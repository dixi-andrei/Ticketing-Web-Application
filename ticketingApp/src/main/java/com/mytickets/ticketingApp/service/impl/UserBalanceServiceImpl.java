// src/main/java/com/mytickets/ticketingApp/service/impl/UserBalanceServiceImpl.java
package com.mytickets.ticketingApp.service.impl;

import com.mytickets.ticketingApp.exception.ResourceNotFoundException;
import com.mytickets.ticketingApp.exception.TicketingAppException;
import com.mytickets.ticketingApp.model.*;
import com.mytickets.ticketingApp.repository.BalanceTransactionRepository;
import com.mytickets.ticketingApp.repository.UserBalanceRepository;
import com.mytickets.ticketingApp.repository.UserRepository;
import com.mytickets.ticketingApp.service.UserBalanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserBalanceServiceImpl implements UserBalanceService {

    @Autowired
    private UserBalanceRepository userBalanceRepository;

    @Autowired
    private BalanceTransactionRepository balanceTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserBalance getOrCreateUserBalance(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return userBalanceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserBalance newBalance = new UserBalance(user);
                    return userBalanceRepository.save(newBalance);
                });
    }

    @Override
    @Transactional
    public UserBalance addToBalance(Long userId, Double amount, String description,
                                    String referenceType, Long referenceId) {
        if (amount <= 0) {
            throw new TicketingAppException("Amount must be greater than zero");
        }

        UserBalance userBalance = getOrCreateUserBalance(userId);
        userBalance.setBalance(userBalance.getBalance() + amount);
        userBalance.setLastUpdated(LocalDateTime.now());

        // Create transaction record
        BalanceTransaction transaction = new BalanceTransaction();
        transaction.setUser(userBalance.getUser());
        transaction.setAmount(amount);
        transaction.setType(BalanceTransactionType.CREDIT);
        transaction.setDescription(description);
        transaction.setReferenceType(referenceType);
        transaction.setReferenceId(referenceId);
        transaction.setTransactionDate(LocalDateTime.now());

        // Save both entities
        balanceTransactionRepository.save(transaction);
        return userBalanceRepository.save(userBalance);
    }

    @Override
    @Transactional
    public UserBalance useFromBalance(Long userId, Double amount, String description,
                                      String referenceType, Long referenceId) {
        if (amount <= 0) {
            throw new TicketingAppException("Amount must be greater than zero");
        }

        UserBalance userBalance = getOrCreateUserBalance(userId);

        // Check if user has enough balance
        if (userBalance.getBalance() < amount) {
            throw new TicketingAppException("Insufficient balance");
        }

        // Update balance
        userBalance.setBalance(userBalance.getBalance() - amount);
        userBalance.setLastUpdated(LocalDateTime.now());

        // Create transaction record
        BalanceTransaction transaction = new BalanceTransaction();
        transaction.setUser(userBalance.getUser());
        transaction.setAmount(amount);
        transaction.setType(BalanceTransactionType.DEBIT);
        transaction.setDescription(description);
        transaction.setReferenceType(referenceType);
        transaction.setReferenceId(referenceId);
        transaction.setTransactionDate(LocalDateTime.now());

        // Save both entities
        balanceTransactionRepository.save(transaction);
        return userBalanceRepository.save(userBalance);
    }

    @Override
    public boolean canUseBalance(Long userId, Double amount) {
        UserBalance userBalance = getOrCreateUserBalance(userId);
        return userBalance.getBalance() >= amount;
    }

    @Override
    public List<BalanceTransaction> getBalanceHistory(Long userId) {
        // Check if user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return balanceTransactionRepository.findByUserIdOrderByTransactionDateDesc(userId);
    }

    @Override
    public Double getCurrentBalance(Long userId) {
        UserBalance userBalance = getOrCreateUserBalance(userId);
        return userBalance.getBalance();
    }
}