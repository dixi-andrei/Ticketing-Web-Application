package com.mytickets.ticketingApp.payload.response;

import com.mytickets.ticketingApp.model.TicketStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TicketResponse {
    private Long id;
    private String ticketNumber;
    private Double originalPrice;
    private Double currentPrice;
    private String section;
    private String seat;
    private String row;
    private TicketStatus status;
    private LocalDateTime purchaseDate;
    private Boolean isUsed;
    private String qrCodeUrl;
    private EventSummaryResponse event;
    private String ownerName;
}