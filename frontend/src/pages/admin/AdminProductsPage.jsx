import React, { useState, useEffect } from 'react';
import { adminProductAPI, categoryAPI } from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    description: '',
    price: '',
    discountPercentage: 0,
    stock: 20,
    categoryId: '',
    imageUrl: '',
    specifications: '',
    variants: '',
    active: true,
  });

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        adminProductAPI.getAllAdmin(),
        categoryAPI.getAll(),
      ]);
      if (prodRes?.data) setProducts(prodRes.data);
      if (catRes?.data) setCategories(catRes.data);
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      brand: '',
      description: '',
      price: '',
      discountPercentage: 0,
      stock: 20,
      categoryId: categories[0]?.id || '',
      imageUrl: '',
      specifications: '',
      variants: '',
      active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      title: p.title,
      brand: p.brand,
      description: p.description,
      price: p.price,
      discountPercentage: p.discountPercentage || 0,
      stock: p.stock || 0,
      categoryId: p.categoryId || '',
      imageUrl: p.imageUrl,
      specifications: p.specifications || '',
      variants: p.variants || '',
      active: p.active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await adminProductAPI.update(editingProduct.id, formData);
      } else {
        await adminProductAPI.create(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminProductAPI.delete(id);
        fetchData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>Loading products...</div>;
  }

  return (
    <div style={{ backgroundColor: '#eaeded', minHeight: '100vh', padding: '24px 0 60px' }}>
      <div className="container" style={{ maxWidth: '1280px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f1111' }}>Product Catalog Management</h1>
            <div style={{ fontSize: '13px', color: '#565959', marginTop: '2px' }}>
              Add, update prices, discounts, specifications and restock inventory
            </div>
          </div>

          <button onClick={openCreateModal} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Add New Product
          </button>
        </div>

        <div className="nova-card" style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f2f2', borderBottom: '1px solid #d5d9d9', color: '#0f1111' }}>
                <th style={{ padding: '12px 16px' }}>Product</th>
                <th style={{ padding: '12px 16px' }}>Brand / Category</th>
                <th style={{ padding: '12px 16px' }}>Price</th>
                <th style={{ padding: '12px 16px' }}>Discount</th>
                <th style={{ padding: '12px 16px' }}>Stock</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&q=80'}
                      alt={p.title}
                      style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '4px' }}
                    />
                    <div>
                      <div style={{ fontWeight: '700', color: '#0f1111', maxWidth: '300px' }}>{p.title}</div>
                      <div style={{ fontSize: '11px', color: '#777' }}>ID: #{p.id}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <strong>{p.brand}</strong>
                    <div style={{ color: '#565959', fontSize: '12px' }}>{p.categoryName || 'General'}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '700' }}>
                    {formatPrice(p.price)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {p.discountPercentage > 0 ? (
                      <span className="badge badge-deal">{p.discountPercentage}% OFF</span>
                    ) : (
                      <span style={{ color: '#888' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {p.stock < 10 ? (
                      <span style={{ color: '#b12704', fontWeight: '700' }}>{p.stock} (Low Stock)</span>
                    ) : (
                      <span style={{ color: '#067d62', fontWeight: '600' }}>{p.stock} units</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${p.active ? 'badge-success' : 'badge-danger'}`}>
                      {p.active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => openEditModal(p)}
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        title="Edit Product"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="btn-danger"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        title="Delete Product"
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

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label>Product Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Brand</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                      className="form-control"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Discount (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Stock Count</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Specifications (Separate with | )</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Battery: 30h | Connectivity: Bluetooth 5.2 | Weight: 250g"
                    value={formData.specifications}
                    onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Variants (Comma-separated options)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Black, Silver, Blue Titanium"
                    value={formData.variants}
                    onChange={(e) => setFormData({ ...formData, variants: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
