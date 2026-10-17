package com.ecommerce.service;

import com.ecommerce.dto.AddressDto;
import com.ecommerce.entity.Address;
import com.ecommerce.entity.User;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.AddressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressService {

    private final AddressRepository addressRepository;

    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public List<AddressDto> getUserAddresses(User user) {
        return addressRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressDto createAddress(User user, AddressDto dto) {
        if (dto.isDefault()) {
            clearDefaultForUser(user.getId());
        } else {
            List<Address> existing = addressRepository.findByUserId(user.getId());
            if (existing.isEmpty()) {
                dto.setDefault(true);
            }
        }

        Address address = new Address();
        address.setUser(user);
        copyDtoToEntity(dto, address);
        Address saved = addressRepository.save(address);
        return mapToDto(saved);
    }

    @Transactional
    public AddressDto updateAddress(User user, Long id, AddressDto dto) {
        Address address = addressRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", id));

        if (dto.isDefault() && !address.isDefault()) {
            clearDefaultForUser(user.getId());
        }

        copyDtoToEntity(dto, address);
        Address saved = addressRepository.save(address);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteAddress(User user, Long id) {
        Address address = addressRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", id));
        addressRepository.delete(address);
    }

    @Transactional
    public AddressDto setDefault(User user, Long id) {
        clearDefaultForUser(user.getId());
        Address address = addressRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", id));
        address.setDefault(true);
        return mapToDto(addressRepository.save(address));
    }

    private void clearDefaultForUser(Long userId) {
        List<Address> list = addressRepository.findByUserId(userId);
        for (Address a : list) {
            if (a.isDefault()) {
                a.setDefault(false);
                addressRepository.save(a);
            }
        }
    }

    private void copyDtoToEntity(AddressDto dto, Address entity) {
        entity.setFullName(dto.getFullName());
        entity.setPhone(dto.getPhone());
        entity.setStreetAddress(dto.getStreetAddress());
        entity.setLandmark(dto.getLandmark());
        entity.setCity(dto.getCity());
        entity.setState(dto.getState());
        entity.setPinCode(dto.getPinCode());
        entity.setDefault(dto.isDefault());
    }

    private AddressDto mapToDto(Address a) {
        return new AddressDto(
                a.getId(),
                a.getFullName(),
                a.getPhone(),
                a.getStreetAddress(),
                a.getLandmark(),
                a.getCity(),
                a.getState(),
                a.getPinCode(),
                a.isDefault()
        );
    }
}
