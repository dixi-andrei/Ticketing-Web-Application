package com.mytickets.ticketingApp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tickets")
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String ticketNumber = UUID.randomUUID().toString();

    @NotNull
    private Double originalPrice;

    @NotNull
    private Double currentPrice;

    private String section;

    private String seat;

    private String row;

    @Enumerated(EnumType.STRING)
    private TicketStatus status = TicketStatus.AVAILABLE;

    private LocalDateTime purchaseDate;

    private Boolean isUsed = false;

    @Column(columnDefinition = "TEXT")
    private String qrCodeUrl;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @ManyToOne
    @JoinColumn(name = "pricing_tier_id")
    private PricingTier pricingTier;

    @OneToOne(mappedBy = "ticket", cascade = CascadeType.ALL)
    private TicketListing listing;

    public Long getId() {
        return id;
    }

    public String getTicketNumber() {
        return ticketNumber;
    }

    public Double getOriginalPrice() {
        return originalPrice;
    }

    public Double getCurrentPrice() {
        return currentPrice;
    }

    public String getSection() {
        return section;
    }

    public String getSeat() {
        return seat;
    }

    public String getRow() {
        return row;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public LocalDateTime getPurchaseDate() {
        return purchaseDate;
    }

    public Boolean getUsed() {
        return isUsed;
    }

    public String getQrCodeUrl() {
        return qrCodeUrl;
    }

    public Event getEvent() {
        return event;
    }

    public User getOwner() {
        return owner;
    }

    public PricingTier getPricingTier() {
        return pricingTier;
    }

    public TicketListing getListing() {
        return listing;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTicketNumber(String ticketNumber) {
        this.ticketNumber = ticketNumber;
    }

    public void setOriginalPrice(Double originalPrice) {
        this.originalPrice = originalPrice;
    }

    public void setCurrentPrice(Double currentPrice) {
        this.currentPrice = currentPrice;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public void setSeat(String seat) {
        this.seat = seat;
    }

    public void setRow(String row) {
        this.row = row;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public void setPurchaseDate(LocalDateTime purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public void setUsed(Boolean used) {
        isUsed = used;
    }

    public void setQrCodeUrl(String qrCodeUrl) {
        this.qrCodeUrl = qrCodeUrl;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public void setPricingTier(PricingTier pricingTier) {
        this.pricingTier = pricingTier;
    }

    public void setListing(TicketListing listing) {
        this.listing = listing;
    }
}