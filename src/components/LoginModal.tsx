import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './Button';
import { Card } from './Card';
import './LoginModal.css';

interface LoginModalProps {
    onDismiss: () => void;
}

export function LoginModal({ onDismiss }: LoginModalProps) {
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async () => {
        setIsLoggingIn(true);
        setError(null);
        try {
            await login();
            onDismiss();
        } catch (err) {
            console.error(err);
            setError("Failed to sign in. Please try again.");
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="modal-overlay">
            <Card className="login-modal">
                <h2 className="login-title">Sign In Required</h2>
                <p className="login-subtitle">
                    Please sign in with Google to start tracking your sessions.
                    Your details will be securely logged for administrative purposes.
                </p>

                {error && <div className="login-error">{error}</div>}

                <div className="login-actions">
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleLogin}
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onDismiss}
                        disabled={isLoggingIn}
                    >
                        Cancel
                    </Button>
                </div>
            </Card>
        </div>
    );
}
