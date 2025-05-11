package com.mytickets.ticketingApp.mapper;

import com.mytickets.ticketingApp.exception.ResourceNotFoundException;
import com.mytickets.ticketingApp.model.Event;
import com.mytickets.ticketingApp.model.PricingTier;
import com.mytickets.ticketingApp.payload.request.PricingTierRequest;
import com.mytickets.ticketingApp.payload.response.PricingTierResponse;
import com.mytickets.ticketingApp.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PricingTierMapper {

    @Autowired
    private EventRepository eventRepository;

    public PricingTier toEntity(PricingTierRequest request) {
        if (request == null) {
            return null;
        }

        PricingTier pricingTier = new PricingTier();
        pricingTier.setName(request.getName());
        pricingTier.setDescription(request.getDescription());
        pricingTier.setPrice(request.getPrice());
        pricingTier.setQuantity(request.getQuantity());
        pricingTier.setAvailable(request.getQuantity()); // Set available same as quantity initially
        pricingTier.setSectionId(request.getSectionId());

        if (request.getEventId() != null) {
            Event event = eventRepository.findById(request.getEventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Event", "id", request.getEventId()));
            pricingTier.setEvent(event);
        }

        return pricingTier;
    }

    public PricingTierResponse toResponse(PricingTier pricingTier) {
        if (pricingTier == null) {
            return null;
        }

        PricingTierResponse response = new PricingTierResponse();
        response.setId(pricingTier.getId());
        response.setName(pricingTier.getName());
        response.setDescription(pricingTier.getDescription());
        response.setPrice(pricingTier.getPrice());
        response.setQuantity(pricingTier.getQuantity());
        response.setAvailable(pricingTier.getAvailable());
        response.setSectionId(pricingTier.getSectionId());

        return response;
    }

    public void updatePricingTierFromRequest(PricingTierRequest request, PricingTier pricingTier) {
        if (request == null || pricingTier == null) {
            return;
        }

        if (request.getName() != null) pricingTier.setName(request.getName());
        if (request.getDescription() != null) pricingTier.setDescription(request.getDescription());
        if (request.getPrice() != null) pricingTier.setPrice(request.getPrice());
        if (request.getSectionId() != null) pricingTier.setSectionId(request.getSectionId());

        if (request.getEventId() != null) {
            Event event = eventRepository.findById(request.getEventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Event", "id", request.getEventId()));
            pricingTier.setEvent(event);
        }
    }
}