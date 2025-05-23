package com.mytickets.ticketingApp.payload.response;

import com.mytickets.ticketingApp.model.EventStatus;
import com.mytickets.ticketingApp.model.EventType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class EventResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime eventDate;
    private String imageUrl;
    private Integer totalTickets;
    private Integer availableTickets;
    private EventType eventType;
    private EventStatus status;
    private VenueResponse venue;
    private String creatorName;
    private List<PricingTierResponse> pricingTiers;
}