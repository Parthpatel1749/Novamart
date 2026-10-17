import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Flame, ShieldAlert, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SubNavbar = () => {
  const { isAdmin, isDeliveryPartner } = useAuth();

  return (
    <nav style={{ backgroundColor: '#232f3e', color: '#fff', fontSize: '14px', overflowX: 'auto' }}>
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          padding: '8px 24px',
          whiteSpace: 'nowrap',
          minHeight: '44px',
        }}
      >
        <Link
          to="/products"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: '700',
            padding: '5px 8px',
            borderRadius: '4px',
          }}
          className="nav-link-hover"
        >
          <Menu size={18} /> All Products
        </Link>

        <Link
          to="/products?category=Electronics"
          style={{ color: '#fff', textDecoration: 'none', padding: '5px 8px', borderRadius: '4px' }}
          className="nav-link-hover"
        >
          Electronics
        </Link>

        <Link
          to="/products?category=Fashion"
          style={{ color: '#fff', textDecoration: 'none', padding: '5px 8px', borderRadius: '4px' }}
          className="nav-link-hover"
        >
          Fashion & Apparel
        </Link>

        <Link
          to="/products?category=Home%20%26%20Kitchen"
          style={{ color: '#fff', textDecoration: 'none', padding: '5px 8px', borderRadius: '4px' }}
          className="nav-link-hover"
        >
          Home & Kitchen
        </Link>

        <Link
          to="/products?category=Beauty%20%26%20Care"
          style={{ color: '#fff', textDecoration: 'none', padding: '5px 8px', borderRadius: '4px' }}
          className="nav-link-hover"
        >
          Beauty & Grooming
        </Link>

        <Link
          to="/products?sortBy=rating"
          style={{
            color: '#febd69',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: '600',
            padding: '5px 8px',
            borderRadius: '4px',
          }}
          className="nav-link-hover"
        >
          <Flame size={16} color="#ff9900" /> Best Sellers
        </Link>

        {isAdmin && (
          <Link
            to="/admin"
            style={{
              backgroundColor: '#cc0c39',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginLeft: 'auto',
            }}
          >
            <ShieldAlert size={14} /> Admin
          </Link>
        )}

        {isDeliveryPartner && (
          <Link
            to="/delivery-partner"
            style={{
              backgroundColor: '#067d62',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Truck size={14} /> Partner Hub
          </Link>
        )}
      </div>
    </nav>
  );
};
