import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MapPin,
  Truck,
  Tag,
  Star,
  LogOut,
  Store,
} from 'lucide-react';

export const AdminNavbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Products & Stock', path: '/admin/products', icon: Package },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Delivery Zones', path: '/admin/delivery-zones', icon: MapPin },
    { label: 'Delivery Partners', path: '/admin/delivery-partners', icon: Truck },
    { label: 'Coupons', path: '/admin/coupons', icon: Tag },
    { label: 'Reviews', path: '/admin/reviews', icon: Star },
    { label: 'Rider Hub', path: '/delivery-partner', icon: Truck },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header style={{ backgroundColor: '#131921', color: '#fff', borderBottom: '2px solid #cc0c39', position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Top Header */}
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 24px',
          minHeight: '64px',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#fff' }}>
            <span style={{ fontSize: '24px', fontWeight: '800' }}>
              Nova<span style={{ color: '#febd69' }}>Mart</span>
            </span>
            <span
              style={{
                backgroundColor: '#cc0c39',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              ADMIN SIDE
            </span>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Quick link to customer storefront */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#232f3e',
              color: '#febd69',
              padding: '6px 12px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '600',
              border: '1px solid #37475a',
            }}
          >
            <Store size={15} /> Customer Storefront
          </Link>

          {/* User info & Logout */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{user?.fullName || 'Admin User'}</div>
                <div style={{ fontSize: '11px', color: '#febd69' }}>{user?.role?.replace('ROLE_', '')}</div>
              </div>
              <button
                onClick={logout}
                style={{
                  backgroundColor: '#37475a',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '12px',
                }}
                title="Sign Out"
              >
                <LogOut size={14} /> Exit
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              style={{
                backgroundColor: '#febd69',
                color: '#111',
                padding: '6px 14px',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '13px',
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Sub Navigation Strip */}
      <nav style={{ backgroundColor: '#232f3e', borderTop: '1px solid #37475a', overflowX: 'auto' }}>
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 24px',
            minHeight: '44px',
            whiteSpace: 'nowrap',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: active ? '700' : '500',
                  color: active ? '#fff' : '#ccc',
                  backgroundColor: active ? '#cc0c39' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} color={active ? '#fff' : '#febd69'} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
