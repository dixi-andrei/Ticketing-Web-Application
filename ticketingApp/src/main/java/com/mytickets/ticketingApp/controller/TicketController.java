package com.mytickets.ticketingApp.controller;

import com.mytickets.ticketingApp.exception.ResourceNotFoundException;
import com.mytickets.ticketingApp.model.Event;
import com.mytickets.ticketingApp.model.PricingTier;
import com.mytickets.ticketingApp.model.Ticket;
import com.mytickets.ticketingApp.model.TicketStatus;
import com.mytickets.ticketingApp.repository.EventRepository;
import com.mytickets.ticketingApp.repository.PricingTierRepository;
import com.mytickets.ticketingApp.repository.TicketRepository;
import com.mytickets.ticketingApp.security.services.UserDetailsImpl;
import com.mytickets.ticketingApp.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;
    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private PricingTierRepository pricingTierRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllTickets() {
        List<Ticket> tickets = ticketService.getAllTickets();

        List<Map<String, Object>> simplifiedTickets = tickets.stream()
                .map(ticket -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", ticket.getId());
                    map.put("ticketNumber", ticket.getTicketNumber());
                    map.put("originalPrice", ticket.getOriginalPrice());
                    map.put("currentPrice", ticket.getCurrentPrice());
                    map.put("section", ticket.getSection());
                    map.put("row", ticket.getRow());
                    map.put("seat", ticket.getSeat());
                    map.put("status", ticket.getStatus());
                    map.put("purchaseDate", ticket.getPurchaseDate());
                    map.put("used", ticket.getUsed());
                    map.put("qrCodeUrl", ticket.getQrCodeUrl());

                    // Add simplified event info
                    if (ticket.getEvent() != null) {
                        Map<String, Object> eventMap = new HashMap<>();
                        eventMap.put("id", ticket.getEvent().getId());
                        eventMap.put("name", ticket.getEvent().getName());
                        eventMap.put("eventDate", ticket.getEvent().getEventDate());

                        // Add simplified venue info
                        if (ticket.getEvent().getVenue() != null) {
                            Map<String, Object> venueMap = new HashMap<>();
                            venueMap.put("id", ticket.getEvent().getVenue().getId());
                            venueMap.put("name", ticket.getEvent().getVenue().getName());
                            venueMap.put("city", ticket.getEvent().getVenue().getCity());
                            eventMap.put("venue", venueMap);
                        }

                        map.put("event", eventMap);
                    }

                    // Add simplified owner info
                    if (ticket.getOwner() != null) {
                        Map<String, Object> ownerMap = new HashMap<>();
                        ownerMap.put("id", ticket.getOwner().getId());
                        ownerMap.put("firstName", ticket.getOwner().getFirstName());
                        ownerMap.put("lastName", ticket.getOwner().getLastName());
                        map.put("owner", ownerMap);
                    }

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedTickets, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        return ticketService.getTicketById(id)
                .map(ticket -> new ResponseEntity<>(ticket, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/number/{ticketNumber}")
    public ResponseEntity<Ticket> getTicketByNumber(@PathVariable String ticketNumber) {
        return ticketService.getTicketByNumber(ticketNumber)
                .map(ticket -> new ResponseEntity<>(ticket, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Ticket>> getTicketsByEvent(@PathVariable Long eventId) {
        List<Ticket> tickets = ticketService.getTicketsByEvent(eventId);
        return new ResponseEntity<>(tickets, HttpStatus.OK);
    }

    @GetMapping("/my-tickets")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Ticket>> getMyTickets() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        List<Ticket> tickets = ticketService.getTicketsByOwner(userDetails.getId());
        return new ResponseEntity<>(tickets, HttpStatus.OK);
    }

    @GetMapping("/my-upcoming-tickets")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Ticket>> getMyUpcomingTickets() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        List<Ticket> tickets = ticketService.getUpcomingTicketsByOwner(userDetails.getId());
        return new ResponseEntity<>(tickets, HttpStatus.OK);
    }


        @PostMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<Ticket> createTicket(@Valid @RequestBody Ticket ticket) {
            Ticket newTicket = ticketService.createTicket(ticket);
            return new ResponseEntity<>(newTicket, HttpStatus.CREATED);
        }
    /*
        @PostMapping("/batch")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<List<Ticket>> createTicketsForEvent(
                @RequestParam Long eventId,
                @RequestParam Long pricingTierId,
                @RequestParam int quantity) {

            List<Ticket> tickets = ticketService.createTicketsForEvent(eventId, pricingTierId, quantity);
            return new ResponseEntity<>(tickets, HttpStatus.CREATED);
        }
*/
    @PostMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Ticket>> createTicketsBatch(
            @RequestParam Long eventId,
            @RequestParam Long pricingTierId,
            @RequestParam int quantity) {

        try {
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

            PricingTier pricingTier = pricingTierRepository.findById(pricingTierId)
                    .orElseThrow(() -> new ResourceNotFoundException("PricingTier", "id", pricingTierId));

            List<Ticket> tickets = new ArrayList<>();

            for (int i = 0; i < quantity; i++) {
                Ticket ticket = new Ticket();
                ticket.setTicketNumber(UUID.randomUUID().toString());
                ticket.setOriginalPrice(pricingTier.getPrice());
                ticket.setCurrentPrice(pricingTier.getPrice());
                ticket.setStatus(TicketStatus.AVAILABLE);
                ticket.setEvent(event);
                ticket.setPricingTier(pricingTier);

                // Use a shorter QR code or placeholder
                String qrCodeContent = "TICKET:" + ticket.getTicketNumber();
                // Optional: generate a smaller QR code or skip for now
                ticket.setQrCodeUrl("placeholder-" + ticket.getTicketNumber());

                tickets.add(ticketRepository.save(ticket));
            }

            // Update event ticket counts
            int totalTickets = event.getTotalTickets() != null ? event.getTotalTickets() : 0;
            event.setTotalTickets(totalTickets + quantity);

            int availableTickets = event.getAvailableTickets() != null ? event.getAvailableTickets() : 0;
            event.setAvailableTickets(availableTickets + quantity);

            eventRepository.save(event);

            // Update pricing tier counts
            int tierQuantity = pricingTier.getQuantity() != null ? pricingTier.getQuantity() : 0;
            pricingTier.setQuantity(tierQuantity + quantity);

            int tierAvailable = pricingTier.getAvailable() != null ? pricingTier.getAvailable() : 0;
            pricingTier.setAvailable(tierAvailable + quantity);

            pricingTierRepository.save(pricingTier);

            return new ResponseEntity<>(tickets, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> updateTicket(@PathVariable Long id, @Valid @RequestBody Ticket ticket) {
        Ticket updatedTicket = ticketService.updateTicket(id, ticket);
        return new ResponseEntity<>(updatedTicket, HttpStatus.OK);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status) {

        Ticket updatedTicket = ticketService.updateTicketStatus(id, status);
        return new ResponseEntity<>(updatedTicket, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HttpStatus> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{id}/purchase")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Ticket> purchaseTicket(@PathVariable Long id) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        Ticket purchasedTicket = ticketService.purchaseTicket(id, userDetails.getId());
        return new ResponseEntity<>(purchasedTicket, HttpStatus.OK);
    }

    @GetMapping("/{id}/qrcode")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> getTicketQRCode(@PathVariable Long id) {
        String qrCodeBase64 = ticketService.generateQRCode(id);

        Map<String, String> response = new HashMap<>();
        response.put("qrCode", qrCodeBase64);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/validate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> validateTicket(@RequestParam String ticketNumber) {
        boolean isValid = ticketService.validateTicket(ticketNumber);

        Map<String, Boolean> response = new HashMap<>();
        response.put("valid", isValid);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }



    @PostMapping("/{id}/use")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HttpStatus> markTicketAsUsed(@PathVariable Long id) {
        ticketService.markTicketAsUsed(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}