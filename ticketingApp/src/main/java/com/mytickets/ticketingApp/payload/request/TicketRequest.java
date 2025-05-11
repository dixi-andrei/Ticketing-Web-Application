package com.mytickets.ticketingApp.payload.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class TicketRequest {
    @NotNull(message = "Event ID is required")
    private Long eventId;

    @NotNull(message = "Pricing tier ID is required")
    private Long pricingTierId;

    @Positive(message = "Quantity must be a positive number")
    private Integer quantity;
}