package com.mytickets.ticketingApp.payload.response;

import com.mytickets.ticketingApp.model.TransactionStatus;
import com.mytickets.ticketingApp.model.TransactionType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TransactionResponse {
    private Long id;
    private String transactionNumber;
    private Double amount;
    private LocalDateTime transactionDate;
    private TransactionType type;
    private TransactionStatus status;
    private String paymentIntentId;
    private String buyerName;
    private String sellerName;
    private TicketSummaryResponse ticket;
}