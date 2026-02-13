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
                    <p className="mb-3">2026 LookyLoo. A GeekDice dApp built with caffeine.ai</p>
                    <div className="flex items-center justify-center gap-2">
                        <a
                            href="https://geekdice.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-opacity hover:opacity-80"
                        >
                            <img
                                src="/assets/GeekGoat-e8cRlk9m.png"
                                alt="GeekGoat"
                                className="h-6 w-6 rounded-full object-cover"
                            />
                        </a>
                        <span>Follow me on</span>
                        <a
                            href="https://x.com/WillGeek4Food"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-opacity hover:opacity-80"
                        >
                            <img
                                src="/assets/X Logo Transparent.png"
                                alt="X"
                                className="h-5 w-5 object-contain"
                            />
                        </a>
                    </div>
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
