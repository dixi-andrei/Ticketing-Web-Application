package com.mytickets.ticketingApp.payload.response;

import lombok.Data;

@Data
public class VenueResponse {
    private Long id;
    private String name;
    private String address;
    private String city;
    private String state;
    private String country;
    private Integer capacity;
    private String venueMap;
    private int eventCount;
}