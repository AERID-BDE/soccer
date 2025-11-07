import React, { useEffect } from 'react';
import { Trophy } from 'lucide-react';

const Login = ({ onSignIn }) => {
  useEffect(() => {
    // Load Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'filled_black',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            locale: 'fr'
          }
        );
      }
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleCredentialResponse = (response) => {
    // Decode JWT token to get user info
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const userInfo = JSON.parse(jsonPayload);
      
      // Store user info
      localStorage.setItem('user', JSON.stringify({
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        sub: userInfo.sub
      }));
      
      // Call onSignIn callback
      onSignIn(userInfo);
    } catch (error) {
      console.error('Error decoding credential:', error);
      alert('Erreur lors de la connexion. Veuillez réessayer.');
    }
  };

  const theme = {
    navy900: '#0C1E2A',
    navy800: '#0F2533',
    navy700: '#123043',
    navy600: '#163B52',
    navy500: '#1C4861',
    navy300: '#3E7994',
    gold500: '#D9A441',
    gold600: '#D19A34',
    gold700: '#B8872E',
    gold400: '#E0B55B',
    gold300: '#E7C772',
    gold200: '#F0D790',
    textPrimary: '#F5EADD',
    textSecondary: '#EDE3CC',
    textMuted: '#5A6A7B',
    success: '#3AC17E',
    danger: '#F05B5B'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${theme.navy700} 0%, ${theme.navy900} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: theme.navy800,
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        padding: '3rem 2rem',
        border: `2px solid ${theme.navy600}`,
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <Trophy style={{ width: '3rem', height: '3rem', color: theme.gold500 }} />
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: theme.textPrimary,
            margin: 0,
            fontFamily: 'Montserrat, system-ui, sans-serif'
          }}>
            Tournoi de Football
          </h1>
        </div>

        <p style={{
          fontSize: '1rem',
          color: theme.textSecondary,
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          Accès restreint. Veuillez vous connecter avec votre compte Google pour continuer.
        </p>

        <div id="google-signin-button" style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}></div>

        {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <div style={{
            padding: '1rem',
            background: theme.navy700,
            borderRadius: '8px',
            marginTop: '1rem',
            border: `1px solid ${theme.danger}`
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: theme.danger,
              margin: 0
            }}>
              ⚠️ Configuration requise : Veuillez définir VITE_GOOGLE_CLIENT_ID dans votre fichier .env
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;

