import React from 'react';

const Login: React.FC = () => {
    const loginUrl = 'http://127.0.0.1:3001/login';

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
