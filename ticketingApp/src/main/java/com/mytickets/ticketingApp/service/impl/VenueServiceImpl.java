package com.mytickets.ticketingApp.service.impl;

import com.mytickets.ticketingApp.exception.ResourceNotFoundException;
import com.mytickets.ticketingApp.model.Venue;
import com.mytickets.ticketingApp.repository.VenueRepository;
import com.mytickets.ticketingApp.service.VenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class VenueServiceImpl implements VenueService {

    @Autowired
    private VenueRepository venueRepository;

    @Override
    @Cacheable("venues")
    public List<Venue> getAllVenues() {
        return venueRepository.findAll();
    }

    @Override
    @Cacheable(value = "venues", key = "#id")
    public Optional<Venue> getVenueById(Long id) {
        return venueRepository.findById(id);
    }

    @Override
    @Transactional
    @Caching(
            put = { @CachePut(value = "venues", key = "#result.id") },
            evict = { @CacheEvict(value = "venues", allEntries = true) }
    )
    public Venue createVenue(Venue venue) {
        return venueRepository.save(venue);
    }

    @Override
    @Transactional
    @Caching(
            put = { @CachePut(value = "venues", key = "#id") },
            evict = {
                    @CacheEvict(value = "venues", allEntries = true),
                    @CacheEvict(value = "events", allEntries = true),
                    @CacheEvict(value = "eventsByVenue", allEntries = true)
            }
    )
    public Venue updateVenue(Long id, Venue updatedVenue) {
        Venue existingVenue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", id));

        existingVenue.setName(updatedVenue.getName());
        existingVenue.setAddress(updatedVenue.getAddress());
        existingVenue.setCity(updatedVenue.getCity());
        existingVenue.setState(updatedVenue.getState());
        existingVenue.setCountry(updatedVenue.getCountry());
        existingVenue.setCapacity(updatedVenue.getCapacity());
        existingVenue.setVenueMap(updatedVenue.getVenueMap());

        return venueRepository.save(existingVenue);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "venues", key = "#id"),
            @CacheEvict(value = "venues", allEntries = true),
            @CacheEvict(value = "events", allEntries = true),
            @CacheEvict(value = "eventsByVenue", allEntries = true)
    })
    public void deleteVenue(Long id) {
        venueRepository.deleteById(id);
    }

    @Override
    @Cacheable("venues")
    public List<Venue> findVenuesByCity(String city) {
        return venueRepository.findByCity(city);
    }

    @Override
    @Cacheable("venues")
    public List<Venue> searchVenuesByName(String name) {
        return venueRepository.findByNameContainingIgnoreCase(name);
    }
}
