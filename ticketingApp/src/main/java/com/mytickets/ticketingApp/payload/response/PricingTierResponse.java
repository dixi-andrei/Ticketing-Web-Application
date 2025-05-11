package com.mytickets.ticketingApp.payload.response;

import lombok.Data;

@Data
public class PricingTierResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer quantity;
    private Integer available;
    private String sectionId;
}