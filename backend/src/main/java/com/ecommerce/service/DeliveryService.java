package com.ecommerce.service;

import com.ecommerce.dto.DeliveryPartnerDto;
import com.ecommerce.dto.DeliveryPartnerRegisterRequest;
import com.ecommerce.entity.*;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DeliveryService {

    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final DeliveryZoneRepository deliveryZoneRepository;
    private final DeliveryAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DeliveryZoneService deliveryZoneService;

    public DeliveryService(DeliveryPartnerRepository deliveryPartnerRepository,
                           DeliveryZoneRepository deliveryZoneRepository,
                           DeliveryAssignmentRepository assignmentRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           DeliveryZoneService deliveryZoneService) {
        this.deliveryPartnerRepository = deliveryPartnerRepository;
        this.deliveryZoneRepository = deliveryZoneRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.deliveryZoneService = deliveryZoneService;
    }

    @Transactional
    public DeliveryPartnerDto registerDeliveryPartner(DeliveryPartnerRegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email already exists");
        }

        User user = new User(
                email,
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                request.getPhone(),
                Role.ROLE_DELIVERY_PARTNER
        );
        user = userRepository.save(user);

        DeliveryPartner partner = new DeliveryPartner(
                user,
                request.getVehicleType(),
                request.getVehicleNumber(),
                request.getLicenseNumber()
        );
        partner.setProfilePhotoUrl(request.getProfilePhotoUrl());
        partner.setDocumentInfo(request.getDocumentInfo());
        partner.setStatus(DeliveryPartnerStatus.UNDER_REVIEW);
        partner.setAvailable(false);

        if (request.getZoneIds() != null && !request.getZoneIds().isEmpty()) {
            List<DeliveryZone> zones = deliveryZoneRepository.findAllById(request.getZoneIds());
            partner.setAssignedZones(new HashSet<>(zones));
        }

        DeliveryPartner saved = deliveryPartnerRepository.save(partner);
        return mapToDto(saved);
    }

    public List<DeliveryPartnerDto> getAllPartners(DeliveryPartnerStatus status) {
        List<DeliveryPartner> partners = (status != null)
                ? deliveryPartnerRepository.findByStatus(status)
                : deliveryPartnerRepository.findAll();
        return partners.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public DeliveryPartnerDto getPartnerById(Long id) {
        DeliveryPartner partner = deliveryPartnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Partner", "id", id));
        return mapToDto(partner);
    }

    public DeliveryPartner getPartnerByUserId(Long userId) {
        return deliveryPartnerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Partner profile not found for user"));
    }

    @Transactional
    public DeliveryPartnerDto approvePartner(Long partnerId, List<Long> zoneIds) {
        DeliveryPartner partner = deliveryPartnerRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Partner", "id", partnerId));

        partner.setStatus(DeliveryPartnerStatus.ACTIVE);
        if (zoneIds != null && !zoneIds.isEmpty()) {
            List<DeliveryZone> zones = deliveryZoneRepository.findAllById(zoneIds);
            partner.getAssignedZones().addAll(zones);
        }
        return mapToDto(deliveryPartnerRepository.save(partner));
    }

    @Transactional
    public DeliveryPartnerDto rejectPartner(Long partnerId) {
        DeliveryPartner partner = deliveryPartnerRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Partner", "id", partnerId));

        partner.setStatus(DeliveryPartnerStatus.REJECTED);
        partner.setAvailable(false);
        return mapToDto(deliveryPartnerRepository.save(partner));
    }

    @Transactional
    public DeliveryPartnerDto toggleAvailability(Long partnerId, boolean available) {
        DeliveryPartner partner = deliveryPartnerRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Partner", "id", partnerId));

        if (partner.getStatus() != DeliveryPartnerStatus.ACTIVE) {
            throw new BadRequestException("Partner must be approved and ACTIVE before going online");
        }

        partner.setAvailable(available);
        return mapToDto(deliveryPartnerRepository.save(partner));
    }

    /**
     * Area-Based Delivery Partner Auto-Assignment Algorithm:
     * When customer orders to a PIN:
     * 1. Match DeliveryZone by PIN
     * 2. Find ACTIVE, APPROVED delivery partners assigned to this zone
     * 3. Filter for available (isAvailable == true)
     * 4. Select the partner with the least active deliveries (load balancing)
     */
    public Optional<DeliveryPartner> findBestAvailablePartnerForZone(DeliveryZone zone) {
        List<DeliveryPartner> available = deliveryPartnerRepository.findAvailablePartnersInZone(
                DeliveryPartnerStatus.ACTIVE, zone.getId()
        );
        if (available.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(available.get(0));
    }

    @Transactional
    public void recordStatusChange(Order order, DeliveryPartner partner, OrderStatus status, String notes, String failureReason) {
        DeliveryAssignment assignment = assignmentRepository.findByOrderId(order.getId())
                .orElseGet(() -> new DeliveryAssignment(order, partner, status));

        assignment.setStatus(status);
        assignment.setPartner(partner);

        if (status == OrderStatus.ASSIGNED) {
            assignment.setAssignedAt(LocalDateTime.now());
        } else if (status == OrderStatus.PICKED_UP) {
            assignment.setPickedUpAt(LocalDateTime.now());
        } else if (status == OrderStatus.DELIVERED) {
            assignment.setDeliveredAt(LocalDateTime.now());
        } else if (status == OrderStatus.DELIVERY_FAILED) {
            assignment.setFailureReason(failureReason);
        }

        assignmentRepository.save(assignment);
    }

    public DeliveryPartnerDto mapToDto(DeliveryPartner dp) {
        DeliveryPartnerDto dto = new DeliveryPartnerDto();
        dto.setId(dp.getId());
        dto.setUserId(dp.getUser().getId());
        dto.setFullName(dp.getUser().getFullName());
        dto.setEmail(dp.getUser().getEmail());
        dto.setPhone(dp.getUser().getPhone());
        dto.setVehicleType(dp.getVehicleType());
        dto.setVehicleNumber(dp.getVehicleNumber());
        dto.setLicenseNumber(dp.getLicenseNumber());
        dto.setProfilePhotoUrl(dp.getProfilePhotoUrl());
        dto.setStatus(dp.getStatus());
        dto.setAvailable(dp.isAvailable());
        dto.setActiveDeliveriesCount(dp.getActiveDeliveriesCount());
        dto.setRegisteredAt(dp.getRegisteredAt());

        if (dp.getAssignedZones() != null) {
            dto.setAssignedZones(dp.getAssignedZones().stream()
                    .map(deliveryZoneService::mapToDto)
                    .collect(Collectors.toList()));
        }
        return dto;
    }
}
