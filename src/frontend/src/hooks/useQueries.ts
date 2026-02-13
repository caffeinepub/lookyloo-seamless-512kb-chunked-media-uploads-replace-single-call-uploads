import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserProfile, Post } from '../backend';

export function useGetCallerUserProfile() {
    const { actor, isFetching: actorFetching } = useActor();

    const query = useQuery<UserProfile | null>({
        queryKey: ['currentUserProfile'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getCallerUserProfile();
        },
        enabled: !!actor && !actorFetching,
        retry: false
    });

    return {
        ...query,
        isLoading: actorFetching || query.isLoading,
        isFetched: !!actor && query.isFetched
    };
}

export function useSaveCallerUserProfile() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (profile: UserProfile) => {
            if (!actor) throw new Error('Actor not available');
            return actor.saveCallerUserProfile(profile);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        }
    });
}

export function useGetPaginatedPosts(start: number, count: number) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<Post[]>({
        queryKey: ['posts', start, count],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getPaginatedPosts(BigInt(start), BigInt(count));
        },
        enabled: !!actor && !actorFetching
    });
}

export function useGetPost(postId: bigint) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<Post>({
        queryKey: ['post', postId.toString()],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getPost(postId);
        },
        enabled: !!actor && !actorFetching
    });
}

export function useDeletePost() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (postId: bigint) => {
            if (!actor) throw new Error('Actor not available');
            return actor.deletePost(postId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });
}
