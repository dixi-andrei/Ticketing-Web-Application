package com.mytickets.ticketingApp.service;

import com.mytickets.ticketingApp.model.Transaction;
import com.mytickets.ticketingApp.model.TransactionStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TransactionService {
    List<Transaction> getAllTransactions();
    Optional<Transaction> getTransactionById(Long id);
    Optional<Transaction> getTransactionByNumber(String transactionNumber);
    List<Transaction> getTransactionsByBuyer(Long buyerId);
    List<Transaction> getTransactionsBySeller(Long sellerId);
    List<Transaction> getTransactionsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    Transaction createTransaction(Transaction transaction);
    Transaction updateTransactionStatus(Long id, TransactionStatus status);
    Double getTotalSalesByUser(Long userId);
    Double getTotalPurchasesByUser(Long userId);
    Transaction processPayment(Long transactionId, String paymentMethod, String paymentDetails);
    Transaction refundTransaction(Long transactionId, String reason);

    Transaction processPaymentWithBalance(Long transactionId, Long buyerId);

    /**
     * Create a transaction for ticket purchase
     * @param ticketId The ID of the ticket to purchase
     * @param buyerId The ID of the buyer
     * @param paymentMethod The payment method (card/balance)
     * @return Created transaction
     */
    Transaction createTicketPurchaseTransaction(Long ticketId, Long buyerId, String paymentMethod);

    /**
     * Create a transaction for listing purchase
     * @param listingId The ID of the listing to purchase
     * @param buyerId The ID of the buyer
     * @param paymentMethod The payment method (card/balance)
     * @return Created transaction
     */
    Transaction createListingPurchaseTransaction(Long listingId, Long buyerId, String paymentMethod);


}