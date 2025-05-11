package com.mytickets.ticketingApp.controller;

import com.mytickets.ticketingApp.model.Ticket;
import com.mytickets.ticketingApp.model.TicketStatus;
import com.mytickets.ticketingApp.security.services.UserDetailsImpl;
import com.mytickets.ticketingApp.service.TicketService;
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

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Ticket>> getAllTickets() {
        List<Ticket> tickets = ticketService.getAllTickets();
        return new ResponseEntity<>(tickets, HttpStatus.OK);
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

    @PostMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Ticket>> createTicketsForEvent(
            @RequestParam Long eventId,
            @RequestParam Long pricingTierId,
            @RequestParam int quantity) {

        List<Ticket> tickets = ticketService.createTicketsForEvent(eventId, pricingTierId, quantity);
        return new ResponseEntity<>(tickets, HttpStatus.CREATED);
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