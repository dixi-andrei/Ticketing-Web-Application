package com.mytickets.ticketingApp.service.impl;

import com.mytickets.ticketingApp.exception.ResourceNotFoundException;
import com.mytickets.ticketingApp.model.Event;
import com.mytickets.ticketingApp.model.EventStatus;
import com.mytickets.ticketingApp.model.EventType;
import com.mytickets.ticketingApp.model.User;
import com.mytickets.ticketingApp.repository.EventRepository;
import com.mytickets.ticketingApp.repository.UserRepository;
import com.mytickets.ticketingApp.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EventServiceImpl implements EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Cacheable("events")
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @Override
    public Page<Event> getEventsPage(Pageable pageable) {
        return eventRepository.findAll(pageable);
    }

    @Override
    @Cacheable(value = "events", key = "#id")
    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }

    @Override
    @Transactional
    @Caching(
            put = { @CachePut(value = "events", key = "#result.id") },
            evict = {
                    @CacheEvict(value = "events", allEntries = true),
                    @CacheEvict(value = "eventsByVenue", allEntries = true),
                    @CacheEvict(value = "upcomingEvents", allEntries = true)
            }
    )
    public Event createEvent(Event event, Long creatorId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", creatorId));

        event.setCreator(creator);
        event.setAvailableTickets(event.getTotalTickets()); // All tickets are available initially
        event.setStatus(EventStatus.SCHEDULED); // Default status

        return eventRepository.save(event);
    }

    @Override
    @Transactional
    @Caching(
            put = { @CachePut(value = "events", key = "#id") },
            evict = {
                    @CacheEvict(value = "events", allEntries = true),
                    @CacheEvict(value = "eventsByVenue", allEntries = true),
                    @CacheEvict(value = "upcomingEvents", allEntries = true)
            }
    )
    public Event updateEvent(Long id, Event updatedEvent) {
        Event existingEvent = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        existingEvent.setName(updatedEvent.getName());
        existingEvent.setDescription(updatedEvent.getDescription());
        existingEvent.setEventDate(updatedEvent.getEventDate());
        existingEvent.setImageUrl(updatedEvent.getImageUrl());
        existingEvent.setVenue(updatedEvent.getVenue());
        existingEvent.setEventType(updatedEvent.getEventType());
        existingEvent.setStatus(updatedEvent.getStatus());

        // Only update ticket counts if provided and greater than current
        if (updatedEvent.getTotalTickets() != null && updatedEvent.getTotalTickets() > existingEvent.getTotalTickets()) {
            int additionalTickets = updatedEvent.getTotalTickets() - existingEvent.getTotalTickets();
            existingEvent.setTotalTickets(updatedEvent.getTotalTickets());
            existingEvent.setAvailableTickets(existingEvent.getAvailableTickets() + additionalTickets);
        }

        return eventRepository.save(existingEvent);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "events", key = "#id"),
            @CacheEvict(value = "events", allEntries = true),
            @CacheEvict(value = "eventsByVenue", allEntries = true),
            @CacheEvict(value = "upcomingEvents", allEntries = true)
    })
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    @Override
    public List<Event> findEventsByCreator(Long creatorId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", creatorId));

        return eventRepository.findByCreator(creator);
    }

    @Override
    @Cacheable("events")
    public List<Event> findEventsByType(EventType eventType) {
        return eventRepository.findByEventType(eventType);
    }

    @Override
    @Cacheable("events")
    public List<Event> findEventsByStatus(EventStatus status) {
        return eventRepository.findByStatus(status);
    }

    @Override
    @Cacheable("upcomingEvents")
    public List<Event> findUpcomingEvents() {
        return eventRepository.findByEventDateAfter(LocalDateTime.now());
    }

    @Override
    @Cacheable(value = "eventsByVenue", key = "#venueId")
    public List<Event> findEventsByVenue(Long venueId) {
        return eventRepository.findByVenueId(venueId);
    }

    @Override
    public List<Event> searchEventsByName(String name) {
        return eventRepository.findByNameContainingIgnoreCase(name);
    }

    @Override
    @Cacheable("upcomingEvents")
    public List<Event> findUpcomingEventsWithAvailableTickets() {
        return eventRepository.findUpcomingEventsWithAvailableTickets(LocalDateTime.now());
    }

    @Override
    @Cacheable("upcomingEvents")
    public List<Event> findUpcomingEventsByCity(String city) {
        return eventRepository.findUpcomingEventsByCity(city, LocalDateTime.now());
    }
}