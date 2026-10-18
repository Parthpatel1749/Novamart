import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { SubNavbar } from './components/SubNavbar';
import { AdminNavbar } from './components/AdminNavbar';
import { Footer } from './components/Footer';
import { PinLocationModal } from './components/PinLocationModal';
import { ProtectedRoute } from './components/ProtectedRoute';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { ProductListingPage } from './pages/customer/ProductListingPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrderConfirmationPage } from './pages/customer/OrderConfirmationPage';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage';
import { CustomerDashboardPage } from './pages/customer/CustomerDashboardPage';
import { LoginPage } from './pages/customer/LoginPage';
import { RegisterPage } from './pages/customer/RegisterPage';
import { ForgotPasswordPage } from './pages/customer/ForgotPasswordPage';

// Delivery Partner Pages
import { DeliveryPartnerRegisterPage } from './pages/delivery/DeliveryPartnerRegisterPage';
import { DeliveryPartnerDashboardPage } from './pages/delivery/DeliveryPartnerDashboardPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminDeliveryPartnersPage } from './pages/admin/AdminDeliveryPartnersPage';
import { AdminDeliveryZonesPage } from './pages/admin/AdminDeliveryZonesPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { PortalSwitcher } from './components/PortalSwitcher';

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
      </main>

      <Footer />
    </div>
  );
}

export default App;
