package com.mytickets.ticketingApp.controller;

import com.mytickets.ticketingApp.model.BalanceTransaction;
import com.mytickets.ticketingApp.model.UserBalance;
import com.mytickets.ticketingApp.security.services.UserDetailsImpl;
import com.mytickets.ticketingApp.service.UserBalanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/balance")
public class UserBalanceController {

    @Autowired
    private UserBalanceService userBalanceService;

    @GetMapping("/current")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getCurrentBalance() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        Double balance = userBalanceService.getCurrentBalance(userDetails.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("balance", balance);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<BalanceTransaction>> getBalanceHistory() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        List<BalanceTransaction> transactions = userBalanceService.getBalanceHistory(userDetails.getId());

        return ResponseEntity.ok(transactions);
    }

    @PostMapping("/use")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> useBalance(
            @RequestParam("amount") Double amount,
            @RequestParam("description") String description,
            @RequestParam(value = "referenceType", required = false) String referenceType,
            @RequestParam(value = "referenceId", required = false) Long referenceId) {

        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        UserBalance userBalance = userBalanceService.useFromBalance(
                userDetails.getId(),
                amount,
                description,
                referenceType,
                referenceId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("newBalance", userBalance.getBalance());

        return ResponseEntity.ok(response);
    }

    // Admin only endpoint to add balance manually
    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> addBalance(
            @RequestParam("userId") Long userId,
            @RequestParam("amount") Double amount,
            @RequestParam("description") String description) {

        UserBalance userBalance = userBalanceService.addToBalance(
                userId,
                amount,
                description,
                "Admin",
                null);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("userId", userId);
        response.put("newBalance", userBalance.getBalance());

        return ResponseEntity.ok(response);
    }
}