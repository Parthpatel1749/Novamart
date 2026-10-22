import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Truck, LogOut, CheckCircle, Zap } from 'lucide-react';

export const PortalSwitcher = ({ currentPortal = 'user' }) => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [switchingRole, setSwitchingRole] = useState(null);
  const navigate = useNavigate();

  if (!import.meta.env.DEV) {
    return null;
  }

  const handleQuickLogin = async (email, password, roleTarget) => {
    try {
      setSwitchingRole(roleTarget);
      await login(email, password);
      if (roleTarget === 'customer') {
        navigate('/');
      } else if (roleTarget === 'admin') {
        if (currentPortal === 'admin') {
          navigate('/');
        } else {
          navigate('/admin');
        }
      } else if (roleTarget === 'delivery') {
        navigate('/delivery-partner');
      }
    } catch (err) {
      alert('Login error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSwitchingRole(null);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        color: '#e2e8f0',
        fontSize: '12px',
        borderBottom: '1px solid #1e293b',
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '12px',
        zIndex: 1000,
        position: 'relative',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Zap size={13} color="#febd69" />
        <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
          Quick Sign-in:
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => handleQuickLogin('customer@novamart.com', 'Customer@123', 'customer')}
          disabled={switchingRole !== null}
          style={{
            backgroundColor: user?.role === 'ROLE_CUSTOMER' ? '#2563eb' : '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
            padding: '4px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.2s',
          }}
          title="Direct Sign in as Customer (customer@novamart.com)"
        >
          <User size={12} color="#60a5fa" />
          {switchingRole === 'customer' ? 'Signing in...' : 'Customer'}
        </button>

        <button
          onClick={() => handleQuickLogin('admin@novamart.com', 'Admin@123', 'admin')}
          disabled={switchingRole !== null}
          style={{
            backgroundColor: user?.role === 'ROLE_ADMIN' ? '#dc2626' : '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
            padding: '4px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.2s',
          }}
          title="Direct Sign in as Admin (admin@novamart.com)"
        >
          <Shield size={12} color="#f87171" />
          {switchingRole === 'admin' ? 'Signing in...' : 'Admin'}
        </button>

        <button
          onClick={() => handleQuickLogin('partner@novamart.com', 'Partner@123', 'delivery')}
          disabled={switchingRole !== null}
          style={{
            backgroundColor: user?.role === 'ROLE_DELIVERY_PARTNER' ? '#059669' : '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
            padding: '4px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.2s',
          }}
          title="Direct Sign in as Delivery Boy (partner@novamart.com)"
        >
          <Truck size={12} color="#34d399" />
          {switchingRole === 'delivery' ? 'Signing in...' : 'Delivery Boy'}
        </button>
      </div>

      {isAuthenticated && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px', borderLeft: '1px solid #334155', paddingLeft: '10px' }}>
          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600' }}>
            <CheckCircle size={12} />
            {user?.fullName || user?.email} ({user?.role?.replace('ROLE_', '')})
          </span>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{
              backgroundColor: 'transparent',
              color: '#94a3b8',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              padding: '2px 6px',
            }}
            title="Sign out"
          >
            <LogOut size={11} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};
