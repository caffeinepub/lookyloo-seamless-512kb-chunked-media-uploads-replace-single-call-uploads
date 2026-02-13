import Text "mo:core/Text";
import Blob "mo:core/Blob";
import List "mo:core/List";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Map "mo:core/Map";
import Timer "mo:core/Timer";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Post and chunk types
  type Post = {
    id : Nat;
    author : Principal;
    media : Blob;
    isFinalized : Bool;
  };

  module Post {
    public func compareById(a : Post, b : Post) : Order.Order {
      Nat.compare(a.id, b.id);
    };

    public func compareByAuthor(a : Post, b : Post) : Order.Order {
      Principal.compare(a.author, b.author);
    };
  };

  type Chunk = {
    index : Nat;
    data : Blob;
    postId : Nat;
    mediaType : MediaType;
    totalSize : Nat;
    author : Principal;
  };

  type MediaType = {
    #image;
    #audio;
  };

  module Chunk {
    public func compare(chunk1 : Chunk, chunk2 : Chunk) : Order.Order {
      Nat.compare(chunk1.index, chunk2.index);
    };

    public func compareBySize(chunk1 : Chunk, chunk2 : Chunk) : Order.Order {
      Nat.compare(chunk1.totalSize, chunk2.totalSize);
    };
  };

  // INTERNAL STATE
  var lastPostId : Nat = 0;
  let posts = Map.empty<Nat, Post>();
  let chunks = Map.empty<Nat, Chunk>();

  let finalizedChunkIds = List.empty<Nat>();

  // Chunk management
  let uploadChunks = Map.empty<Nat, Blob>();
  let uploadStates = Map.empty<Nat, Bool>();
  let uploadAuthors = Map.empty<Nat, Principal>();

  let finalizedPosts = Map.empty<Nat, Bool>();

  let chunkTimers = List.empty<Timer.TimerId>();
  let permanentChunkIds = List.empty<Nat>();
  let outdatedChunkIds = List.empty<Nat>();

  let finalizedPostIds = List.empty<Nat>();
  var lastFinalizedChunkId : Nat = 0;

  let postTimers = List.empty<Timer.TimerId>();

  module ChunkedUpload {
    public func handleRepeatedPost(postId : Nat) {
      if (finalizedPosts.containsKey(postId)) {
        Runtime.trap("Media upload already finalized for this post id");
      };
    };

    public func countChunks(_ : Nat) : Nat {
      0;
    };

    public func deleteOldChunk(_ : ()) {};
  };

  // Post management helper
  module PostHelper {
    public func new(caller : Principal, id : Nat, media : Blob) : Post {
      { id; author = caller; media; isFinalized = true };
    };
  };

  module PostNotFoundError {
    public func postNotFound(postId : Nat) {
      Runtime.trap("Post " # postId.toText() # " was not found or has not been finalized yet. Use getPost to fetch individual finalized posts.");
    };
  };

  type AsyncResponse = {
    #success;
    #error : Text;
  };

  let uploadStateFinalizer = List.empty<Nat>();

  // POST APIs - Public read access (including guests)
  public query ({ caller }) func getPaginatedPosts(start : Nat, count : Nat) : async [Post] {
    let postsArray = posts.values().toArray().sort(Post.compareById);

    let end = start + count;
    if (start >= postsArray.size()) {
      [];
    } else if (end > postsArray.size()) {
      Array.tabulate(postsArray.size() - start, func(i) { postsArray[start + i] });
    } else {
      Array.tabulate(count, func(i) { postsArray[start + i] });
    };
  };

  public query ({ caller }) func getPost(postId : Nat) : async Post {
    finalFilter(postId);
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Requested non-existing media post " # postId.toText()) };
      case (?post) { post };
    };
  };

  public query ({ caller }) func getPostsByAuthor(author : Principal) : async [Post] {
    let results = posts.values().toArray().sort(Post.compareById);
    results.filter<Post>(
      func(post) { author == post.author }
    );
  };

  let outdatedChunkTimers = List.empty<Timer.TimerId>();
  let outdatedPostTimers = List.empty<Timer.TimerId>();

  // Delete post - only owner or admin
  public shared ({ caller }) func deletePost(postId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete posts");
    };

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        // Only the author or an admin can delete
        if (post.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the post author or admins can delete this post");
        };
        posts.remove(postId);
        finalizedPosts.remove(postId);
        true;
      };
    };
  };

  func requireUserPermission(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can upload media posts");
    };
  };

  func requireNewPost(postId : Nat) {
    if (finalizedPosts.containsKey(postId)) {
      Runtime.trap("Chunk uploads can only be performed on new posts, not existing posts. This post is already finalized for postId " # postId.toText());
    };
  };

  func finalFilter(postId : Nat) {
    if (not (finalizedPosts.containsKey(postId))) {
      Runtime.trap("Media post " # postId.toText() # " is INVALID. The post is only available during the chunked upload.");
    };
  };

  func requireUploadOwnership(caller : Principal, postId : Nat) {
    switch (uploadAuthors.get(postId)) {
      case (null) { /* First chunk, will be set */ };
      case (?author) {
        if (author != caller) {
          Runtime.trap("Unauthorized: Only the upload owner can continue this upload");
        };
      };
    };
  };

  // Upload media chunk - only authenticated users, ownership verified
  public shared ({ caller }) func uploadMediaChunk(temporaryPostId : Nat, totalSize : Nat, chunkIndex : Nat, data : Blob) : async Bool {
    requireUserPermission(caller);
    requireNewPost(temporaryPostId);
    requireUploadOwnership(caller, temporaryPostId);

    if (data.size() > 1024 * 512) {
      Runtime.trap("Media chunks are limited to 512 KB");
    };

    // Set the author for this upload if not already set
    switch (uploadAuthors.get(temporaryPostId)) {
      case (null) { uploadAuthors.add(temporaryPostId, caller) };
      case (?_) {};
    };

    switch (uploadChunks.get(temporaryPostId)) {
      case (null) {
        // First chunk must be index 0
        if (chunkIndex != 0) {
          Runtime.trap("First chunk must have index 0");
        };
        uploadChunks.add(temporaryPostId, data);
      };
      case (?existingChunk) {
        let existingChunkSize = existingChunk.size();
        let expectedSize = chunkIndex * 1024 * 512;
        if (existingChunkSize != expectedSize) {
          Runtime.trap("Media chunks must be uploaded in ascending order starting from index 0. Expected size: " # expectedSize.toText() # ", got: " # existingChunkSize.toText());
        };
        // Append the new chunk
        let combined = Blob.fromArray(existingChunk.toArray().concat(data.toArray()));
        uploadChunks.add(temporaryPostId, combined);
      };
    };
    true;
  };

  // Finalize upload - only authenticated users, ownership verified
  public shared ({ caller }) func finalizeUpload(postId : Nat) : async Bool {
    requireUserPermission(caller);
    requireUploadOwnership(caller, postId);

    let data = switch (uploadChunks.get(postId)) {
      case (null) { Runtime.trap("Cannot finalize non-existing upload") };
      case (?d) { d };
    };

    let dataSize = data.size();

    if (dataSize == 0) {
      Runtime.trap("Cannot finalize empty upload");
    };

    if (dataSize > 0) {
      addFinalizedPost(caller, postId, data);
      // Clean up upload state
      uploadChunks.remove(postId);
      uploadAuthors.remove(postId);
      return true;
    } else {
      Runtime.trap("File upload incomplete. Data size: " # dataSize.toText());
    };
  };

  // Upload media data (single call) - only authenticated users
  public shared ({ caller }) func uploadMediaData(data : Blob) : async Nat {
    requireUserPermission(caller);

    if (data.size() > 1024 * 512) {
      Runtime.trap("Media POST requests are limited to 512 KB");
    };

    lastPostId += 1;
    addFinalizedPost(caller, lastPostId, data);
    lastPostId;
  };

  // Delete chunk - only authenticated users, ownership verified
  public shared ({ caller }) func deleteChunk(postId : Nat) : async () {
    requireUserPermission(caller);
    requireUploadOwnership(caller, postId);
    uploadChunks.remove(postId);
    uploadAuthors.remove(postId);
  };

  // Set upload state - only authenticated users, ownership verified
  public shared ({ caller }) func setUploadState(postId : Nat, state : Bool) : async () {
    requireUserPermission(caller);
    requireUploadOwnership(caller, postId);
    uploadStates.add(postId, state);
  };

  // Get upload state - public read access
  public query ({ caller }) func getUploadState(postId : Nat) : async Bool {
    switch (uploadStates.get(postId)) {
      case (null) { false };
      case (?uploadState) { uploadState };
    };
  };

  func addFinalizedPost(author : Principal, postId : Nat, data : Blob) {
    finalizedPosts.add(postId, true);
    uploadStates.add(postId, false);
    let post : Post = {
      id = postId;
      author = author;
      media = data;
      isFinalized = true;
    };
    posts.add(postId, post);
  };

  let outdatedChunkDeleters = List.empty<Timer.TimerId>();
  let outdatedPostDeleters = List.empty<Timer.TimerId>();
  let chunkStateUpdaters = List.empty<Timer.TimerId>();
};
