import React, { useState, useEffect } from 'react';
import { couponAPI } from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import { Plus, Trash2 } from 'lucide-react';

export const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: 10,
    minOrderAmount: 499,
    maxDiscountAmount: 500,
    expiryDate: '2026-12-31',
    active: true,
  });

  const fetchCoupons = async () => {
    try {
      const res = await couponAPI.getAllAdmin();
      if (res?.data) {
        setCoupons(res.data);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await couponAPI.create(formData);
      setShowModal(false);
      setFormData({
        code: '',
        discountPercentage: 10,
        minOrderAmount: 499,
        maxDiscountAmount: 500,
        expiryDate: '2026-12-31',
        active: true,
      });
      fetchCoupons();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this coupon?')) {
      try {
        await couponAPI.delete(id);
        fetchCoupons();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>Loading coupons...</div>;
  }

  return (
    <div style={{ backgroundColor: '#eaeded', minHeight: '100vh', padding: '24px 0 60px' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f1111' }}>
              Promotional Coupons & Discounts
            </h1>
            <div style={{ fontSize: '13px', color: '#565959', marginTop: '2px' }}>
              Manage promotional codes for cart checkout savings
            </div>
          </div>

          <button onClick={() => setShowModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Create New Coupon
          </button>
        </div>

        <div className="nova-card" style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f2f2', borderBottom: '1px solid #d5d9d9', color: '#0f1111' }}>
                <th style={{ padding: '12px 16px' }}>Code</th>
                <th style={{ padding: '12px 16px' }}>Discount %</th>
                <th style={{ padding: '12px 16px' }}>Min. Order</th>
                <th style={{ padding: '12px 16px' }}>Max Discount</th>
                <th style={{ padding: '12px 16px' }}>Expiry</th>
                <th style={{ padding: '12px 16px' }}>Times Used</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="badge badge-deal" style={{ fontSize: '12px' }}>{c.code}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '700' }}>{c.discountPercentage}%</td>
                  <td style={{ padding: '12px 16px' }}>{formatPrice(c.minOrderAmount)}</td>
                  <td style={{ padding: '12px 16px' }}>{c.maxDiscountAmount ? formatPrice(c.maxDiscountAmount) : 'No cap'}</td>
                  <td style={{ padding: '12px 16px' }}>{c.expiryDate || 'Lifetime'}</td>
                  <td style={{ padding: '12px 16px' }}>{c.usedCount || 0}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(c.id)} className="btn-danger" style={{ padding: '4px 8px' }}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Create Coupon</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Coupon Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. FESTIVE25"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Discount Percentage (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Min. Order Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Max Discount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
