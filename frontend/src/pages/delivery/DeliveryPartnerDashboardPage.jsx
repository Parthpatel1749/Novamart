import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { deliveryPartnerAPI } from '../../services/api';
import { formatPrice, formatDate, getOrderStatusInfo } from '../../utils/formatters';
import {
  Power,
  Package,
  CheckCircle,
  KeyRound,
  RefreshCw,
  Phone,
  AlertTriangle,
  MapPin,
  Navigation,
} from 'lucide-react';

export const DeliveryPartnerDashboardPage = () => {
  const { user } = useAuth();
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // OTP Confirmation Modal State
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState(null);
  const [inputOtp, setInputOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Failed Delivery Modal State
  const [selectedOrderForFailure, setSelectedOrderForFailure] = useState(null);
  const [failureReason, setFailureReason] = useState('Customer unavailable');

  const fetchDashboardData = async () => {
    try {
      const [profRes, delivRes] = await Promise.all([
        deliveryPartnerAPI.getProfile(),
        deliveryPartnerAPI.getDeliveries(),
      ]);
      if (profRes?.data) setPartnerProfile(profRes.data);
      if (delivRes?.data) setDeliveries(delivRes.data);
    } catch (err) {
      console.error('Error fetching partner deliveries:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleOnline = async () => {
    if (!partnerProfile) return;
    const nextState = !partnerProfile.available;
    try {
      const res = await deliveryPartnerAPI.toggleAvailability(nextState);
      if (res?.data) {
        setPartnerProfile(res.data);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Status transitions
  const handleAccept = async (orderId) => {
    try {
      await deliveryPartnerAPI.accept(orderId);
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePickup = async (orderId) => {
    try {
      await deliveryPartnerAPI.pickup(orderId);
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOutForDelivery = async (orderId) => {
    try {
      await deliveryPartnerAPI.outForDelivery(orderId);
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmOtpDelivery = async (e) => {
    e.preventDefault();
    if (!inputOtp.trim()) return;

    setVerifyingOtp(true);
    setOtpError('');
    try {
      await deliveryPartnerAPI.deliver(selectedOrderForDelivery.id, inputOtp.trim());
      setSelectedOrderForDelivery(null);
      setInputOtp('');
      fetchDashboardData();
    } catch (err) {
      setOtpError(err.message || 'Invalid delivery OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleRecordFailure = async (e) => {
    e.preventDefault();
    try {
      await deliveryPartnerAPI.failed(selectedOrderForFailure.id, failureReason);
      setSelectedOrderForFailure(null);
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>Loading delivery partner dashboard...</div>;
  }

  const activeDeliveries = deliveries.filter(
    (d) => !['DELIVERED', 'CANCELLED', 'DELIVERY_FAILED'].includes(d.orderStatus)
  );
  const completedDeliveries = deliveries.filter((d) => d.orderStatus === 'DELIVERED');
  const earningsEstimate = completedDeliveries.length * 60; // ₹60 per successful delivery payout

  return (
    <div style={{ backgroundColor: '#eaeded', minHeight: '100vh', padding: '24px 0 60px' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        {/* Top Status & Online/Offline Control Card */}
        <div
          className="nova-card"
          style={{
            padding: '24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            borderLeft: partnerProfile?.available ? '6px solid #067d62' : '6px solid #718096',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f1111' }}>
                Welcome, {partnerProfile?.fullName || user?.fullName}
              </h1>
              <span className={`badge ${partnerProfile?.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                {partnerProfile?.status}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#565959', marginTop: '4px' }}>
              Vehicle: <strong>{partnerProfile?.vehicleType} ({partnerProfile?.vehicleNumber})</strong> | Zone:{' '}
              <strong>{partnerProfile?.assignedZones?.map((z) => z.zoneName).join(', ') || 'Vadodara Central'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#565959' }}>Availability Status</div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '800',
                  color: partnerProfile?.available ? '#067d62' : '#e53e3e',
                }}
              >
                ● {partnerProfile?.available ? 'ONLINE (Ready for Orders)' : 'OFFLINE'}
              </div>
            </div>

            <button
              onClick={handleToggleOnline}
              className={partnerProfile?.available ? 'btn-danger' : 'btn-primary'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '700',
              }}
            >
              <Power size={18} />
              {partnerProfile?.available ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        </div>

        {/* 4 Stat Overview Tiles */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div className="nova-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: '#565959', textTransform: 'uppercase', fontWeight: '700' }}>
              Active Tasks
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#ff9900', marginTop: '6px' }}>
              {activeDeliveries.length}
            </div>
            <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>Pending fulfillment</div>
          </div>

          <div className="nova-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: '#565959', textTransform: 'uppercase', fontWeight: '700' }}>
              Completed Deliveries
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#067d62', marginTop: '6px' }}>
              {completedDeliveries.length}
            </div>
            <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>Verified with OTP</div>
          </div>

          <div className="nova-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: '#565959', textTransform: 'uppercase', fontWeight: '700' }}>
              Total Assigned
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#0f1111', marginTop: '6px' }}>
              {deliveries.length}
            </div>
            <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>Lifetime orders</div>
          </div>

          <div className="nova-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: '#565959', textTransform: 'uppercase', fontWeight: '700' }}>
              Estimated Payout
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#007185', marginTop: '6px' }}>
              {formatPrice(earningsEstimate)}
            </div>
            <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>₹60 per completed delivery</div>
          </div>
        </div>

        {/* Assigned Deliveries Table & Action Hub */}
        <div className="nova-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f1111' }}>
                Your Assigned Deliveries
              </h2>
              <div style={{ fontSize: '13px', color: '#565959', marginTop: '2px' }}>
                Follow the delivery lifecycle: Assigned → Pickup from Hub → Out for Delivery → Verify OTP → Delivered
              </div>
            </div>

            <button
              onClick={() => {
                setRefreshing(true);
                fetchDashboardData();
              }}
              className="btn-secondary"
              style={{ fontSize: '13px' }}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {deliveries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#666', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <Package size={48} color="#a0aec0" style={{ margin: '0 auto 12px' }} />
              <h3>No deliveries assigned yet</h3>
              <p style={{ fontSize: '13px', color: '#777', marginTop: '4px' }}>
                Keep your status <strong>ONLINE</strong> to receive new area-based orders for your zone.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {deliveries.map((delivery) => {
                const status = getOrderStatusInfo(delivery.orderStatus);
                return (
                  <div
                    key={delivery.id}
                    style={{
                      border: '1px solid #d5d9d9',
                      borderRadius: '8px',
                      padding: '20px',
                      backgroundColor: delivery.orderStatus === 'DELIVERED' ? '#fcfcfc' : '#fff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '800', color: '#007185' }}>
                          {delivery.orderNumber}
                        </span>
                        <span className={`badge ${status.badgeClass}`}>{status.label}</span>
                        <span style={{ fontSize: '12px', color: '#555' }}>
                          Placed: {formatDate(delivery.createdAt)}
                        </span>
                      </div>

                      <div style={{ fontSize: '14px', fontWeight: '700' }}>
                        Amount: {formatPrice(delivery.finalAmount)}{' '}
                        <span style={{ fontSize: '11px', color: delivery.paymentMethod === 'COD' ? '#e65100' : '#067d62' }}>
                          ({delivery.paymentMethod} - {delivery.paymentStatus})
                        </span>
                      </div>
                    </div>

                    {/* Customer & Address Details */}
                    <div
                      style={{
                        backgroundColor: '#f7fafa',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '16px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                        fontSize: '13px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {/* Customer Details & Direct Calling */}
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: '6px',
                          padding: '12px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div style={{ fontSize: '11px', color: '#565959', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>
                          Customer Contact
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f1111' }}>
                          {delivery.shippingFullName}
                        </div>
                        <div style={{ marginTop: '8px' }}>
                          <a
                            href={`tel:${delivery.shippingPhone}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              backgroundColor: '#e6f4ea',
                              color: '#137333',
                              border: '1px solid #137333',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              fontWeight: '700',
                              fontSize: '12px',
                            }}
                          >
                            <Phone size={14} /> Call: {delivery.shippingPhone}
                          </a>
                        </div>
                      </div>

                      {/* Complete Delivery Address & Navigation */}
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: '6px',
                          padding: '12px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#565959',
                            textTransform: 'uppercase',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginBottom: '4px',
                          }}
                        >
                          <MapPin size={13} color="#c45500" /> Delivery Address
                        </div>
                        <div style={{ fontWeight: '600', color: '#0f1111', lineHeight: '1.4' }}>
                          {delivery.shippingStreetAddress}
                        </div>
                        {delivery.shippingLandmark && (
                          <div style={{ fontSize: '12px', color: '#007185', marginTop: '3px', fontWeight: '600' }}>
                            📍 Landmark: {delivery.shippingLandmark}
                          </div>
                        )}
                        <div style={{ fontSize: '12px', color: '#333', marginTop: '3px' }}>
                          {delivery.shippingCity}, {delivery.shippingState || 'Gujarat'} -{' '}
                          <strong style={{ color: '#0f1111' }}>{delivery.shippingPinCode}</strong>
                        </div>
                        <div style={{ fontSize: '11px', color: '#067d62', fontWeight: '600', marginTop: '4px' }}>
                          Zone: {delivery.deliveryZoneName || 'Vadodara Central'}
                        </div>

                        {/* 1-Click Google Maps Turn-by-Turn Navigation */}
                        <div style={{ marginTop: '10px' }}>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${delivery.shippingStreetAddress}, ${delivery.shippingLandmark ? delivery.shippingLandmark + ', ' : ''}${delivery.shippingCity}, ${delivery.shippingPinCode}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              backgroundColor: '#f0f8ff',
                              color: '#007185',
                              border: '1px solid #007185',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              fontWeight: '700',
                              fontSize: '12px',
                            }}
                          >
                            <Navigation size={13} /> Open in Google Maps
                          </a>
                        </div>
                      </div>

                      {/* Items & Payment Cash Collection */}
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: '6px',
                          padding: '12px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div style={{ fontSize: '11px', color: '#565959', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>
                          Items ({delivery.items?.length || 0}) & Payment
                        </div>
                        <div style={{ color: '#333', fontSize: '12px', marginBottom: '8px' }}>
                          {delivery.items?.map((i) => i.productTitle).join(', ')}
                        </div>
                        {delivery.paymentMethod === 'COD' && delivery.orderStatus !== 'DELIVERED' ? (
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: '700',
                              color: '#b12704',
                              backgroundColor: '#fff8e1',
                              padding: '6px 10px',
                              borderRadius: '4px',
                              border: '1px solid #ffe082',
                            }}
                          >
                            💵 Collect COD Cash: {formatPrice(delivery.finalAmount)}
                          </div>
                        ) : (
                          <div style={{ fontSize: '12px', color: '#067d62', fontWeight: '600' }}>
                            ✓ Prepaid ({delivery.paymentMethod} - {delivery.paymentStatus})
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Lifecycle Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {delivery.orderStatus === 'ASSIGNED' && (
                        <button
                          onClick={() => handleAccept(delivery.id)}
                          className="btn-primary"
                          style={{ fontSize: '13px' }}
                        >
                          Accept Order
                        </button>
                      )}

                      {['ASSIGNED', 'CONFIRMED', 'PROCESSING', 'PACKED'].includes(delivery.orderStatus) && (
                        <button
                          onClick={() => handlePickup(delivery.id)}
                          className="btn-primary"
                          style={{ fontSize: '13px' }}
                        >
                          Pick Up from Hub (status → PICKED_UP)
                        </button>
                      )}

                      {delivery.orderStatus === 'PICKED_UP' && (
                        <button
                          onClick={() => handleOutForDelivery(delivery.id)}
                          className="btn-orange"
                          style={{ fontSize: '13px' }}
                        >
                          Start Delivery (status → OUT_FOR_DELIVERY)
                        </button>
                      )}

                      {['PICKED_UP', 'OUT_FOR_DELIVERY'].includes(delivery.orderStatus) && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedOrderForDelivery(delivery);
                              setInputOtp('');
                              setOtpError('');
                            }}
                            className="btn-primary"
                            style={{
                              fontSize: '13px',
                              backgroundColor: '#067d62',
                              borderColor: '#067d62',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <KeyRound size={15} /> Confirm Delivery (Verify OTP)
                          </button>

                          <button
                            onClick={() => setSelectedOrderForFailure(delivery)}
                            className="btn-danger"
                            style={{ fontSize: '13px' }}
                          >
                            Mark Delivery Failed
                          </button>
                        </>
                      )}

                      {delivery.orderStatus === 'DELIVERED' && (
                        <span style={{ color: '#067d62', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle size={16} /> Delivery Completed & OTP Verified
                        </span>
                      )}

                      {delivery.orderStatus === 'DELIVERY_FAILED' && (
                        <span style={{ color: '#c53030', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertTriangle size={16} /> Failed: {delivery.failureReason}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* OTP Delivery Confirmation Modal */}
      {selectedOrderForDelivery && (
        <div className="modal-backdrop" onClick={() => setSelectedOrderForDelivery(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Confirm Delivery: {selectedOrderForDelivery.orderNumber}</h3>
              <button onClick={() => setSelectedOrderForDelivery(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleConfirmOtpDelivery}>
              <div className="modal-body">
                <p style={{ fontSize: '13px', color: '#565959', marginBottom: '16px' }}>
                  Ask the customer (<strong>{selectedOrderForDelivery.shippingFullName}</strong>) for their 6-digit confirmation OTP shown on their order tracking screen.
                </p>

                {selectedOrderForDelivery.paymentMethod === 'COD' && (
                  <div style={{ backgroundColor: '#fffaf2', border: '1px solid #ffd591', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', color: '#b06000' }}>
                    <strong>COD Collection:</strong> Please collect <strong>{formatPrice(selectedOrderForDelivery.finalAmount)}</strong> cash or UPI before confirming.
                  </div>
                )}

                <div className="form-group">
                  <label>Enter 6-Digit Customer OTP</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 482915"
                    value={inputOtp}
                    onChange={(e) => setInputOtp(e.target.value)}
                    maxLength={6}
                    style={{ fontSize: '24px', letterSpacing: '8px', textAlign: 'center', fontWeight: '800' }}
                    required
                    autoFocus
                  />
                </div>

                {otpError && (
                  <div style={{ color: '#cc0c39', fontSize: '13px', marginTop: '6px', fontWeight: '600' }}>
                    {otpError}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setSelectedOrderForDelivery(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={verifyingOtp}>
                  {verifyingOtp ? 'Verifying...' : 'Verify & Mark Delivered'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Failed Delivery Reason Modal */}
      {selectedOrderForFailure && (
        <div className="modal-backdrop" onClick={() => setSelectedOrderForFailure(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Record Delivery Failure</h3>
              <button onClick={() => setSelectedOrderForFailure(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleRecordFailure}>
              <div className="modal-body">
                <p style={{ fontSize: '13px', color: '#565959', marginBottom: '14px' }}>
                  Please specify why the delivery for order <strong>{selectedOrderForFailure.orderNumber}</strong> could not be completed.
                </p>
                <div className="form-group">
                  <label>Failure Reason</label>
                  <select
                    className="form-control"
                    value={failureReason}
                    onChange={(e) => setFailureReason(e.target.value)}
                  >
                    <option value="Customer unavailable at address">Customer unavailable at address</option>
                    <option value="Wrong or incomplete address">Wrong or incomplete address</option>
                    <option value="Customer refused package">Customer refused package</option>
                    <option value="Phone unreachable / switched off">Phone unreachable / switched off</option>
                    <option value="Customer requested reschedule">Customer requested reschedule</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setSelectedOrderForFailure(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-danger">
                  Submit Failure Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
