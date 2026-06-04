import React, { useEffect, useState } from 'react';
import { getAccessToken, logout } from './spotify';
import Login from './components/Login';
import Gallery from './components/Gallery';
import './App.css';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    console.log("App mounted, checking token...");
    const accessToken = getAccessToken();
    console.log("Token result:", accessToken ? "Found" : "Not Found");
    setToken(accessToken);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Spotify Palette</h1>
        {token && <button onClick={logout} className="logout-button">Logout</button>}
      </header>
      <main>
        {!token ? (
          <Login />
        ) : (
          <Gallery token={token} />
        )}
      </main>
    </div>
  );
};

export default App;
