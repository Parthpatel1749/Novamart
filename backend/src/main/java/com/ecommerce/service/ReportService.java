package com.ecommerce.service;

import com.ecommerce.dto.DashboardStatsDto;
import com.ecommerce.entity.DeliveryPartnerStatus;
import com.ecommerce.entity.OrderStatus;
import com.ecommerce.entity.Role;
import com.ecommerce.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class ReportService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final DeliveryZoneRepository deliveryZoneRepository;

    public ReportService(OrderRepository orderRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository,
                         DeliveryPartnerRepository deliveryPartnerRepository,
                         DeliveryZoneRepository deliveryZoneRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.deliveryPartnerRepository = deliveryPartnerRepository;
        this.deliveryZoneRepository = deliveryZoneRepository;
    }

    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();

        BigDecimal deliveredSales = orderRepository.calculateTotalDeliveredSales();
        BigDecimal activeSales = orderRepository.calculateTotalActiveSales();
        stats.setTotalSales(activeSales != null ? activeSales : BigDecimal.ZERO);

        stats.setTotalOrders(orderRepository.count());
        stats.setCompletedOrders(orderRepository.countByOrderStatus(OrderStatus.DELIVERED));
        stats.setCancelledOrders(orderRepository.countByOrderStatus(OrderStatus.CANCELLED));

        long pending = orderRepository.countByOrderStatus(OrderStatus.PLACED)
                + orderRepository.countByOrderStatus(OrderStatus.CONFIRMED)
                + orderRepository.countByOrderStatus(OrderStatus.PROCESSING)
                + orderRepository.countByOrderStatus(OrderStatus.PACKED)
                + orderRepository.countByOrderStatus(OrderStatus.ASSIGNED)
                + orderRepository.countByOrderStatus(OrderStatus.PICKED_UP)
                + orderRepository.countByOrderStatus(OrderStatus.OUT_FOR_DELIVERY);
        stats.setPendingOrders(pending);

        long returns = orderRepository.countByOrderStatus(OrderStatus.RETURN_REQUESTED)
                + orderRepository.countByOrderStatus(OrderStatus.RETURNED)
                + orderRepository.countByOrderStatus(OrderStatus.REFUND_INITIATED)
                + orderRepository.countByOrderStatus(OrderStatus.REFUNDED);
        stats.setReturnRefundOrders(returns);

        stats.setTotalCustomers(userRepository.countByRole(Role.ROLE_CUSTOMER));
        stats.setTotalProducts(productRepository.count());
        stats.setLowStockProducts(productRepository.findByStockLessThan(10).size());

        stats.setTotalDeliveryPartners(deliveryPartnerRepository.count());
        stats.setActiveDeliveryPartners(deliveryPartnerRepository.countByStatus(DeliveryPartnerStatus.ACTIVE));
        stats.setPendingPartnerApprovals(deliveryPartnerRepository.countByStatus(DeliveryPartnerStatus.UNDER_REVIEW));

        stats.setTotalDeliveryZones(deliveryZoneRepository.count());

        Map<String, Long> statusMap = new HashMap<>();
        for (OrderStatus st : OrderStatus.values()) {
            statusMap.put(st.name(), orderRepository.countByOrderStatus(st));
        }
        stats.setOrdersByStatus(statusMap);

        return stats;
    }
}
