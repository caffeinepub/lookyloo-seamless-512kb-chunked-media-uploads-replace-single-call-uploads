import { useState, useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from './hooks/useQueries';
import Header from './components/Header';
import Landing from './components/Landing';
import Feed from './components/feed/Feed';
import PostViewer from './components/viewer/PostViewer';
import ProfileSetupModal from './components/ProfileSetupModal';
import UploadComposer from './components/upload/UploadComposer';
import { getUrlParameter } from './utils/urlParams';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
    const { identity, loginStatus } = useInternetIdentity();
    const isAuthenticated = !!identity;

    const {
        data: userProfile,
        isLoading: profileLoading,
        isFetched: profileFetched
    } = useGetCallerUserProfile();

    const [selectedPostId, setSelectedPostId] = useState<bigint | null>(null);
    const [showUploadComposer, setShowUploadComposer] = useState(false);
    const [profileName, setProfileName] = useState('');

    const saveProfileMutation = useSaveCallerUserProfile();

    // Check for shared post in URL
    useEffect(() => {
        const postIdParam = getUrlParameter('postId');
        if (postIdParam) {
            try {
                setSelectedPostId(BigInt(postIdParam));
            } catch (e) {
                console.error('Invalid postId in URL:', e);
            }
        }
    }, []);

    const showProfileSetup =
        isAuthenticated && !profileLoading && profileFetched && userProfile === null;

    const handleSaveProfile = async () => {
        if (!profileName.trim()) return;
        try {
            await saveProfileMutation.mutateAsync({ name: profileName.trim() });
        } catch (error) {
            console.error('Failed to save profile:', error);
        }
    };

    const handleUploadSuccess = () => {
        setShowUploadComposer(false);
    };

    const handleCloseViewer = () => {
        setSelectedPostId(null);
        // Clear URL parameter
        if (getUrlParameter('postId')) {
            window.history.replaceState(null, '', window.location.pathname);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header
                isAuthenticated={isAuthenticated}
                onUploadClick={() => setShowUploadComposer(true)}
            />

            <main className="container mx-auto px-4 py-8">
                {!isAuthenticated ? (
                    <Landing />
                ) : selectedPostId !== null ? (
                    <PostViewer postId={selectedPostId} onClose={handleCloseViewer} />
                ) : showUploadComposer ? (
                    <UploadComposer
                        onSuccess={handleUploadSuccess}
                        onCancel={() => setShowUploadComposer(false)}
                    />
                ) : (
                    <Feed onPostClick={setSelectedPostId} />
                )}
            </main>

            <footer className="mt-16 border-t border-border py-8">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    <p>
                        © {new Date().getFullYear()} LookyLoo. Built with love using{' '}
                        <a
                            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            caffeine.ai
                        </a>
                    </p>
                </div>
            </footer>

            {showProfileSetup && (
                <ProfileSetupModal
                    profileName={profileName}
                    onProfileNameChange={setProfileName}
                    onSave={handleSaveProfile}
                    isSaving={saveProfileMutation.isPending}
                />
            )}

            <Toaster />
        </div>
    );
}
