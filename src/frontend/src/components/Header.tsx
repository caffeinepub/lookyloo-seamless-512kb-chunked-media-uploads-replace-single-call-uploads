import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Upload, LogIn, LogOut } from 'lucide-react';

interface HeaderProps {
    isAuthenticated: boolean;
    onUploadClick: () => void;
}

export default function Header({ isAuthenticated, onUploadClick }: HeaderProps) {
    const { login, clear, loginStatus } = useInternetIdentity();
    const queryClient = useQueryClient();

    const handleAuth = async () => {
        if (isAuthenticated) {
            await clear();
            queryClient.clear();
        } else {
            try {
                await login();
            } catch (error: any) {
                console.error('Login error:', error);
                if (error.message === 'User is already authenticated') {
                    await clear();
                    setTimeout(() => login(), 300);
                }
            }
        }
    };

    const isLoggingIn = loginStatus === 'logging-in';

    return (
        <header className="border-b border-border bg-card">
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-background">
                            <img
                                src="/assets/lookyloo-logo.png"
                                alt="LookyLoo"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <span className="text-lg font-medium">
                            Hey there, LookyLoo!{'\u00A0\u00A0'}Wanna see somethin'?
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {isAuthenticated && (
                            <Button onClick={onUploadClick} size="default" className="gap-2">
                                <Upload className="h-4 w-4" />
                                Upload
                            </Button>
                        )}
                        <Button
                            onClick={handleAuth}
                            disabled={isLoggingIn}
                            variant={isAuthenticated ? 'outline' : 'default'}
                            size="default"
                            className="gap-2"
                        >
                            {isLoggingIn ? (
                                'Logging in...'
                            ) : isAuthenticated ? (
                                <>
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </>
                            ) : (
                                <>
                                    <LogIn className="h-4 w-4" />
                                    Login
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
