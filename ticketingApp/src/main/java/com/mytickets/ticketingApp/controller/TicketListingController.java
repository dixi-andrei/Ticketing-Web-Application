package com.mytickets.ticketingApp.controller;

import com.mytickets.ticketingApp.model.TicketListing;
import com.mytickets.ticketingApp.security.services.UserDetailsImpl;
import com.mytickets.ticketingApp.service.TicketListingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/listings")
public class TicketListingController {

    @Autowired
    private TicketListingService ticketListingService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllListings() {
        List<TicketListing> listings = ticketListingService.getAllListings();

        List<Map<String, Object>> simplifiedListings = listings.stream()
                .map(listing -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", listing.getId());
                    map.put("askingPrice", listing.getAskingPrice());
                    map.put("description", listing.getDescription());
                    map.put("listingDate", listing.getListingDate());
                    map.put("status", listing.getStatus());

                    // Add simplified ticket info
                    if (listing.getTicket() != null) {
                        Map<String, Object> ticketMap = new HashMap<>();
                        ticketMap.put("id", listing.getTicket().getId());
                        ticketMap.put("ticketNumber", listing.getTicket().getTicketNumber());
                        ticketMap.put("originalPrice", listing.getTicket().getOriginalPrice());
                        ticketMap.put("section", listing.getTicket().getSection());
                        ticketMap.put("row", listing.getTicket().getRow());
                        ticketMap.put("seat", listing.getTicket().getSeat());

                        // Add simplified event info
                        if (listing.getTicket().getEvent() != null) {
                            Map<String, Object> eventMap = new HashMap<>();
                            eventMap.put("id", listing.getTicket().getEvent().getId());
                            eventMap.put("name", listing.getTicket().getEvent().getName());
                            eventMap.put("eventDate", listing.getTicket().getEvent().getEventDate());

                            // Add simplified venue info
                            if (listing.getTicket().getEvent().getVenue() != null) {
                                Map<String, Object> venueMap = new HashMap<>();
                                venueMap.put("id", listing.getTicket().getEvent().getVenue().getId());
                                venueMap.put("name", listing.getTicket().getEvent().getVenue().getName());
                                venueMap.put("city", listing.getTicket().getEvent().getVenue().getCity());
                                eventMap.put("venue", venueMap);
                            }

                            ticketMap.put("event", eventMap);
                        }

                        map.put("ticket", ticketMap);
                    }

                    // Add simplified seller info
                    if (listing.getSeller() != null) {
                        Map<String, Object> sellerMap = new HashMap<>();
                        sellerMap.put("id", listing.getSeller().getId());
                        sellerMap.put("firstName", listing.getSeller().getFirstName());
                        sellerMap.put("lastName", listing.getSeller().getLastName());
                        map.put("seller", sellerMap);
                    }

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedListings, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getListingById(@PathVariable Long id) {
        return ticketListingService.getListingById(id)
                .map(listing -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", listing.getId());
                    map.put("askingPrice", listing.getAskingPrice());
                    map.put("description", listing.getDescription());
                    map.put("listingDate", listing.getListingDate());
                    map.put("status", listing.getStatus());

                    // Add simplified ticket info
                    if (listing.getTicket() != null) {
                        Map<String, Object> ticketMap = new HashMap<>();
                        ticketMap.put("id", listing.getTicket().getId());
                        ticketMap.put("ticketNumber", listing.getTicket().getTicketNumber());
                        ticketMap.put("originalPrice", listing.getTicket().getOriginalPrice());
                        ticketMap.put("section", listing.getTicket().getSection());
                        ticketMap.put("row", listing.getTicket().getRow());
                        ticketMap.put("seat", listing.getTicket().getSeat());

                        // Add simplified event info
                        if (listing.getTicket().getEvent() != null) {
                            Map<String, Object> eventMap = new HashMap<>();
                            eventMap.put("id", listing.getTicket().getEvent().getId());
                            eventMap.put("name", listing.getTicket().getEvent().getName());
                            eventMap.put("eventDate", listing.getTicket().getEvent().getEventDate());

                            // Add simplified venue info
                            if (listing.getTicket().getEvent().getVenue() != null) {
                                Map<String, Object> venueMap = new HashMap<>();
                                venueMap.put("id", listing.getTicket().getEvent().getVenue().getId());
                                venueMap.put("name", listing.getTicket().getEvent().getVenue().getName());
                                venueMap.put("city", listing.getTicket().getEvent().getVenue().getCity());
                                eventMap.put("venue", venueMap);
                            }

                            ticketMap.put("event", eventMap);
                        }

                        map.put("ticket", ticketMap);
                    }

                    // Add simplified seller info
                    if (listing.getSeller() != null) {
                        Map<String, Object> sellerMap = new HashMap<>();
                        sellerMap.put("id", listing.getSeller().getId());
                        sellerMap.put("firstName", listing.getSeller().getFirstName());
                        sellerMap.put("lastName", listing.getSeller().getLastName());
                        map.put("seller", sellerMap);
                    }

                    return new ResponseEntity<>(map, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/my-listings")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getMyListings() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        List<TicketListing> listings = ticketListingService.getListingsBySeller(userDetails.getId());

        List<Map<String, Object>> simplifiedListings = listings.stream()
                .map(listing -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", listing.getId());
                    map.put("askingPrice", listing.getAskingPrice());
                    map.put("description", listing.getDescription());
                    map.put("listingDate", listing.getListingDate());
                    map.put("status", listing.getStatus());

                    // Add simplified ticket info
                    if (listing.getTicket() != null) {
                        Map<String, Object> ticketMap = new HashMap<>();
                        ticketMap.put("id", listing.getTicket().getId());
                        ticketMap.put("ticketNumber", listing.getTicket().getTicketNumber());
                        ticketMap.put("originalPrice", listing.getTicket().getOriginalPrice());

                        // Add simplified event info
                        if (listing.getTicket().getEvent() != null) {
                            Map<String, Object> eventMap = new HashMap<>();
                            eventMap.put("id", listing.getTicket().getEvent().getId());
                            eventMap.put("name", listing.getTicket().getEvent().getName());
                            eventMap.put("eventDate", listing.getTicket().getEvent().getEventDate());
                            ticketMap.put("event", eventMap);
                        }

                        map.put("ticket", ticketMap);
                    }

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedListings, HttpStatus.OK);
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Map<String, Object>>> getListingsByEvent(@PathVariable Long eventId) {
        List<TicketListing> listings = ticketListingService.getActiveListingsByEvent(eventId);

        List<Map<String, Object>> simplifiedListings = listings.stream()
                .map(listing -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", listing.getId());
                    map.put("askingPrice", listing.getAskingPrice());
                    map.put("description", listing.getDescription());
                    map.put("listingDate", listing.getListingDate());
                    map.put("status", listing.getStatus());

                    // Add simplified ticket info
                    if (listing.getTicket() != null) {
                        Map<String, Object> ticketMap = new HashMap<>();
                        ticketMap.put("id", listing.getTicket().getId());
                        ticketMap.put("ticketNumber", listing.getTicket().getTicketNumber());
                        ticketMap.put("originalPrice", listing.getTicket().getOriginalPrice());
                        ticketMap.put("section", listing.getTicket().getSection());
                        ticketMap.put("row", listing.getTicket().getRow());
                        ticketMap.put("seat", listing.getTicket().getSeat());

                        map.put("ticket", ticketMap);
                    }

                    // Add simplified seller info
                    if (listing.getSeller() != null) {
                        Map<String, Object> sellerMap = new HashMap<>();
                        sellerMap.put("id", listing.getSeller().getId());
                        sellerMap.put("firstName", listing.getSeller().getFirstName());
                        sellerMap.put("lastName", listing.getSeller().getLastName());
                        map.put("seller", sellerMap);
                    }

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedListings, HttpStatus.OK);
    }

    @GetMapping("/event/{eventId}/cheapest")
    public ResponseEntity<List<Map<String, Object>>> getCheapestListingsByEvent(@PathVariable Long eventId) {
        List<TicketListing> listings = ticketListingService.getActiveListingsByEventOrderByPrice(eventId);

        List<Map<String, Object>> simplifiedListings = listings.stream()
                .map(listing -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", listing.getId());
                    map.put("askingPrice", listing.getAskingPrice());
                    map.put("description", listing.getDescription());
                    map.put("listingDate", listing.getListingDate());
                    map.put("status", listing.getStatus());

                    // Add simplified ticket info
                    if (listing.getTicket() != null) {
                        Map<String, Object> ticketMap = new HashMap<>();
                        ticketMap.put("id", listing.getTicket().getId());
                        ticketMap.put("ticketNumber", listing.getTicket().getTicketNumber());
                        ticketMap.put("originalPrice", listing.getTicket().getOriginalPrice());
                        ticketMap.put("section", listing.getTicket().getSection());
                        ticketMap.put("row", listing.getTicket().getRow());
                        ticketMap.put("seat", listing.getTicket().getSeat());

                        map.put("ticket", ticketMap);
                    }

                    // Add simplified seller info
                    if (listing.getSeller() != null) {
                        Map<String, Object> sellerMap = new HashMap<>();
                        sellerMap.put("id", listing.getSeller().getId());
                        sellerMap.put("firstName", listing.getSeller().getFirstName());
                        sellerMap.put("lastName", listing.getSeller().getLastName().charAt(0) + "."); // Only first initial of last name
                        map.put("seller", sellerMap);
                    }

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedListings, HttpStatus.OK);
    }

    @GetMapping("/event/{eventId}/count")
    public ResponseEntity<Map<String, Long>> countListingsByEvent(@PathVariable Long eventId) {
        Long count = ticketListingService.countActiveListingsByEvent(eventId);

        Map<String, Long> response = new HashMap<>();
        response.put("count", count);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }


    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<TicketListing> createListing(
            @Valid @RequestBody TicketListing listing,
            @RequestParam Long ticketId) {

        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        TicketListing newListing = ticketListingService.createListing(listing, ticketId, userDetails.getId());
        return new ResponseEntity<>(newListing, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<TicketListing> updateListing(
            @PathVariable Long id,
            @Valid @RequestBody TicketListing listing) {

        // Add seller verification logic here if needed
        TicketListing updatedListing = ticketListingService.updateListing(id, listing);
        return new ResponseEntity<>(updatedListing, HttpStatus.OK);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<HttpStatus> cancelListing(@PathVariable Long id) {
        // Add seller verification logic here if needed
        ticketListingService.cancelListing(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/{id}/purchase")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<TicketListing> purchaseListing(@PathVariable Long id) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        TicketListing purchasedListing = ticketListingService.purchaseListing(id, userDetails.getId());
        return new ResponseEntity<>(purchasedListing, HttpStatus.OK);
    }
}