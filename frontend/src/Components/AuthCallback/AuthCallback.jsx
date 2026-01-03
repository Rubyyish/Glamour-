import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const name = params.get('name');

      if (token && name) {
        try {
          // Store token
          localStorage.setItem('token', token);
          
          // Create user object
          const user = { name };
          localStorage.setItem('user', JSON.stringify(user));
          
          // Update auth context
          setUser(user);
          setIsAuthenticated(true);

          // Show success message
          toast.success(`Welcome back, ${name}! 🎉`, {
            position: "top-right",
            autoClose: 3000,
          });

          // Redirect to home
          navigate('/home');
        } catch (error) {
          console.error('OAuth callback error:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/login');
        }
      } else {
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, setUser, setIsAuthenticated]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          fontSize: '24px', 
          marginBottom: '16px',
          animation: 'spin 1s linear infinite'
        }}>⏳</div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
