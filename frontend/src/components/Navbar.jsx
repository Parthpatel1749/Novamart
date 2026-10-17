import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import { useWishlist } from '../context/WishlistContext';
import {
  Search,
  ShoppingCart,
  MapPin,
  User,
  Heart,
  Package,
  Shield,
  Truck,
  ChevronDown,
  LogOut,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isDeliveryPartner } = useAuth();
  const { cart } = useCart();
  const { wishlistCount } = useWishlist();
  const { pinCode, city, openLocationModal } = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?query=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <header style={{ backgroundColor: '#131921', color: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          gap: '16px',
          minHeight: '72px',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'none',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: '4px',
          }}
          className="nav-link-hover"
        >
          <span style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Nova<span style={{ color: '#febd69' }}>Mart</span>
          </span>
          <span style={{ fontSize: '12px', color: '#ccc', alignSelf: 'flex-start', marginTop: '2px', fontWeight: '600' }}>
            .in
          </span>
        </Link>

        {/* Deliver to Location Picker */}
        <button
          onClick={openLocationModal}
          style={{
            background: 'none',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 10px',
            borderRadius: '4px',
            textAlign: 'left',
            cursor: 'pointer',
          }}
          className="nav-link-hover"
          title="Change delivery location"
        >
          <MapPin size={22} color="#febd69" />
          <div style={{ lineHeight: '1.25' }}>
            <span style={{ fontSize: '12px', color: '#ccc', display: 'block' }}>Deliver to</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap' }}>
              {city} {pinCode}
            </span>
          </div>
        </button>

        {/* Large Search Bar */}
        <form
          onSubmit={handleSearch}
          style={{
            flex: 1,
            display: 'flex',
            maxWidth: '860px',
            height: '46px',
            borderRadius: '6px',
            overflow: 'hidden',
            backgroundColor: '#fff',
            boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
          }}
        >
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              backgroundColor: '#f3f3f3',
              border: 'none',
              padding: '0 14px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#333',
              outline: 'none',
              borderRight: '1px solid #ddd',
              cursor: 'pointer',
              height: '100%',
            }}
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Home & Kitchen">Home & Kitchen</option>
            <option value="Beauty & Care">Beauty & Care</option>
          </select>

          <input
            type="text"
            placeholder="Search NovaMart for products, electronics, brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              padding: '0 16px',
              fontSize: '15px',
              outline: 'none',
              color: '#111',
              height: '100%',
            }}
          />

          <button
            type="submit"
            style={{
              backgroundColor: '#febd69',
              border: 'none',
              width: '54px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3a847')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#febd69')}
            title="Search"
          >
            <Search size={22} color="#111" />
          </button>
        </form>

        {/* Navigation Action Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Account Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setShowAccountMenu(true)}
            onMouseLeave={() => setShowAccountMenu(false)}
          >
            <div
              onClick={() => {
                if (!isAuthenticated) navigate('/login');
                else navigate('/dashboard');
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '6px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                lineHeight: '1.25',
              }}
              className="nav-link-hover"
            >
              <span style={{ fontSize: '12px', color: '#ccc' }}>
                Hello, {isAuthenticated ? user?.fullName?.split(' ')[0] : 'Sign In'}
              </span>
              <span style={{ fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px', color: '#fff' }}>
                Account & Lists <ChevronDown size={15} />
              </span>
            </div>

            {/* Flyout Menu */}
            {showAccountMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  right: 0,
                  backgroundColor: '#fff',
                  color: '#111',
                  boxShadow: 'var(--shadow-lg)',
                  borderRadius: '8px',
                  padding: '18px',
                  width: '260px',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  border: '1px solid #ddd',
                }}
              >
                {!isAuthenticated ? (
                  <div style={{ textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: '14px' }}>
                    <Link
                      to="/login"
                      className="btn-primary"
                      style={{ width: '100%', display: 'block', textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box', padding: '10px' }}
                    >
                      Sign In
                    </Link>
                    <div style={{ fontSize: '12px', color: '#555', marginTop: '10px' }}>
                      New customer? <Link to="/register" style={{ color: '#007185', fontWeight: '600' }}>Start here.</Link>
                    </div>
                  </div>
                ) : (
                  <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>{user?.fullName}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{user?.email}</div>
                    <div style={{ marginTop: '6px' }}>
                      <span className="badge badge-info" style={{ fontSize: '11px' }}>
                        {user?.role?.replace('ROLE_', '')}
                      </span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
                  <Link
                    to="/dashboard"
                    style={{ fontSize: '14px', color: '#333', textDecoration: 'none', padding: '4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <User size={16} /> Your Account
                  </Link>
                  <Link
                    to="/orders"
                    style={{ fontSize: '14px', color: '#333', textDecoration: 'none', padding: '4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Package size={16} /> Your Orders
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      style={{
                        fontSize: '14px',
                        color: '#cc0c39',
                        fontWeight: '600',
                        textDecoration: 'none',
                        padding: '4px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Shield size={16} /> Admin Portal
                    </Link>
                  )}

                  {isDeliveryPartner && (
                    <Link
                      to="/delivery-partner"
                      style={{
                        fontSize: '14px',
                        color: '#067d62',
                        fontWeight: '600',
                        textDecoration: 'none',
                        padding: '4px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Truck size={16} /> Delivery Portal
                    </Link>
                  )}

                  {isAuthenticated && (
                    <button
                      onClick={logout}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#c7511f',
                        fontSize: '14px',
                        textAlign: 'left',
                        padding: '8px 0 0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderTop: '1px solid #eee',
                        marginTop: '4px',
                        fontWeight: '500',
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Wishlist Link */}
          <Link
            to={isAuthenticated ? '/dashboard?tab=wishlist' : '/login'}
            style={{
              color: '#fff',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '4px',
              position: 'relative',
            }}
            className="nav-link-hover"
            title="Your Wishlist"
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Heart size={22} color={wishlistCount > 0 ? '#ff9900' : '#fff'} fill={wishlistCount > 0 ? '#ff9900' : 'none'} />
              {wishlistCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: '#cc0c39',
                    color: '#fff',
                    borderRadius: '50%',
                    fontSize: '11px',
                    fontWeight: '800',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </div>
            <span style={{ fontSize: '14px', fontWeight: '700' }}>Wishlist</span>
          </Link>

          {/* Returns & Orders */}
          <Link
            to={isAuthenticated ? '/orders' : '/login'}
            style={{
              color: '#fff',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              padding: '6px 10px',
              borderRadius: '4px',
              lineHeight: '1.25',
            }}
            className="nav-link-hover"
          >
            <span style={{ fontSize: '12px', color: '#ccc' }}>Returns</span>
            <span style={{ fontSize: '14px', fontWeight: '700' }}>& Orders</span>
          </Link>

          {/* Cart Icon with Counter */}
          <Link
            to="/cart"
            style={{
              color: '#fff',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '4px',
              position: 'relative',
            }}
            className="nav-link-hover"
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ShoppingCart size={34} />
              <span
                style={{
                  position: 'absolute',
                  top: '-7px',
                  right: '-7px',
                  backgroundColor: '#ff9900',
                  color: '#111',
                  borderRadius: '50%',
                  fontSize: '13px',
                  fontWeight: '800',
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              >
                {cart.totalItems || 0}
              </span>
            </div>
            <span
              style={{
                fontSize: '15px',
                fontWeight: '700',
                alignSelf: 'flex-end',
                marginBottom: '2px',
              }}
            >
              Cart
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};
