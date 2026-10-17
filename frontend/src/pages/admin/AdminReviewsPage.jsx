import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { Star, Trash2, RefreshCw } from 'lucide-react';

export const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await reviewAPI.getAllAdmin();
      if (res?.data) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Remove this review from product page?')) {
      try {
        await reviewAPI.deleteReview(id);
        fetchReviews();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>Loading reviews...</div>;
  }

  return (
    <div style={{ backgroundColor: '#eaeded', minHeight: '100vh', padding: '24px 0 60px' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f1111' }}>
              Customer Reviews Moderation
            </h1>
            <div style={{ fontSize: '13px', color: '#565959', marginTop: '2px' }}>
              Monitor feedback, verified purchase badges, and remove inappropriate content
            </div>
          </div>

          <button onClick={fetchReviews} className="btn-secondary" style={{ fontSize: '13px' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div className="nova-card" style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f2f2', borderBottom: '1px solid #d5d9d9', color: '#0f1111' }}>
                <th style={{ padding: '12px 16px' }}>Product</th>
                <th style={{ padding: '12px 16px' }}>User</th>
                <th style={{ padding: '12px 16px' }}>Rating</th>
                <th style={{ padding: '12px 16px' }}>Review Headline & Comment</th>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '700', color: '#007185' }}>
                    {r.productTitle || `Product #${r.productId}`}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <strong>{r.userName}</strong>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', color: '#ffa41c' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill={i < r.rating ? '#ffa41c' : 'none'} stroke="#ffa41c" />
                      ))}
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px', maxWidth: '350px' }}>
                    <div style={{ fontWeight: '700', color: '#0f1111' }}>{r.title}</div>
                    <div style={{ color: '#565959', fontSize: '12px', marginTop: '2px' }}>{r.comment}</div>
                  </td>

                  <td style={{ padding: '12px 16px', color: '#777', fontSize: '11px' }}>
                    {formatDate(r.createdAt)}
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="btn-danger"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                      title="Remove Review"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
