import React, { useState, useEffect } from 'react';
import { adminDeliveryAPI } from '../../services/api';
import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react';

export const AdminDeliveryZonesPage = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({
    zoneName: '',
    city: 'Vadodara',
    area: '',
    pinCodes: '',
    active: true,
  });

  const fetchZones = async () => {
    try {
      const res = await adminDeliveryAPI.getZones();
      if (res?.data) {
        setZones(res.data);
      }
    } catch (err) {
      console.error('Error fetching delivery zones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const openCreateModal = () => {
    setEditingZone(null);
    setFormData({
      zoneName: '',
      city: 'Vadodara',
      area: '',
      pinCodes: '',
      active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (z) => {
    setEditingZone(z);
    setFormData({
      zoneName: z.zoneName,
      city: z.city,
      area: z.area,
      pinCodes: z.pinCodes,
      active: z.active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingZone) {
        await adminDeliveryAPI.updateZone(editingZone.id, formData);
      } else {
        await adminDeliveryAPI.createZone(formData);
      }
      setShowModal(false);
      fetchZones();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this delivery zone?')) {
      try {
        await adminDeliveryAPI.deleteZone(id);
        fetchZones();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>Loading delivery zones...</div>;
  }

  return (
    <div style={{ backgroundColor: '#eaeded', minHeight: '100vh', padding: '24px 0 60px' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f1111' }}>
              Area Delivery Zones (Hyperlocal Routing)
            </h1>
            <div style={{ fontSize: '13px', color: '#565959', marginTop: '2px' }}>
              Define geographical city zones and postal PIN codes for automated delivery partner matching
            </div>
          </div>

          <button onClick={openCreateModal} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Create Delivery Zone
          </button>
        </div>

        <div className="nova-card" style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f2f2', borderBottom: '1px solid #d5d9d9', color: '#0f1111' }}>
                <th style={{ padding: '12px 16px' }}>Zone Name</th>
                <th style={{ padding: '12px 16px' }}>City & Area</th>
                <th style={{ padding: '12px 16px' }}>Serviceable PIN Codes</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0f1111' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={16} color="#ff9900" />
                      <span>{z.zoneName}</span>
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <strong>{z.city}</strong>
                    <div style={{ fontSize: '12px', color: '#565959' }}>{z.area}</div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {z.pinCodes?.split(',').map((pin, i) => (
                        <span key={i} className="badge badge-info" style={{ fontSize: '11px' }}>
                          {pin.trim()}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${z.active ? 'badge-success' : 'badge-danger'}`}>
                      {z.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => openEditModal(z)}
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(z.id)}
                        className="btn-danger"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zone Create / Edit Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>
                {editingZone ? 'Edit Delivery Zone' : 'Create Delivery Zone'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Zone Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Vadodara Central"
                    value={formData.zoneName}
                    onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Area / Sector</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Alkapuri, Central Hub"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Serviceable PIN Codes (Comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="390001, 390002, 390007, 390009"
                    value={formData.pinCodes}
                    onChange={(e) => setFormData({ ...formData, pinCodes: e.target.value })}
                    required
                  />
                  <div style={{ fontSize: '11px', color: '#565959', marginTop: '4px' }}>
                    Orders placed to any of these PIN codes will be automatically mapped to this zone.
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingZone ? 'Save Changes' : 'Create Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
