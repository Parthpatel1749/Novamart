import React, { useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { MapPin, X, CheckCircle, AlertCircle } from 'lucide-react';

export const PinLocationModal = () => {
  const { isModalOpen, closeLocationModal, updateLocation, pinCode } = useLocation();
  const [inputPin, setInputPin] = useState(pinCode);
  const [statusMsg, setStatusMsg] = useState('');

  if (!isModalOpen) return null;

  const handleApply = (pin, cityName, zone) => {
    updateLocation(pin, cityName, zone);
    setStatusMsg(`Selected ${zone} (${pin})`);
    setTimeout(() => {
      closeLocationModal();
      setStatusMsg('');
    }, 600);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const clean = inputPin.trim();
    if (!/^\d{6}$/.test(clean)) {
      setStatusMsg('Please enter a valid 6-digit PIN code');
      return;
    }

    if (['390001', '390002', '390007', '390009'].includes(clean)) {
      handleApply(clean, 'Vadodara', 'Vadodara Central');
    } else if (['390010', '390011', '390012'].includes(clean)) {
      handleApply(clean, 'Vadodara', 'Vadodara West');
    } else {
      // General serviceable PIN
      handleApply(clean, 'Vadodara', 'Vadodara Metro');
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeLocationModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="#ff9900" />
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Choose your delivery location</h3>
          </div>
          <button
            onClick={closeLocationModal}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '13px', color: '#565959', marginBottom: '16px' }}>
            Select a delivery location to see product availability and guaranteed fast delivery options from our local delivery partners.
          </p>

          <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Enter 6-digit PIN code"
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value)}
              maxLength={6}
            />
            <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
              Apply
            </button>
          </form>

          {statusMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: statusMsg.includes('valid') ? '#cc0c39' : '#067d62', fontSize: '13px' }}>
              {statusMsg.includes('valid') ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
              <span>{statusMsg}</span>
            </div>
          )}

          <div style={{ borderTop: '1px solid #e7e7e7', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#0f1111', marginBottom: '10px' }}>
              Pre-Configured Delivery Zones (Vadodara)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleApply('390001', 'Vadodara', 'Vadodara Central')}
                style={{
                  textAlign: 'left',
                  padding: '10px',
                  borderRadius: '6px',
                  border: pinCode === '390001' ? '2px solid #ff9900' : '1px solid #d5d9d9',
                  background: pinCode === '390001' ? '#fffaf2' : '#fff',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#111' }}>Vadodara Central</div>
                <div style={{ fontSize: '12px', color: '#565959' }}>PIN: 390001, 390002...</div>
                <div style={{ fontSize: '11px', color: '#067d62', marginTop: '4px', fontWeight: '600' }}>✓ Active Partner Online</div>
              </button>

              <button
                type="button"
                onClick={() => handleApply('390010', 'Vadodara', 'Vadodara West')}
                style={{
                  textAlign: 'left',
                  padding: '10px',
                  borderRadius: '6px',
                  border: pinCode === '390010' ? '2px solid #ff9900' : '1px solid #d5d9d9',
                  background: pinCode === '390010' ? '#fffaf2' : '#fff',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#111' }}>Vadodara West</div>
                <div style={{ fontSize: '12px', color: '#565959' }}>PIN: 390010, 390011...</div>
                <div style={{ fontSize: '11px', color: '#b06000', marginTop: '4px', fontWeight: '600' }}>⚡ Standard Delivery</div>
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={closeLocationModal}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
