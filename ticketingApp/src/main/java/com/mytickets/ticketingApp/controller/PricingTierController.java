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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    public ResponseEntity<List<Map<String, Object>>> getAllPricingTiers() {
        List<PricingTier> pricingTiers = pricingTierService.getAllPricingTiers();

        List<Map<String, Object>> simplifiedTiers = pricingTiers.stream()
                .map(tier -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", tier.getId());
                    map.put("name", tier.getName());
                    map.put("description", tier.getDescription());
                    map.put("price", tier.getPrice());
                    map.put("quantity", tier.getQuantity());
                    map.put("available", tier.getAvailable());
                    map.put("sectionId", tier.getSectionId());

                    // Add simplified event info
                    if (tier.getEvent() != null) {
                        Map<String, Object> eventMap = new HashMap<>();
                        eventMap.put("id", tier.getEvent().getId());
                        eventMap.put("name", tier.getEvent().getName());
                        eventMap.put("eventDate", tier.getEvent().getEventDate());
                        map.put("event", eventMap);
                    }

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedTiers, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPricingTierById(@PathVariable Long id) {
        return pricingTierService.getPricingTierById(id)
                .map(tier -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", tier.getId());
                    map.put("name", tier.getName());
                    map.put("description", tier.getDescription());
                    map.put("price", tier.getPrice());
                    map.put("quantity", tier.getQuantity());
                    map.put("available", tier.getAvailable());
                    map.put("sectionId", tier.getSectionId());

                    // Add simplified event info
                    if (tier.getEvent() != null) {
                        Map<String, Object> eventMap = new HashMap<>();
                        eventMap.put("id", tier.getEvent().getId());
                        eventMap.put("name", tier.getEvent().getName());
                        eventMap.put("eventDate", tier.getEvent().getEventDate());

                        // Add simplified venue info
                        if (tier.getEvent().getVenue() != null) {
                            Map<String, Object> venueMap = new HashMap<>();
                            venueMap.put("id", tier.getEvent().getVenue().getId());
                            venueMap.put("name", tier.getEvent().getVenue().getName());
                            venueMap.put("city", tier.getEvent().getVenue().getCity());
                            eventMap.put("venue", venueMap);
                        }

                        map.put("event", eventMap);
                    }

                    return new ResponseEntity<>(map, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Map<String, Object>>> getPricingTiersByEvent(@PathVariable Long eventId) {
        List<PricingTier> pricingTiers = pricingTierService.getPricingTiersByEvent(eventId);

        List<Map<String, Object>> simplifiedTiers = pricingTiers.stream()
                .map(tier -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", tier.getId());
                    map.put("name", tier.getName());
                    map.put("description", tier.getDescription());
                    map.put("price", tier.getPrice());
                    map.put("quantity", tier.getQuantity());
                    map.put("available", tier.getAvailable());
                    map.put("sectionId", tier.getSectionId());

                    // Add simplified event info
                    if (tier.getEvent() != null) {
                        Map<String, Object> eventMap = new HashMap<>();
                        eventMap.put("id", tier.getEvent().getId());
                        eventMap.put("name", tier.getEvent().getName());
                        map.put("event", eventMap);
                    }

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedTiers, HttpStatus.OK);
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