import React, { createContext, useContext, useState } from 'react';

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const [pinCode, setPinCode] = useState(() => localStorage.getItem('novamart_pin') || '390001');
  const [city, setCity] = useState(() => localStorage.getItem('novamart_city') || 'Vadodara');
  const [zoneName, setZoneName] = useState(() => localStorage.getItem('novamart_zone') || 'Vadodara Central');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateLocation = (newPin, newCity = 'Vadodara', newZone = 'Vadodara Central') => {
    setPinCode(newPin);
    setCity(newCity);
    setZoneName(newZone);
    localStorage.setItem('novamart_pin', newPin);
    localStorage.setItem('novamart_city', newCity);
    localStorage.setItem('novamart_zone', newZone);
  };

  const openLocationModal = () => setIsModalOpen(true);
  const closeLocationModal = () => setIsModalOpen(false);

  return (
    <LocationContext.Provider
      value={{
        pinCode,
        city,
        zoneName,
        isModalOpen,
        openLocationModal,
        closeLocationModal,
        updateLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
