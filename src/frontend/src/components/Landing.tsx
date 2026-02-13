import { Camera } from 'lucide-react';

export default function Landing() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <Camera className="h-12 w-12 text-primary" />
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight">Welcome to LookyLoo</h1>
            <p className="mb-8 max-w-md text-lg text-muted-foreground">
                Share your photos and videos with the world. Login to get started.
            </p>
        </div>
    );
}
