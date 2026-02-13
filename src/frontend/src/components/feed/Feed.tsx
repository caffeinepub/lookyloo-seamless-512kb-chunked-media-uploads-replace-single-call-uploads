import { useState } from 'react';
import { useGetPaginatedPosts } from '../../hooks/useQueries';
import PostCard from './PostCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface FeedProps {
    onPostClick: (postId: bigint) => void;
}

const POSTS_PER_PAGE = 9;

export default function Feed({ onPostClick }: FeedProps) {
    const [page, setPage] = useState(0);

    const { data: posts, isLoading, error } = useGetPaginatedPosts(page * POSTS_PER_PAGE, POSTS_PER_PAGE);

    const hasNextPage = posts && posts.length === POSTS_PER_PAGE;
    const hasPrevPage = page > 0;

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <p className="text-destructive">Failed to load posts. Please try again.</p>
            </div>
        );
    }

    if (!posts || posts.length === 0) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
                <p className="text-lg text-muted-foreground">No posts yet. Be the first to share!</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                    <PostCard key={post.id.toString()} post={post} onClick={() => onPostClick(post.id)} />
                ))}
            </div>

            {(hasNextPage || hasPrevPage) && (
                <div className="flex items-center justify-center gap-4">
                    <Button
                        onClick={() => setPage((p) => p - 1)}
                        disabled={!hasPrevPage}
                        variant="outline"
                        size="default"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">Page {page + 1}</span>
                    <Button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!hasNextPage}
                        variant="outline"
                        size="default"
                    >
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
