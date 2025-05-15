package com.mytickets.ticketingApp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    private LocalDateTime eventDate;

    @Column(length = 2000)
    private String imageUrl;

    private Integer totalTickets;

    private Integer availableTickets;

    @Enumerated(EnumType.STRING)
    private EventType eventType;

    @Enumerated(EnumType.STRING)
    private EventStatus status = EventStatus.SCHEDULED;

    @ManyToOne
    @JoinColumn(name = "venue_id")
    @JsonIgnoreProperties("events")
    private Venue venue;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private List<Ticket> tickets = new ArrayList<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private List<PricingTier> pricingTiers = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getEventDate() {
        return eventDate;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Integer getTotalTickets() {
        return totalTickets;
    }

    public Integer getAvailableTickets() {
        return availableTickets;
    }

    public EventType getEventType() {
        return eventType;
    }

    public EventStatus getStatus() {
        return status;
    }

    public Venue getVenue() {
        return venue;
    }

    public User getCreator() {
        return creator;
    }

    public List<Ticket> getTickets() {
        return tickets;
    }

    public List<PricingTier> getPricingTiers() {
        return pricingTiers;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setEventDate(LocalDateTime eventDate) {
        this.eventDate = eventDate;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setTotalTickets(Integer totalTickets) {
        this.totalTickets = totalTickets;
    }

    public void setAvailableTickets(Integer availableTickets) {
        this.availableTickets = availableTickets;
    }

    public void setEventType(EventType eventType) {
        this.eventType = eventType;
    }

    public void setStatus(EventStatus status) {
        this.status = status;
    }

    public void setVenue(Venue venue) {
        this.venue = venue;
    }

    public void setCreator(User creator) {
        this.creator = creator;
    }

    public void setTickets(List<Ticket> tickets) {
        this.tickets = tickets;
    }

    public void setPricingTiers(List<PricingTier> pricingTiers) {
        this.pricingTiers = pricingTiers;
    }
}