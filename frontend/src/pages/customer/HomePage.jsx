import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeroBanner } from '../../components/HeroBanner';
import { ProductCard } from '../../components/ProductCard';
import { productAPI } from '../../services/api';
import { Zap, Flame, ArrowRight } from 'lucide-react';

export const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await productAPI.getProducts();
        if (prodRes?.data) setProducts(prodRes.data);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const dealProducts = products.filter(p => (p.discountPercentage || 0) >= 15);
  const topRated = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);

  return (
    <div style={{ backgroundColor: '#eaeded', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Carousel */}
      <HeroBanner />

      <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        {/* Amazon-style 4-card teaser grid overlapping Hero */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '30px',
          }}
        >
          {/* Card 1: Electronics Category */}
          <div className="nova-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>
              Upgrade your Tech & Gadgets
            </h3>
            <div
              style={{
                height: '200px',
                backgroundImage: 'url("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '6px',
                marginBottom: '12px',
              }}
            />
            <Link to="/products?category=Electronics" style={{ fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              See all electronics <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 2: Beauty & Personal Care */}
          <div className="nova-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>
              Beauty & Personal Care
            </h3>
            <div
              style={{
                height: '200px',
                backgroundImage: 'url("https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '6px',
                marginBottom: '12px',
              }}
            />
            <Link to="/products?category=Beauty%20%26%20Care" style={{ fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Shop personal care <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 3: Fashion Trends */}
          <div className="nova-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>
              Men's & Women's Fashion
            </h3>
            <div
              style={{
                height: '200px',
                backgroundImage: 'url("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '6px',
                marginBottom: '12px',
              }}
            />
            <Link to="/products?category=Fashion" style={{ fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Explore styles <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 4: Home & Kitchen Essentials */}
          <div className="nova-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>
              Smart Home & Kitchen
            </h3>
            <div
              style={{
                height: '200px',
                backgroundImage: 'url("https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '6px',
                marginBottom: '12px',
              }}
            />
            <Link to="/products?category=Home%20%26%20Kitchen" style={{ fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Shop appliances <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Today's Deals Section */}
        <div className="nova-card" style={{ padding: '24px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ backgroundColor: '#cc0c39', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={14} /> LIGHTNING DEALS
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f1111' }}>
                Today's Best Offers
              </h2>
            </div>
            <Link to="/products" style={{ fontSize: '14px', fontWeight: '600' }}>
              See all deals
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#777' }}>Loading deals...</div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '20px',
              }}
            >
              {(dealProducts.length > 0 ? dealProducts : products.slice(0, 4)).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Best Sellers Section */}
        <div className="nova-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ backgroundColor: '#ff9900', color: '#111', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Flame size={14} /> TOP RATED
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f1111' }}>
                Customer Favorites & Best Sellers
              </h2>
            </div>
            <Link to="/products?sortBy=rating" style={{ fontSize: '14px', fontWeight: '600' }}>
              View ranking
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '20px',
            }}
          >
            {topRated.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
