package com.mytickets.ticketingApp.service;

import com.mytickets.ticketingApp.model.PricingTier;

import java.util.List;
import java.util.Optional;

public interface PricingTierService {
    List<PricingTier> getAllPricingTiers();
    Optional<PricingTier> getPricingTierById(Long id);
    List<PricingTier> getPricingTiersByEvent(Long eventId);
    PricingTier createPricingTier(PricingTier pricingTier);
    PricingTier updatePricingTier(Long id, PricingTier pricingTier);
    void deletePricingTier(Long id);
}