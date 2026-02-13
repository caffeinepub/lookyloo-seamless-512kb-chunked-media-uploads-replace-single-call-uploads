import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface UploadButtonProps {
    onClick: () => void;
}

export default function UploadButton({ onClick }: UploadButtonProps) {
    return (
        <Button onClick={onClick} size="default" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
        </Button>
    );
}
