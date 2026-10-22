import React, { useState, useEffect } from 'react';
import { adminOrderAPI, adminDeliveryAPI } from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';
import { Truck, RefreshCw, KeyRound, UserCheck, CheckCircle2 } from 'lucide-react';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Manual Assign Modal
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [assignNotes, setAssignNotes] = useState('Admin dispatch assignment');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const fetchOrders = async () => {
    try {
      const [ordRes, partRes] = await Promise.all([
        adminOrderAPI.getAllOrders(),
        adminDeliveryAPI.getPartners('ACTIVE'),
      ]);
      if (ordRes?.data) setOrders(ordRes.data);
      if (partRes?.data) setPartners(partRes.data);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminOrderAPI.updateStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPartnerId) return;

    setSubmittingAssign(true);
    try {
      await adminDeliveryAPI.assignDelivery(assigningOrder.id, Number(selectedPartnerId), assignNotes);
      setAssigningOrder(null);
      fetchOrders();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingAssign(false);
    }
  };

  const filteredOrders = statusFilter === 'ALL'
    ? orders
    : orders.filter((o) => o.orderStatus === statusFilter);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>Loading orders...</div>;
  }

  return (
    <div style={{ backgroundColor: '#eaeded', minHeight: '100vh', padding: '24px 0 60px' }}>
      <div className="container" style={{ maxWidth: '1280px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f1111' }}>Order Management & Dispatch</h1>
            <div style={{ fontSize: '13px', color: '#565959', marginTop: '2px' }}>
              Confirm, update workflow stages, and assign area-based delivery partners
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', fontSize: '13px' }}
            >
              <option value="ALL">All Statuses ({orders.length})</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="PACKED">PACKED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="PICKED_UP">PICKED_UP</option>
              <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="RETURN_REQUESTED">RETURN_REQUESTED</option>
            </select>

            <button onClick={fetchOrders} className="btn-secondary" style={{ fontSize: '13px' }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        <div className="nova-card" style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f2f2', borderBottom: '1px solid #d5d9d9', color: '#0f1111' }}>
                <th style={{ padding: '12px 16px' }}>Order # / Date</th>
                <th style={{ padding: '12px 16px' }}>Customer & Destination</th>
                <th style={{ padding: '12px 16px' }}>Total Amount</th>
                <th style={{ padding: '12px 16px' }}>Payment</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Delivery Partner</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '700', color: '#007185' }}>{o.orderNumber}</div>
                      <div style={{ fontSize: '11px', color: '#777' }}>{formatDate(o.createdAt)}</div>
                      {o.deliveryOtp && (
                        <div style={{ fontSize: '11px', color: '#b06000', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                          <KeyRound size={12} /> OTP: <strong>{o.deliveryOtp}</strong>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '700' }}>{o.shippingFullName}</div>
                      <div style={{ fontSize: '12px', color: '#333' }}>
                        {o.shippingStreetAddress}
                        {o.shippingLandmark && <span style={{ color: '#007185' }}> (Near {o.shippingLandmark})</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: '#565959', marginTop: '2px' }}>
                        {o.shippingCity} - <strong>{o.shippingPinCode}</strong> ({o.deliveryZoneName || 'Zone Pending'})
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', fontWeight: '700' }}>
                      {formatPrice(o.finalAmount)}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${o.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                        {o.paymentMethod} - {o.paymentStatus}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <select
                        value={o.orderStatus}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        style={{
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid #d5d9d9',
                          fontWeight: '600',
                          backgroundColor: '#fff',
                        }}
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="PACKED">PACKED</option>
                        <option value="ASSIGNED">ASSIGNED</option>
                        <option value="PICKED_UP">PICKED_UP</option>
                        <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="RETURN_REQUESTED">RETURN_REQUESTED</option>
                        <option value="RETURNED">RETURNED</option>
                        <option value="REFUND_INITIATED">REFUND_INITIATED</option>
                        <option value="REFUNDED">REFUNDED</option>
                      </select>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      {o.deliveryPartnerName ? (
                        <div>
                          <div style={{ fontWeight: '700', color: '#067d62', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <UserCheck size={14} /> {o.deliveryPartnerName}
                          </div>
                          <div style={{ fontSize: '11px', color: '#777' }}>{o.deliveryPartnerVehicle}</div>
                        </div>
                      ) : (
                        <span style={{ color: '#c45500', fontSize: '12px', fontWeight: '600' }}>
                          ⚠️ Unassigned
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {['DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED'].includes(o.orderStatus) ? (
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: o.orderStatus === 'DELIVERED' ? '#f0fdf4' : '#f9fafb',
                            color: o.orderStatus === 'DELIVERED' ? '#067d62' : '#6b7280',
                            border: `1px solid ${o.orderStatus === 'DELIVERED' ? '#bbf7d0' : '#e5e7eb'}`,
                          }}
                        >
                          {o.orderStatus === 'DELIVERED' ? (
                            <>
                              <CheckCircle2 size={13} color="#059669" /> Delivered
                            </>
                          ) : (
                            o.orderStatus
                          )}
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setAssigningOrder(o);
                            setSelectedPartnerId(o.deliveryPartnerId || (partners[0]?.id || ''));
                          }}
                          className="btn-secondary"
                          style={{ fontSize: '12px', padding: '4px 10px' }}
                        >
                          <Truck size={13} /> {o.deliveryPartnerName ? 'Reassign' : 'Assign Partner'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Delivery Assignment Modal */}
      {assigningOrder && (
        <div className="modal-backdrop" onClick={() => setAssigningOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>
                Assign Partner to {assigningOrder.orderNumber}
              </h3>
              <button onClick={() => setAssigningOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleAssignSubmit}>
              <div className="modal-body">
                <div style={{ backgroundColor: '#f0f9f5', border: '1px solid #b7eb8f', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Customer:</strong> {assigningOrder.shippingFullName} ({assigningOrder.shippingPhone})
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Address:</strong> {assigningOrder.shippingStreetAddress}
                    {assigningOrder.shippingLandmark && <span>, Landmark: <strong>{assigningOrder.shippingLandmark}</strong></span>}
                    , {assigningOrder.shippingCity}, {assigningOrder.shippingState} - <strong>{assigningOrder.shippingPinCode}</strong>
                  </div>
                  <div style={{ color: '#067d62', fontWeight: '600' }}>
                    <strong>Zone:</strong> {assigningOrder.deliveryZoneName || 'Auto-match'}
                  </div>
                </div>

                <div className="form-group">
                  <label>Select Approved Delivery Partner</label>
                  <select
                    className="form-control"
                    value={selectedPartnerId}
                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                    required
                  >
                    <option value="">Choose active rider...</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} - {p.vehicleType} ({p.vehicleNumber}) [Active Deliveries: {p.activeDeliveriesCount}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Assignment Notes</label>
                  <input
                    type="text"
                    className="form-control"
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setAssigningOrder(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submittingAssign}>
                  {submittingAssign ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
