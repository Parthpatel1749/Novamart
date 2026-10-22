import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, authAPI, addressAPI } from '../../services/api';
import { formatPrice, formatDate, getOrderStatusInfo } from '../../utils/formatters';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import {
  Package,
  MapPin,
  User,
  Heart,
  RotateCcw,
  Bell,
  Truck,
  Plus,
  KeyRound,
  CheckCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Unlink,
  AlertCircle,
} from 'lucide-react';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';
import { GoogleAccountLinkModal } from '../../components/GoogleAccountLinkModal';

export const CustomerDashboardPage = () => {
  const { user, updateUserProfile, unlinkGoogle, googleLogin } = useAuth();
  const { wishlist, removeFromWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Address Management
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    streetAddress: '',
    landmark: '',
    city: 'Vadodara',
    state: 'Gujarat',
    pinCode: '390001',
    isDefault: false,
  });
  const [addressMsg, setAddressMsg] = useState('');

  // Profile Edit
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');

  // Password Reset
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  // Google Single Sign-On Account Linking State
  const [googleMsg, setGoogleMsg] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [linkingData, setLinkingData] = useState(null);

  const handleUnlinkGoogle = async () => {
    if (!window.confirm('Are you sure you want to disconnect Google Sign-In from your NovaMart account?')) {
      return;
    }
    setGoogleError('');
    setGoogleMsg('');
    try {
      await unlinkGoogle();
      setGoogleMsg('Google account disconnected successfully.');
      setTimeout(() => setGoogleMsg(''), 3000);
    } catch (err) {
      setGoogleError(err.message || 'Failed to disconnect Google account.');
      setTimeout(() => setGoogleError(''), 4000);
    }
  };

  const handleLinkGoogleSuccess = async (idToken) => {
    setGoogleError('');
    setGoogleMsg('');
    try {
      const result = await googleLogin(idToken);
      if (result?.linkingRequired) {
        setLinkingData({
          email: result.email,
          fullName: result.fullName,
          idToken,
        });
        return;
      }
      setGoogleMsg('Google account linked successfully!');
      setTimeout(() => setGoogleMsg(''), 3000);
    } catch (err) {
      setGoogleError(err.message || 'Failed to link Google account.');
      setTimeout(() => setGoogleError(''), 4000);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderAPI.getUserOrders();
        if (res?.data) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error('Error fetching user orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  // Synchronize and manage user's own delivery addresses
  useEffect(() => {
    if (!user) return;
    const storageKey = `novamart_addresses_${user.email || user.id}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure outdated placeholder names are replaced with user's own profile info
          const cleaned = parsed.map((a) => ({
            ...a,
            fullName: (!a.fullName || a.fullName === 'Priya Sharma') ? (user.fullName || 'User') : a.fullName,
            phone: (!a.phone || (a.phone === '9898000004' && user.phone)) ? (user.phone || a.phone) : a.phone,
          }));
          setAddresses(cleaned);
          localStorage.setItem(storageKey, JSON.stringify(cleaned));
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved addresses', e);
      }
    }

    // Try backend addresses API
    addressAPI.getAddresses()
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setAddresses(res.data);
          localStorage.setItem(storageKey, JSON.stringify(res.data));
          return;
        }
      })
      .catch(() => {});

    // If no saved addresses found, derive from user's latest placed order
    if (orders.length > 0 && orders[0].shippingStreetAddress) {
      const o = orders[0];
      const initial = [
        {
          id: 'addr_' + Date.now(),
          fullName: o.shippingFullName || user.fullName || '',
          phone: o.shippingPhone || user.phone || '',
          streetAddress: o.shippingStreetAddress,
          landmark: o.shippingLandmark || '',
          city: o.shippingCity || 'Vadodara',
          state: o.shippingState || 'Gujarat',
          pinCode: o.shippingPinCode || '390001',
          isDefault: true,
        },
      ];
      setAddresses(initial);
      localStorage.setItem(storageKey, JSON.stringify(initial));
    } else {
      // Create user's own primary address profile (using logged-in user's identity)
      const initial = [
        {
          id: 'addr_' + Date.now(),
          fullName: user.fullName || '',
          phone: user.phone || '9898000004',
          streetAddress: 'Flat 302, Shivalik Residency, R.C. Dutt Road, Alkapuri',
          landmark: 'Near Express Hotel',
          city: 'Vadodara',
          state: 'Gujarat',
          pinCode: '390001',
          isDefault: true,
        },
      ];
      setAddresses(initial);
      localStorage.setItem(storageKey, JSON.stringify(initial));
    }
  }, [user, orders]);

  const handleOpenAddModal = () => {
    setAddressForm({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      streetAddress: '',
      landmark: '',
      city: 'Vadodara',
      state: 'Gujarat',
      pinCode: '390001',
      isDefault: addresses.length === 0,
    });
    setEditingAddressId(null);
    setShowAddressModal(true);
  };

  const handleOpenEditModal = (addr) => {
    setAddressForm({
      fullName: addr.fullName || user?.fullName || '',
      phone: addr.phone || user?.phone || '',
      streetAddress: addr.streetAddress || '',
      landmark: addr.landmark || '',
      city: addr.city || 'Vadodara',
      state: addr.state || 'Gujarat',
      pinCode: addr.pinCode || '390001',
      isDefault: !!addr.isDefault,
    });
    setEditingAddressId(addr.id);
    setShowAddressModal(true);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    let updated;
    const storageKey = `novamart_addresses_${user?.email || user?.id}`;

    if (editingAddressId) {
      updated = addresses.map((a) => {
        if (a.id === editingAddressId) {
          return { ...addressForm, id: editingAddressId };
        }
        return addressForm.isDefault ? { ...a, isDefault: false } : a;
      });
      if (typeof editingAddressId === 'number') {
        addressAPI.updateAddress(editingAddressId, addressForm).catch(() => {});
      }
    } else {
      const newAddr = { ...addressForm, id: 'addr_' + Date.now() };
      if (newAddr.isDefault) {
        updated = addresses.map((a) => ({ ...a, isDefault: false }));
        updated.push(newAddr);
      } else {
        updated = [...addresses, newAddr];
      }
      addressAPI.createAddress(newAddr).catch(() => {});
    }

    setAddresses(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setShowAddressModal(false);
    setAddressMsg(editingAddressId ? 'Address updated successfully!' : 'New address added successfully!');
    setTimeout(() => setAddressMsg(''), 3000);
  };

  const handleDeleteAddress = (id) => {
    const updated = addresses.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    setAddresses(updated);
    const storageKey = `novamart_addresses_${user?.email || user?.id}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
    if (typeof id === 'number') {
      addressAPI.deleteAddress(id).catch(() => {});
    }
    setAddressMsg('Address removed successfully.');
    setTimeout(() => setAddressMsg(''), 3000);
  };

  const handleSetDefaultAddress = (id) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);
    const storageKey = `novamart_addresses_${user?.email || user?.id}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
    if (typeof id === 'number') {
      addressAPI.setDefaultAddress(id).catch(() => {});
    }
    setAddressMsg('Default delivery address updated.');
    setTimeout(() => setAddressMsg(''), 3000);
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    updateUserProfile({ fullName, phone });
    setProfileMsg('Profile updated successfully!');
    setTimeout(() => setProfileMsg(''), 3000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await authAPI.resetPassword({
        email: user.email,
        oldPassword,
        newPassword,
      });
      setPasswordMsg('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  const returnOrders = orders.filter((o) =>
    ['RETURN_REQUESTED', 'RETURNED', 'REFUND_INITIATED', 'REFUNDED'].includes(o.orderStatus)
  );

  return (
    <div style={{ backgroundColor: '#eaeded', minHeight: '100vh', padding: '30px 0 60px' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f1111', marginBottom: '24px' }}>
          Your Account
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Navigation Sidebar */}
          <div className="nova-card" style={{ padding: '16px' }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #eee', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {user?.pictureUrl ? (
                <img
                  src={user.pictureUrl}
                  alt={user.fullName || 'User avatar'}
                  referrerPolicy="no-referrer"
                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #febd69', flexShrink: 0 }}
                />
              ) : null}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.fullName}</div>
                <div style={{ fontSize: '12px', color: '#565959', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => setTab('orders')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: activeTab === 'orders' ? '#fffaf2' : 'transparent',
                  color: activeTab === 'orders' ? '#b06000' : '#111',
                  fontWeight: activeTab === 'orders' ? '700' : '500',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderLeft: activeTab === 'orders' ? '4px solid #ff9900' : '4px solid transparent',
                }}
              >
                <Package size={16} /> Your Orders ({orders.length})
              </button>

              <button
                onClick={() => setTab('wishlist')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: activeTab === 'wishlist' ? '#fffaf2' : 'transparent',
                  color: activeTab === 'wishlist' ? '#b06000' : '#111',
                  fontWeight: activeTab === 'wishlist' ? '700' : '500',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderLeft: activeTab === 'wishlist' ? '4px solid #ff9900' : '4px solid transparent',
                }}
              >
                <Heart size={16} /> Wishlist ({wishlistCount})
              </button>

              <button
                onClick={() => setTab('addresses')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: activeTab === 'addresses' ? '#fffaf2' : 'transparent',
                  color: activeTab === 'addresses' ? '#b06000' : '#111',
                  fontWeight: activeTab === 'addresses' ? '700' : '500',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderLeft: activeTab === 'addresses' ? '4px solid #ff9900' : '4px solid transparent',
                }}
              >
                <MapPin size={16} /> Delivery Addresses
              </button>

              <button
                onClick={() => setTab('returns')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: activeTab === 'returns' ? '#fffaf2' : 'transparent',
                  color: activeTab === 'returns' ? '#b06000' : '#111',
                  fontWeight: activeTab === 'returns' ? '700' : '500',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderLeft: activeTab === 'returns' ? '4px solid #ff9900' : '4px solid transparent',
                }}
              >
                <RotateCcw size={16} /> Returns & Refunds ({returnOrders.length})
              </button>

              <button
                onClick={() => setTab('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: activeTab === 'profile' ? '#fffaf2' : 'transparent',
                  color: activeTab === 'profile' ? '#b06000' : '#111',
                  fontWeight: activeTab === 'profile' ? '700' : '500',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderLeft: activeTab === 'profile' ? '4px solid #ff9900' : '4px solid transparent',
                }}
              >
                <User size={16} /> Login & Security
              </button>

              <button
                onClick={() => setTab('notifications')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: activeTab === 'notifications' ? '#fffaf2' : 'transparent',
                  color: activeTab === 'notifications' ? '#b06000' : '#111',
                  fontWeight: activeTab === 'notifications' ? '700' : '500',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderLeft: activeTab === 'notifications' ? '4px solid #ff9900' : '4px solid transparent',
                }}
              >
                <Bell size={16} /> Delivery Alerts
              </button>
            </div>
          </div>

          {/* Tab Contents */}
          <div>
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f1111' }}>Past Orders</h2>

                {loadingOrders ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>Loading your orders...</div>
                ) : orders.length === 0 ? (
                  <div className="nova-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <Package size={48} color="#a0aec0" style={{ margin: '0 auto 12px' }} />
                    <h3>No orders found</h3>
                    <p style={{ fontSize: '13px', color: '#565959', margin: '8px 0 16px' }}>
                      You haven't placed any orders yet.
                    </p>
                    <Link to="/products" className="btn-primary" style={{ textDecoration: 'none' }}>
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  orders.map((order) => {
                    const status = getOrderStatusInfo(order.orderStatus);
                    return (
                      <div key={order.id} className="nova-card" style={{ padding: '0', overflow: 'hidden' }}>
                        {/* Order Header */}
                        <div
                          style={{
                            backgroundColor: '#f0f2f2',
                            padding: '14px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid #d5d9d9',
                            fontSize: '12px',
                            color: '#565959',
                            flexWrap: 'wrap',
                            gap: '12px',
                          }}
                        >
                          <div>
                            <div>ORDER PLACED</div>
                            <div style={{ fontWeight: '700', color: '#0f1111' }}>{formatDate(order.createdAt)}</div>
                          </div>

                          <div>
                            <div>TOTAL</div>
                            <div style={{ fontWeight: '700', color: '#0f1111' }}>{formatPrice(order.finalAmount)}</div>
                          </div>

                          <div>
                            <div>SHIP TO</div>
                            <div style={{ fontWeight: '700', color: '#007185' }}>{order.shippingFullName}</div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div>ORDER # {order.orderNumber}</div>
                            <Link to={`/orders/${order.id}`} style={{ color: '#007185', fontWeight: '600' }}>
                              View order details
                            </Link>
                          </div>
                        </div>

                        {/* Order Body */}
                        <div style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className={`badge ${status.badgeClass}`}>{status.label}</span>
                              <span style={{ fontSize: '13px', color: '#565959' }}>
                                Zone: {order.deliveryZoneName || 'Vadodara Central'} ({order.shippingPinCode})
                              </span>
                            </div>

                            {order.deliveryOtp && order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fffaf2', border: '1px solid #ffd591', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', color: '#b06000' }}>
                                <KeyRound size={14} /> OTP: <strong style={{ letterSpacing: '2px', fontSize: '14px' }}>{order.deliveryOtp}</strong>
                              </div>
                            )}
                          </div>

                          {/* Items */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {order.items?.map((item) => (
                              <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <img
                                  src={item.productImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&q=80'}
                                  alt={item.productTitle}
                                  style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '4px' }}
                                />
                                <div style={{ flex: 1 }}>
                                  <Link to={`/products/${item.productId}`} style={{ fontSize: '14px', fontWeight: '600', color: '#0f1111', textDecoration: 'none' }}>
                                    {item.productTitle}
                                  </Link>
                                  <div style={{ fontSize: '12px', color: '#565959', marginTop: '2px' }}>
                                    Quantity: {item.quantity} | {formatPrice(item.subtotal)}
                                  </div>
                                </div>

                                <Link to={`/orders/${order.id}`} className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px', textDecoration: 'none' }}>
                                  <Truck size={14} /> Track Package
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f1111' }}>Your Wishlist ({wishlistCount})</h2>
                {wishlist.length === 0 ? (
                  <div className="nova-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <Heart size={48} color="#a0aec0" style={{ margin: '0 auto 12px' }} />
                    <h3>Your Wishlist is empty</h3>
                    <p style={{ fontSize: '13px', color: '#565959', margin: '8px 0 16px' }}>
                      Explore products and click the heart icon on any product to save items for later.
                    </p>
                    <Link to="/products" className="btn-primary" style={{ textDecoration: 'none' }}>
                      Explore Products
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                    {wishlist.map((item) => (
                      <div key={item.id} className="nova-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <img
                            src={item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80'}
                            alt={item.title}
                            style={{ width: '100%', height: '160px', objectFit: 'contain', marginBottom: '12px' }}
                          />
                          <div style={{ fontSize: '11px', color: '#565959', textTransform: 'uppercase', fontWeight: '700' }}>
                            {item.brand}
                          </div>
                          <Link to={`/products/${item.id}`} style={{ fontSize: '14px', fontWeight: '600', color: '#0f1111', textDecoration: 'none', display: 'block', margin: '4px 0' }}>
                            {item.title}
                          </Link>
                          <div style={{ fontSize: '16px', fontWeight: '800', color: '#b12704', marginTop: '6px' }}>
                            {formatPrice(item.discountedPrice || item.price)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                          <button
                            onClick={() => {
                              addToCart(item, 1);
                              removeFromWishlist(item.id);
                            }}
                            className="btn-primary"
                            style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                          >
                            Move to Cart
                          </button>
                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            className="btn-secondary"
                            style={{ fontSize: '12px', padding: '8px' }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="nova-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Your Addresses</h2>
                    <p style={{ fontSize: '13px', color: '#565959', margin: '4px 0 0 0' }}>Manage delivery locations associated with your account</p>
                  </div>
                  <button
                    onClick={handleOpenAddModal}
                    className="btn-primary"
                    style={{ fontSize: '13px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={16} /> Add Address
                  </button>
                </div>

                {addressMsg && (
                  <div style={{ backgroundColor: '#f0f9f5', border: '1px solid #b7eb8f', color: '#135200', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={16} /> {addressMsg}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      style={{
                        border: addr.isDefault ? '2px solid #ff9900' : '1px solid #d5d9d9',
                        borderRadius: '8px',
                        padding: '16px',
                        backgroundColor: addr.isDefault ? '#fffaf2' : '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div>
                        {addr.isDefault && (
                          <span className="badge badge-warning" style={{ marginBottom: '8px', display: 'inline-block' }}>
                            Default Address
                          </span>
                        )}
                        <h4 style={{ fontSize: '15px', fontWeight: '700', marginTop: addr.isDefault ? '4px' : '0', color: '#0f1111' }}>
                          {addr.fullName || user?.fullName}
                        </h4>
                        <p style={{ fontSize: '13px', color: '#555', marginTop: '6px', lineHeight: '1.5' }}>
                          {addr.streetAddress}{addr.landmark ? `, ${addr.landmark}` : ''}<br />
                          {addr.city}, {addr.state} - <strong>{addr.pinCode}</strong><br />
                          Phone: {addr.phone || user?.phone}
                        </p>
                        <div style={{ fontSize: '12px', color: '#067d62', fontWeight: '600', marginTop: '10px' }}>
                          ✓ Serviced by {addr.city || 'Vadodara'} Central Hub
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f0f0f0', fontSize: '13px' }}>
                        <button
                          onClick={() => handleOpenEditModal(addr)}
                          style={{ background: 'none', border: 'none', color: '#007185', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                        >
                          Edit
                        </button>
                        {addresses.length > 1 && (
                          <>
                            <span style={{ color: '#ccc' }}>|</span>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              style={{ background: 'none', border: 'none', color: '#c40000', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                            >
                              Remove
                            </button>
                          </>
                        )}
                        {!addr.isDefault && (
                          <>
                            <span style={{ color: '#ccc' }}>|</span>
                            <button
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              style={{ background: 'none', border: 'none', color: '#007185', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                            >
                              Set as Default
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add Address Card */}
                  <div
                    onClick={handleOpenAddModal}
                    style={{
                      border: '2px dashed #c7c7c7',
                      borderRadius: '8px',
                      padding: '24px 16px',
                      backgroundColor: '#fbfbfb',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      minHeight: '180px',
                    }}
                  >
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#f0f2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus size={20} color="#0f1111" />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: '#0f1111' }}>Add Address</span>
                    <span style={{ fontSize: '12px', color: '#767676' }}>Add a new delivery address</span>
                  </div>
                </div>
              </div>
            )}

            {/* Returns Tab */}
            {activeTab === 'returns' && (
              <div className="nova-card" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>Returns & Refunds</h2>
                {returnOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                    No return or refund requests recorded.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {returnOrders.map((o) => (
                      <div key={o.id} style={{ border: '1px solid #d5d9d9', borderRadius: '8px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong>{o.orderNumber}</strong>
                          <span className="badge badge-warning">{o.orderStatus}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#555', marginTop: '6px' }}>
                          Reason: {o.returnReason || 'General return'}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '700', marginTop: '6px' }}>
                          Refund Amount: {formatPrice(o.finalAmount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="nova-card" style={{ padding: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Personal Information</h2>
                  <form onSubmit={handleUpdateProfile}>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" className="form-control" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input type="text" className="form-control" value={user?.email || ''} disabled style={{ backgroundColor: '#f5f5f5' }} />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="text" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    {profileMsg && <div style={{ color: '#067d62', fontSize: '13px', marginBottom: '10px' }}>{profileMsg}</div>}
                    <button type="submit" className="btn-primary">Save Changes</button>
                  </form>
                </div>

                {/* Connected Accounts (Google Single Sign-On) */}
                <div className="nova-card" style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Connected Accounts</h2>
                    <p style={{ fontSize: '13px', color: '#565959', margin: '4px 0 0' }}>
                      Manage third-party single sign-on identities linked to your NovaMart account
                    </p>
                  </div>

                  {googleMsg && (
                    <div style={{ backgroundColor: '#f0f9f5', border: '1px solid #b7eb8f', color: '#135200', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={16} /> {googleMsg}
                    </div>
                  )}

                  {googleError && (
                    <div style={{ backgroundColor: '#fff5f5', border: '1px solid #fed7d7', color: '#c53030', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={16} /> {googleError}
                    </div>
                  )}

                  <div
                    style={{
                      border: '1px solid #d5d9d9',
                      borderRadius: '8px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #dadce0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '700', fontSize: '15px' }}>Google Account</span>
                          {user?.authProvider?.includes('GOOGLE') || user?.googleId ? (
                            <span className="badge badge-success" style={{ fontSize: '11px', backgroundColor: '#e6f4ea', color: '#137333', border: '1px solid #ceead6' }}>
                              Connected
                            </span>
                          ) : (
                            <span className="badge" style={{ fontSize: '11px', backgroundColor: '#f1f3f4', color: '#5f6368', border: '1px solid #dadce0' }}>
                              Not Connected
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#565959', marginTop: '2px' }}>
                          {user?.authProvider?.includes('GOOGLE') || user?.googleId
                            ? `Connected with ${user?.email}`
                            : 'Sign in to NovaMart with 1-click using your Google identity'}
                        </div>
                      </div>
                    </div>

                    <div>
                      {user?.authProvider?.includes('GOOGLE') || user?.googleId ? (
                        <button
                          type="button"
                          onClick={handleUnlinkGoogle}
                          className="btn-secondary"
                          style={{ fontSize: '12px', padding: '6px 12px', color: '#c40000', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Unlink size={14} /> Disconnect Google
                        </button>
                      ) : (
                        <div style={{ minWidth: '200px' }}>
                          <GoogleSignInButton
                            text="continue_with"
                            onSuccess={handleLinkGoogleSuccess}
                            onError={(msg) => setGoogleError(msg)}
                            width={220}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="nova-card" style={{ padding: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Change Password</h2>
                  <form onSubmit={handlePasswordChange}>
                    <div className="form-group">
                      <label>Old Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showOldPassword ? 'text' : 'password'}
                          className="form-control"
                          style={{ paddingRight: '40px' }}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
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
                          title={showOldPassword ? 'Hide password' : 'Show password'}
                        >
                          {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          className="form-control"
                          style={{ paddingRight: '40px' }}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
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
                          title={showNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    {passwordMsg && <div style={{ color: '#067d62', fontSize: '13px', marginBottom: '10px' }}>{passwordMsg}</div>}
                    <button type="submit" className="btn-secondary">Update Password</button>
                  </form>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="nova-card" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>Delivery & Order Alerts</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f0f9f5', border: '1px solid #b7eb8f', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <CheckCircle size={18} color="#067d62" />
                    <div style={{ fontSize: '13px' }}>
                      <strong>Vadodara Central Delivery Alert:</strong> Express morning dispatch slots are active for 390001, 390002.
                    </div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#e8f0fe', border: '1px solid #c2e7ff', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Truck size={18} color="#1a73e8" />
                    <div style={{ fontSize: '13px' }}>
                      <strong>Hyperlocal Dispatch:</strong> Orders placed before 4:00 PM are handed to your local delivery boy on the same day.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Add / Edit Modal */}
      {showAddressModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setShowAddressModal(false)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              boxShadow: 'var(--shadow-md)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
                {editingAddressId ? 'Edit Delivery Address' : 'Add a New Address'}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddress}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Full name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  placeholder="First and last name"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Mobile number</label>
                <input
                  type="tel"
                  className="form-control"
                  required
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Flat, House no., Building, Company, Apartment</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={addressForm.streetAddress}
                  onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })}
                  placeholder="e.g. Flat 302, Shivalik Residency, R.C. Dutt Road"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Landmark (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={addressForm.landmark}
                  onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                  placeholder="e.g. Near Express Hotel"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Town/City</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="Vadodara"
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>State</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    placeholder="Gujarat"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>6-digit PIN code</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  maxLength={6}
                  value={addressForm.pinCode}
                  onChange={(e) => setAddressForm({ ...addressForm, pinCode: e.target.value })}
                  placeholder="390001"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  id="isDefaultAddr"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  style={{ accentColor: '#ff9900', width: '16px', height: '16px' }}
                />
                <label htmlFor="isDefaultAddr" style={{ fontSize: '13px', color: '#111', cursor: 'pointer' }}>
                  Make this my default address
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="btn-secondary"
                  style={{ fontSize: '13px', padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ fontSize: '13px', padding: '8px 20px' }}
                >
                  {editingAddressId ? 'Save Changes' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Linking Modal for SSO in Dashboard */}
      <GoogleAccountLinkModal
        isOpen={!!linkingData}
        email={linkingData?.email}
        fullName={linkingData?.fullName}
        idToken={linkingData?.idToken}
        onSuccess={() => {
          setLinkingData(null);
          setGoogleMsg('Google account linked successfully!');
          setTimeout(() => setGoogleMsg(''), 3000);
        }}
        onClose={() => setLinkingData(null)}
      />
    </div>
  );
};
