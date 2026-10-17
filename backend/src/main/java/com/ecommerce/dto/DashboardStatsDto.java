package com.ecommerce.dto;

import java.math.BigDecimal;
import java.util.Map;

public class DashboardStatsDto {
    private BigDecimal totalSales;
    private long totalOrders;
    private long pendingOrders;
    private long completedOrders;
    private long cancelledOrders;
    private long returnRefundOrders;
    private long totalCustomers;
    private long totalProducts;
    private long lowStockProducts;
    private long totalDeliveryPartners;
    private long activeDeliveryPartners;
    private long pendingPartnerApprovals;
    private long totalDeliveryZones;
    private Map<String, Long> ordersByStatus;

    public DashboardStatsDto() {}

    public BigDecimal getTotalSales() { return totalSales; }
    public void setTotalSales(BigDecimal totalSales) { this.totalSales = totalSales; }

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

    public long getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; }

    public long getCompletedOrders() { return completedOrders; }
    public void setCompletedOrders(long completedOrders) { this.completedOrders = completedOrders; }

    public long getCancelledOrders() { return cancelledOrders; }
    public void setCancelledOrders(long cancelledOrders) { this.cancelledOrders = cancelledOrders; }

    public long getReturnRefundOrders() { return returnRefundOrders; }
    public void setReturnRefundOrders(long returnRefundOrders) { this.returnRefundOrders = returnRefundOrders; }

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public long getLowStockProducts() { return lowStockProducts; }
    public void setLowStockProducts(long lowStockProducts) { this.lowStockProducts = lowStockProducts; }

    public long getTotalDeliveryPartners() { return totalDeliveryPartners; }
    public void setTotalDeliveryPartners(long totalDeliveryPartners) { this.totalDeliveryPartners = totalDeliveryPartners; }

    public long getActiveDeliveryPartners() { return activeDeliveryPartners; }
    public void setActiveDeliveryPartners(long activeDeliveryPartners) { this.activeDeliveryPartners = activeDeliveryPartners; }

    public long getPendingPartnerApprovals() { return pendingPartnerApprovals; }
    public void setPendingPartnerApprovals(long pendingPartnerApprovals) { this.pendingPartnerApprovals = pendingPartnerApprovals; }

    public long getTotalDeliveryZones() { return totalDeliveryZones; }
    public void setTotalDeliveryZones(long totalDeliveryZones) { this.totalDeliveryZones = totalDeliveryZones; }

    public Map<String, Long> getOrdersByStatus() { return ordersByStatus; }
    public void setOrdersByStatus(Map<String, Long> ordersByStatus) { this.ordersByStatus = ordersByStatus; }
}
