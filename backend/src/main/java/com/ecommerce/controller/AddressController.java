package com.ecommerce.controller;

import com.ecommerce.dto.AddressDto;
import com.ecommerce.dto.ApiResponse;
import com.ecommerce.entity.User;
import com.ecommerce.service.AddressService;
import com.ecommerce.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;
    private final AuthService authService;

    public AddressController(AddressService addressService, AuthService authService) {
        this.addressService = addressService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressDto>>> getAddresses() {
        User user = authService.getCurrentAuthenticatedUser();
        List<AddressDto> list = addressService.getUserAddresses(user);
        return ResponseEntity.ok(ApiResponse.ok("Addresses fetched successfully", list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressDto>> createAddress(@RequestBody AddressDto dto) {
        User user = authService.getCurrentAuthenticatedUser();
        AddressDto created = addressService.createAddress(user, dto);
        return ResponseEntity.ok(ApiResponse.ok("Address added successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressDto>> updateAddress(@PathVariable Long id, @RequestBody AddressDto dto) {
        User user = authService.getCurrentAuthenticatedUser();
        AddressDto updated = addressService.updateAddress(user, id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Address updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        addressService.deleteAddress(user, id);
        return ResponseEntity.ok(ApiResponse.ok("Address deleted successfully", null));
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<ApiResponse<AddressDto>> setDefault(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        AddressDto updated = addressService.setDefault(user, id);
        return ResponseEntity.ok(ApiResponse.ok("Default address updated", updated));
    }
}
