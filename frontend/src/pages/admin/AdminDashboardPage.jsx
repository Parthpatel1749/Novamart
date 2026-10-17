import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminOrderAPI } from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Truck,
  MapPin,
  Tag,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await adminOrderAPI.getDashboardStats();
      if (res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>Loading administrator dashboard...</div>;
  }

  return (
    <div style={{ backgroundColor: '#eaeded', minHeight: '100vh', padding: '24px 0 60px' }}>
      <div className="container" style={{ maxWidth: '1280px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f1111' }}>
              Administrator Control Center
            </h1>
            <div style={{ fontSize: '13px', color: '#565959', marginTop: '2px' }}>
              Hyperlocal E-Commerce Operations, Area Deliveries & Catalog Management
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchStats} className="btn-secondary" style={{ fontSize: '13px' }}>
              <RefreshCw size={14} /> Refresh Data
            </button>
            <Link to="/admin/orders" className="btn-primary" style={{ fontSize: '13px', textDecoration: 'none' }}>
              Manage Orders
            </Link>
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div className="nova-card" style={{ padding: '20px', borderLeft: '4px solid #007185' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#565959', textTransform: 'uppercase' }}>
                Total Revenue
              </span>
              <TrendingUp size={20} color="#007185" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f1111', marginTop: '8px' }}>
              {formatPrice(stats?.totalSales)}
            </div>
            <div style={{ fontSize: '12px', color: '#067d62', marginTop: '4px', fontWeight: '600' }}>
              Across {stats?.totalOrders} total orders
            </div>
          </div>

          <div className="nova-card" style={{ padding: '20px', borderLeft: '4px solid #ff9900' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#565959', textTransform: 'uppercase' }}>
                Pending Dispatch
              </span>
              <Package size={20} color="#ff9900" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#ff9900', marginTop: '8px' }}>
              {stats?.pendingOrders}
            </div>
            <div style={{ fontSize: '12px', color: '#565959', marginTop: '4px' }}>
              Orders processing or out for delivery
            </div>
          </div>

          <div className="nova-card" style={{ padding: '20px', borderLeft: '4px solid #067d62' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#565959', textTransform: 'uppercase' }}>
                Active Delivery Fleet
              </span>
              <Truck size={20} color="#067d62" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#067d62', marginTop: '8px' }}>
              {stats?.activeDeliveryPartners} <span style={{ fontSize: '14px', color: '#777' }}>/ {stats?.totalDeliveryPartners}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#565959', marginTop: '4px' }}>
              {stats?.pendingPartnerApprovals > 0 ? (
                <span style={{ color: '#c45500', fontWeight: '700' }}>
                  ⚠️ {stats?.pendingPartnerApprovals} approvals pending
                </span>
              ) : (
                'All partners reviewed'
              )}
            </div>
          </div>

          <div className="nova-card" style={{ padding: '20px', borderLeft: '4px solid #cc0c39' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#565959', textTransform: 'uppercase' }}>
                Inventory Alerts
              </span>
              <AlertTriangle size={20} color="#cc0c39" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: stats?.lowStockProducts > 0 ? '#cc0c39' : '#067d62', marginTop: '8px' }}>
              {stats?.lowStockProducts}
            </div>
            <div style={{ fontSize: '12px', color: '#565959', marginTop: '4px' }}>
              Products below stock threshold (&lt;10)
            </div>
          </div>
        </div>

        {/* Quick Operations Modules Grid */}
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f1111', marginBottom: '16px' }}>
          Operations & Management
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '30px',
          }}
        >
          {/* Card 1: Orders Management */}
          <Link to="/admin/orders" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="nova-card" style={{ padding: '20px', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Package size={22} color="#007185" />
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Order Processing</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#565959', lineHeight: '1.4', marginBottom: '12px' }}>
                Process incoming orders, update stages, and manually assign or reassign deliveries to active partners.
              </p>
              <div style={{ fontSize: '12px', color: '#007185', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Manage {stats?.totalOrders} Orders <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* Card 2: Delivery Partner Applications */}
          <Link to="/admin/delivery-partners" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="nova-card" style={{ padding: '20px', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Truck size={22} color="#067d62" />
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Delivery Partners</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#565959', lineHeight: '1.4', marginBottom: '12px' }}>
                Review partner onboarding applications, approve/reject riders, assign zones and monitor real-time workloads.
              </p>
              <div style={{ fontSize: '12px', color: '#067d62', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {stats?.pendingPartnerApprovals} Pending Approvals <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* Card 3: Delivery Zones */}
          <Link to="/admin/delivery-zones" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="nova-card" style={{ padding: '20px', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <MapPin size={22} color="#ff9900" />
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Delivery Zones & PINs</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#565959', lineHeight: '1.4', marginBottom: '12px' }}>
                Configure coverage areas (e.g. Vadodara Central, Vadodara West) with associated postal PIN codes.
              </p>
              <div style={{ fontSize: '12px', color: '#b06000', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {stats?.totalDeliveryZones} Configured Zones <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* Card 4: Product Inventory */}
          <Link to="/admin/products" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="nova-card" style={{ padding: '20px', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Tag size={22} color="#b12704" />
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Products & Inventory</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#565959', lineHeight: '1.4', marginBottom: '12px' }}>
                Add new products, adjust pricing, manage discounts, variants, specifications and restock quantities.
              </p>
              <div style={{ fontSize: '12px', color: '#b12704', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Manage {stats?.totalProducts} Products <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* Card 5: Coupons */}
          <Link to="/admin/coupons" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="nova-card" style={{ padding: '20px', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Tag size={22} color="#7627bb" />
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Promo Coupons</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#565959', lineHeight: '1.4', marginBottom: '12px' }}>
                Create promotional coupon codes (e.g. WELCOME50, SAVE20), set discount % and minimum order rules.
              </p>
              <div style={{ fontSize: '12px', color: '#7627bb', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Coupons & Discounts <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* Card 6: Reviews */}
          <Link to="/admin/reviews" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="nova-card" style={{ padding: '20px', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <ShieldCheck size={22} color="#1a73e8" />
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Customer Reviews</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#565959', lineHeight: '1.4', marginBottom: '12px' }}>
                Moderate product ratings and written feedback left by customers across all categories.
              </p>
              <div style={{ fontSize: '12px', color: '#1a73e8', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Review Moderation <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
