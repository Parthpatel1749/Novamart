import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Shield, Truck, User, Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else if (user.role === 'ROLE_DELIVERY_PARTNER') {
        navigate('/delivery-partner');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '90vh', padding: '40px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Brand Header */}
      <Link to="/" style={{ textDecoration: 'none', color: '#111', marginBottom: '24px' }}>
        <span style={{ fontSize: '32px', fontWeight: '800' }}>
          Nova<span style={{ color: '#febd69' }}>Mart</span>
        </span>
        <span style={{ fontSize: '14px', color: '#555' }}>.in</span>
      </Link>

      {/* Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          border: '1px solid #d5d9d9',
          borderRadius: '8px',
          padding: '24px 26px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>Sign in</h1>

        {error && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#fff5f5', border: '1px solid #fed7d7', padding: '10px', borderRadius: '6px', color: '#c53030', fontSize: '13px', marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email or mobile phone number</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. customer@novamart.com"
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ margin: 0 }}>Password</label>
              <span style={{ fontSize: '12px', color: '#007185', cursor: 'pointer' }}>
                Forgot Password?
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                style={{ paddingRight: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#565959',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '10px', fontSize: '14px', marginTop: '10px' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ fontSize: '12px', color: '#565959', marginTop: '16px', lineHeight: '1.4' }}>
          By continuing, you agree to NovaMart's Conditions of Use and Privacy Notice.
        </div>

        {/* Demo Credentials Quick-Fill Box */}
        {import.meta.env.DEV && (
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#555', marginBottom: '8px', textAlign: 'center' }}>
              QUICK DEMO LOGINS (1-Click)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                type="button"
                onClick={() => fillCredentials('customer@novamart.com', 'Customer@123')}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px', justifyContent: 'flex-start' }}
              >
                <User size={14} color="#007185" /> Customer: customer@novamart.com
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('admin@novamart.com', 'Admin@123')}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px', justifyContent: 'flex-start' }}
              >
                <Shield size={14} color="#cc0c39" /> Admin: admin@novamart.com
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('partner@novamart.com', 'Partner@123')}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px', justifyContent: 'flex-start' }}
              >
                <Truck size={14} color="#067d62" /> Delivery Partner: partner@novamart.com
              </button>
            </div>
          </div>
        )}

        {/* Become a Delivery Partner Link */}
        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #d5d9d9', textAlign: 'center' }}>
          <Link
            to="/delivery-partner/register"
            style={{
              color: '#067d62',
              fontWeight: '700',
              fontSize: '12px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #86efac',
              boxSizing: 'border-box',
              transition: 'all 0.2s',
            }}
          >
            <Truck size={15} color="#059669" /> Become a Delivery Partner
          </Link>
        </div>
      </div>

      {/* New to NovaMart */}
      <div style={{ width: '100%', maxWidth: '380px', marginTop: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0', color: '#767676', fontSize: '12px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e7e7e7' }} />
          <span style={{ padding: '0 8px' }}>New to NovaMart?</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e7e7e7' }} />
        </div>

        <Link
          to="/register"
          className="btn-secondary"
          style={{ width: '100%', padding: '10px', fontSize: '13px', textDecoration: 'none', boxSizing: 'border-box' }}
        >
          Create your NovaMart account
        </Link>
      </div>
    </div>
  );
};
