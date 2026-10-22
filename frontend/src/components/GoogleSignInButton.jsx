import React, { useEffect, useRef, useState } from 'react';

/**
 * GoogleSignInButton
 * Implements Google Identity Services (GIS) following official Google Branding Guidelines.
 * Renders the official Google button and provides fallback with Google G logo SVG.
 */
export const GoogleSignInButton = ({
  onSuccess,
  onError,
  text = 'continue_with',
  width = 328,
  disabled = false,
}) => {
  const buttonDivRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Handle Google credential response
  const handleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      if (onError) onError('No credential received from Google identity services');
      return;
    }

    try {
      setIsProcessing(true);
      if (onSuccess) {
        await onSuccess(response.credential);
      }
    } catch (err) {
      if (onError) {
        onError(err.message || 'Google sign-in failed');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!clientId) {
      return;
    }

    // Check if Google script is already loaded
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    // Load Google Identity Services script
    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => setScriptLoaded(true));
      existingScript.addEventListener('error', () => setLoadError('Failed to load Google Identity Services'));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setLoadError('Unable to load Google Identity Services');
    document.head.appendChild(script);
  }, [clientId]);

  // Initialize and render official Google button once script is ready
  useEffect(() => {
    if (!scriptLoaded || !clientId || !buttonDivRef.current || !window.google?.accounts?.id) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render official Google button inside the container
      buttonDivRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(buttonDivRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: text, // 'signin_with', 'signup_with', 'continue_with'
        shape: 'rectangular',
        logo_alignment: 'left',
        width: width,
      });
    } catch (err) {
      console.warn('GIS renderButton error:', err);
    }
  }, [scriptLoaded, clientId, text, width]);

  // If Client ID is not configured in .env, display a helpful educational notice
  if (!clientId || clientId.includes('your-google-client-id')) {
    return (
      <div
        style={{
          width: '100%',
          border: '1px solid #d5d9d9',
          borderRadius: '6px',
          padding: '10px 14px',
          backgroundColor: '#fafafa',
          color: '#555',
          fontSize: '12px',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', color: '#111' }}>
          <GoogleIcon size={18} />
          <span>Continue with Google</span>
        </div>
        <div style={{ fontSize: '11px', color: '#767676', marginTop: '4px' }}>
          Set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>frontend/.env</code> to enable
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Official Google Button Render Target */}
      <div
        ref={buttonDivRef}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          minHeight: '44px',
          opacity: disabled || isProcessing ? 0.6 : 1,
          pointerEvents: disabled || isProcessing ? 'none' : 'auto',
        }}
      />

      {/* Fallback branded button shown while GIS is loading or in case of load failure */}
      {(!scriptLoaded || loadError) && (
        <button
          type="button"
          disabled={disabled || isProcessing}
          style={{
            width: '100%',
            height: '44px',
            backgroundColor: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '4px',
            color: '#3c4043',
            fontSize: '14px',
            fontWeight: '500',
            fontFamily: 'Roboto, arial, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: disabled || isProcessing ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 2px rgba(60,64,67,0.08)',
            transition: 'background-color 0.2s, box-shadow 0.2s',
          }}
          onClick={() => {
            if (window.google?.accounts?.id) {
              window.google.accounts.id.prompt();
            }
          }}
        >
          <GoogleIcon size={18} />
          <span>{isProcessing ? 'Connecting to Google...' : text === 'signup_with' ? 'Sign up with Google' : 'Continue with Google'}</span>
        </button>
      )}

      {isProcessing && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#007185',
            fontWeight: '600',
            borderRadius: '4px',
          }}
        >
          Authenticating...
        </div>
      )}
    </div>
  );
};

// Accurate Google 4-Color SVG Icon conforming to Google Branding Guidelines
const GoogleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);
