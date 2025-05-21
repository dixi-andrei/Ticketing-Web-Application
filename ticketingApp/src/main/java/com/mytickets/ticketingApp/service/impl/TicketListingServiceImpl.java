package com.mytickets.ticketingApp.service.impl;

import com.mytickets.ticketingApp.model.*;
import com.mytickets.ticketingApp.repository.TicketListingRepository;
import com.mytickets.ticketingApp.repository.TicketRepository;
import com.mytickets.ticketingApp.repository.TransactionRepository;
import com.mytickets.ticketingApp.repository.UserRepository;
import com.mytickets.ticketingApp.service.TicketListingService;
import com.mytickets.ticketingApp.service.UserBalanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TicketListingServiceImpl implements TicketListingService {

    @Autowired
    private TicketListingRepository ticketListingRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private UserBalanceService userBalanceService;

    @Override
    public List<TicketListing> getAllListings() {
        return ticketListingRepository.findAll();
    }

    @Override
    public Optional<TicketListing> getListingById(Long id) {
        return ticketListingRepository.findById(id);
    }

    @Override
    public List<TicketListing> getListingsBySeller(Long sellerId) {
        return ticketListingRepository.findBySellerId(sellerId);
    }

    @Override
    public List<TicketListing> getActiveListingsByEvent(Long eventId) {
        return ticketListingRepository.findActiveListingsByEvent(eventId);
    }

    @Override
    public List<TicketListing> getActiveListingsByEventOrderByPrice(Long eventId) {
        return ticketListingRepository.findActiveListingsByEventOrderByPriceAsc(eventId);
    }

    @Override
    @Transactional
    public TicketListing createListing(TicketListing listing, Long ticketId, Long sellerId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + sellerId));

        // Verify that the user owns the ticket
        if (ticket.getOwner() == null || !ticket.getOwner().getId().equals(sellerId)) {
            throw new RuntimeException("User does not own this ticket");
        }

        // Check if the ticket is already listed
        if (ticket.getStatus() == TicketStatus.LISTED) {
            throw new RuntimeException("Ticket is already listed for sale");
        }

        // Enforce the "no markup" rule
        if (listing.getAskingPrice() > ticket.getOriginalPrice()) {
            throw new RuntimeException("Asking price cannot be higher than the original price");
        }

        // Update ticket status
        ticket.setStatus(TicketStatus.LISTED);
        ticket.setCurrentPrice(listing.getAskingPrice());
        ticketRepository.save(ticket);

        // Create the listing
        listing.setTicket(ticket);
        listing.setSeller(seller);
        listing.setStatus(ListingStatus.ACTIVE);
        listing.setListingDate(LocalDateTime.now());

        return ticketListingRepository.save(listing);
    }

    @Override
    @Transactional
    public TicketListing updateListing(Long id, TicketListing updatedListing) {
        TicketListing existingListing = ticketListingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found with id: " + id));

        // Only allow updating active listings
        if (existingListing.getStatus() != ListingStatus.ACTIVE) {
            throw new RuntimeException("Cannot update a listing that is not active");
        }

        // Enforce the "no markup" rule
        if (updatedListing.getAskingPrice() > existingListing.getTicket().getOriginalPrice()) {
            throw new RuntimeException("Asking price cannot be higher than the original price");
        }

        existingListing.setAskingPrice(updatedListing.getAskingPrice());
        if (updatedListing.getDescription() != null) {
            existingListing.setDescription(updatedListing.getDescription());
        }

        // Update the ticket's current price
        Ticket ticket = existingListing.getTicket();
        ticket.setCurrentPrice(updatedListing.getAskingPrice());
        ticketRepository.save(ticket);

        return ticketListingRepository.save(existingListing);
    }

    @Override
    @Transactional
    public void cancelListing(Long id) {
        TicketListing listing = ticketListingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found with id: " + id));

        // Only allow canceling active listings
        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new RuntimeException("Cannot cancel a listing that is not active");
        }

        listing.setStatus(ListingStatus.CANCELLED);

        // Update the ticket status
        Ticket ticket = listing.getTicket();
        ticket.setStatus(TicketStatus.PURCHASED); // Revert to purchased state
        ticketRepository.save(ticket);

        ticketListingRepository.save(listing);
    }

    @Override
    @Transactional
    public TicketListing purchaseListing(Long listingId, Long buyerId) {
        TicketListing listing = ticketListingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found with id: " + listingId));

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + buyerId));

        // Check if listing is active
        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new RuntimeException("Listing is not active");
        }

        // Check if buyer is not the seller
        if (listing.getSeller().getId().equals(buyerId)) {
            throw new RuntimeException("You cannot purchase your own listing");
        }

        // Update listing status
        listing.setStatus(ListingStatus.SOLD);

        // Update ticket ownership and status
        Ticket ticket = listing.getTicket();
        User seller = ticket.getOwner();
        ticket.setOwner(buyer);
        ticket.setStatus(TicketStatus.RESOLD);
        ticketRepository.save(ticket);

        // Create transaction record
        Transaction transaction = new Transaction();
        transaction.setAmount(listing.getAskingPrice());
        transaction.setType(TransactionType.SECONDARY_PURCHASE);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setBuyer(buyer);
        transaction.setSeller(seller);
        transaction.setTicket(ticket);
        transaction.setTransactionDate(LocalDateTime.now());

        // Save transaction
        Transaction savedTransaction = transactionRepository.save(transaction);

        // Add money to seller's balance
        userBalanceService.addToBalance(
                seller.getId(),
                listing.getAskingPrice(),
                "Payment for ticket " + ticket.getTicketNumber(),
                "Transaction",
                savedTransaction.getId()
        );

        return ticketListingRepository.save(listing);
    }

    @Override
    public Long countActiveListingsByEvent(Long eventId) {
        return ticketListingRepository.countActiveListingsByEvent(eventId);
    }
}