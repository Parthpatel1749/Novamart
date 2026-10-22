import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Eye, EyeOff, Lock, ShieldCheck, X } from 'lucide-react';

export const GoogleAccountLinkModal = ({
  isOpen,
  email,
  fullName,
  idToken,
  onSuccess,
  onClose,
}) => {
  const { linkGoogle } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const authData = await linkGoogle(idToken, password);
      if (onSuccess) {
        onSuccess(authData);
      }
    } catch (err) {
      setError(err.message || 'Failed to verify password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '420px',
          padding: '28px 24px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#555',
            padding: '4px',
          }}
          title="Cancel"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#e8f0fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={22} color="#1a73e8" />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#111' }}>
              Link Your Google Account
            </h2>
            <div style={{ fontSize: '12px', color: '#565959' }}>Secure Identity Verification</div>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.5', margin: '0 0 16px' }}>
          An existing NovaMart account was found with <strong>{email}</strong> ({fullName || 'Customer'}).
          To prevent unauthorized account takeovers and enable Google Sign-In, please verify your existing password.
        </p>

        {error && (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              backgroundColor: '#fff5f5',
              border: '1px solid #fed7d7',
              padding: '10px',
              borderRadius: '6px',
              color: '#c53030',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>
              Enter Password for {email}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                style={{ paddingRight: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Current account password"
                required
                autoFocus
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

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ flex: 1, padding: '10px', fontSize: '13px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ flex: 2, padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Lock size={15} />
              {loading ? 'Verifying...' : 'Verify & Link Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
