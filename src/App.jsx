import { useState, useEffect } from 'react';
import FootballTournament from '../football-tournament';
import Login from './Login';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleSignIn = (userInfo) => {
    setUser(userInfo);
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    setUser(null);
    
    // Sign out from Google
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #123043 0%, #0C1E2A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#F5EADD',
        fontFamily: 'Montserrat, system-ui, sans-serif'
      }}>
        Chargement...
      </div>
    );
  }

  if (!user) {
    return <Login onSignIn={handleSignIn} />;
  }

  return <FootballTournament user={user} onSignOut={handleSignOut} />;
}

export default App;

