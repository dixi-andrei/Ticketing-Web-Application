package com.mytickets.ticketingApp.service.impl;

import com.mytickets.ticketingApp.model.*;
import com.mytickets.ticketingApp.repository.TicketListingRepository;
import com.mytickets.ticketingApp.repository.TicketRepository;
import com.mytickets.ticketingApp.repository.TransactionRepository;
import com.mytickets.ticketingApp.repository.UserRepository;
import com.mytickets.ticketingApp.service.TransactionService;
import com.mytickets.ticketingApp.service.UserBalanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionServiceImpl implements TransactionService {

    @Autowired
    private UserBalanceService userBalanceService;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    // Add these methods to your TransactionServiceImpl class

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketListingRepository ticketListingRepository;

    @Override
    @Transactional
    public Transaction createTicketPurchaseTransaction(Long ticketId, Long buyerId, String paymentMethod) {
        // Validate ticket exists and is available
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        if (ticket.getStatus() != TicketStatus.AVAILABLE) {
            throw new RuntimeException("Ticket is not available for purchase");
        }

        // Validate buyer exists
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + buyerId));

        // Create transaction
        Transaction transaction = new Transaction();
        transaction.setAmount(ticket.getCurrentPrice());
        transaction.setType(TransactionType.PRIMARY_PURCHASE);
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setBuyer(buyer);

        // For primary purchases, seller is typically the event creator or system
        if (ticket.getEvent() != null && ticket.getEvent().getCreator() != null) {
            transaction.setSeller(ticket.getEvent().getCreator());
        }

        transaction.setTicket(ticket);
        transaction.setTransactionDate(LocalDateTime.now());

        // Set payment intent based on method
        if ("balance".equals(paymentMethod)) {
            transaction.setPaymentIntentId("BALANCE_PENDING_" + System.currentTimeMillis());
        } else {
            transaction.setPaymentIntentId("CARD_PENDING_" + System.currentTimeMillis());
        }

        return transactionRepository.save(transaction);
    }

    @Override
    @Transactional
    public Transaction createListingPurchaseTransaction(Long listingId, Long buyerId, String paymentMethod) {
        // Validate listing exists and is active
        TicketListing listing = ticketListingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found with id: " + listingId));

        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new RuntimeException("Listing is not active");
        }

        // Validate buyer exists
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + buyerId));

        // Check if buyer is not the seller
        if (listing.getSeller().getId().equals(buyerId)) {
            throw new RuntimeException("You cannot purchase your own listing");
        }

        // Validate ticket and seller
        Ticket ticket = listing.getTicket();
        if (ticket == null) {
            throw new RuntimeException("No ticket associated with this listing");
        }

        User seller = listing.getSeller();
        if (seller == null) {
            throw new RuntimeException("No seller associated with this listing");
        }

        // Create transaction
        Transaction transaction = new Transaction();
        transaction.setAmount(listing.getAskingPrice());
        transaction.setType(TransactionType.SECONDARY_PURCHASE);
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setBuyer(buyer);
        transaction.setSeller(seller);
        transaction.setTicket(ticket);
        transaction.setTransactionDate(LocalDateTime.now());

        // Set payment intent based on method
        if ("balance".equals(paymentMethod)) {
            transaction.setPaymentIntentId("BALANCE_PENDING_" + System.currentTimeMillis());
        } else {
            transaction.setPaymentIntentId("CARD_PENDING_" + System.currentTimeMillis());
        }

        return transactionRepository.save(transaction);
    }

    @Override
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    @Override
    public Optional<Transaction> getTransactionById(Long id) {
        return transactionRepository.findById(id);
    }

    @Override
    public Optional<Transaction> getTransactionByNumber(String transactionNumber) {
        return transactionRepository.findByTransactionNumber(transactionNumber);
    }

    @Override
    public List<Transaction> getTransactionsByBuyer(Long buyerId) {
        return transactionRepository.findByBuyerId(buyerId);
    }

    @Override
    public List<Transaction> getTransactionsBySeller(Long sellerId) {
        return transactionRepository.findBySellerId(sellerId);
    }

    @Override
    public List<Transaction> getTransactionsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return transactionRepository.findByTransactionDateBetween(startDate, endDate);
    }

    @Override
    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        // Set default values if not provided
        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(LocalDateTime.now());
        }

        if (transaction.getStatus() == null) {
            transaction.setStatus(TransactionStatus.PENDING);
        }

        return transactionRepository.save(transaction);
    }

    @Override
    @Transactional
    public Transaction updateTransactionStatus(Long id, TransactionStatus status) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + id));

        transaction.setStatus(status);
        return transactionRepository.save(transaction);
    }

    @Override
    public Double getTotalSalesByUser(Long userId) {
        Double total = transactionRepository.sumCompletedSalesByUser(userId);
        return total != null ? total : 0.0;
    }

    @Override
    public Double getTotalPurchasesByUser(Long userId) {
        Double total = transactionRepository.sumCompletedPurchasesByUser(userId);
        return total != null ? total : 0.0;
    }

    @Transactional
    protected void completeTicketPurchase(Transaction transaction) {
        Ticket ticket = transaction.getTicket();
        User buyer = transaction.getBuyer();

        // Update ticket ownership and status
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
            }
        }

        ticketRepository.save(ticket);
    }

    @Transactional
    protected void completeListingPurchase(Transaction transaction) {
        // Find the listing
        TicketListing listing = ticketListingRepository.findByTicketId(transaction.getTicket().getId())
                .orElseThrow(() -> new RuntimeException("Listing not found for ticket"));

        // Update listing status
        listing.setStatus(ListingStatus.SOLD);

        // Update ticket ownership and status
        Ticket ticket = transaction.getTicket();
        User buyer = transaction.getBuyer();
        User seller = transaction.getSeller();

        ticket.setOwner(buyer);
        ticket.setStatus(TicketStatus.RESOLD);
        ticket.setPurchaseDate(LocalDateTime.now());

        // Add money to seller's balance
        userBalanceService.addToBalance(
                seller.getId(),
                transaction.getAmount(),
                "Payment for ticket " + ticket.getTicketNumber(),
                "Transaction",
                transaction.getId()
        );

        ticketListingRepository.save(listing);
        ticketRepository.save(ticket);
    }


    @Override
    @Transactional
    public Transaction processPaymentWithBalance(Long transactionId, Long buyerId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + transactionId));

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + buyerId));

        // Check if transaction is pending
        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new RuntimeException("Transaction is not in PENDING state");
        }

        // Check if buyer is correct
        if (!transaction.getBuyer().getId().equals(buyerId)) {
            throw new RuntimeException("This transaction does not belong to the user");
        }

        // Check if buyer has enough balance
        if (!userBalanceService.canUseBalance(buyerId, transaction.getAmount())) {
            throw new RuntimeException("Insufficient balance to complete transaction");
        }

        try {
            // Use balance for payment (deduct from buyer)
            userBalanceService.useFromBalance(
                    buyerId,
                    transaction.getAmount(),
                    "Payment for ticket " + transaction.getTicket().getTicketNumber(),
                    "Transaction",
                    transaction.getId()
            );

            // For secondary purchases (resale), add money to seller's balance
            if (transaction.getType() == TransactionType.SECONDARY_PURCHASE && transaction.getSeller() != null) {
                userBalanceService.addToBalance(
                        transaction.getSeller().getId(),
                        transaction.getAmount(),
                        "Sale of ticket " + transaction.getTicket().getTicketNumber(),
                        "Transaction",
                        transaction.getId()
                );
            }

            // Update transaction status
            transaction.setStatus(TransactionStatus.COMPLETED);
            transaction.setPaymentIntentId("BALANCE_PAYMENT_" + System.currentTimeMillis());

            Transaction savedTransaction = transactionRepository.save(transaction);

            // Log for debugging
            System.out.println("Balance payment completed for transaction: " + savedTransaction.getId());
            System.out.println("Amount deducted: " + transaction.getAmount());

            return savedTransaction;

        } catch (Exception e) {
            // If anything fails, mark transaction as failed
            transaction.setStatus(TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            throw new RuntimeException("Payment processing failed: " + e.getMessage());
        }
    }


    @Override
    @Transactional
    public Transaction processPayment(Long transactionId, String paymentMethod, String paymentDetails) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + transactionId));

        // In a real application, this would integrate with a payment gateway
        // For now, we'll just update the status
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setPaymentIntentId("PAYMENT_" + paymentMethod + "_" + System.currentTimeMillis());

        return transactionRepository.save(transaction);
    }

    @Override
    @Transactional
    public Transaction refundTransaction(Long transactionId, String reason) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + transactionId));

        // Check if transaction can be refunded
        if (transaction.getStatus() != TransactionStatus.COMPLETED) {
            throw new RuntimeException("Only completed transactions can be refunded");
        }

        // In a real application, this would integrate with a payment gateway for the refund
        // For now, we'll just update the status
        transaction.setStatus(TransactionStatus.REFUNDED);

        return transactionRepository.save(transaction);
    }
}