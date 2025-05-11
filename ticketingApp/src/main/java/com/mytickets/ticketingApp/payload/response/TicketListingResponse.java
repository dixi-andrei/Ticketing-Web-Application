package com.mytickets.ticketingApp.payload.response;

import com.mytickets.ticketingApp.model.ListingStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TicketListingResponse {
    private Long id;
    private Double askingPrice;
    private String description;
    private LocalDateTime listingDate;
    private ListingStatus status;
    private TicketResponse ticket;
    private String sellerName;
}