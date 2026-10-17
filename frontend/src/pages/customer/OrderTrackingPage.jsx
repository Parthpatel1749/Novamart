import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { formatPrice, formatDate, getOrderStatusInfo, ORDER_STATUS_FLOW } from '../../utils/formatters';
import {
  MapPin,
  Truck,
  CheckCircle,
  Clock,
  KeyRound,
  RotateCcw,
  XCircle,
  RefreshCw,
  Phone,
  User,
  AlertTriangle,
} from 'lucide-react';

export const OrderTrackingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cancellation & Return modals
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Found a better price elsewhere');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('Item defective or not as described');

  const fetchOrder = async () => {
    try {
      const res = await orderAPI.getOrderById(id);
      if (res?.data) {
        setOrder(res.data);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrder();
  };

  const handleCancel = async () => {
    try {
      const res = await orderAPI.cancelOrder(id, cancelReason);
      if (res?.data) {
        setOrder(res.data);
        setShowCancelModal(false);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReturn = async () => {
    try {
      const res = await orderAPI.requestReturn(id, returnReason);
      if (res?.data) {
        setOrder(res.data);
        setShowReturnModal(false);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>Loading order tracking details...</div>;
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <h2>Order not found</h2>
        <Link to="/orders" className="btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>
          Back to Orders
        </Link>
      </div>
    );
  }

  const statusInfo = getOrderStatusInfo(order.orderStatus);
  const currentStep = statusInfo.step;
  const isTerminated = ['CANCELLED', 'RETURNED', 'REFUNDED', 'DELIVERY_FAILED'].includes(order.orderStatus);

  return (
    <div style={{ backgroundColor: '#eaeded', minHeight: '100vh', padding: '30px 0 60px' }}>
      <div className="container" style={{ maxWidth: '1050px' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f1111' }}>
              Track Package: {order.orderNumber}
            </h1>
            <div style={{ fontSize: '13px', color: '#565959', marginTop: '4px' }}>
              Placed on {formatDate(order.createdAt)} | Order Total: <strong>{formatPrice(order.finalAmount)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleRefresh} className="btn-secondary" style={{ fontSize: '13px' }}>
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh Status
            </button>
            <Link to="/orders" className="btn-secondary" style={{ fontSize: '13px', textDecoration: 'none' }}>
              All Orders
            </Link>
          </div>
        </div>

        {/* Status Tracker Box */}
        <div className="nova-card" style={{ padding: '30px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#565959' }}>Current Status</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f1111', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span className={`badge ${statusInfo.badgeClass}`} style={{ fontSize: '14px', padding: '4px 10px' }}>
                  {statusInfo.label}
                </span>
              </div>
            </div>

            {order.orderStatus === 'DELIVERED' && (
              <div style={{ color: '#067d62', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={18} /> Package delivered successfully
              </div>
            )}
          </div>

          {/* Stepper Timeline (if not cancelled/failed) */}
          {!isTerminated ? (
            <div style={{ margin: '30px 0 20px', overflowX: 'auto', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', minWidth: '700px', position: 'relative' }}>
                {ORDER_STATUS_FLOW.map((statusKey, index) => {
                  const isDone = index <= currentStep;
                  const isCurrent = index === currentStep;
                  const stepLabel = getOrderStatusInfo(statusKey).label;

                  return (
                    <React.Fragment key={statusKey}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 2, position: 'relative' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: isDone ? (isCurrent ? '#ff9900' : '#067d62') : '#e0e0e0',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '13px',
                            boxShadow: isCurrent ? '0 0 0 4px rgba(255, 153, 0, 0.25)' : 'none',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {isDone ? <CheckCircle size={16} /> : index + 1}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            fontWeight: isCurrent ? '700' : '500',
                            color: isDone ? '#0f1111' : '#888',
                            textAlign: 'center',
                            marginTop: '8px',
                            maxWidth: '90px',
                          }}
                        >
                          {stepLabel}
                        </div>
                      </div>

                      {index < ORDER_STATUS_FLOW.length - 1 && (
                        <div
                          style={{
                            flex: 1,
                            height: '4px',
                            backgroundColor: index < currentStep ? '#067d62' : '#e0e0e0',
                            zIndex: 1,
                            marginTop: '-22px',
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '16px', color: '#c53030', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={20} />
              <div>
                <strong>Status Update:</strong> {statusInfo.label}
                {order.cancelReason && <div style={{ fontSize: '13px', marginTop: '2px' }}>Reason: {order.cancelReason}</div>}
                {order.failureReason && <div style={{ fontSize: '13px', marginTop: '2px' }}>Delivery Failure Reason: {order.failureReason}</div>}
              </div>
            </div>
          )}

          {/* OTP Verification Box */}
          {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && order.deliveryOtp && (
            <div
              style={{
                backgroundColor: '#fffaf2',
                border: '2px dashed #ff9900',
                borderRadius: '8px',
                padding: '16px 20px',
                marginTop: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <KeyRound size={24} color="#b06000" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#b06000' }}>
                    Delivery Confirmation OTP
                  </div>
                  <div style={{ fontSize: '12px', color: '#565959' }}>
                    Share this code with your delivery partner to confirm handover.
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: '28px',
                  fontWeight: '900',
                  letterSpacing: '6px',
                  backgroundColor: '#fff',
                  padding: '6px 18px',
                  borderRadius: '6px',
                  border: '1px solid #ffd591',
                  color: '#111',
                }}
              >
                {order.deliveryOtp}
              </div>
            </div>
          )}
        </div>

        {/* 2-Column: Assigned Partner Info & Address/Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Assigned Delivery Partner Details */}
          <div className="nova-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} color="#007185" /> Delivery Partner Details
            </h3>

            {order.deliveryPartnerName ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} color="#555" />
                  <span>Rider Name: <strong>{order.deliveryPartnerName}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={16} color="#555" />
                  <span>Contact: <strong>{order.deliveryPartnerPhone || 'Available upon dispatch'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={16} color="#555" />
                  <span>Vehicle: <strong>{order.deliveryPartnerVehicle}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#067d62', fontWeight: '600' }}>
                  <CheckCircle size={16} />
                  <span>Zone: {order.deliveryZoneName || 'Vadodara Central'}</span>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: '#565959', lineHeight: '1.5' }}>
                <Clock size={16} color="#b06000" style={{ display: 'inline', marginRight: '6px' }} />
                Your order is currently being prepared at the local hub ({order.deliveryZoneName || 'Vadodara'}). A delivery partner will be automatically assigned for PIN <strong>{order.shippingPinCode}</strong>.
              </div>
            )}
          </div>

          {/* Shipping Address & Actions */}
          <div className="nova-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="#007185" /> Shipping Address
            </h3>

            <div style={{ fontSize: '13px', color: '#333', lineHeight: '1.5', marginBottom: '16px' }}>
              <strong>{order.shippingFullName}</strong><br />
              {order.shippingStreetAddress}<br />
              {order.shippingLandmark && <span>{order.shippingLandmark}<br /></span>}
              {order.shippingCity}, {order.shippingState} - <strong>{order.shippingPinCode}</strong><br />
              Phone: {order.shippingPhone}
            </div>

            {/* Actions: Cancel or Return */}
            <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #eee', paddingTop: '14px' }}>
              {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
                <button onClick={() => setShowCancelModal(true)} className="btn-danger" style={{ flex: 1 }}>
                  <XCircle size={14} /> Cancel Order
                </button>
              )}

              {order.orderStatus === 'DELIVERED' && (
                <button onClick={() => setShowReturnModal(true)} className="btn-secondary" style={{ flex: 1 }}>
                  <RotateCcw size={14} /> Request Return / Refund
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order Items List */}
        <div className="nova-card" style={{ padding: '24px', marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Items in this delivery</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {order.items?.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '14px' }}>
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
                    Qty: {item.quantity} {item.selectedVariant && `| Style: ${item.selectedVariant}`}
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>
                  {formatPrice(item.subtotal)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="modal-backdrop" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Cancel Order</h3>
              <button onClick={() => setShowCancelModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13px', color: '#565959', marginBottom: '14px' }}>
                Are you sure you want to cancel this order? Products will be returned to inventory.
              </p>
              <div className="form-group">
                <label>Reason for Cancellation</label>
                <select className="form-control" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}>
                  <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Delivery time too long">Delivery time too long</option>
                  <option value="Need to change shipping address">Need to change shipping address</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCancelModal(false)}>Keep Order</button>
              <button className="btn-danger" onClick={handleCancel}>Confirm Cancellation</button>
            </div>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="modal-backdrop" onClick={() => setShowReturnModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Request Return / Refund</h3>
              <button onClick={() => setShowReturnModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13px', color: '#565959', marginBottom: '14px' }}>
                Our area delivery partner will pick up the item from your address for verification.
              </p>
              <div className="form-group">
                <label>Reason for Return</label>
                <select className="form-control" value={returnReason} onChange={(e) => setReturnReason(e.target.value)}>
                  <option value="Item defective or not as described">Item defective or not as described</option>
                  <option value="Wrong size or item sent">Wrong size or item sent</option>
                  <option value="Quality not as expected">Quality not as expected</option>
                  <option value="No longer needed">No longer needed</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowReturnModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleReturn}>Submit Return Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
