package com.ecommerce.service;

import com.ecommerce.dto.DeliveryZoneDto;
import com.ecommerce.entity.DeliveryZone;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.DeliveryZoneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DeliveryZoneService {

    private final DeliveryZoneRepository deliveryZoneRepository;

    public DeliveryZoneService(DeliveryZoneRepository deliveryZoneRepository) {
        this.deliveryZoneRepository = deliveryZoneRepository;
    }

    public List<DeliveryZoneDto> getAllZones() {
        return deliveryZoneRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<DeliveryZoneDto> getActiveZones() {
        return deliveryZoneRepository.findByActiveTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DeliveryZoneDto getZoneById(Long id) {
        DeliveryZone zone = deliveryZoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Zone", "id", id));
        return mapToDto(zone);
    }

    public Optional<DeliveryZone> findZoneByPin(String pin) {
        if (pin == null || pin.trim().isEmpty()) return Optional.empty();
        String cleanPin = pin.trim();
        return deliveryZoneRepository.findByActiveTrue().stream()
                .filter(zone -> zone.supportsPin(cleanPin))
                .findFirst();
    }

    @Transactional
    public DeliveryZoneDto createZone(DeliveryZoneDto dto) {
        DeliveryZone zone = new DeliveryZone(dto.getZoneName(), dto.getCity(), dto.getArea(), dto.getPinCodes());
        zone.setActive(dto.isActive());
        DeliveryZone saved = deliveryZoneRepository.save(zone);
        return mapToDto(saved);
    }

    @Transactional
    public DeliveryZoneDto updateZone(Long id, DeliveryZoneDto dto) {
        DeliveryZone zone = deliveryZoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Zone", "id", id));

        zone.setZoneName(dto.getZoneName());
        zone.setCity(dto.getCity());
        zone.setArea(dto.getArea());
        zone.setPinCodes(dto.getPinCodes());
        zone.setActive(dto.isActive());

        return mapToDto(deliveryZoneRepository.save(zone));
    }

    @Transactional
    public void deleteZone(Long id) {
        DeliveryZone zone = deliveryZoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Zone", "id", id));
        deliveryZoneRepository.delete(zone);
    }

    public DeliveryZoneDto mapToDto(DeliveryZone zone) {
        DeliveryZoneDto dto = new DeliveryZoneDto();
        dto.setId(zone.getId());
        dto.setZoneName(zone.getZoneName());
        dto.setCity(zone.getCity());
        dto.setArea(zone.getArea());
        dto.setPinCodes(zone.getPinCodes());
        dto.setActive(zone.isActive());

        if (zone.getPinCodes() != null) {
            List<String> pins = Arrays.stream(zone.getPinCodes().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
            dto.setPinCodeList(pins);
        }
        return dto;
    }
}
