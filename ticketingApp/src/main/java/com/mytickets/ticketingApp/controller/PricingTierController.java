package com.mytickets.ticketingApp.controller;

import com.mytickets.ticketingApp.mapper.PricingTierMapper;
import com.mytickets.ticketingApp.model.PricingTier;
import com.mytickets.ticketingApp.payload.request.PricingTierRequest;
import com.mytickets.ticketingApp.payload.response.PricingTierResponse;
import com.mytickets.ticketingApp.service.PricingTierService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/pricing-tiers")
public class PricingTierController {

    @Autowired
    private PricingTierService pricingTierService;

    @Autowired
    private PricingTierMapper pricingTierMapper;

    @GetMapping
    public ResponseEntity<List<PricingTierResponse>> getAllPricingTiers() {
        List<PricingTier> pricingTiers = pricingTierService.getAllPricingTiers();
        List<PricingTierResponse> pricingTierResponses = pricingTiers.stream()
                .map(pricingTierMapper::toResponse)
                .collect(Collectors.toList());
        return new ResponseEntity<>(pricingTierResponses, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PricingTierResponse> getPricingTierById(@PathVariable Long id) {
        return pricingTierService.getPricingTierById(id)
                .map(pricingTier -> {
                    PricingTierResponse response = pricingTierMapper.toResponse(pricingTier);
                    return new ResponseEntity<>(response, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<PricingTierResponse>> getPricingTiersByEvent(@PathVariable Long eventId) {
        List<PricingTier> pricingTiers = pricingTierService.getPricingTiersByEvent(eventId);
        List<PricingTierResponse> pricingTierResponses = pricingTiers.stream()
                .map(pricingTierMapper::toResponse)
                .collect(Collectors.toList());
        return new ResponseEntity<>(pricingTierResponses, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PricingTierResponse> createPricingTier(@Valid @RequestBody PricingTierRequest pricingTierRequest) {
        PricingTier pricingTier = pricingTierMapper.toEntity(pricingTierRequest);
        PricingTier savedPricingTier = pricingTierService.createPricingTier(pricingTier);
        PricingTierResponse response = pricingTierMapper.toResponse(savedPricingTier);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PricingTierResponse> updatePricingTier(
            @PathVariable Long id,
            @Valid @RequestBody PricingTierRequest pricingTierRequest) {

        PricingTier updatedPricingTier = pricingTierService.updatePricingTier(id, pricingTierMapper.toEntity(pricingTierRequest));
        PricingTierResponse response = pricingTierMapper.toResponse(updatedPricingTier);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HttpStatus> deletePricingTier(@PathVariable Long id) {
        pricingTierService.deletePricingTier(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}