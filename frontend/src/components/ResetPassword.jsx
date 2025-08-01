import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './AuthStyles.css';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userType, setUserType] = useState('employee');

    // Get user type from URL parameters
    useEffect(() => {
        const typeFromUrl = searchParams.get('type');
        if (typeFromUrl && (typeFromUrl === 'admin' || typeFromUrl === 'employee')) {
            setUserType(typeFromUrl);
        }
    }, [searchParams]);

    const handleReset = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMsg('');
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setIsLoading(false);
            return;
        }

        try {
            const res = await axios.post(`http://localhost:5004/api/reset-password/${token}`, { 
                password,
                userType 
            });
            setMsg(res.data.message + ' Redirecting to login...');
            setTimeout(() => navigate('/login'), 2500); // redirect after success
        } catch (err) {
            console.error('Reset error:', err);
            setError(err.response?.data?.message || 'Reset failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-body">
            <div className="bg-container">
                <div className="container">
                    <h1>Reset {userType.charAt(0).toUpperCase() + userType.slice(1)} Password</h1>
                    
                    <div style={{ 
                        textAlign: 'center', 
                        marginBottom: '1.5rem', 
                        padding: '0.5rem', 
                        background: 'rgba(155, 89, 182, 0.1)', 
                        borderRadius: '4px',
                        color: 'var(--text-secondary)'
                    }}>
                        Resetting password for: <strong>{userType}</strong>
                    </div>

                    <form onSubmit={handleReset} style={{ width: '100%' }}>
                        <div className="tbox">
                            <label htmlFor="password" style={{ marginBottom: '0.5rem', display: 'block', color: 'var(--text-secondary)' }}>
                                New Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Enter new password (min 6 characters)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength="6"
                            />
                        </div>

                        <div className="tbox">
                            <label htmlFor="confirmPassword" style={{ marginBottom: '0.5rem', display: 'block', color: 'var(--text-secondary)' }}>
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength="6"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: isLoading ? '#ccc' : '#9B59B6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                marginTop: '1rem'
                            }}
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>

                        {msg && (
                            <div className="success-message-modern" style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                background: '#d4edda',
                                color: '#155724',
                                border: '1px solid #c3e6cb',
                                borderRadius: '4px',
                                textAlign: 'center'
                            }}>
                                ✅ {msg}
                            </div>
                        )}
                        
                        {error && (
                            <div className="error-message" style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                background: '#f8d7da',
                                color: '#721c24',
                                border: '1px solid #f5c6cb',
                                borderRadius: '4px',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <Link
                            to="/login"
                            style={{
                                color: 'var(--text-link)',
                                textDecoration: 'underline',
                                fontSize: '0.95rem',
                            }}
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}