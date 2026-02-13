import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ProfileSetupModalProps {
    profileName: string;
    onProfileNameChange: (name: string) => void;
    onSave: () => void;
    isSaving: boolean;
}

export default function ProfileSetupModal({
    profileName,
    onProfileNameChange,
    onSave,
    isSaving
}: ProfileSetupModalProps) {
    return (
        <Dialog open={true}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Welcome to LookyLoo!</DialogTitle>
                    <DialogDescription>
                        Please tell us your name to complete your profile setup.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter your name"
                            value={profileName}
                            onChange={(e) => onProfileNameChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && profileName.trim()) {
                                    onSave();
                                }
                            }}
                        />
                    </div>
                    <Button
                        onClick={onSave}
                        disabled={!profileName.trim() || isSaving}
                        className="w-full"
                    >
                        {isSaving ? 'Saving...' : 'Continue'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
