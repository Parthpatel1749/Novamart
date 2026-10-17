import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productAPI, reviewAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, formatDate } from '../../utils/formatters';
import {
  Star,
  Truck,
  ShieldCheck,
  RefreshCw,
  Check,
  ShoppingCart,
  Zap,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { pinCode, city, openLocationModal } = useLocation();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Review submission state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const [prodRes, revRes] = await Promise.all([
          productAPI.getProductById(id),
          reviewAPI.getProductReviews(id),
        ]);
        if (prodRes?.data) {
          setProduct(prodRes.data);
          if (prodRes.data.variants) {
            const first = prodRes.data.variants.split(',')[0].trim();
            setSelectedVariant(first);
          }
        }
        if (revRes?.data) setReviews(revRes.data);
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product, quantity, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    // Direct checkout with directProductId
    navigate('/checkout', {
      state: {
        directProduct: product,
        directQuantity: quantity,
        directVariant: selectedVariant,
      },
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await reviewAPI.addReview(id, {
        rating: newRating,
        title: newTitle,
        comment: newComment,
      });
      if (res?.data) {
        setReviews([res.data, ...reviews]);
        setShowReviewModal(false);
        setNewTitle('');
        setNewComment('');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px', color: '#555' }}>Loading product details...</div>;
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <h2>Product not found</h2>
        <Link to="/products" className="btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>
          Back to Products
        </Link>
      </div>
    );
  }

  const discount = product.discountPercentage || 0;
  const originalPrice = product.price;
  const discountedPrice = product.discountedPrice || (originalPrice * (1 - discount / 100));
  const variantsList = product.variants ? product.variants.split(',').map((v) => v.trim()) : [];

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', padding: '20px 0 60px' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#565959', marginBottom: '20px' }}>
          <Link to="/" style={{ color: '#007185' }}>Home</Link>
          <ChevronRight size={12} />
          <Link to="/products" style={{ color: '#007185' }}>{product.categoryName || 'Products'}</Link>
          <ChevronRight size={12} />
          <span style={{ color: '#0f1111', fontWeight: '600' }}>{product.brand}</span>
        </div>

        {/* 3-Column Amazon Layout: Image Gallery | Product Details | Buy Box */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 450px) 1fr minmax(280px, 320px)',
            gap: '30px',
            alignItems: 'start',
          }}
        >
          {/* Column 1: Image Gallery */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div
              style={{
                border: '1px solid #e7e7e7',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: '#fafafa',
              }}
            >
              <img
                src={product.imageUrl}
                alt={product.title}
                style={{
                  maxHeight: '380px',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  margin: '0 auto',
                  display: 'block',
                }}
              />
            </div>
          </div>

          {/* Column 2: Center Details */}
          <div>
            <div style={{ fontSize: '13px', color: '#007185', fontWeight: '600', textTransform: 'uppercase' }}>
              Brand: {product.brand}
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f1111', lineHeight: '1.3', margin: '6px 0 10px' }}>
              {product.title}
            </h1>

            {/* Ratings */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '14px', borderBottom: '1px solid #e7e7e7' }}>
              <div style={{ display: 'flex', color: '#ffa41c' }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.floor(product.rating || 4.5) ? '#ffa41c' : 'none'}
                    stroke="#ffa41c"
                  />
                ))}
              </div>
              <span style={{ fontSize: '14px', color: '#007185', fontWeight: '600' }}>{product.rating}</span>
              <span style={{ fontSize: '13px', color: '#565959' }}>| {product.reviewCount} customer ratings</span>
            </div>

            {/* Price Box */}
            <div style={{ padding: '16px 0', borderBottom: '1px solid #e7e7e7' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                {discount > 0 && (
                  <span style={{ color: '#cc0c39', fontSize: '24px', fontWeight: '300' }}>
                    -{Math.round(discount)}%
                  </span>
                )}
                <span style={{ fontSize: '28px', fontWeight: '700', color: '#0f1111' }}>
                  {formatPrice(discountedPrice)}
                </span>
              </div>

              {discount > 0 && (
                <div style={{ fontSize: '13px', color: '#565959', marginTop: '4px' }}>
                  Typical price: <span style={{ textDecoration: 'line-through' }}>{formatPrice(originalPrice)}</span>
                </div>
              )}
              <div style={{ fontSize: '12px', color: '#565959', marginTop: '4px' }}>Inclusive of all taxes</div>
            </div>

            {/* Variants Selector */}
            {variantsList.length > 0 && (
              <div style={{ padding: '16px 0', borderBottom: '1px solid #e7e7e7' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                  Select Option: <span style={{ color: '#565959', fontWeight: '400' }}>{selectedVariant}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {variantsList.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: selectedVariant === v ? '2px solid #e77600' : '1px solid #d5d9d9',
                        backgroundColor: selectedVariant === v ? '#fffaf2' : '#fff',
                        fontSize: '13px',
                        fontWeight: selectedVariant === v ? '700' : '400',
                        cursor: 'pointer',
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product Specifications Table */}
            {product.specifications && (
              <div style={{ padding: '16px 0', borderBottom: '1px solid #e7e7e7' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px' }}>Specifications</h3>
                <div style={{ fontSize: '13px', color: '#333', lineHeight: '1.6' }}>
                  {product.specifications.split('|').map((spec, i) => (
                    <div key={i} style={{ padding: '4px 0', borderBottom: '1px dashed #eee' }}>
                      {spec.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div style={{ padding: '16px 0' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>About this item</h3>
              <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.6' }}>{product.description}</p>
            </div>
          </div>

          {/* Column 3: Amazon Buy Box */}
          <div
            style={{
              border: '1px solid #d5d9d9',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: '#fff',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#b12704', marginBottom: '10px' }}>
              {formatPrice(discountedPrice)}
            </div>

            <div style={{ fontSize: '13px', color: '#007185', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Truck size={16} /> FREE delivery <strong>Tomorrow</strong>
            </div>

            <div style={{ fontSize: '12px', color: '#565959', marginBottom: '14px' }}>
              Delivering to <strong>{city} {pinCode}</strong>
              <button
                onClick={openLocationModal}
                style={{ background: 'none', border: 'none', color: '#007185', cursor: 'pointer', marginLeft: '6px', fontSize: '12px' }}
              >
                Change PIN
              </button>
            </div>

            {/* In Stock / Stock remaining */}
            <div style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '700' }}>
              {product.stock > 0 ? (
                product.stock < 10 ? (
                  <span style={{ color: '#b12704' }}>Only {product.stock} left in stock - order soon.</span>
                ) : (
                  <span style={{ color: '#007600' }}>In stock</span>
                )
              ) : (
                <span style={{ color: '#b12704' }}>Currently unavailable</span>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: '#565959' }}>Quantity:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d5d9d9',
                    backgroundColor: '#f0f2f2',
                    fontSize: '13px',
                  }}
                >
                  {[...Array(Math.min(10, product.availableStock || 5))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  backgroundColor: added ? '#067d62' : undefined,
                  borderColor: added ? '#067d62' : undefined,
                  color: added ? '#fff' : '#111',
                }}
              >
                {added ? (
                  <>
                    <Check size={16} /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} /> Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="btn-orange"
                style={{ width: '100%', padding: '10px', fontSize: '14px', justifyContent: 'center' }}
              >
                <Zap size={16} /> Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #eee', fontSize: '12px', color: '#565959', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="#007185" /> Secure transaction with 256-bit encryption
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={14} color="#007185" /> 7-day replacement & return guarantee
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={14} color="#007185" /> Dispatched via NovaMart Local Delivery Network
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div style={{ marginTop: '50px', borderTop: '1px solid #e7e7e7', paddingTop: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f1111' }}>Customer Reviews</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <div style={{ display: 'flex', color: '#ffa41c' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < Math.floor(product.rating || 4.5) ? '#ffa41c' : 'none'} stroke="#ffa41c" />
                  ))}
                </div>
                <span style={{ fontSize: '14px', fontWeight: '700' }}>{product.rating} out of 5</span>
              </div>
            </div>

            <button onClick={() => setShowReviewModal(true)} className="btn-secondary">
              <MessageSquare size={16} /> Write a customer review
            </button>
          </div>

          {reviews.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', color: '#666' }}>
              No reviews yet. Be the first to share your thoughts on this product!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map((rev) => (
                <div key={rev.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#febd69', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px' }}>
                      {rev.userName ? rev.userName[0].toUpperCase() : 'U'}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{rev.userName || 'Verified Buyer'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', color: '#ffa41c' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill={i < rev.rating ? '#ffa41c' : 'none'} stroke="#ffa41c" />
                      ))}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>{rev.title}</span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#777', marginBottom: '6px' }}>
                    Reviewed on {formatDate(rev.createdAt)} | <span style={{ color: '#c45500', fontWeight: '600' }}>Verified Purchase</span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#333', lineHeight: '1.5' }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="modal-backdrop" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Create Review</h3>
              <button onClick={() => setShowReviewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                ✕
              </button>
            </div>
            <form onSubmit={handleReviewSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Overall Rating</label>
                  <div style={{ display: 'flex', gap: '8px', cursor: 'pointer', padding: '6px 0' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={24}
                        fill={star <= newRating ? '#ffa41c' : 'none'}
                        stroke="#ffa41c"
                        onClick={() => setNewRating(star)}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Add a headline</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="What's most important to know?"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Add a written review</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="What did you like or dislike? How was the delivery?"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowReviewModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
