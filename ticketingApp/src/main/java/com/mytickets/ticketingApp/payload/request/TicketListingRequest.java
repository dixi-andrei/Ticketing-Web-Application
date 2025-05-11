package com.mytickets.ticketingApp.payload.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class TicketListingRequest {
    @NotNull(message = "Ticket ID is required")
    private Long ticketId;

    @NotNull(message = "Asking price is required")
    @Positive(message = "Asking price must be a positive number")
    private Double askingPrice;

    private String description;
}