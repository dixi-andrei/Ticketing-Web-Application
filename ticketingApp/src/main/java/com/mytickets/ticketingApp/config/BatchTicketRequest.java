package com.mytickets.ticketingApp.config;

import java.util.List;

public class BatchTicketRequest {
    private Long eventId;
    private Long pricingTierId;
    private List<TicketInfo> tickets;

    // Getters and setters
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public Long getPricingTierId() { return pricingTierId; }
    public void setPricingTierId(Long pricingTierId) { this.pricingTierId = pricingTierId; }

    public List<TicketInfo> getTickets() { return tickets; }
    public void setTickets(List<TicketInfo> tickets) { this.tickets = tickets; }

    public static class TicketInfo {
        private String section;
        private String row;
        private String seat;

        // Getters and setters
        public String getSection() { return section; }
        public void setSection(String section) { this.section = section; }

        public String getRow() { return row; }
        public void setRow(String row) { this.row = row; }

        public String getSeat() { return seat; }
        public void setSeat(String seat) { this.seat = seat; }
    }
}
