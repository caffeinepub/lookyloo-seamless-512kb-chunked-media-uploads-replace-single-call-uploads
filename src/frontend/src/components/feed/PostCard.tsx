import { Post } from '../../backend';
import { Card } from '@/components/ui/card';
import { Image as ImageIcon, Video } from 'lucide-react';
import { useMemo } from 'react';

interface PostCardProps {
    post: Post;
    onClick: () => void;
}

export default function PostCard({ post, onClick }: PostCardProps) {
    const mediaUrl = useMemo(() => {
        if (!post.media || post.media.length === 0) return null;
        const blob = new Blob([new Uint8Array(post.media)]);
        return URL.createObjectURL(blob);
    }, [post.media]);

    const isVideo = useMemo(() => {
        if (!post.media || post.media.length === 0) return false;
        // Simple heuristic: check first few bytes for video signatures
        const arr = new Uint8Array(post.media);
        // MP4 signature
        if (arr.length > 8 && arr[4] === 0x66 && arr[5] === 0x74 && arr[6] === 0x79 && arr[7] === 0x70) {
            return true;
        }
        return false;
    }, [post.media]);

    return (
        <Card
            className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
            onClick={onClick}
        >
            <div className="relative aspect-square bg-muted">
                {mediaUrl ? (
                    isVideo ? (
                        <video
                            src={mediaUrl}
                            className="h-full w-full object-cover"
                            muted
                            playsInline
                        />
                    ) : (
                        <img
                            src={mediaUrl}
                            alt="Post"
                            className="h-full w-full object-cover"
                        />
                    )
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        {isVideo ? (
                            <Video className="h-12 w-12 text-muted-foreground" />
                        ) : (
                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        )}
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
            </div>
        </Card>
    );
}
