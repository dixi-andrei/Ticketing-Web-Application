package com.mytickets.ticketingApp.mapper;

import com.mytickets.ticketingApp.exception.ResourceNotFoundException;
import com.mytickets.ticketingApp.model.Event;
import com.mytickets.ticketingApp.model.Venue;
import com.mytickets.ticketingApp.payload.request.EventRequest;
import com.mytickets.ticketingApp.payload.response.EventResponse;
import com.mytickets.ticketingApp.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class EventMapper {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private VenueMapper venueMapper;

    @Autowired
    private PricingTierMapper pricingTierMapper;

    public Event toEntity(EventRequest request) {
        if (request == null) {
            return null;
        }

        Event event = new Event();
        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setEventDate(request.getEventDate());
        event.setImageUrl(request.getImageUrl());
        event.setTotalTickets(request.getTotalTickets());
        event.setAvailableTickets(request.getTotalTickets()); // Set available same as total initially
        event.setEventType(request.getEventType());
        event.setStatus(request.getStatus());

        if (request.getVenueId() != null) {
            Venue venue = venueRepository.findById(request.getVenueId())
                    .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", request.getVenueId()));
            event.setVenue(venue);
        }

        return event;
    }

    public EventResponse toResponse(Event event) {
        if (event == null) {
            return null;
        }

        EventResponse response = new EventResponse();
        response.setId(event.getId());
        response.setName(event.getName());
        response.setDescription(event.getDescription());
        response.setEventDate(event.getEventDate());
        response.setImageUrl(event.getImageUrl());
        response.setTotalTickets(event.getTotalTickets());
        response.setAvailableTickets(event.getAvailableTickets());
        response.setEventType(event.getEventType());
        response.setStatus(event.getStatus());

        if (event.getVenue() != null) {
            response.setVenue(venueMapper.toResponse(event.getVenue()));
        }

        response.setCreatorName(event.getCreator() != null ?
                event.getCreator().getFirstName() + " " + event.getCreator().getLastName() : "System");

        if (event.getPricingTiers() != null && !event.getPricingTiers().isEmpty()) {
            response.setPricingTiers(event.getPricingTiers().stream()
                    .map(pricingTierMapper::toResponse)
                    .collect(Collectors.toList()));
        }

        return response;
    }

    public void updateEventFromRequest(EventRequest request, Event event) {
        if (request == null || event == null) {
            return;
        }

        if (request.getName() != null) event.setName(request.getName());
        if (request.getDescription() != null) event.setDescription(request.getDescription());
        if (request.getEventDate() != null) event.setEventDate(request.getEventDate());
        if (request.getImageUrl() != null) event.setImageUrl(request.getImageUrl());
        if (request.getEventType() != null) event.setEventType(request.getEventType());
        if (request.getStatus() != null) event.setStatus(request.getStatus());

        if (request.getVenueId() != null) {
            Venue venue = venueRepository.findById(request.getVenueId())
                    .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", request.getVenueId()));
            event.setVenue(venue);
        }
    }
}