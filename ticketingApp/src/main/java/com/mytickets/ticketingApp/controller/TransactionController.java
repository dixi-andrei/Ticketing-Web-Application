package com.mytickets.ticketingApp.controller;

import com.mytickets.ticketingApp.model.Transaction;
import com.mytickets.ticketingApp.model.TransactionStatus;
import com.mytickets.ticketingApp.security.services.UserDetailsImpl;
import com.mytickets.ticketingApp.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllTransactions() {
        List<Transaction> transactions = transactionService.getAllTransactions();

        List<Map<String, Object>> simplifiedTransactions = transactions.stream()
                .map(transaction -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", transaction.getId());
                    map.put("transactionNumber", transaction.getTransactionNumber());
                    map.put("amount", transaction.getAmount());
                    map.put("transactionDate", transaction.getTransactionDate());
                    map.put("type", transaction.getType());
                    map.put("status", transaction.getStatus());
                    map.put("paymentIntentId", transaction.getPaymentIntentId());

                    // Add simplified buyer info
                    if (transaction.getBuyer() != null) {
                        Map<String, Object> buyerMap = new HashMap<>();
                        buyerMap.put("id", transaction.getBuyer().getId());
                        buyerMap.put("firstName", transaction.getBuyer().getFirstName());
                        buyerMap.put("lastName", transaction.getBuyer().getLastName());
                        map.put("buyer", buyerMap);
                    }

                    // Add simplified seller info
                    if (transaction.getSeller() != null) {
                        Map<String, Object> sellerMap = new HashMap<>();
                        sellerMap.put("id", transaction.getSeller().getId());
                        sellerMap.put("firstName", transaction.getSeller().getFirstName());
                        sellerMap.put("lastName", transaction.getSeller().getLastName());
                        map.put("seller", sellerMap);
                    }

                    // Add simplified ticket info
                    if (transaction.getTicket() != null) {
                        Map<String, Object> ticketMap = new HashMap<>();
                        ticketMap.put("id", transaction.getTicket().getId());
                        ticketMap.put("ticketNumber", transaction.getTicket().getTicketNumber());

                        // Add simplified event info
                        if (transaction.getTicket().getEvent() != null) {
                            Map<String, Object> eventMap = new HashMap<>();
                            eventMap.put("id", transaction.getTicket().getEvent().getId());
                            eventMap.put("name", transaction.getTicket().getEvent().getName());
                            ticketMap.put("event", eventMap);
                        }

                        map.put("ticket", ticketMap);
                    }

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedTransactions, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getTransactionById(@PathVariable Long id) {
        return transactionService.getTransactionById(id)
                .map(transaction -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", transaction.getId());
                    map.put("transactionNumber", transaction.getTransactionNumber());
                    map.put("amount", transaction.getAmount());
                    map.put("transactionDate", transaction.getTransactionDate());
                    map.put("type", transaction.getType());
                    map.put("status", transaction.getStatus());
                    map.put("paymentIntentId", transaction.getPaymentIntentId());

                    // Add simplified buyer info
                    if (transaction.getBuyer() != null) {
                        Map<String, Object> buyerMap = new HashMap<>();
                        buyerMap.put("id", transaction.getBuyer().getId());
                        buyerMap.put("firstName", transaction.getBuyer().getFirstName());
                        buyerMap.put("lastName", transaction.getBuyer().getLastName());
                        map.put("buyer", buyerMap);
                    }

                    // Add simplified seller info
                    if (transaction.getSeller() != null) {
                        Map<String, Object> sellerMap = new HashMap<>();
                        sellerMap.put("id", transaction.getSeller().getId());
                        sellerMap.put("firstName", transaction.getSeller().getFirstName());
                        sellerMap.put("lastName", transaction.getSeller().getLastName());
                        map.put("seller", sellerMap);
                    }

                    // Add simplified ticket info
                    if (transaction.getTicket() != null) {
                        Map<String, Object> ticketMap = new HashMap<>();
                        ticketMap.put("id", transaction.getTicket().getId());
                        ticketMap.put("ticketNumber", transaction.getTicket().getTicketNumber());

                        // Add simplified event info
                        if (transaction.getTicket().getEvent() != null) {
                            Map<String, Object> eventMap = new HashMap<>();
                            eventMap.put("id", transaction.getTicket().getEvent().getId());
                            eventMap.put("name", transaction.getTicket().getEvent().getName());
                            ticketMap.put("event", eventMap);
                        }

                        map.put("ticket", ticketMap);
                    }

                    return new ResponseEntity<>(map, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/number/{transactionNumber}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getTransactionByNumber(@PathVariable String transactionNumber) {
        return transactionService.getTransactionByNumber(transactionNumber)
                .map(transaction -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", transaction.getId());
                    map.put("transactionNumber", transaction.getTransactionNumber());
                    map.put("amount", transaction.getAmount());
                    map.put("transactionDate", transaction.getTransactionDate());
                    map.put("type", transaction.getType());
                    map.put("status", transaction.getStatus());
                    map.put("paymentIntentId", transaction.getPaymentIntentId());

                    // Add simplified buyer and seller info
                    // Similar to getTransactionById
                    if (transaction.getBuyer() != null) {
                        Map<String, Object> buyerMap = new HashMap<>();
                        buyerMap.put("id", transaction.getBuyer().getId());
                        buyerMap.put("firstName", transaction.getBuyer().getFirstName());
                        buyerMap.put("lastName", transaction.getBuyer().getLastName());
                        map.put("buyer", buyerMap);
                    }

                    if (transaction.getSeller() != null) {
                        Map<String, Object> sellerMap = new HashMap<>();
                        sellerMap.put("id", transaction.getSeller().getId());
                        sellerMap.put("firstName", transaction.getSeller().getFirstName());
                        sellerMap.put("lastName", transaction.getSeller().getLastName());
                        map.put("seller", sellerMap);
                    }

                    if (transaction.getTicket() != null) {
                        Map<String, Object> ticketMap = new HashMap<>();
                        ticketMap.put("id", transaction.getTicket().getId());
                        ticketMap.put("ticketNumber", transaction.getTicket().getTicketNumber());

                        if (transaction.getTicket().getEvent() != null) {
                            Map<String, Object> eventMap = new HashMap<>();
                            eventMap.put("id", transaction.getTicket().getEvent().getId());
                            eventMap.put("name", transaction.getTicket().getEvent().getName());
                            ticketMap.put("event", eventMap);
                        }

                        map.put("ticket", ticketMap);
                    }

                    return new ResponseEntity<>(map, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/my-purchases")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getMyPurchases() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        List<Transaction> transactions = transactionService.getTransactionsByBuyer(userDetails.getId());

        List<Map<String, Object>> simplifiedTransactions = transactions.stream()
                .map(transaction -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", transaction.getId());
                    map.put("transactionNumber", transaction.getTransactionNumber());
                    map.put("amount", transaction.getAmount());
                    map.put("transactionDate", transaction.getTransactionDate());
                    map.put("type", transaction.getType());
                    map.put("status", transaction.getStatus());

                    // Add simplified ticket info
                    if (transaction.getTicket() != null) {
                        Map<String, Object> ticketMap = new HashMap<>();
                        ticketMap.put("id", transaction.getTicket().getId());
                        ticketMap.put("ticketNumber", transaction.getTicket().getTicketNumber());

                        // Add simplified event info
                        if (transaction.getTicket().getEvent() != null) {
                            Map<String, Object> eventMap = new HashMap<>();
                            eventMap.put("id", transaction.getTicket().getEvent().getId());
                            eventMap.put("name", transaction.getTicket().getEvent().getName());
                            ticketMap.put("event", eventMap);
                        }

                        map.put("ticket", ticketMap);
                    }

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedTransactions, HttpStatus.OK);
    }

    @GetMapping("/my-sales")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getMySales() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        List<Transaction> transactions = transactionService.getTransactionsBySeller(userDetails.getId());

        List<Map<String, Object>> simplifiedTransactions = transactions.stream()
                .map(transaction -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", transaction.getId());
                    map.put("transactionNumber", transaction.getTransactionNumber());
                    map.put("amount", transaction.getAmount());
                    map.put("transactionDate", transaction.getTransactionDate());
                    map.put("type", transaction.getType());
                    map.put("status", transaction.getStatus());

                    // Add simplified buyer info
                    if (transaction.getBuyer() != null) {
                        Map<String, Object> buyerMap = new HashMap<>();
                        buyerMap.put("id", transaction.getBuyer().getId());
                        buyerMap.put("firstName", transaction.getBuyer().getFirstName());
                        buyerMap.put("lastName", transaction.getBuyer().getLastName());
                        map.put("buyer", buyerMap);
                    }

                    // Add simplified ticket info
                    if (transaction.getTicket() != null) {
                        Map<String, Object> ticketMap = new HashMap<>();
                        ticketMap.put("id", transaction.getTicket().getId());
                        ticketMap.put("ticketNumber", transaction.getTicket().getTicketNumber());

                        // Add simplified event info
                        if (transaction.getTicket().getEvent() != null) {
                            Map<String, Object> eventMap = new HashMap<>();
                            eventMap.put("id", transaction.getTicket().getEvent().getId());
                            eventMap.put("name", transaction.getTicket().getEvent().getName());
                            ticketMap.put("event", eventMap);
                        }

                        map.put("ticket", ticketMap);
                    }

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedTransactions, HttpStatus.OK);
    }

    @GetMapping("/my-total-sales")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Double>> getMyTotalSales() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        Double total = transactionService.getTotalSalesByUser(userDetails.getId());

        Map<String, Double> response = new HashMap<>();
        response.put("total", total);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/my-total-purchases")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Double>> getMyTotalPurchases() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        Double total = transactionService.getTotalPurchasesByUser(userDetails.getId());

        Map<String, Double> response = new HashMap<>();
        response.put("total", total);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getTransactionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<Transaction> transactions = transactionService.getTransactionsByDateRange(startDate, endDate);

        List<Map<String, Object>> simplifiedTransactions = transactions.stream()
                .map(transaction -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", transaction.getId());
                    map.put("transactionNumber", transaction.getTransactionNumber());
                    map.put("amount", transaction.getAmount());
                    map.put("transactionDate", transaction.getTransactionDate());
                    map.put("type", transaction.getType());
                    map.put("status", transaction.getStatus());

                    // Add simplified buyer and seller info
                    if (transaction.getBuyer() != null) {
                        Map<String, Object> buyerMap = new HashMap<>();
                        buyerMap.put("id", transaction.getBuyer().getId());
                        buyerMap.put("firstName", transaction.getBuyer().getFirstName());
                        buyerMap.put("lastName", transaction.getBuyer().getLastName());
                        map.put("buyer", buyerMap);
                    }

                    if (transaction.getSeller() != null) {
                        Map<String, Object> sellerMap = new HashMap<>();
                        sellerMap.put("id", transaction.getSeller().getId());
                        sellerMap.put("firstName", transaction.getSeller().getFirstName());
                        sellerMap.put("lastName", transaction.getSeller().getLastName());
                        map.put("seller", sellerMap);
                    }

                    // Add simplified ticket info
                    if (transaction.getTicket() != null) {
                        Map<String, Object> ticketMap = new HashMap<>();
                        ticketMap.put("id", transaction.getTicket().getId());
                        ticketMap.put("ticketNumber", transaction.getTicket().getTicketNumber());

                        // Add simplified event info
                        if (transaction.getTicket().getEvent() != null) {
                            Map<String, Object> eventMap = new HashMap<>();
                            eventMap.put("id", transaction.getTicket().getEvent().getId());
                            eventMap.put("name", transaction.getTicket().getEvent().getName());
                            ticketMap.put("event", eventMap);
                        }

                        map.put("ticket", ticketMap);
                    }

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedTransactions, HttpStatus.OK);
    }

    @PostMapping("/{id}/process-payment")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Transaction> processPayment(
            @PathVariable Long id,
            @RequestParam String paymentMethod,
            @RequestParam(required = false) String paymentDetails) {

        Transaction processedTransaction = transactionService.processPayment(id, paymentMethod, paymentDetails);
        return new ResponseEntity<>(processedTransaction, HttpStatus.OK);
    }

    @PostMapping("/{id}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Transaction> refundTransaction(
            @PathVariable Long id,
            @RequestParam String reason) {

        Transaction refundedTransaction = transactionService.refundTransaction(id, reason);
        return new ResponseEntity<>(refundedTransaction, HttpStatus.OK);
    }

    // Add this to TransactionController.java
    @PostMapping("/{id}/pay-with-balance")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Transaction> payWithBalance(@PathVariable Long id) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        Transaction completedTransaction = transactionService.processPaymentWithBalance(id, userDetails.getId());
        return new ResponseEntity<>(completedTransaction, HttpStatus.OK);
    }



    @PostMapping("/purchase-ticket")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> createTicketPurchaseTransaction(@Valid @RequestBody Map<String, Object> requestData) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        try {
            Long ticketId = Long.valueOf(requestData.get("ticketId").toString());
            String paymentMethod = requestData.getOrDefault("paymentMethod", "card").toString();

            // Create a transaction for ticket purchase
            Transaction transaction = transactionService.createTicketPurchaseTransaction(
                    ticketId,
                    userDetails.getId(),
                    paymentMethod
            );

            // Convert to simplified format
            Map<String, Object> response = new HashMap<>();
            response.put("id", transaction.getId());
            response.put("transactionNumber", transaction.getTransactionNumber());
            response.put("amount", transaction.getAmount());
            response.put("status", transaction.getStatus());
            response.put("type", transaction.getType());
            response.put("paymentIntentId", transaction.getPaymentIntentId());
            response.put("transactionDate", transaction.getTransactionDate());

            // Add ticket info
            if (transaction.getTicket() != null) {
                Map<String, Object> ticketMap = new HashMap<>();
                ticketMap.put("id", transaction.getTicket().getId());
                ticketMap.put("ticketNumber", transaction.getTicket().getTicketNumber());

                if (transaction.getTicket().getEvent() != null) {
                    Map<String, Object> eventMap = new HashMap<>();
                    eventMap.put("id", transaction.getTicket().getEvent().getId());
                    eventMap.put("name", transaction.getTicket().getEvent().getName());
                    ticketMap.put("event", eventMap);
                }

                response.put("ticket", ticketMap);
            }

            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid ticket ID format"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/purchase-listing")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> createListingPurchaseTransaction(@Valid @RequestBody Map<String, Object> requestData) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        try {
            Long listingId = Long.valueOf(requestData.get("listingId").toString());
            String paymentMethod = requestData.getOrDefault("paymentMethod", "card").toString();

            // Create a transaction for listing purchase
            Transaction transaction = transactionService.createListingPurchaseTransaction(
                    listingId,
                    userDetails.getId(),
                    paymentMethod
            );

            // Convert to simplified format
            Map<String, Object> response = new HashMap<>();
            response.put("id", transaction.getId());
            response.put("transactionNumber", transaction.getTransactionNumber());
            response.put("amount", transaction.getAmount());
            response.put("status", transaction.getStatus());
            response.put("type", transaction.getType());
            response.put("paymentIntentId", transaction.getPaymentIntentId());
            response.put("transactionDate", transaction.getTransactionDate());

            // Add buyer info
            if (transaction.getBuyer() != null) {
                Map<String, Object> buyerMap = new HashMap<>();
                buyerMap.put("id", transaction.getBuyer().getId());
                buyerMap.put("firstName", transaction.getBuyer().getFirstName());
                buyerMap.put("lastName", transaction.getBuyer().getLastName());
                response.put("buyer", buyerMap);
            }

            // Add seller info
            if (transaction.getSeller() != null) {
                Map<String, Object> sellerMap = new HashMap<>();
                sellerMap.put("id", transaction.getSeller().getId());
                sellerMap.put("firstName", transaction.getSeller().getFirstName());
                sellerMap.put("lastName", transaction.getSeller().getLastName());
                response.put("seller", sellerMap);
            }

            // Add ticket info
            if (transaction.getTicket() != null) {
                Map<String, Object> ticketMap = new HashMap<>();
                ticketMap.put("id", transaction.getTicket().getId());
                ticketMap.put("ticketNumber", transaction.getTicket().getTicketNumber());
                ticketMap.put("section", transaction.getTicket().getSection());
                ticketMap.put("row", transaction.getTicket().getRow());
                ticketMap.put("seat", transaction.getTicket().getSeat());

                if (transaction.getTicket().getEvent() != null) {
                    Map<String, Object> eventMap = new HashMap<>();
                    eventMap.put("id", transaction.getTicket().getEvent().getId());
                    eventMap.put("name", transaction.getTicket().getEvent().getName());
                    eventMap.put("eventDate", transaction.getTicket().getEvent().getEventDate());

                    if (transaction.getTicket().getEvent().getVenue() != null) {
                        Map<String, Object> venueMap = new HashMap<>();
                        venueMap.put("name", transaction.getTicket().getEvent().getVenue().getName());
                        venueMap.put("city", transaction.getTicket().getEvent().getVenue().getCity());
                        eventMap.put("venue", venueMap);
                    }

                    ticketMap.put("event", eventMap);
                }

                response.put("ticket", ticketMap);
            }

            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid listing ID format"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}