package com.mytickets.ticketingApp.service.impl;

import com.mytickets.ticketingApp.model.*;
import com.mytickets.ticketingApp.repository.*;
import com.mytickets.ticketingApp.service.QRCodeService;
import com.mytickets.ticketingApp.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TicketServiceImpl implements TicketService {

    @Autowired
    private TicketListingRepository ticketListingRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PricingTierRepository pricingTierRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private QRCodeService qrCodeService;

    @Override
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    @Override
    public Optional<Ticket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }

    @Override
    public Optional<Ticket> getTicketByNumber(String ticketNumber) {
        return ticketRepository.findByTicketNumber(ticketNumber);
    }

    @Override
    public List<Ticket> getTicketsByEvent(Long eventId) {
        return ticketRepository.findByEventId(eventId);
    }

    @Override
    public List<Ticket> getTicketsByOwner(Long ownerId) {
        return ticketRepository.findByOwnerId(ownerId);
    }

    @Override
    public List<Ticket> getUpcomingTicketsByOwner(Long ownerId) {
        return ticketRepository.findUpcomingTicketsByOwner(ownerId);
    }

    @Override
    @Transactional
    public Ticket createTicket(Ticket ticket) {
        // Generate a unique ticket number if not provided
        if (ticket.getTicketNumber() == null || ticket.getTicketNumber().isEmpty()) {
            ticket.setTicketNumber(UUID.randomUUID().toString());
        }

        // Set initial status if not provided
        if (ticket.getStatus() == null) {
            ticket.setStatus(TicketStatus.AVAILABLE);
        }

        // Generate QR code
        String qrCodeContent = "TICKET:" + ticket.getTicketNumber();
        String qrCodeBase64 = qrCodeService.generateQRCodeAsBase64(qrCodeContent, 250, 250);
        ticket.setQrCodeUrl(qrCodeBase64);

        // Update event available tickets count
        Event event = ticket.getEvent();
        if (event != null && event.getId() != null) {
            Event managedEvent = eventRepository.findById(event.getId())
                    .orElseThrow(() -> new RuntimeException("Event not found with id: " + event.getId()));

            int availableTickets = managedEvent.getAvailableTickets() != null ?
                    managedEvent.getAvailableTickets() : 0;
            managedEvent.setAvailableTickets(availableTickets + 1);

            int totalTickets = managedEvent.getTotalTickets() != null ?
                    managedEvent.getTotalTickets() : 0;
            managedEvent.setTotalTickets(totalTickets + 1);

            eventRepository.save(managedEvent);
        }

        return ticketRepository.save(ticket);
    }

    @Override
    @Transactional
    public List<Ticket> createTicketsForEvent(Long eventId, Long pricingTierId, int quantity) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));

        PricingTier pricingTier = pricingTierRepository.findById(pricingTierId)
                .orElseThrow(() -> new RuntimeException("Pricing tier not found with id: " + pricingTierId));

        if (!pricingTier.getEvent().getId().equals(eventId)) {
            throw new RuntimeException("Pricing tier does not belong to the specified event");
        }

        // Update pricing tier quantities
        int tierAvailable = pricingTier.getAvailable() != null ? pricingTier.getAvailable() : 0;
        pricingTier.setAvailable(tierAvailable + quantity);

        int tierQuantity = pricingTier.getQuantity() != null ? pricingTier.getQuantity() : 0;
        pricingTier.setQuantity(tierQuantity + quantity);

        pricingTierRepository.save(pricingTier);

        // Update event ticket counts
        int eventAvailableTickets = event.getAvailableTickets() != null ? event.getAvailableTickets() : 0;
        event.setAvailableTickets(eventAvailableTickets + quantity);

        int eventTotalTickets = event.getTotalTickets() != null ? event.getTotalTickets() : 0;
        event.setTotalTickets(eventTotalTickets + quantity);

        eventRepository.save(event);

        // Create tickets
        List<Ticket> tickets = new ArrayList<>();
        for (int i = 0; i < quantity; i++) {
            Ticket ticket = new Ticket();
            ticket.setTicketNumber(UUID.randomUUID().toString());
            ticket.setOriginalPrice(pricingTier.getPrice());
            ticket.setCurrentPrice(pricingTier.getPrice());
            ticket.setStatus(TicketStatus.AVAILABLE);
            ticket.setEvent(event);
            ticket.setPricingTier(pricingTier);

            // Generate QR code
            String qrCodeContent = "TICKET:" + ticket.getTicketNumber();
            String qrCodeBase64 = qrCodeService.generateQRCodeAsBase64(qrCodeContent, 250, 250);
            ticket.setQrCodeUrl(qrCodeBase64);

            tickets.add(ticketRepository.save(ticket));
        }

        return tickets;
    }

    @Override
    @Transactional
    public Ticket updateTicket(Long id, Ticket updatedTicket) {
        Ticket existingTicket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        // Update mutable fields
        if (updatedTicket.getSection() != null) {
            existingTicket.setSection(updatedTicket.getSection());
        }

        if (updatedTicket.getSeat() != null) {
            existingTicket.setSeat(updatedTicket.getSeat());
        }

        if (updatedTicket.getRow() != null) {
            existingTicket.setRow(updatedTicket.getRow());
        }

        if (updatedTicket.getStatus() != null) {
            existingTicket.setStatus(updatedTicket.getStatus());
        }

        // Don't allow changing currentPrice to be higher than originalPrice
        if (updatedTicket.getCurrentPrice() != null &&
                updatedTicket.getCurrentPrice() <= existingTicket.getOriginalPrice()) {
            existingTicket.setCurrentPrice(updatedTicket.getCurrentPrice());
        }

        return ticketRepository.save(existingTicket);
    }

    @Override
    @Transactional
    public Ticket updateTicketStatus(Long id, TicketStatus status) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        ticket.setStatus(status);

        // If ticket is being marked as PURCHASED, update event available tickets
        if (status == TicketStatus.PURCHASED) {
            Event event = ticket.getEvent();
            if (event != null) {
                int availableTickets = event.getAvailableTickets() != null ?
                        event.getAvailableTickets() : 0;

                if (availableTickets > 0) {
                    event.setAvailableTickets(availableTickets - 1);
                    eventRepository.save(event);
                }
            }
        }

        return ticketRepository.save(ticket);
    }

    @Override
    @Transactional
    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }

    @Override
    @Transactional
    public Ticket purchaseTicket(Long ticketId, Long buyerId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + buyerId));

        // Check if ticket is available
        if (ticket.getStatus() != TicketStatus.AVAILABLE) {
            throw new RuntimeException("Ticket is not available for purchase");
        }

        // Update ticket details
        ticket.setOwner(buyer);
        ticket.setStatus(TicketStatus.PURCHASED);
        ticket.setPurchaseDate(LocalDateTime.now());

        // Update event available tickets count
        Event event = ticket.getEvent();
        if (event != null) {
            int availableTickets = event.getAvailableTickets() != null ?
                    event.getAvailableTickets() : 0;

            if (availableTickets > 0) {
                event.setAvailableTickets(availableTickets - 1);
                eventRepository.save(event);
            }
        }

        // Create transaction record
        Transaction transaction = new Transaction();
        transaction.setAmount(ticket.getCurrentPrice());
        transaction.setType(TransactionType.PRIMARY_PURCHASE);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setBuyer(buyer);
        // The seller might be the event creator or the platform itself
        transaction.setSeller(event.getCreator());
        transaction.setTicket(ticket);
        transaction.setTransactionDate(LocalDateTime.now());

        transactionRepository.save(transaction);

        return ticketRepository.save(ticket);
    }

    @Override
    public String generateQRCode(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        String qrCodeContent = "TICKET:" + ticket.getTicketNumber();
        return qrCodeService.generateQRCodeAsBase64(qrCodeContent, 250, 250);
    }

    @Override
    public boolean validateTicket(String ticketNumber) {
        Optional<Ticket> ticketOpt = ticketRepository.findByTicketNumber(ticketNumber);

        if (ticketOpt.isPresent()) {
            Ticket ticket = ticketOpt.get();

            // Check if ticket exists and has valid status
            return (ticket.getStatus() == TicketStatus.PURCHASED ||
                    ticket.getStatus() == TicketStatus.RESOLD) &&
                    !ticket.getUsed() &&
                    ticket.getEvent().getStatus() != EventStatus.CANCELLED;
        }

        return false;
    }

    @Override
    @Transactional
    public void markTicketAsUsed(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        ticket.setUsed(true);
        ticketRepository.save(ticket);
    }

    @Override
    public boolean canTicketBeResold(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        // Check if ticket is in PURCHASED status (not LISTED, RESOLD, etc.)
        if (ticket.getStatus() != TicketStatus.PURCHASED) {
            return false;
        }

        // Check if ticket already has an active listing
        Optional<TicketListing> existingListing = ticketListingRepository.findByTicketId(ticketId);
        if (existingListing.isPresent() && existingListing.get().getStatus() == ListingStatus.ACTIVE) {
            return false;
        }

        // Check if event hasn't happened yet
        LocalDateTime now = LocalDateTime.now();
        if (ticket.getEvent().getEventDate().isBefore(now)) {
            return false;
        }

        return true;
    }
}