import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { SubNavbar } from './components/SubNavbar';
import { AdminNavbar } from './components/AdminNavbar';
import { Footer } from './components/Footer';
import { PinLocationModal } from './components/PinLocationModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PortalSwitcher } from './components/PortalSwitcher';

// Customer Pages (Lazy Loaded for 10k Concurrency Initial Bundle Optimization)
const HomePage = lazy(() => import('./pages/customer/HomePage').then(m => ({ default: m.HomePage })));
const ProductListingPage = lazy(() => import('./pages/customer/ProductListingPage').then(m => ({ default: m.ProductListingPage })));
const ProductDetailPage = lazy(() => import('./pages/customer/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CartPage = lazy(() => import('./pages/customer/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/customer/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderConfirmationPage = lazy(() => import('./pages/customer/OrderConfirmationPage').then(m => ({ default: m.OrderConfirmationPage })));
const OrderTrackingPage = lazy(() => import('./pages/customer/OrderTrackingPage').then(m => ({ default: m.OrderTrackingPage })));
const CustomerDashboardPage = lazy(() => import('./pages/customer/CustomerDashboardPage').then(m => ({ default: m.CustomerDashboardPage })));
const LoginPage = lazy(() => import('./pages/customer/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/customer/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/customer/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));

// Delivery Partner Pages (Lazy Loaded)
const DeliveryPartnerRegisterPage = lazy(() => import('./pages/delivery/DeliveryPartnerRegisterPage').then(m => ({ default: m.DeliveryPartnerRegisterPage })));
const DeliveryPartnerDashboardPage = lazy(() => import('./pages/delivery/DeliveryPartnerDashboardPage').then(m => ({ default: m.DeliveryPartnerDashboardPage })));

// Admin Pages (Lazy Loaded)
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage').then(m => ({ default: m.AdminOrdersPage })));
const AdminDeliveryPartnersPage = lazy(() => import('./pages/admin/AdminDeliveryPartnersPage').then(m => ({ default: m.AdminDeliveryPartnersPage })));
const AdminDeliveryZonesPage = lazy(() => import('./pages/admin/AdminDeliveryZonesPage').then(m => ({ default: m.AdminDeliveryZonesPage })));
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage').then(m => ({ default: m.AdminCouponsPage })));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage').then(m => ({ default: m.AdminReviewsPage })));

const PageLoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', flexDirection: 'column', gap: '12px' }}>
    <div style={{ width: '36px', height: '36px', border: '3px solid #f3f3f3', borderTop: '3px solid #ff9900', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <span style={{ fontSize: '13px', color: '#565959', fontWeight: '500' }}>Loading NovaMart...</span>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: isAdminRoute ? '#eaeded' : '#fff' }}>
      <PortalSwitcher currentPortal={isAdminRoute ? 'admin' : 'user'} />
      {isAdminRoute ? (
        <AdminNavbar />
      ) : (
        <>
          <Navbar />
          <SubNavbar />
          <PinLocationModal />
        </>
      )}

      <main style={{ flex: 1 }}>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
          {/* Public Customer Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Customer Authenticated Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-confirmation/:id"
            element={
              <ProtectedRoute>
                <OrderConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <CustomerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderTrackingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <CustomerDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Delivery Partner Routes */}
          <Route path="/delivery-partner/register" element={<DeliveryPartnerRegisterPage />} />
          <Route path="/delivery-partner/login" element={<LoginPage />} />
          <Route
            path="/delivery-partner"
            element={
              <ProtectedRoute requiredRole="ROLE_DELIVERY_PARTNER">
                <DeliveryPartnerDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <AdminProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <AdminOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/delivery-partners"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <AdminDeliveryPartnersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/delivery-zones"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <AdminDeliveryZonesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <AdminCouponsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <AdminReviewsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export default App;
