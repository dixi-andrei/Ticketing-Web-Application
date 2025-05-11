package com.mytickets.ticketingApp.payload.request;

import com.mytickets.ticketingApp.model.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class TransactionRequest {
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be a positive number")
    private Double amount;

    @NotNull(message = "Transaction type is required")
    private TransactionType type;

    @NotNull(message = "Buyer ID is required")
    private Long buyerId;

    @NotNull(message = "Seller ID is required")
    private Long sellerId;

    @NotNull(message = "Ticket ID is required")
    private Long ticketId;
}