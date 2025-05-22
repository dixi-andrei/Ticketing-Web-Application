package com.mytickets.ticketingApp.service;

import com.mytickets.ticketingApp.model.Ticket;
import com.mytickets.ticketingApp.model.TicketStatus;

import java.util.List;
import java.util.Optional;

public interface TicketService {
    List<Ticket> getAllTickets();
    Optional<Ticket> getTicketById(Long id);
    Optional<Ticket> getTicketByNumber(String ticketNumber);
    List<Ticket> getTicketsByEvent(Long eventId);
    List<Ticket> getTicketsByOwner(Long ownerId);
    List<Ticket> getUpcomingTicketsByOwner(Long ownerId);
    Ticket createTicket(Ticket ticket);
    List<Ticket> createTicketsForEvent(Long eventId, Long pricingTierId, int quantity);
    Ticket updateTicket(Long id, Ticket ticket);
    Ticket updateTicketStatus(Long id, TicketStatus status);
    void deleteTicket(Long id);
    Ticket purchaseTicket(Long ticketId, Long buyerId);
    String generateQRCode(Long ticketId);
    boolean validateTicket(String ticketNumber);
    void markTicketAsUsed(Long ticketId);
    public boolean canTicketBeResold(Long ticketId);
}