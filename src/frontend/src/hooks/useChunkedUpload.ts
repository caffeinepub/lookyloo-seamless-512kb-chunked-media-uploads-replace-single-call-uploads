import { useState, useCallback, useRef } from 'react';
import { useActor } from './useActor';
import { useQueryClient } from '@tanstack/react-query';
import { sliceFileIntoChunks } from '../utils/chunking';

const CHUNK_SIZE = 512 * 1024; // 512 KB

export function useChunkedUpload() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const cancelledRef = useRef(false);

    const cancel = useCallback(() => {
        cancelledRef.current = true;
    }, []);

    const upload = useCallback(
        async (file: File) => {
            if (!actor) throw new Error('Actor not available');

            cancelledRef.current = false;
            setIsUploading(true);
            setProgress(0);

            try {
                // Generate a temporary post ID (use timestamp + random)
                const temporaryPostId = BigInt(Date.now() * 1000 + Math.floor(Math.random() * 1000));

                // Slice file into chunks
                const chunks = sliceFileIntoChunks(file, CHUNK_SIZE);
                const totalChunks = chunks.length;
                const totalSize = file.size;

                let uploadedBytes = 0;

                // Upload chunks sequentially
                for (let i = 0; i < totalChunks; i++) {
                    if (cancelledRef.current) {
                        // Clean up on cancel
                        try {
                            await actor.deleteChunk(temporaryPostId);
                        } catch (e) {
                            console.error('Failed to clean up chunks:', e);
                        }
                        throw new Error('Upload cancelled');
                    }

                    const chunk = chunks[i];
                    const chunkArray = new Uint8Array(await chunk.arrayBuffer());

                    // Retry logic for failed chunks
                    let retries = 3;
                    let success = false;

                    while (retries > 0 && !success) {
                        try {
                            await actor.uploadMediaChunk(
                                temporaryPostId,
                                BigInt(totalSize),
                                BigInt(i),
                                chunkArray
                            );
                            success = true;
                        } catch (error) {
                            retries--;
                            if (retries === 0) throw error;
                            // Wait before retry
                            await new Promise((resolve) => setTimeout(resolve, 1000));
                        }
                    }

                    uploadedBytes += chunk.size;
                    setProgress(Math.round((uploadedBytes / totalSize) * 100));
                }

                if (cancelledRef.current) {
                    try {
                        await actor.deleteChunk(temporaryPostId);
                    } catch (e) {
                        console.error('Failed to clean up chunks:', e);
                    }
                    throw new Error('Upload cancelled');
                }

                // Finalize the upload
                await actor.finalizeUpload(temporaryPostId);

                // Invalidate posts query to refresh feed
                queryClient.invalidateQueries({ queryKey: ['posts'] });

                setProgress(100);
            } catch (error) {
                throw error;
            } finally {
                setIsUploading(false);
                if (!cancelledRef.current) {
                    setProgress(0);
                }
            }
        },
        [actor, queryClient]
    );

    return {
        upload,
        progress,
        isUploading,
        cancel
    };
}
