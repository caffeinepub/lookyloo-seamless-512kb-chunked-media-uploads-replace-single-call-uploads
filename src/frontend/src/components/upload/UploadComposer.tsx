import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Loader2 } from 'lucide-react';
import { useChunkedUpload } from '../../hooks/useChunkedUpload';
import { toast } from 'sonner';

interface UploadComposerProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function UploadComposer({ onSuccess, onCancel }: UploadComposerProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { upload, progress, isUploading, cancel } = useChunkedUpload();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            await upload(selectedFile);
            toast.success('Upload complete!');
            onSuccess();
        } catch (error: any) {
            if (error.message !== 'Upload cancelled') {
                toast.error(error.message || 'Upload failed');
            }
        }
    };

    const handleCancel = () => {
        if (isUploading) {
            cancel();
        }
        onCancel();
    };

    return (
        <div className="mx-auto max-w-2xl">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Upload Media</CardTitle>
                        <Button onClick={handleCancel} variant="ghost" size="icon">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!selectedFile ? (
                        <div
                            className="flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:bg-muted"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="mb-2 text-lg font-medium">Click to select a file</p>
                            <p className="text-sm text-muted-foreground">
                                Images and videos supported
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-lg border border-border bg-muted/50 p-4">
                                <p className="font-medium">{selectedFile.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>

                            {isUploading && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Uploading...</span>
                                        <span className="font-medium">{progress}%</span>
                                    </div>
                                    <Progress value={progress} />
                                </div>
                            )}

                            <div className="flex gap-3">
                                {!isUploading ? (
                                    <>
                                        <Button
                                            onClick={handleUpload}
                                            className="flex-1"
                                            size="lg"
                                        >
                                            Upload
                                        </Button>
                                        <Button
                                            onClick={() => setSelectedFile(null)}
                                            variant="outline"
                                            size="lg"
                                        >
                                            Change File
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={handleCancel}
                                        variant="destructive"
                                        className="flex-1"
                                        size="lg"
                                    >
                                        Cancel Upload
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
