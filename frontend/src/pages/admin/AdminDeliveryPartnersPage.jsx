import React, { useState, useEffect } from 'react';
import { adminDeliveryAPI } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { Check, X, RefreshCw, MapPin } from 'lucide-react';

export const AdminDeliveryPartnersPage = () => {
  const [partners, setPartners] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Approval Modal
  const [approvingPartner, setApprovingPartner] = useState(null);
  const [selectedZoneIds, setSelectedZoneIds] = useState([]);
  const [approving, setApproving] = useState(false);

  const fetchPartners = async () => {
    try {
      const [partRes, zoneRes] = await Promise.all([
        adminDeliveryAPI.getPartners(statusFilter || undefined),
        adminDeliveryAPI.getZones(),
      ]);
      if (partRes?.data) setPartners(partRes.data);
      if (zoneRes?.data) setZones(zoneRes.data);
    } catch (err) {
      console.error('Error fetching delivery partners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [statusFilter]);

  const handleOpenApproveModal = (partner) => {
    setApprovingPartner(partner);
    const existingZoneIds = partner.assignedZones ? partner.assignedZones.map((z) => z.id) : [];
    setSelectedZoneIds(existingZoneIds.length > 0 ? existingZoneIds : [zones[0]?.id].filter(Boolean));
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    setApproving(true);
    try {
      await adminDeliveryAPI.approvePartner(approvingPartner.id, selectedZoneIds);
      setApprovingPartner(null);
      fetchPartners();
    } catch (err) {
      alert(err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (partnerId) => {
    if (window.confirm('Reject this delivery partner application?')) {
      try {
        await adminDeliveryAPI.rejectPartner(partnerId);
        fetchPartners();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const toggleZoneSelection = (zoneId) => {
    if (selectedZoneIds.includes(zoneId)) {
      setSelectedZoneIds(selectedZoneIds.filter((id) => id !== zoneId));
    } else {
      setSelectedZoneIds([...selectedZoneIds, zoneId]);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>Loading delivery partners...</div>;
  }

  return (
    <div style={{ backgroundColor: '#eaeded', minHeight: '100vh', padding: '24px 0 60px' }}>
      <div className="container" style={{ maxWidth: '1280px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f1111' }}>
              Delivery Partner Fleet & Approvals
            </h1>
            <div style={{ fontSize: '13px', color: '#565959', marginTop: '2px' }}>
              Review onboarding applications, verify licenses, and assign serviceable PIN zones
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', fontSize: '13px' }}
            >
              <option value="">All Applications ({partners.length})</option>
              <option value="UNDER_REVIEW">UNDER REVIEW (Pending)</option>
              <option value="ACTIVE">ACTIVE & Approved</option>
              <option value="REJECTED">REJECTED</option>
            </select>

            <button onClick={fetchPartners} className="btn-secondary" style={{ fontSize: '13px' }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        <div className="nova-card" style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f2f2', borderBottom: '1px solid #d5d9d9', color: '#0f1111' }}>
                <th style={{ padding: '12px 16px' }}>Partner Details</th>
                <th style={{ padding: '12px 16px' }}>Vehicle & License</th>
                <th style={{ padding: '12px 16px' }}>Assigned Delivery Zones</th>
                <th style={{ padding: '12px 16px' }}>Online Status</th>
                <th style={{ padding: '12px 16px' }}>Active Load</th>
                <th style={{ padding: '12px 16px' }}>Account Flow</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: '700', color: '#0f1111' }}>{p.fullName}</div>
                    <div style={{ fontSize: '12px', color: '#565959' }}>{p.email}</div>
                    <div style={{ fontSize: '12px', color: '#007185' }}>{p.phone}</div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                      Registered: {formatDate(p.registeredAt)}
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <strong>{p.vehicleType}</strong>
                    <div style={{ fontSize: '12px', color: '#565959' }}>Number: {p.vehicleNumber}</div>
                    <div style={{ fontSize: '12px', color: '#565959' }}>DL: {p.licenseNumber}</div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    {p.assignedZones && p.assignedZones.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {p.assignedZones.map((z) => (
                          <span key={z.id} className="badge badge-info" style={{ fontSize: '11px' }}>
                            {z.zoneName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#888', fontStyle: 'italic' }}>No zones assigned</span>
                    )}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        color: p.available ? '#067d62' : '#718096',
                        fontWeight: '700',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      ● {p.available ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: '700', color: p.activeDeliveriesCount > 0 ? '#ff9900' : '#067d62' }}>
                      {p.activeDeliveriesCount} orders
                    </span>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span
                      className={`badge ${
                        p.status === 'ACTIVE'
                          ? 'badge-success'
                          : p.status === 'UNDER_REVIEW'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      {p.status === 'UNDER_REVIEW' && (
                        <>
                          <button
                            onClick={() => handleOpenApproveModal(p)}
                            className="btn-primary"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                          >
                            <Check size={13} /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(p.id)}
                            className="btn-danger"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                          >
                            <X size={13} /> Reject
                          </button>
                        </>
                      )}

                      {p.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleOpenApproveModal(p)}
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                        >
                          <MapPin size={13} /> Edit Zones
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve & Assign Zones Modal */}
      {approvingPartner && (
        <div className="modal-backdrop" onClick={() => setApprovingPartner(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>
                Approve Partner & Assign Zones: {approvingPartner.fullName}
              </h3>
              <button onClick={() => setApprovingPartner(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleApproveSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '13px', color: '#565959', marginBottom: '16px' }}>
                  Select the delivery zones this rider is authorized to fulfill orders in:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {zones.map((zone) => (
                    <label
                      key={zone.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px',
                        borderRadius: '6px',
                        border: selectedZoneIds.includes(zone.id) ? '2px solid #ff9900' : '1px solid #d5d9d9',
                        backgroundColor: selectedZoneIds.includes(zone.id) ? '#fffaf2' : '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedZoneIds.includes(zone.id)}
                        onChange={() => toggleZoneSelection(zone.id)}
                      />
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '13px' }}>{zone.zoneName} ({zone.city})</div>
                        <div style={{ fontSize: '12px', color: '#565959' }}>PINs: {zone.pinCodes}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setApprovingPartner(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={approving}>
                  {approving ? 'Saving...' : 'Confirm Approval & Zone Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
