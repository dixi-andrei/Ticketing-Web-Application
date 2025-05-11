package com.mytickets.ticketingApp.payload.response;

import com.mytickets.ticketingApp.model.EventStatus;
import com.mytickets.ticketingApp.model.EventType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventSummaryResponse {
    private Long id;
    private String name;
    private LocalDateTime eventDate;
    private String imageUrl;
    private EventType eventType;
    private EventStatus status;
    private String venueName;
    private String venueCity;
}