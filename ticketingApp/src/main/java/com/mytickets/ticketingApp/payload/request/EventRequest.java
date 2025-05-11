package com.mytickets.ticketingApp.payload.request;

import com.mytickets.ticketingApp.model.EventStatus;
import com.mytickets.ticketingApp.model.EventType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventRequest {
    @NotBlank(message = "Event name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Event date is required")
    @Future(message = "Event date must be in the future")
    private LocalDateTime eventDate;

    private String imageUrl;

    @Positive(message = "Total tickets must be a positive number")
    private Integer totalTickets;

    @NotNull(message = "Event type is required")
    private EventType eventType;

    private EventStatus status;

    @NotNull(message = "Venue ID is required")
    private Long venueId;
}