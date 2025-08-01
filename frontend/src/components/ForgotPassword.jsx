import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AuthStyles.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [userType, setUserType] = useState('employee'); // employee or admin
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMsg('');

        try {
            const res = await axios.post('http://localhost:5004/api/forgot-password', { 
                email, 
                userType 
            });
            setMsg(res.data.message);
        } catch (err) {
            console.error('Full error:', err);
            if (err.response) {
                console.error('Response data:', err.response.data);
                console.error('Response status:', err.response.status);
                setError(err.response.data?.message || `Server error: ${err.response.status}`);
            } else if (err.request) {
                console.error('No response received:', err.request);
                setError('No response from server. Is the backend running?');
            } else {
                console.error('Request setup error:', err.message);
                setError('Failed to send request');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-body">
            <div className="bg-container">
                <div className="container">
                    <h1>Forgot Password</h1>
                    
                    {/* User Type Selector */}
                    <div className="user-type-toggle">
                        <label className={`radio-container ${userType === "employee" ? "checked" : ""}`}>
                            Employee
                            <input
                                type="radio"
                                name="userType"
                                value="employee"
                                checked={userType === "employee"}
                                onChange={() => setUserType("employee")}
                            />
                            <span className="checkmark"></span>
                        </label>

                        <label className={`radio-container ${userType === "admin" ? "checked" : ""}`}>
                            Admin
                            <input
                                type="radio"
                                name="userType"
                                value="admin"
                                checked={userType === "admin"}
                                onChange={() => setUserType("admin")}
                            />
                            <span className="checkmark"></span>
                        </label>
                    </div>

                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <div className="tbox">
                            <label htmlFor="email" style={{ marginBottom: '0.5rem', display: 'block', color: 'var(--text-secondary)' }}>
                                Enter your {userType} email
                            </label>
                            <input
                                type="email"
                                id="email"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#9B59B6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                marginTop: '1rem'
                            }}
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        {msg && (
                            <div className="success-message-modern">
                                ✅ {msg}
                            </div>
                        )}

                        {error && (
                            <div className="error-message">
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