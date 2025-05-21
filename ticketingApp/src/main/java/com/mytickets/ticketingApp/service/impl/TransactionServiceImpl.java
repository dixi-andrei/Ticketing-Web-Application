package com.mytickets.ticketingApp.service.impl;

import com.mytickets.ticketingApp.model.Transaction;
import com.mytickets.ticketingApp.model.TransactionStatus;
import com.mytickets.ticketingApp.model.User;
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

        // Use balance for payment
        userBalanceService.useFromBalance(
                buyerId,
                transaction.getAmount(),
                "Payment for ticket " + transaction.getTicket().getTicketNumber(),
                "Transaction",
                transaction.getId()
        );

        // Update transaction status
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setPaymentIntentId("BALANCE_PAYMENT_" + System.currentTimeMillis());

        return transactionRepository.save(transaction);
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