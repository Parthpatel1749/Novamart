import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Check, Truck } from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import { useWishlist } from '../context/WishlistContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { pinCode } = useLocation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const discount = product.discountPercentage || 0;
  const originalPrice = product.price;
  const discountedPrice = product.discountedPrice || (originalPrice * (1 - discount / 100));

  return (
    <div
      className="nova-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        position: 'relative',
        backgroundColor: '#fff',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #e7e7e7',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(255,255,255,0.85)',
          border: 'none',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 2,
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        }}
        title="Add to Wishlist"
      >
        <Heart size={16} color={isWishlisted ? '#cc0c39' : '#888'} fill={isWishlisted ? '#cc0c39' : 'none'} />
      </button>

      {/* Product Image Link */}
      <Link
        to={`/products/${product.id}`}
        style={{
          display: 'block',
          position: 'relative',
          padding: '16px',
          textAlign: 'center',
          backgroundColor: '#fafafa',
          textDecoration: 'none',
        }}
      >
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'}
          alt={product.title}
          style={{
            maxHeight: '190px',
            maxWidth: '100%',
            objectFit: 'contain',
            margin: '0 auto',
            display: 'block',
          }}
          loading="lazy"
        />

        {discount > 0 && (
          <span
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              backgroundColor: '#cc0c39',
              color: '#fff',
              fontSize: '11px',
              fontWeight: '700',
              padding: '2px 6px',
              borderRadius: '3px',
            }}
          >
            {Math.round(discount)}% off
          </span>
        )}
      </Link>

      {/* Product Details */}
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#777', fontWeight: '700', letterSpacing: '0.5px' }}>
          {product.brand}
        </div>

        <Link
          to={`/products/${product.id}`}
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#0f1111',
            textDecoration: 'none',
            lineHeight: '1.35',
            marginTop: '4px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
          title={product.title}
        >
          {product.title}
        </Link>

        {/* Rating Stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#ffa41c' }}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={13}
                fill={i < Math.floor(product.rating || 4.5) ? '#ffa41c' : 'none'}
                stroke="#ffa41c"
              />
            ))}
          </div>
          <span style={{ fontSize: '12px', color: '#007185', fontWeight: '500' }}>
            {product.rating || 4.5}
          </span>
          <span style={{ fontSize: '11px', color: '#565959' }}>
            ({product.reviewCount || 0})
          </span>
        </div>

        {/* Price & Discount */}
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#0f1111' }}>
              {formatPrice(discountedPrice)}
            </span>
            {discount > 0 && (
              <span style={{ fontSize: '12px', color: '#565959', textDecoration: 'line-through' }}>
                M.R.P: {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Delivery Info with dynamic PIN */}
        <div style={{ fontSize: '12px', color: '#565959', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Truck size={13} color="#007185" />
          <span>
            FREE delivery <strong>Tomorrow</strong> to <strong>{pinCode}</strong>
          </span>
        </div>

        {/* Stock Status Indicator */}
        <div style={{ marginTop: '6px', fontSize: '11px', fontWeight: '600' }}>
          {product.stock > 0 ? (
            product.stock < 10 ? (
              <span style={{ color: '#b12704' }}>Only {product.stock} left in stock - order soon</span>
            ) : (
              <span style={{ color: '#007600' }}>In stock</span>
            )
          ) : (
            <span style={{ color: '#b12704' }}>Currently unavailable</span>
          )}
        </div>

        {/* Add to Cart CTA */}
        <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '13px',
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
                <ShoppingCart size={15} /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
