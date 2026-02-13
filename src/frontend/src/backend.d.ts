import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface Post {
    id: bigint;
    media: Uint8Array;
    author: Principal;
    isFinalized: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteChunk(postId: bigint): Promise<void>;
    deletePost(postId: bigint): Promise<boolean>;
    finalizeUpload(postId: bigint): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPaginatedPosts(start: bigint, count: bigint): Promise<Array<Post>>;
    getPost(postId: bigint): Promise<Post>;
    getPostsByAuthor(author: Principal): Promise<Array<Post>>;
    getUploadState(postId: bigint): Promise<boolean>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setUploadState(postId: bigint, state: boolean): Promise<void>;
    uploadMediaChunk(temporaryPostId: bigint, totalSize: bigint, chunkIndex: bigint, data: Uint8Array): Promise<boolean>;
    uploadMediaData(data: Uint8Array): Promise<bigint>;
}
