import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { deliveryPartnerAPI, adminDeliveryAPI } from '../../services/api';
import { Truck, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export const DeliveryPartnerRegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: 'Vadodara',
    state: 'Gujarat',
    pinCode: '390001',
    vehicleType: 'Motorcycle',
    vehicleNumber: '',
    licenseNumber: '',
    profilePhotoUrl: '',
    documentInfo: 'Aadhaar & DL Verified',
    zoneIds: [],
  });

  const [availableZones, setAvailableZones] = useState([]);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminDeliveryAPI.getZones()
      .then((res) => {
        if (res?.data) {
          setAvailableZones(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({ ...prev, zoneIds: [res.data[0].id] }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords are identical.');
      return;
    }

    setLoading(true);
    try {
      await deliveryPartnerAPI.register(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ backgroundColor: '#eaeded', minHeight: '85vh', padding: '60px 16px', display: 'flex', justifyContent: 'center' }}>
        <div className="nova-card" style={{ maxWidth: '600px', width: '100%', padding: '40px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: '#e6f4ea', marginBottom: '16px' }}>
            <CheckCircle2 size={54} color="#067d62" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>
            Application Submitted for Review
          </h1>
          <p style={{ fontSize: '14px', color: '#565959', lineHeight: '1.6', marginBottom: '24px' }}>
            Thank you for registering as a NovaMart Delivery Partner! Your application is currently <strong>Under Review</strong> by our logistics administrators. Once approved, you will be assigned your preferred delivery zone and can go online to receive orders.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/delivery-partner/login" className="btn-primary" style={{ textDecoration: 'none' }}>
              Partner Sign In
            </Link>
            <Link to="/" className="btn-secondary" style={{ textDecoration: 'none' }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#eaeded', minHeight: '100vh', padding: '40px 16px' }}>
      <div className="container" style={{ maxWidth: '750px' }}>
        <div className="nova-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Truck size={28} color="#067d62" />
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f1111' }}>
              Delivery Partner Onboarding
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: '#565959', marginBottom: '24px' }}>
            Join NovaMart's dedicated local area delivery fleet. Deliver orders in your preferred city zones and earn per delivery.
          </p>

          {error && (
            <div style={{ backgroundColor: '#fff5f5', border: '1px solid #fed7d7', padding: '12px', borderRadius: '6px', color: '#c53030', fontSize: '13px', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '14px' }}>
              1. Personal Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="As per Driving License"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="10-digit number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Email for portal login"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    style={{ paddingRight: '40px' }}
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#565959',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-control"
                    style={{ paddingRight: '40px' }}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#565959',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                    }}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && formData.password !== confirmPassword && (
                  <div style={{ fontSize: '11px', color: '#c53030', marginTop: '4px' }}>
                    Passwords do not match
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Residential Address</label>
              <input
                type="text"
                className="form-control"
                placeholder="Street address, colony, area"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
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
                <label>State</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>PIN Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.pinCode}
                  onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                  required
                />
              </div>
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: '700', borderBottom: '1px solid #eee', paddingBottom: '6px', margin: '20px 0 14px' }}>
              2. Vehicle & Verification Documents
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label>Vehicle Type</label>
                <select
                  className="form-control"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                >
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Electric Scooter">Electric Scooter</option>
                  <option value="Bicycle">Bicycle</option>
                  <option value="Van">Delivery Van</option>
                </select>
              </div>

              <div className="form-group">
                <label>Vehicle Registration Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. GJ-06-AB-1234"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Driving License Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. DL-GJ06-2023-XXXXXXX"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                required
              />
            </div>

            {availableZones.length > 0 && (
              <div className="form-group">
                <label>Preferred Delivery Zone</label>
                <select
                  className="form-control"
                  value={formData.zoneIds[0] || ''}
                  onChange={(e) => setFormData({ ...formData, zoneIds: [Number(e.target.value)] })}
                >
                  {availableZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.zoneName} ({z.pinCodes})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '16px' }}
            >
              {loading ? 'Submitting Application...' : 'Register as Delivery Partner'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
            Already registered? <Link to="/delivery-partner/login" style={{ color: '#007185' }}>Sign in to Partner Hub</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
