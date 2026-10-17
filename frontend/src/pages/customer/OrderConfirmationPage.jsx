import React, { useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Package, KeyRound } from 'lucide-react';

export const OrderConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const order = location.state?.order;

  useEffect(() => {
    // Fire celebratory confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div style={{ backgroundColor: '#eaeded', minHeight: '85vh', padding: '40px 16px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="nova-card" style={{ padding: '36px', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: '#e6f4ea', marginBottom: '16px' }}>
            <CheckCircle2 size={54} color="#067d62" />
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f1111', marginBottom: '8px' }}>
            Thank you, your order has been placed!
          </h1>
          <p style={{ fontSize: '15px', color: '#565959', marginBottom: '20px' }}>
            An order confirmation has been generated and dispatched to our area hub.
          </p>

          {/* OTP Box Highlight */}
          {order?.deliveryOtp && (
            <div
              style={{
                backgroundColor: '#fffaf2',
                border: '2px dashed #ff9900',
                borderRadius: '12px',
                padding: '20px',
                maxWidth: '480px',
                margin: '0 auto 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#b06000', fontWeight: '700', fontSize: '14px', marginBottom: '6px' }}>
                <KeyRound size={18} /> YOUR DELIVERY VERIFICATION OTP
              </div>
              <div style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '8px', color: '#0f1111', margin: '8px 0' }}>
                {order.deliveryOtp}
              </div>
              <div style={{ fontSize: '12px', color: '#565959' }}>
                Please provide this 6-digit code to the NovaMart delivery partner when they arrive to confirm delivery.
              </div>
            </div>
          )}

          {/* Details Summary Card */}
          <div
            style={{
              backgroundColor: '#f7fafa',
              border: '1px solid #d5d9d9',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'left',
              marginBottom: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', color: '#565959' }}>Order Number</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#007185' }}>
                {order?.orderNumber || `ORD-${id}`}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#565959' }}>Estimated Delivery</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#067d62' }}>
                Tomorrow by 8:00 PM
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#565959' }}>Delivery Zone</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f1111' }}>
                {order?.deliveryZoneName || 'Vadodara Central'} ({order?.shippingPinCode || '390001'})
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#565959' }}>Payment Status</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f1111' }}>
                {order?.paymentMethod} ({order?.paymentStatus || 'CONFIRMED'})
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <Link
              to={`/orders/${id}`}
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '14px', textDecoration: 'none' }}
            >
              <Package size={16} /> Track Order Live
            </Link>
            <Link
              to="/products"
              className="btn-secondary"
              style={{ padding: '12px 24px', fontSize: '14px', textDecoration: 'none' }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
