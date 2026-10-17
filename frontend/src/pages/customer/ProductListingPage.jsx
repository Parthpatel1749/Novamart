import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../../services/api';
import { ProductCard } from '../../components/ProductCard';
import { Star, Filter, Grid, List as ListIcon, ChevronRight } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

export const ProductListingPage = () => {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('query') || '';
  const categoryParam = searchParams.get('category') || '';
  const sortByParam = searchParams.get('sortBy') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [minRating, setMinRating] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [maxPrice, setMaxPrice] = useState(150000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState(sortByParam || 'featured');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes, brandRes] = await Promise.all([
          productAPI.getProducts({
            query: queryParam || undefined,
            sortBy: sortBy !== 'featured' ? sortBy : undefined,
          }),
          categoryAPI.getAll(),
          productAPI.getBrands(),
        ]);
        if (prodRes?.data) setProducts(prodRes.data);
        if (catRes?.data) setCategories(catRes.data);
        if (brandRes?.data) setBrands(brandRes.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [queryParam, sortBy]);

  // Client-side filtering
  const filteredProducts = products.filter((p) => {
    if (selectedCategory && selectedCategory !== 'All') {
      if (p.categoryName?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    }
    if (selectedBrand && p.brand?.toLowerCase() !== selectedBrand.toLowerCase()) return false;
    if (minRating && (p.rating || 0) < minRating) return false;
    if (maxPrice && Number(p.discountedPrice || p.price) > maxPrice) return false;
    if (inStockOnly && p.stock <= 0) return false;
    return true;
  });

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', padding: '16px 0 60px' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#565959', marginBottom: '16px' }}>
          <Link to="/" style={{ color: '#007185' }}>Home</Link>
          <ChevronRight size={12} />
          <Link to="/products" style={{ color: '#007185' }}>Products</Link>
          {selectedCategory && (
            <>
              <ChevronRight size={12} />
              <span style={{ color: '#0f1111', fontWeight: '600' }}>{selectedCategory}</span>
            </>
          )}
          {queryParam && (
            <>
              <ChevronRight size={12} />
              <span>Results for "{queryParam}"</span>
            </>
          )}
        </div>

        {/* Results Header bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e7e7e7',
            paddingBottom: '14px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <span style={{ fontSize: '14px', color: '#565959' }}>
              Showing <strong>1-{filteredProducts.length}</strong> of <strong>{products.length}</strong> results
              {queryParam && <span> for <strong style={{ color: '#c45500' }}>"{queryParam}"</strong></span>}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <label htmlFor="sort-select" style={{ color: '#565959' }}>Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d5d9d9',
                  backgroundColor: '#f0f2f2',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <option value="featured">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Avg. Customer Review</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', border: '1px solid #d5d9d9', borderRadius: '4px', overflow: 'hidden' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '6px 10px',
                  background: viewMode === 'grid' ? '#e7e7e7' : '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
                title="Grid View"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '6px 10px',
                  background: viewMode === 'list' ? '#e7e7e7' : '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
                title="List View"
              >
                <ListIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid: Sidebar + Products List */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '30px' }}>
          {/* Sidebar Filters */}
          <aside style={{ borderRight: '1px solid #f0f0f0', paddingRight: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', fontWeight: '700', fontSize: '15px' }}>
              <Filter size={16} /> Filters
            </div>

            {/* Category Filter */}
            <div style={{ marginBottom: '22px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#0f1111' }}>
                Department
              </h4>
              <ul style={{ listStyle: 'none', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li
                  onClick={() => setSelectedCategory('')}
                  style={{
                    cursor: 'pointer',
                    fontWeight: !selectedCategory ? '700' : '400',
                    color: !selectedCategory ? '#111' : '#007185',
                  }}
                >
                  All Categories
                </li>
                {categories.map((c) => (
                  <li
                    key={c.id}
                    onClick={() => setSelectedCategory(c.name)}
                    style={{
                      cursor: 'pointer',
                      fontWeight: selectedCategory === c.name ? '700' : '400',
                      color: selectedCategory === c.name ? '#111' : '#007185',
                    }}
                  >
                    {c.name}
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Reviews Filter */}
            <div style={{ marginBottom: '22px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#0f1111' }}>
                Avg. Customer Review
              </h4>
              {[4, 3].map((stars) => (
                <div
                  key={stars}
                  onClick={() => setMinRating(minRating === stars ? null : stars)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    padding: '3px 0',
                    color: minRating === stars ? '#111' : '#007185',
                    fontWeight: minRating === stars ? '700' : '400',
                  }}
                >
                  <div style={{ display: 'flex', color: '#ffa41c' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < stars ? '#ffa41c' : 'none'} stroke="#ffa41c" />
                    ))}
                  </div>
                  <span>& Up</span>
                </div>
              ))}
            </div>

            {/* Price Filter Slider */}
            <div style={{ marginBottom: '22px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#0f1111' }}>
                Price Range
              </h4>
              <input
                type="range"
                min="1000"
                max="150000"
                step="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ff9900' }}
              />
              <div style={{ fontSize: '12px', color: '#565959', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span>Up to {formatPrice(maxPrice)}</span>
              </div>
            </div>

            {/* Brand Filter */}
            {brands.length > 0 && (
              <div style={{ marginBottom: '22px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#0f1111' }}>
                  Brand
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {brands.map((b) => (
                    <label key={b} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedBrand === b}
                        onChange={() => setSelectedBrand(selectedBrand === b ? '' : b)}
                      />
                      <span>{b}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div style={{ marginBottom: '22px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#0f1111' }}>
                Availability
              </h4>
              <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                <span>Include Out of Stock</span>
              </label>
            </div>

            {/* Reset Filters button */}
            <button
              onClick={() => {
                setSelectedCategory('');
                setMinRating(null);
                setSelectedBrand('');
                setMaxPrice(150000);
                setInStockOnly(false);
              }}
              className="btn-secondary"
              style={{ width: '100%', fontSize: '12px', padding: '6px' }}
            >
              Clear All Filters
            </button>
          </aside>

          {/* Product Items */}
          <main>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px', color: '#666' }}>Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No matching products found</h3>
                <p style={{ fontSize: '14px', color: '#565959', marginBottom: '16px' }}>
                  Try resetting your search query or filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setMinRating(null);
                    setSelectedBrand('');
                    setMaxPrice(150000);
                  }}
                  className="btn-primary"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(240px, 1fr))' : '1fr',
                  gap: '20px',
                }}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
