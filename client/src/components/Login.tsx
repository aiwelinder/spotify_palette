import React from 'react';

const Login: React.FC = () => {
    // Use relative path since backend will serve the frontend in production
    const loginUrl = window.location.origin.includes('127.0.0.1') || window.location.origin.includes('localhost')
        ? 'http://127.0.0.1:3001/login' 
        : '/login';

    return (
        <div className="login-container">
            <p>Visualize your Spotify library in rainbow order.</p>
            <a href={loginUrl} className="login-button">
                Login with Spotify
            </a>
        </div>
    );
};

export default Login;
