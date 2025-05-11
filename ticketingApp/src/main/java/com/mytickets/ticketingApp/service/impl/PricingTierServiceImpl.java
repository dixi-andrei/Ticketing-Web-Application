package com.mytickets.ticketingApp.service.impl;

import com.mytickets.ticketingApp.exception.ResourceNotFoundException;
import com.mytickets.ticketingApp.model.Event;
import com.mytickets.ticketingApp.model.PricingTier;
import com.mytickets.ticketingApp.repository.EventRepository;
import com.mytickets.ticketingApp.repository.PricingTierRepository;
import com.mytickets.ticketingApp.service.PricingTierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PricingTierServiceImpl implements PricingTierService {

    @Autowired
    private PricingTierRepository pricingTierRepository;

    @Autowired
    private EventRepository eventRepository;

    @Override
    public List<PricingTier> getAllPricingTiers() {
        return pricingTierRepository.findAll();
    }

    @Override
    public Optional<PricingTier> getPricingTierById(Long id) {
        return pricingTierRepository.findById(id);
    }

    @Override
    public List<PricingTier> getPricingTiersByEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        return pricingTierRepository.findByEvent(event);
    }

    @Override
    @Transactional
    public PricingTier createPricingTier(PricingTier pricingTier) {
        // Validate event exists
        if (pricingTier.getEvent() != null && pricingTier.getEvent().getId() != null) {
            Event event = eventRepository.findById(pricingTier.getEvent().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Event", "id", pricingTier.getEvent().getId()));
            pricingTier.setEvent(event);
        }

        // Initialize available tickets with the same value as quantity
        if (pricingTier.getQuantity() != null) {
            pricingTier.setAvailable(pricingTier.getQuantity());
        }

        // Update event ticket counts
        if (pricingTier.getEvent() != null) {
            Event event = pricingTier.getEvent();
            if (pricingTier.getQuantity() != null) {
                // Update total tickets
                int totalTickets = event.getTotalTickets() != null ? event.getTotalTickets() : 0;
                event.setTotalTickets(totalTickets + pricingTier.getQuantity());

                // Update available tickets
                int availableTickets = event.getAvailableTickets() != null ? event.getAvailableTickets() : 0;
                event.setAvailableTickets(availableTickets + pricingTier.getQuantity());

                eventRepository.save(event);
            }
        }

        return pricingTierRepository.save(pricingTier);
    }

    @Override
    @Transactional
    public PricingTier updatePricingTier(Long id, PricingTier updatedPricingTier) {
        PricingTier existingPricingTier = pricingTierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PricingTier", "id", id));

        // Capture old quantity for event ticket count adjustment
        int oldQuantity = existingPricingTier.getQuantity() != null ? existingPricingTier.getQuantity() : 0;
        int newQuantity = updatedPricingTier.getQuantity() != null ? updatedPricingTier.getQuantity() : oldQuantity;

        // Update basic fields
        existingPricingTier.setName(updatedPricingTier.getName());
        existingPricingTier.setDescription(updatedPricingTier.getDescription());
        existingPricingTier.setPrice(updatedPricingTier.getPrice());
        existingPricingTier.setSectionId(updatedPricingTier.getSectionId());

        // Update quantity and available tickets
        if (updatedPricingTier.getQuantity() != null) {
            int quantityDifference = newQuantity - oldQuantity;

            existingPricingTier.setQuantity(newQuantity);

            // Update available tickets based on the quantity change
            int currentAvailable = existingPricingTier.getAvailable() != null ? existingPricingTier.getAvailable() : 0;
            existingPricingTier.setAvailable(currentAvailable + quantityDifference);

            // Update event ticket counts
            if (existingPricingTier.getEvent() != null && quantityDifference != 0) {
                Event event = existingPricingTier.getEvent();

                // Update total tickets
                int totalTickets = event.getTotalTickets() != null ? event.getTotalTickets() : 0;
                event.setTotalTickets(totalTickets + quantityDifference);

                // Update available tickets
                int availableTickets = event.getAvailableTickets() != null ? event.getAvailableTickets() : 0;
                event.setAvailableTickets(availableTickets + quantityDifference);

                eventRepository.save(event);
            }
        }

        return pricingTierRepository.save(existingPricingTier);
    }

    @Override
    @Transactional
    public void deletePricingTier(Long id) {
        PricingTier pricingTier = pricingTierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PricingTier", "id", id));

        // Update event ticket counts before deletion
        if (pricingTier.getEvent() != null && pricingTier.getQuantity() != null) {
            Event event = pricingTier.getEvent();

            // Reduce total tickets
            int totalTickets = event.getTotalTickets() != null ? event.getTotalTickets() : 0;
            event.setTotalTickets(Math.max(0, totalTickets - pricingTier.getQuantity()));

            // Reduce available tickets
            int availableTickets = event.getAvailableTickets() != null ? event.getAvailableTickets() : 0;
            int availableInTier = pricingTier.getAvailable() != null ? pricingTier.getAvailable() : 0;
            event.setAvailableTickets(Math.max(0, availableTickets - availableInTier));

            eventRepository.save(event);
        }

        pricingTierRepository.deleteById(id);
    }
}