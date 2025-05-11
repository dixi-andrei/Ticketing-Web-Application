package com.mytickets.ticketingApp.payload.response;

import lombok.Data;

@Data
public class TicketSummaryResponse {
    private Long id;
    private String ticketNumber;
    private String eventName;
    private String eventDate;
    private Double price;
    private String section;
    private String seat;
}