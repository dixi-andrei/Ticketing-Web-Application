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
}