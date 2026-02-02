import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fafafa',
      fontFamily: "'Inter', sans-serif",
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem 4rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '600',
          color: '#1a1a1a',
          margin: '0 0 1rem 0',
          letterSpacing: '1px'
        }}>
          Payment Successful!
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#666',
          margin: '0 0 2rem 0',
          lineHeight: '1.6'
        }}>
          Thank you for your purchase. Your order has been confirmed and will be processed shortly.
        </p>
        <button
          onClick={() => navigate('/collections')}
          style={{
            background: '#1a1a1a',
            color: 'white',
            border: 'none',
            padding: '1rem 2.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: "'Inter', sans-serif"
          }}
          onMouseOver={(e) => e.target.style.background = '#333'}
          onMouseOut={(e) => e.target.style.background = '#1a1a1a'}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
