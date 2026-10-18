import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, ArrowLeft, Mail, Shield, User, Truck } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  // Step 1: Email verification, Step 2: Set new password, Step 3: Success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: Submit email to check if user exists in database and generate reset token
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email.trim());
      // The backend returns { success: true, message: "...", data: "<token>" }
      const token = response?.data || response?.token || response;
      if (token) {
        setResetToken(typeof token === 'string' ? token : '');
      }
      setStep(2);
    } catch (err) {
      setError(err.message || 'Unable to find an account with that email in our database.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit new password to database via /api/auth/reset-password
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords are identical.');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword({
        email: email.trim(),
        resetToken: resetToken || 'temp-token',
        newPassword,
      });

      setSuccessMsg('Your password has been securely updated in the database!');
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to update password in database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillEmail = (demoEmail) => {
    setEmail(demoEmail);
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

      {/* Main Card */}
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
        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <>
            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '10px' }}>Password assistance</h1>
            <p style={{ fontSize: '13px', color: '#565959', marginBottom: '18px', lineHeight: '1.4' }}>
              Enter the email address associated with your NovaMart account to reset your password.
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

            <form onSubmit={handleEmailSubmit}>
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

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '10px', fontSize: '14px', marginTop: '14px' }}
              >
                {loading ? 'Verifying Account...' : 'Continue'}
              </button>
            </form>

            <div style={{ fontSize: '12px', color: '#565959', marginTop: '20px', lineHeight: '1.5' }}>
              Has your email address changed? If you no longer use the e-mail address associated with your NovaMart account, you may contact{' '}
              <span style={{ color: '#007185', cursor: 'pointer' }}>Customer Service</span> for help.
            </div>

            {/* Quick Demo Accounts helper */}
            <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#767676', marginBottom: '8px', textAlign: 'center', textTransform: 'uppercase' }}>
                Test with Database Accounts (1-Click)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => fillEmail('customer@novamart.com')}
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '6px', justifyContent: 'flex-start' }}
                >
                  <User size={14} color="#007185" /> customer@novamart.com
                </button>
                <button
                  type="button"
                  onClick={() => fillEmail('admin@novamart.com')}
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '6px', justifyContent: 'flex-start' }}
                >
                  <Shield size={14} color="#cc0c39" /> admin@novamart.com
                </button>
                <button
                  type="button"
                  onClick={() => fillEmail('partner@novamart.com')}
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '6px', justifyContent: 'flex-start' }}
                >
                  <Truck size={14} color="#067d62" /> partner@novamart.com
                </button>
              </div>
            </div>
          </>
        )}

        {/* STEP 2: Enter New Password */}
        {step === 2 && (
          <>
            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Create new password</h1>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#15803d',
                marginBottom: '16px',
              }}
            >
              <CheckCircle2 size={16} />
              <span>
                Account found: <strong>{email}</strong>
              </span>
            </div>

            <p style={{ fontSize: '13px', color: '#565959', marginBottom: '18px', lineHeight: '1.4' }}>
              We'll ask for this password whenever you sign in to NovaMart.
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

            <form onSubmit={handlePasswordReset}>
              <div className="form-group">
                <label>New password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    style={{ paddingRight: '40px' }}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                <label>Re-enter password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-control"
                    style={{ paddingRight: '40px' }}
                    placeholder="Re-enter your new password"
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
                {confirmPassword && newPassword !== confirmPassword && (
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
                {loading ? 'Saving in Database...' : 'Save changes and Sign In'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError('');
                }}
                className="btn-secondary"
                style={{ width: '100%', padding: '8px', fontSize: '13px', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <ArrowLeft size={14} /> Back to Email
              </button>
            </form>
          </>
        )}

        {/* STEP 3: Success Confirmation */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f1111', marginBottom: '8px' }}>
              Password Reset Complete!
            </h1>

            <p style={{ fontSize: '13px', color: '#565959', lineHeight: '1.5', marginBottom: '22px' }}>
              Your password has been successfully updated in the database for <strong>{email}</strong>. You can now sign in with your new password.
            </p>

            <Link
              to="/login"
              className="btn-primary"
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                textDecoration: 'none',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            >
              Sign In Now
            </Link>
          </div>
        )}

        {/* Back to sign in link */}
        {step !== 3 && (
          <div style={{ fontSize: '12px', color: '#565959', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '16px', textAlign: 'center' }}>
            Remember your password?{' '}
            <Link to="/login" style={{ color: '#007185', fontWeight: '600', textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        )}
      </div>

      {/* New to NovaMart link */}
      <div style={{ width: '100%', maxWidth: '380px', marginTop: '20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0', color: '#767676', fontSize: '12px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e7e7e7' }} />
          <span style={{ padding: '0 8px' }}>Need a new account?</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e7e7e7' }} />
        </div>

        <Link
          to="/register"
          className="btn-secondary"
          style={{ width: '100%', padding: '10px', fontSize: '13px', textDecoration: 'none', display: 'block', boxSizing: 'border-box' }}
        >
          Create your NovaMart account
        </Link>
      </div>
    </div>
  );
};
