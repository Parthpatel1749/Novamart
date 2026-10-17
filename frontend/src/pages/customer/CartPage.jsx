import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';
import { Trash2, ShieldCheck, ArrowRight, ShoppingBag, Truck } from 'lucide-react';

export const CartPage = () => {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const isFreeDeliveryEligible = cart.subtotal >= 499;
  const remainingForFreeDelivery = Math.max(0, 499 - cart.subtotal);

  if (cart.items.length === 0) {
    return (
      <div style={{ backgroundColor: '#eaeded', minHeight: '80vh', padding: '40px 16px' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div className="nova-card" style={{ padding: '40px', textAlign: 'center' }}>
            <ShoppingBag size={54} color="#a0aec0" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
              Your NovaMart Cart is empty
            </h2>
            <p style={{ fontSize: '14px', color: '#565959', marginBottom: '24px' }}>
              Your shopping cart is waiting. Give it purpose – fill it with groceries, electronics, fashion, and more.
            </p>
            <Link
              to="/products"
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '14px', textDecoration: 'none' }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#eaeded', minHeight: '90vh', padding: '24px 0 60px' }}>
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Main Cart Items Column */}
          <div className="nova-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '16px', marginBottom: '16px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f1111' }}>Shopping Cart</h1>
                <button
                  onClick={clearCart}
                  style={{ background: 'none', border: 'none', color: '#007185', fontSize: '12px', cursor: 'pointer', marginTop: '4px' }}
                >
                  Deselect all items
                </button>
              </div>
              <span style={{ fontSize: '14px', color: '#565959' }}>Price</span>
            </div>

            {/* Free Delivery Bar */}
            <div
              style={{
                backgroundColor: isFreeDeliveryEligible ? '#e6f4ea' : '#fffaf2',
                border: isFreeDeliveryEligible ? '1px solid #a8dab5' : '1px solid #fed8b1',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Truck size={20} color={isFreeDeliveryEligible ? '#137333' : '#e65100'} />
              <div style={{ fontSize: '13px' }}>
                {isFreeDeliveryEligible ? (
                  <span style={{ color: '#137333', fontWeight: '700' }}>
                    Part of your order qualifies for FREE Delivery!
                  </span>
                ) : (
                  <span>
                    Add <strong>{formatPrice(remainingForFreeDelivery)}</strong> of eligible items to get{' '}
                    <strong style={{ color: '#007600' }}>FREE Delivery</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Cart Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr auto',
                    gap: '16px',
                    borderBottom: '1px solid #eee',
                    paddingBottom: '20px',
                  }}
                >
                  {/* Thumbnail */}
                  <Link to={`/products/${item.productId}`}>
                    <img
                      src={item.productImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'}
                      alt={item.productTitle}
                      style={{ width: '100%', height: '110px', objectFit: 'contain', borderRadius: '4px' }}
                    />
                  </Link>

                  {/* Title & Controls */}
                  <div>
                    <Link
                      to={`/products/${item.productId}`}
                      style={{ fontSize: '16px', fontWeight: '600', color: '#0f1111', textDecoration: 'none', lineHeight: '1.3' }}
                    >
                      {item.productTitle}
                    </Link>

                    <div style={{ fontSize: '12px', color: '#007600', fontWeight: '600', margin: '6px 0' }}>
                      In Stock
                    </div>

                    {item.selectedVariant && (
                      <div style={{ fontSize: '12px', color: '#565959', marginBottom: '8px' }}>
                        Style: <strong>{item.selectedVariant}</strong>
                      </div>
                    )}

                    {/* Qty & Delete controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d5d9d9', borderRadius: '6px', overflow: 'hidden' }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{ padding: '4px 10px', background: '#f0f2f2', border: 'none', cursor: 'pointer', fontWeight: '700' }}
                        >
                          -
                        </button>
                        <span style={{ padding: '4px 14px', fontSize: '13px', fontWeight: '600' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{ padding: '4px 10px', background: '#f0f2f2', border: 'none', cursor: 'pointer', fontWeight: '700' }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#007185',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f1111' }}>
                      {formatPrice(item.subtotal)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#565959' }}>
                      {formatPrice(item.unitPrice)} each
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'right', marginTop: '16px', fontSize: '16px' }}>
              Subtotal ({cart.totalItems} items): <strong>{formatPrice(cart.subtotal)}</strong>
            </div>
          </div>

          {/* Right Summary Box */}
          <div className="nova-card" style={{ padding: '24px', position: 'sticky', top: '90px' }}>
            <div style={{ fontSize: '13px', color: '#007600', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <ShieldCheck size={16} /> Eligible for fast doorstep dispatch
            </div>

            <div style={{ fontSize: '18px', fontWeight: '500', color: '#0f1111', marginBottom: '16px' }}>
              Subtotal ({cart.totalItems} items): <br />
              <strong style={{ fontSize: '24px', color: '#b12704' }}>{formatPrice(cart.subtotal)}</strong>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                fontWeight: '700',
                justifyContent: 'center',
                marginBottom: '14px',
              }}
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>

            <div style={{ fontSize: '12px', color: '#565959', lineHeight: '1.4' }}>
              By placing your order, you agree to NovaMart's Conditions of Use & Sale.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
