import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Zap, Truck } from 'lucide-react';

const SLIDES = [
  {
    title: 'The Great NovaMart Shopping Festival',
    subtitle: 'Unbeatable deals on Flagship Smartphones, Premium Audio & 4K TVs',
    tag: 'LIMITED TIME OFFERS',
    link: '/products?category=Electronics',
    buttonText: 'Shop Electronics',
    bg: 'linear-gradient(135deg, #131921 0%, #1a2a3a 50%, #2c3e50 100%)',
    badgeColor: '#febd69',
  },
  {
    title: 'Area-Based Hyperlocal Delivery',
    subtitle: 'Direct from our city hubs to your doorstep with real-time OTP tracking',
    tag: 'LOCAL PARTNER DISPATCH',
    link: '/products',
    buttonText: 'Explore Serviceable PINs',
    bg: 'linear-gradient(135deg, #0b3d2e 0%, #145a32 50%, #1e8449 100%)',
    badgeColor: '#a3e4d7',
  },
  {
    title: 'Curated Fashion & Lifestyle Essentials',
    subtitle: 'Step into the new season with verified authentic brands & free returns',
    tag: 'NEW ARRIVALS 2026',
    link: '/products?category=Fashion',
    buttonText: 'Discover Fashion',
    bg: 'linear-gradient(135deg, #4a154b 0%, #6c3483 50%, #884ea0 100%)',
    badgeColor: '#f5cba7',
  },
];

export const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrentSlide((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrentSlide((c) => (c + 1) % SLIDES.length);

  const slide = SLIDES[currentSlide];

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '340px' }}>
      <div
        style={{
          background: slide.bg,
          color: '#fff',
          padding: '60px 40px',
          minHeight: '340px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transition: 'background 0.5s ease',
        }}
      >
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700',
              color: slide.badgeColor,
              marginBottom: '12px',
            }}
          >
            <Zap size={13} /> {slide.tag}
          </div>

          <h1 style={{ fontSize: '38px', fontWeight: '800', lineHeight: '1.2', marginBottom: '12px', maxWidth: '750px' }}>
            {slide.title}
          </h1>

          <p style={{ fontSize: '16px', color: '#e0e0e0', marginBottom: '24px', maxWidth: '600px', lineHeight: '1.5' }}>
            {slide.subtitle}
          </p>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <Link
              to={slide.link}
              className="btn-primary"
              style={{
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: '700',
                textDecoration: 'none',
              }}
            >
              {slide.buttonText}
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#febd69', fontSize: '13px' }}>
              <Truck size={18} />
              <span>Free Delivery on ₹499+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Controls */}
      <button
        onClick={prev}
        style={{
          position: 'absolute',
          top: '50%',
          left: '16px',
          transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.4)',
          border: 'none',
          color: '#fff',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={next}
        style={{
          position: 'absolute',
          top: '50%',
          right: '16px',
          transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.4)',
          border: 'none',
          color: '#fff',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots Indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
        }}
      >
        {SLIDES.map((_, idx) => (
          <span
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            style={{
              width: currentSlide === idx ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              backgroundColor: currentSlide === idx ? '#febd69' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
};
