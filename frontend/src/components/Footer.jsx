import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{ marginTop: 'auto', backgroundColor: '#232f3e', color: '#fff' }}>
      {/* Value Badges Banner */}
      <div style={{ backgroundColor: '#1a242f', borderBottom: '1px solid #37475a', padding: '24px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Truck size={28} color="#febd69" />
            <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Area-Based Fast Delivery</h4>
            <p style={{ fontSize: '12px', color: '#ccc' }}>Automated PIN & zone matching for fastest rider dispatch</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={28} color="#febd69" />
            <h4 style={{ fontSize: '14px', fontWeight: '700' }}>100% Secure Checkout</h4>
            <p style={{ fontSize: '12px', color: '#ccc' }}>OTP-verified delivery confirmation & verified payment gateway</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={28} color="#febd69" />
            <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Easy Returns & Refunds</h4>
            <p style={{ fontSize: '12px', color: '#ccc' }}>Hassle-free 7-day return policy on all eligible orders</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Headphones size={28} color="#febd69" />
            <h4 style={{ fontSize: '14px', fontWeight: '700' }}>24/7 Dedicated Support</h4>
            <p style={{ fontSize: '12px', color: '#ccc' }}>Reach out to our customer care team anytime</p>
          </div>
        </div>
      </div>

      {/* Back to top */}
      <div
        onClick={scrollToTop}
        style={{
          backgroundColor: '#37475a',
          textAlign: 'center',
          padding: '12px',
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#485769')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#37475a')}
      >
        Back to top
      </div>

      {/* Links Columns */}
      <div className="container" style={{ padding: '40px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Get to Know Us</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#ddd' }}>
            <li><Link to="/" style={{ color: '#ddd' }}>About NovaMart</Link></li>
            <li><Link to="/products" style={{ color: '#ddd' }}>All Products</Link></li>
            <li><Link to="/" style={{ color: '#ddd' }}>Our Tech Stack</Link></li>
            <li><Link to="/" style={{ color: '#ddd' }}>Sustainable Commerce</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Make Money with Us</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#ddd' }}>
            <li><Link to="/delivery-partner/register" style={{ color: '#febd69', fontWeight: '600' }}>Become a Delivery Partner</Link></li>
            <li><Link to="/delivery-partner/login" style={{ color: '#ddd' }}>Delivery Partner Login</Link></li>
            <li><Link to="/admin" style={{ color: '#ddd' }}>Administrator Access</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Delivery Coverage</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#ddd' }}>
            <li><span style={{ color: '#bbb' }}>Vadodara Central (390001 - 390009)</span></li>
            <li><span style={{ color: '#bbb' }}>Vadodara West (390010 - 390012)</span></li>
            <li><Link to="/" style={{ color: '#ddd' }}>Check Serviceability</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Let Us Help You</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#ddd' }}>
            <li><Link to="/dashboard" style={{ color: '#ddd' }}>Your Account</Link></li>
            <li><Link to="/orders" style={{ color: '#ddd' }}>Your Orders & Tracking</Link></li>
            <li><Link to="/dashboard" style={{ color: '#ddd' }}>Returns & Refunds Centre</Link></li>
            <li><Link to="/login" style={{ color: '#ddd' }}>Customer Help</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright & Original Branding notice */}
      <div style={{ backgroundColor: '#131921', padding: '24px 16px', borderTop: '1px solid #3a4553', textAlign: 'center', fontSize: '12px', color: '#999' }}>
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <span>Conditions of Use & Sale</span>
          <span>Privacy Notice</span>
          <span>Area Delivery Terms</span>
        </div>
        <div>
          © 2026 NovaMart.in - B2C E-Commerce Web Application with Own Area-Based Delivery Management. Built with React + Vite + Spring Boot + JPA.
        </div>
      </div>
    </footer>
  );
};
