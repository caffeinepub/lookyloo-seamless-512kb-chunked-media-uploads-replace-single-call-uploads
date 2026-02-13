/**
 * Slices a File into fixed-size chunks (last chunk may be smaller)
 * @param file - The file to slice
 * @param chunkSize - Size of each chunk in bytes (default 512KB)
 * @returns Array of Blob chunks
 */
export function sliceFileIntoChunks(file: File, chunkSize: number = 512 * 1024): Blob[] {
    const chunks: Blob[] = [];
    let offset = 0;

    while (offset < file.size) {
        const end = Math.min(offset + chunkSize, file.size);
        chunks.push(file.slice(offset, end));
        offset = end;
    }

    return chunks;
}

/**
 * Calculates the total number of chunks for a given file size
 * @param fileSize - Size of the file in bytes
 * @param chunkSize - Size of each chunk in bytes (default 512KB)
 * @returns Total number of chunks
 */
export function calculateTotalChunks(fileSize: number, chunkSize: number = 512 * 1024): number {
    return Math.ceil(fileSize / chunkSize);
}

/**
 * Gets the byte range for a specific chunk index
 * @param chunkIndex - Zero-based chunk index
 * @param chunkSize - Size of each chunk in bytes (default 512KB)
 * @param totalSize - Total file size in bytes
 * @returns Object with start and end byte positions
 */
export function getChunkByteRange(
    chunkIndex: number,
    chunkSize: number = 512 * 1024,
    totalSize: number
): { start: number; end: number } {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, totalSize);
    return { start, end };
}
