import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { orderAPI, couponAPI, paymentAPI } from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import {
  MapPin,
  CheckCircle,
  AlertCircle,
  Lock,
} from 'lucide-react';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { cart, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { pinCode: globalPin, city: globalCity } = useLocation();

  // Check if direct buy mode ("Buy Now")
  const directProduct = routerLocation.state?.directProduct;
  const directQuantity = routerLocation.state?.directQuantity || 1;
  const directVariant = routerLocation.state?.directVariant || null;

  // Checkout Steps
  const [activeStep, setActiveStep] = useState(1); // 1: Address, 2: Delivery, 3: Coupon, 4: Payment

  // Address Form State
  const [shippingAddress, setShippingAddress] = useState(() => {
    if (user) {
      const storageKey = `novamart_addresses_${user.email || user.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const def = parsed.find((a) => a.isDefault) || parsed[0];
            if (def) {
              return {
                fullName: (!def.fullName || def.fullName === 'Priya Sharma') ? (user.fullName || '') : def.fullName,
                phone: (!def.phone || (def.phone === '9898000004' && user.phone)) ? (user.phone || def.phone) : def.phone,
                streetAddress: def.streetAddress || '',
                landmark: def.landmark || '',
                city: def.city || globalCity || 'Vadodara',
                state: def.state || 'Gujarat',
                pinCode: def.pinCode || globalPin || '390001',
              };
            }
          }
        } catch {}
      }
    }
    return {
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      streetAddress: '',
      landmark: '',
      city: globalCity || 'Vadodara',
      state: 'Gujarat',
      pinCode: globalPin || '390001',
    };
  });

  // Delivery Speed Option
  const [deliveryOption, setDeliveryOption] = useState('STANDARD');

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState('WELCOME50');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, CARD, NET_BANKING, COD
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: routerLocation } });
    }
  }, [isAuthenticated, navigate, routerLocation]);

  // Compute Totals
  const itemsSubtotal = directProduct
    ? (directProduct.discountedPrice || directProduct.price) * directQuantity
    : cart.subtotal;

  const deliveryFee = itemsSubtotal >= 499 || deliveryOption === 'STANDARD' ? 0 : 40;
  const finalTotal = Math.max(0, itemsSubtotal - couponDiscount + deliveryFee);

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await couponAPI.validate(couponCodeInput.trim(), itemsSubtotal);
      if (res?.data) {
        setAppliedCoupon(res.data);
        const discountAmt = (itemsSubtotal * (res.data.discountPercentage / 100));
        const capped = res.data.maxDiscountAmount ? Math.min(discountAmt, res.data.maxDiscountAmount) : discountAmt;
        setCouponDiscount(capped);
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon');
      setAppliedCoupon(null);
      setCouponDiscount(0);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    setSubmittingOrder(true);
    try {
      // 1. If online payment, simulate payment intent verification
      if (paymentMethod !== 'COD') {
        const intentRes = await paymentAPI.createIntent({
          amount: finalTotal,
          method: paymentMethod,
        });
        await paymentAPI.verify({
          paymentId: intentRes.data.paymentId,
        });
      }

      // 2. Submit Order to Backend
      const orderPayload = {
        shippingFullName: shippingAddress.fullName,
        shippingPhone: shippingAddress.phone,
        shippingStreetAddress: shippingAddress.streetAddress,
        shippingLandmark: shippingAddress.landmark,
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state,
        shippingPinCode: shippingAddress.pinCode.trim(),
        paymentMethod: paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
      };

      if (directProduct) {
        orderPayload.directProductId = directProduct.id;
        orderPayload.directQuantity = directQuantity;
        orderPayload.directVariant = directVariant;
      }

      const res = await orderAPI.createOrder(orderPayload);
      const createdOrder = res.data;

      // Save/update this address into user's saved addresses
      if (user) {
        const storageKey = `novamart_addresses_${user.email || user.id}`;
        const newSavedAddr = {
          id: 'addr_' + Date.now(),
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          streetAddress: shippingAddress.streetAddress,
          landmark: shippingAddress.landmark,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pinCode: shippingAddress.pinCode.trim(),
          isDefault: true,
        };
        const existingStr = localStorage.getItem(storageKey);
        let updatedList = [newSavedAddr];
        if (existingStr) {
          try {
            const parsed = JSON.parse(existingStr);
            if (Array.isArray(parsed)) {
              updatedList = [newSavedAddr, ...parsed.map((a) => ({ ...a, isDefault: false }))];
            }
          } catch {}
        }
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
      }

      // Clear cart
      if (!directProduct) {
        await clearCart();
      }

      // Navigate to Order Confirmation
      navigate(`/order-confirmation/${createdOrder.id}`, { state: { order: createdOrder } });
    } catch (err) {
      alert('Order placement failed: ' + err.message);
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#eaeded', minHeight: '100vh', padding: '24px 0 60px' }}>
      <div className="container" style={{ maxWidth: '1150px' }}>
        {/* Checkout Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px', fontWeight: '800' }}>
              Nova<span style={{ color: '#febd69' }}>Mart</span>
            </span>
            <span style={{ fontSize: '20px', color: '#555', fontWeight: '300' }}>| Checkout</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#565959', fontSize: '13px' }}>
            <Lock size={16} /> 256-Bit SSL Secure Checkout
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
          {/* Left Column: Multi-Step Accordion / Wizard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Step 1: Delivery Address */}
            <div className="nova-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#131921', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
                    1
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Delivery Address & PIN Matching</h3>
                </div>
                {activeStep > 1 && (
                  <button
                    onClick={() => setActiveStep(1)}
                    style={{ background: 'none', border: 'none', color: '#007185', fontSize: '13px', cursor: 'pointer' }}
                  >
                    Change
                  </button>
                )}
              </div>

              {activeStep === 1 ? (
                <div>
                  <div style={{ backgroundColor: '#f0f9f5', border: '1px solid #b7eb8f', borderRadius: '6px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={20} color="#067d62" />
                    <div style={{ fontSize: '12px', color: '#135200' }}>
                      <strong>Area-Based Routing:</strong> Orders to PIN <strong>{shippingAddress.pinCode}</strong> will be routed directly to the designated zone delivery partner for instant dispatch.
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Flat, House no., Building, Apartment</label>
                    <input
                      type="text"
                      className="form-control"
                      value={shippingAddress.streetAddress}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, streetAddress: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Landmark</label>
                    <input
                      type="text"
                      className="form-control"
                      value={shippingAddress.landmark}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, landmark: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>PIN Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={shippingAddress.pinCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, pinCode: e.target.value })}
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setShippingAddress({ ...shippingAddress, pinCode: '390001', city: 'Vadodara' })}
                      className="btn-secondary"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      Use Vadodara Central (390001)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShippingAddress({ ...shippingAddress, pinCode: '390010', city: 'Vadodara' })}
                      className="btn-secondary"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      Use Vadodara West (390010)
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveStep(2)}
                    className="btn-primary"
                    style={{ marginTop: '16px', padding: '8px 20px' }}
                  >
                    Deliver to this address
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#565959', lineHeight: '1.4' }}>
                  <strong>{shippingAddress.fullName}</strong>, {shippingAddress.streetAddress}, {shippingAddress.city}, {shippingAddress.state} - <strong>{shippingAddress.pinCode}</strong> (Phone: {shippingAddress.phone})
                </div>
              )}
            </div>

            {/* Step 2: Delivery Speed */}
            <div className="nova-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: activeStep >= 2 ? '#131921' : '#ccc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
                    2
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Delivery Option</h3>
                </div>
                {activeStep > 2 && (
                  <button
                    onClick={() => setActiveStep(2)}
                    style={{ background: 'none', border: 'none', color: '#007185', fontSize: '13px', cursor: 'pointer' }}
                  >
                    Change
                  </button>
                )}
              </div>

              {activeStep === 2 ? (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', borderRadius: '6px', border: '1px solid #d5d9d9', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="deliverySpeed"
                        checked={deliveryOption === 'STANDARD'}
                        onChange={() => setDeliveryOption('STANDARD')}
                        style={{ marginTop: '4px' }}
                      />
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: '#007600' }}>
                          FREE Standard Delivery - Guaranteed Tomorrow
                        </div>
                        <div style={{ fontSize: '12px', color: '#565959' }}>
                          Delivered directly by assigned NovaMart delivery boy for your zone.
                        </div>
                      </div>
                    </label>
                  </div>

                  <button
                    onClick={() => setActiveStep(3)}
                    className="btn-primary"
                    style={{ marginTop: '16px', padding: '8px 20px' }}
                  >
                    Continue to Coupon & Payment
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#565959' }}>
                  Standard Guaranteed Delivery by tomorrow (FREE)
                </div>
              )}
            </div>

            {/* Step 3: Coupon Code */}
            <div className="nova-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: activeStep >= 3 ? '#131921' : '#ccc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
                  3
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Promotional Code / Coupon</h3>
              </div>

              <div style={{ display: 'flex', gap: '8px', maxWidth: '400px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. WELCOME50, SAVE20"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon}
                  className="btn-secondary"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {validatingCoupon ? 'Checking...' : 'Apply'}
                </button>
              </div>

              {appliedCoupon && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', color: '#067d62', fontSize: '13px' }}>
                  <CheckCircle size={16} />
                  <span>
                    Coupon <strong>{appliedCoupon.code}</strong> applied! You saved <strong>{formatPrice(couponDiscount)}</strong> ({appliedCoupon.discountPercentage}% off).
                  </span>
                </div>
              )}

              {couponError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', color: '#cc0c39', fontSize: '13px' }}>
                  <AlertCircle size={16} />
                  <span>{couponError}</span>
                </div>
              )}
            </div>

            {/* Step 4: Payment Method */}
            <div className="nova-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#131921', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
                  4
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Select a payment method</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '6px', border: paymentMethod === 'UPI' ? '2px solid #ff9900' : '1px solid #d5d9d9', backgroundColor: paymentMethod === 'UPI' ? '#fffaf2' : '#fff', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>UPI / QR (Instant & Recommended)</div>
                    <div style={{ fontSize: '12px', color: '#565959' }}>Google Pay, PhonePe, Paytm, BHIM</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '6px', border: paymentMethod === 'CARD' ? '2px solid #ff9900' : '1px solid #d5d9d9', backgroundColor: paymentMethod === 'CARD' ? '#fffaf2' : '#fff', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>Credit / Debit Card</div>
                    <div style={{ fontSize: '12px', color: '#565959' }}>Visa, MasterCard, RuPay</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '6px', border: paymentMethod === 'COD' ? '2px solid #ff9900' : '1px solid #d5d9d9', backgroundColor: paymentMethod === 'COD' ? '#fffaf2' : '#fff', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>Cash on Delivery (COD)</div>
                    <div style={{ fontSize: '12px', color: '#565959' }}>Pay cash or UPI upon delivery verification</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="nova-card" style={{ padding: '24px', position: 'sticky', top: '90px' }}>
            <button
              onClick={handlePlaceOrder}
              disabled={submittingOrder}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                fontWeight: '700',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              {submittingOrder ? 'Processing Order...' : 'Place Your Order and Pay'}
            </button>

            <div style={{ fontSize: '12px', color: '#565959', lineHeight: '1.4', marginBottom: '16px' }}>
              By placing your order, you agree to NovaMart's privacy notice and conditions of use.
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <h4 style={{ fontWeight: '700', fontSize: '15px', color: '#0f1111' }}>Order Summary</h4>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#565959' }}>Items:</span>
                <span>{formatPrice(itemsSubtotal)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#565959' }}>Delivery & Handling:</span>
                <span style={{ color: '#007600' }}>
                  {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b12704' }}>
                  <span>Coupon Discount:</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '12px', marginTop: '6px', fontSize: '18px', fontWeight: '800', color: '#b12704' }}>
                <span>Order Total:</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#f0f9f5', borderRadius: '6px', padding: '12px', marginTop: '20px', fontSize: '12px', color: '#135200' }}>
              <strong>Area Delivery Guarantee:</strong> You will receive a 6-digit confirmation OTP to share with the rider when they arrive.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
