import { useMemo } from 'react';
import { useGetPost, useDeletePost } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Trash2, Share2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PostViewerProps {
    postId: bigint;
    onClose: () => void;
}

export default function PostViewer({ postId, onClose }: PostViewerProps) {
    const { identity } = useInternetIdentity();
    const { data: post, isLoading, error } = useGetPost(postId);
    const deletePostMutation = useDeletePost();

    const isAuthor = useMemo(() => {
        if (!post || !identity) return false;
        return post.author.toString() === identity.getPrincipal().toString();
    }, [post, identity]);

    const mediaUrl = useMemo(() => {
        if (!post?.media || post.media.length === 0) return null;
        const blob = new Blob([new Uint8Array(post.media)]);
        return URL.createObjectURL(blob);
    }, [post?.media]);

    const isVideo = useMemo(() => {
        if (!post?.media || post.media.length === 0) return false;
        const arr = new Uint8Array(post.media);
        if (arr.length > 8 && arr[4] === 0x66 && arr[5] === 0x74 && arr[6] === 0x79 && arr[7] === 0x70) {
            return true;
        }
        return false;
    }, [post?.media]);

    const handleShare = () => {
        const shareUrl = `${window.location.origin}${window.location.pathname}?postId=${postId}`;
        navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied to clipboard!');
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await deletePostMutation.mutateAsync(postId);
            toast.success('Post deleted successfully');
            onClose();
        } catch (error) {
            toast.error('Failed to delete post');
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <p className="text-destructive">Failed to load post</p>
                <Button onClick={onClose} variant="outline">
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-4 flex items-center justify-between">
                <Button onClick={onClose} variant="ghost" size="icon">
                    <X className="h-5 w-5" />
                </Button>
                <div className="flex gap-2">
                    <Button onClick={handleShare} variant="outline" size="default" className="gap-2">
                        <Share2 className="h-4 w-4" />
                        Share
                    </Button>
                    {isAuthor && (
                        <Button
                            onClick={handleDelete}
                            variant="destructive"
                            size="default"
                            className="gap-2"
                            disabled={deletePostMutation.isPending}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {mediaUrl && (
                        <div className="relative w-full">
                            {isVideo ? (
                                <video
                                    src={mediaUrl}
                                    controls
                                    className="w-full"
                                    style={{ maxHeight: '80vh' }}
                                />
                            ) : (
                                <img
                                    src={mediaUrl}
                                    alt="Post"
                                    className="w-full"
                                    style={{ maxHeight: '80vh', objectFit: 'contain' }}
                                />
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
