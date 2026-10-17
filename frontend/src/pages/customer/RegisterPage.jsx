import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Eye, EyeOff, Truck } from 'lucide-react';

export const RegisterPage = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password accurately.');
      return;
    }

    try {
      await register({
        fullName,
        email,
        phone,
        password,
        role: 'ROLE_CUSTOMER',
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check inputs.');
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '90vh', padding: '40px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#111', marginBottom: '24px' }}>
        <span style={{ fontSize: '32px', fontWeight: '800' }}>
          Nova<span style={{ color: '#febd69' }}>Mart</span>
        </span>
        <span style={{ fontSize: '14px', color: '#555' }}>.in</span>
      </Link>

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
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>Create Account</h1>

        {error && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#fff5f5', border: '1px solid #fed7d7', padding: '10px', borderRadius: '6px', color: '#c53030', fontSize: '13px', marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your name</label>
            <input
              type="text"
              className="form-control"
              placeholder="First and last name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mobile number</label>
            <input
              type="tel"
              className="form-control"
              placeholder="Mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                style={{ paddingRight: '40px' }}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
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
            <div style={{ fontSize: '11px', color: '#565959', marginTop: '4px' }}>
              Passwords must be at least 6 characters.
            </div>
          </div>

          <div className="form-group">
            <label>Confirm password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-control"
                style={{ paddingRight: '40px' }}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <div style={{ fontSize: '11px', color: '#c53030', marginTop: '4px' }}>
                Passwords do not match
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '10px', fontSize: '14px', marginTop: '10px' }}
          >
            {loading ? 'Creating Account...' : 'Continue'}
          </button>
        </form>

        <div style={{ fontSize: '12px', color: '#565959', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Already have an account? <Link to="/login" style={{ color: '#007185' }}>Sign in</Link></span>
        </div>

        {/* Become a Delivery Partner Link */}
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #d5d9d9', textAlign: 'center' }}>
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
    </div>
  );
};
