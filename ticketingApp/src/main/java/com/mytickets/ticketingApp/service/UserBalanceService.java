package com.mytickets.ticketingApp.service;

import com.mytickets.ticketingApp.model.BalanceTransaction;
import com.mytickets.ticketingApp.model.UserBalance;
import java.util.List;
import java.util.Optional;

public interface UserBalanceService {
    UserBalance getOrCreateUserBalance(Long userId);

    UserBalance addToBalance(Long userId, Double amount, String description, String referenceType, Long referenceId);

    UserBalance useFromBalance(Long userId, Double amount, String description, String referenceType, Long referenceId);

    boolean canUseBalance(Long userId, Double amount);

    List<BalanceTransaction> getBalanceHistory(Long userId);

    Double getCurrentBalance(Long userId);
}