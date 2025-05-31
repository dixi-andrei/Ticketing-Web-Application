package com.mytickets.ticketingApp.controller;

import com.mytickets.ticketingApp.config.BatchTicketRequest;
import com.mytickets.ticketingApp.exception.ResourceNotFoundException;
import com.mytickets.ticketingApp.model.Event;
import com.mytickets.ticketingApp.model.PricingTier;
import com.mytickets.ticketingApp.model.Ticket;
import com.mytickets.ticketingApp.model.TicketStatus;
import com.mytickets.ticketingApp.repository.EventRepository;
import com.mytickets.ticketingApp.repository.PricingTierRepository;
import com.mytickets.ticketingApp.repository.TicketRepository;
import com.mytickets.ticketingApp.security.services.UserDetailsImpl;
import com.mytickets.ticketingApp.service.QRCodeService;
import com.mytickets.ticketingApp.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.time.LocalDateTime;
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
    @Autowired
    private QRCodeService qRCodeService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllTickets() {
        try {
            System.out.println("AdminDashboard: Fetching all tickets...");

            List<Ticket> tickets = ticketRepository.findAll();
            System.out.println("Found " + tickets.size() + " tickets in database");

            if (tickets.isEmpty()) {
                System.out.println("No tickets found in database");
                return ResponseEntity.ok(new ArrayList<>());
            }

            List<Map<String, Object>> simplifiedTickets = new ArrayList<>();

            for (Ticket ticket : tickets) {
                try {
                    Map<String, Object> map = new HashMap<>();

                    // Basic ticket information (with null checks)
                    map.put("id", ticket.getId());
                    map.put("ticketNumber", ticket.getTicketNumber() != null ? ticket.getTicketNumber() : "");
                    map.put("originalPrice", ticket.getOriginalPrice() != null ? ticket.getOriginalPrice() : 0.0);
                    map.put("currentPrice", ticket.getCurrentPrice() != null ? ticket.getCurrentPrice() : 0.0);
                    map.put("section", ticket.getSection());
                    map.put("row", ticket.getRow());
                    map.put("seat", ticket.getSeat());
                    map.put("status", ticket.getStatus() != null ? ticket.getStatus().toString() : "AVAILABLE");
                    map.put("purchaseDate", ticket.getPurchaseDate());
                    map.put("used", ticket.getUsed() != null ? ticket.getUsed() : false);
                    map.put("qrCodeUrl", ticket.getQrCodeUrl());

                    // Add event info (with null checks)
                    Map<String, Object> eventMap = new HashMap<>();
                    if (ticket.getEvent() != null) {
                        eventMap.put("id", ticket.getEvent().getId());
                        eventMap.put("name", ticket.getEvent().getName() != null ? ticket.getEvent().getName() : "Unknown Event");
                        eventMap.put("eventDate", ticket.getEvent().getEventDate());

                        // Add venue info
                        Map<String, Object> venueMap = new HashMap<>();
                        if (ticket.getEvent().getVenue() != null) {
                            venueMap.put("id", ticket.getEvent().getVenue().getId());
                            venueMap.put("name", ticket.getEvent().getVenue().getName() != null ?
                                    ticket.getEvent().getVenue().getName() : "Unknown Venue");
                            venueMap.put("city", ticket.getEvent().getVenue().getCity());
                        } else {
                            venueMap.put("id", null);
                            venueMap.put("name", "No Venue");
                            venueMap.put("city", "");
                        }
                        eventMap.put("venue", venueMap);
                    } else {
                        eventMap.put("id", null);
                        eventMap.put("name", "No Event");
                        eventMap.put("eventDate", null);
                        eventMap.put("venue", Map.of("id", (Object) null, "name", "No Venue", "city", ""));
                    }
                    map.put("event", eventMap);

                    // Add owner info (with null checks)
                    if (ticket.getOwner() != null) {
                        Map<String, Object> ownerMap = new HashMap<>();
                        ownerMap.put("id", ticket.getOwner().getId());
                        ownerMap.put("firstName", ticket.getOwner().getFirstName() != null ?
                                ticket.getOwner().getFirstName() : "Unknown");
                        ownerMap.put("lastName", ticket.getOwner().getLastName() != null ?
                                ticket.getOwner().getLastName() : "User");
                        map.put("owner", ownerMap);
                    } else {
                        map.put("owner", null);
                    }

                    // Add pricing tier info if available
                    if (ticket.getPricingTier() != null) {
                        Map<String, Object> tierMap = new HashMap<>();
                        tierMap.put("id", ticket.getPricingTier().getId());
                        tierMap.put("name", ticket.getPricingTier().getName() != null ?
                                ticket.getPricingTier().getName() : "Unknown Tier");
                        tierMap.put("price", ticket.getPricingTier().getPrice());
                        map.put("pricingTier", tierMap);
                    } else {
                        map.put("pricingTier", null);
                    }

                    simplifiedTickets.add(map);

                } catch (Exception e) {
                    System.err.println("Error processing ticket ID " + ticket.getId() + ": " + e.getMessage());
                    // Continue with next ticket instead of failing completely
                }
            }

            System.out.println("Successfully processed " + simplifiedTickets.size() + " tickets");
            return ResponseEntity.ok(simplifiedTickets);

        } catch (Exception e) {
            System.err.println("Error in getAllTickets: " + e.getMessage());
            e.printStackTrace();

            // Return error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch tickets: " + e.getMessage());
            errorResponse.put("tickets", new ArrayList<>());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
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
    public ResponseEntity<?> getMyTickets() {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                    .getAuthentication().getPrincipal();

            System.out.println("User " + userDetails.getId() + " requesting their tickets");

            List<Ticket> tickets = ticketRepository.findByOwnerId(userDetails.getId());
            System.out.println("Found " + tickets.size() + " tickets for user " + userDetails.getId());

            if (tickets.isEmpty()) {
                System.out.println("No tickets found for user " + userDetails.getId());
                return ResponseEntity.ok(new ArrayList<>());
            }

            List<Map<String, Object>> simplifiedTickets = new ArrayList<>();

            for (Ticket ticket : tickets) {
                try {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", ticket.getId());
                    map.put("ticketNumber", ticket.getTicketNumber() != null ? ticket.getTicketNumber() : "");
                    map.put("originalPrice", ticket.getOriginalPrice() != null ? ticket.getOriginalPrice() : 0.0);
                    map.put("currentPrice", ticket.getCurrentPrice() != null ? ticket.getCurrentPrice() : 0.0);
                    map.put("section", ticket.getSection());
                    map.put("row", ticket.getRow());
                    map.put("seat", ticket.getSeat());
                    map.put("status", ticket.getStatus() != null ? ticket.getStatus().toString() : "AVAILABLE");
                    map.put("purchaseDate", ticket.getPurchaseDate());
                    map.put("used", ticket.getUsed() != null ? ticket.getUsed() : false);

                    // Add event info
                    Map<String, Object> eventMap = new HashMap<>();
                    if (ticket.getEvent() != null) {
                        eventMap.put("id", ticket.getEvent().getId());
                        eventMap.put("name", ticket.getEvent().getName() != null ? ticket.getEvent().getName() : "Unknown Event");
                        eventMap.put("eventDate", ticket.getEvent().getEventDate());

                        // Add venue info
                        Map<String, Object> venueMap = new HashMap<>();
                        if (ticket.getEvent().getVenue() != null) {
                            venueMap.put("id", ticket.getEvent().getVenue().getId());
                            venueMap.put("name", ticket.getEvent().getVenue().getName() != null ?
                                    ticket.getEvent().getVenue().getName() : "Unknown Venue");
                            venueMap.put("city", ticket.getEvent().getVenue().getCity());
                        } else {
                            venueMap.put("id", null);
                            venueMap.put("name", "No Venue");
                            venueMap.put("city", "");
                        }
                        eventMap.put("venue", venueMap);
                    } else {
                        eventMap.put("id", null);
                        eventMap.put("name", "No Event");
                        eventMap.put("eventDate", null);
                        eventMap.put("venue", Map.of("id", (Object) null, "name", "No Venue", "city", ""));
                    }
                    map.put("event", eventMap);

                    simplifiedTickets.add(map);

                } catch (Exception e) {
                    System.err.println("Error processing user ticket ID " + ticket.getId() + ": " + e.getMessage());
                }
            }

            System.out.println("Successfully processed " + simplifiedTickets.size() + " user tickets");
            return ResponseEntity.ok(simplifiedTickets);

        } catch (Exception e) {
            System.err.println("Error in getMyTickets: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch user tickets: " + e.getMessage());
            errorResponse.put("tickets", new ArrayList<>());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
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

    // Add this method to your TicketController.java

    @GetMapping("/available-by-pricing-tier/{pricingTierId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAvailableTicketsByPricingTier(@PathVariable Long pricingTierId) {
        try {
            // Get all tickets for this pricing tier that are available
            List<Ticket> availableTickets = ticketRepository.findByPricingTierIdAndStatus(pricingTierId, TicketStatus.AVAILABLE);

            if (availableTickets.isEmpty()) {
                return new ResponseEntity<>(new ArrayList<>(), HttpStatus.OK);
            }

            // Convert to simplified format
            List<Map<String, Object>> simplifiedTickets = availableTickets.stream()
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

                        // Add simplified pricing tier info
                        if (ticket.getPricingTier() != null) {
                            Map<String, Object> tierMap = new HashMap<>();
                            tierMap.put("id", ticket.getPricingTier().getId());
                            tierMap.put("name", ticket.getPricingTier().getName());
                            tierMap.put("price", ticket.getPricingTier().getPrice());
                            map.put("pricingTier", tierMap);
                        }

                        return map;
                    })
                    .collect(Collectors.toList());

            return new ResponseEntity<>(simplifiedTickets, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/batch-with-seating")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Ticket>> createTicketsBatchWithSeating(
            @RequestBody BatchTicketRequest request) {

        try {
            Event event = eventRepository.findById(request.getEventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Event", "id", request.getEventId()));

            PricingTier pricingTier = pricingTierRepository.findById(request.getPricingTierId())
                    .orElseThrow(() -> new ResourceNotFoundException("PricingTier", "id", request.getPricingTierId()));

            List<Ticket> tickets = new ArrayList<>();
            int quantity = request.getTickets().size();

            for (BatchTicketRequest.TicketInfo ticketInfo : request.getTickets()) {
                Ticket ticket = new Ticket();
                ticket.setTicketNumber(UUID.randomUUID().toString());
                ticket.setOriginalPrice(pricingTier.getPrice());
                ticket.setCurrentPrice(pricingTier.getPrice());
                ticket.setStatus(TicketStatus.AVAILABLE);
                ticket.setEvent(event);
                ticket.setPricingTier(pricingTier);

                // Set seating information
                ticket.setSection(ticketInfo.getSection());
                ticket.setRow(ticketInfo.getRow());
                ticket.setSeat(ticketInfo.getSeat());

                // Generate QR code with enhanced content
                String qrCodeContent = String.format("TICKET:%s|EVENT:%s|SEAT:%s",
                        ticket.getTicketNumber(),
                        event.getName(),
                        getSeatDisplayString(ticketInfo.getSection(), ticketInfo.getRow(), ticketInfo.getSeat()));

                try {
                    String qrCodeBase64 = qRCodeService.generateQRCodeAsBase64(qrCodeContent, 200, 200);
                    ticket.setQrCodeUrl(qrCodeBase64);
                } catch (Exception e) {
                    // Fallback if QR generation fails
                    ticket.setQrCodeUrl("placeholder-" + ticket.getTicketNumber());
                }

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

    @GetMapping("/my-upcoming-tickets")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getMyUpcomingTickets() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        List<Ticket> tickets = ticketService.getUpcomingTicketsByOwner(userDetails.getId());

        // Convert to simplified format to avoid circular references
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

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedTickets, HttpStatus.OK);
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

    @GetMapping("/{id}/can-resell")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> canTicketBeResold(@PathVariable Long id) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        try {
            // First check if user owns the ticket
            Optional<Ticket> ticketOpt = ticketService.getTicketById(id);
            if (ticketOpt.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("canResell", false);
                response.put("reason", "Ticket not found");
                return ResponseEntity.ok(response);
            }

            Ticket ticket = ticketOpt.get();

            // Check if user owns the ticket
            if (ticket.getOwner() == null || !ticket.getOwner().getId().equals(userDetails.getId())) {
                Map<String, Object> response = new HashMap<>();
                response.put("canResell", false);
                response.put("reason", "You do not own this ticket");
                return ResponseEntity.ok(response);
            }

            boolean canResell = ticketService.canTicketBeResold(id);
            Map<String, Object> response = new HashMap<>();
            response.put("canResell", canResell);

            if (!canResell) {
                // Provide specific reason why it can't be resold
                if (ticket.getStatus() == TicketStatus.LISTED) {
                    response.put("reason", "Ticket is already listed for sale");
                } else if (ticket.getStatus() == TicketStatus.RESOLD) {
                    response.put("reason", "Ticket has already been resold");
                } else if (ticket.getEvent().getEventDate().isBefore(LocalDateTime.now())) {
                    response.put("reason", "Event has already occurred");
                } else {
                    response.put("reason", "Ticket cannot be resold at this time");
                }
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("canResell", false);
            response.put("reason", e.getMessage());
            return ResponseEntity.ok(response);
        }
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

    private String getSeatDisplayString(String section, String row, String seat) {
        List<String> parts = new ArrayList<>();
        if (section != null && !section.trim().isEmpty()) {
            parts.add("Sec " + section);
        }
        if (row != null && !row.trim().isEmpty()) {
            parts.add("Row " + row);
        }
        if (seat != null && !seat.trim().isEmpty()) {
            parts.add("Seat " + seat);
        }

        if (parts.isEmpty()) {
            return "GA"; // General Admission
        }

        return String.join(" ", parts);
    }


    private Map<String, Object> createPricingTierResponse(PricingTier tier) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", tier.getId());
        response.put("name", tier.getName());
        response.put("description", tier.getDescription());
        response.put("price", tier.getPrice());
        response.put("quantity", tier.getQuantity());
        response.put("available", tier.getAvailable());
        response.put("sectionId", tier.getSectionId());

        if (tier.getEvent() != null) {
            Map<String, Object> eventInfo = new HashMap<>();
            eventInfo.put("id", tier.getEvent().getId());
            eventInfo.put("name", tier.getEvent().getName());
            response.put("event", eventInfo);
        }

        return response;
    }
}



