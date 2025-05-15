package com.mytickets.ticketingApp.controller;

import com.mytickets.ticketingApp.model.Event;
import com.mytickets.ticketingApp.model.EventStatus;
import com.mytickets.ticketingApp.model.EventType;
import com.mytickets.ticketingApp.security.services.UserDetailsImpl;
import com.mytickets.ticketingApp.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllEvents() {
        List<Event> events = eventService.getAllEvents();

        List<Map<String, Object>> simplifiedEvents = events.stream()
                .map(event -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", event.getId());
                    map.put("name", event.getName());
                    map.put("description", event.getDescription());
                    map.put("eventDate", event.getEventDate());
                    map.put("imageUrl", event.getImageUrl());
                    map.put("totalTickets", event.getTotalTickets());
                    map.put("availableTickets", event.getAvailableTickets());
                    map.put("eventType", event.getEventType());
                    map.put("status", event.getStatus());

                    // Add simplified venue info
                    if (event.getVenue() != null) {
                        Map<String, Object> venueMap = new HashMap<>();
                        venueMap.put("id", event.getVenue().getId());
                        venueMap.put("name", event.getVenue().getName());
                        venueMap.put("city", event.getVenue().getCity());
                        venueMap.put("state", event.getVenue().getState());
                        venueMap.put("country", event.getVenue().getCountry());
                        map.put("venue", venueMap);
                    }

                    // Add simplified creator info
                    if (event.getCreator() != null) {
                        Map<String, Object> creatorMap = new HashMap<>();
                        creatorMap.put("id", event.getCreator().getId());
                        creatorMap.put("firstName", event.getCreator().getFirstName());
                        creatorMap.put("lastName", event.getCreator().getLastName());
                        map.put("creator", creatorMap);
                    }

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedEvents, HttpStatus.OK);
    }

    @GetMapping("/page")
    public ResponseEntity<Map<String, Object>> getEventsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "eventDate") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ?
                Sort.Direction.DESC : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<Event> eventsPage = eventService.getEventsPage(pageable);

        // Convert page content to simplified format
        List<Map<String, Object>> simplifiedEvents = eventsPage.getContent().stream()
                .map(event -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", event.getId());
                    map.put("name", event.getName());
                    map.put("description", event.getDescription());
                    map.put("eventDate", event.getEventDate());
                    map.put("imageUrl", event.getImageUrl());
                    map.put("totalTickets", event.getTotalTickets());
                    map.put("availableTickets", event.getAvailableTickets());
                    map.put("eventType", event.getEventType());
                    map.put("status", event.getStatus());

                    // Add simplified venue info
                    if (event.getVenue() != null) {
                        Map<String, Object> venueMap = new HashMap<>();
                        venueMap.put("id", event.getVenue().getId());
                        venueMap.put("name", event.getVenue().getName());
                        venueMap.put("city", event.getVenue().getCity());
                        map.put("venue", venueMap);
                    }

                    return map;
                })
                .collect(Collectors.toList());

        // Create response with pagination info
        Map<String, Object> response = new HashMap<>();
        response.put("content", simplifiedEvents);
        response.put("currentPage", eventsPage.getNumber());
        response.put("totalItems", eventsPage.getTotalElements());
        response.put("totalPages", eventsPage.getTotalPages());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(event -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", event.getId());
                    map.put("name", event.getName());
                    map.put("description", event.getDescription());
                    map.put("eventDate", event.getEventDate());
                    map.put("imageUrl", event.getImageUrl());
                    map.put("totalTickets", event.getTotalTickets());
                    map.put("availableTickets", event.getAvailableTickets());
                    map.put("eventType", event.getEventType());
                    map.put("status", event.getStatus());

                    // Add simplified venue info
                    if (event.getVenue() != null) {
                        Map<String, Object> venueMap = new HashMap<>();
                        venueMap.put("id", event.getVenue().getId());
                        venueMap.put("name", event.getVenue().getName());
                        venueMap.put("address", event.getVenue().getAddress());
                        venueMap.put("city", event.getVenue().getCity());
                        venueMap.put("state", event.getVenue().getState());
                        venueMap.put("country", event.getVenue().getCountry());
                        venueMap.put("capacity", event.getVenue().getCapacity());
                        venueMap.put("venueMap", event.getVenue().getVenueMap());
                        map.put("venue", venueMap);
                    }

                    // Add simplified creator info
                    if (event.getCreator() != null) {
                        Map<String, Object> creatorMap = new HashMap<>();
                        creatorMap.put("id", event.getCreator().getId());
                        creatorMap.put("firstName", event.getCreator().getFirstName());
                        creatorMap.put("lastName", event.getCreator().getLastName());
                        map.put("creator", creatorMap);
                    }

                    return new ResponseEntity<>(map, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/creator")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getEventsByCreator() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        List<Event> events = eventService.findEventsByCreator(userDetails.getId());

        List<Map<String, Object>> simplifiedEvents = events.stream()
                .map(event -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", event.getId());
                    map.put("name", event.getName());
                    map.put("description", event.getDescription());
                    map.put("eventDate", event.getEventDate());
                    map.put("imageUrl", event.getImageUrl());
                    map.put("totalTickets", event.getTotalTickets());
                    map.put("availableTickets", event.getAvailableTickets());
                    map.put("eventType", event.getEventType());
                    map.put("status", event.getStatus());

                    // Add simplified venue info
                    if (event.getVenue() != null) {
                        Map<String, Object> venueMap = new HashMap<>();
                        venueMap.put("id", event.getVenue().getId());
                        venueMap.put("name", event.getVenue().getName());
                        venueMap.put("city", event.getVenue().getCity());
                        map.put("venue", venueMap);
                    }

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedEvents, HttpStatus.OK);
    }

    @GetMapping("/type/{eventType}")
    public ResponseEntity<List<Map<String, Object>>> getEventsByType(@PathVariable EventType eventType) {
        List<Event> events = eventService.findEventsByType(eventType);

        List<Map<String, Object>> simplifiedEvents = events.stream()
                .map(event -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", event.getId());
                    map.put("name", event.getName());
                    map.put("description", event.getDescription());
                    map.put("eventDate", event.getEventDate());
                    map.put("imageUrl", event.getImageUrl());
                    map.put("totalTickets", event.getTotalTickets());
                    map.put("availableTickets", event.getAvailableTickets());
                    map.put("eventType", event.getEventType());
                    map.put("status", event.getStatus());

                    // Add simplified venue info
                    if (event.getVenue() != null) {
                        Map<String, Object> venueMap = new HashMap<>();
                        venueMap.put("id", event.getVenue().getId());
                        venueMap.put("name", event.getVenue().getName());
                        venueMap.put("city", event.getVenue().getCity());
                        map.put("venue", venueMap);
                    }

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedEvents, HttpStatus.OK);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Map<String, Object>>> getEventsByStatus(@PathVariable EventStatus status) {
        List<Event> events = eventService.findEventsByStatus(status);

        List<Map<String, Object>> simplifiedEvents = events.stream()
                .map(event -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", event.getId());
                    map.put("name", event.getName());
                    map.put("eventDate", event.getEventDate());
                    map.put("imageUrl", event.getImageUrl());
                    map.put("totalTickets", event.getTotalTickets());
                    map.put("availableTickets", event.getAvailableTickets());
                    map.put("eventType", event.getEventType());
                    map.put("status", event.getStatus());

                    // Add simplified venue info
                    if (event.getVenue() != null) {
                        Map<String, Object> venueMap = new HashMap<>();
                        venueMap.put("id", event.getVenue().getId());
                        venueMap.put("name", event.getVenue().getName());
                        venueMap.put("city", event.getVenue().getCity());
                        map.put("venue", venueMap);
                    }

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedEvents, HttpStatus.OK);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Map<String, Object>>> getUpcomingEvents() {
        List<Event> events = eventService.findUpcomingEvents();

        List<Map<String, Object>> simplifiedEvents = events.stream()
                .map(event -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", event.getId());
                    map.put("name", event.getName());
                    map.put("description", event.getDescription());
                    map.put("eventDate", event.getEventDate());
                    map.put("imageUrl", event.getImageUrl());
                    map.put("totalTickets", event.getTotalTickets());
                    map.put("availableTickets", event.getAvailableTickets());
                    map.put("eventType", event.getEventType());
                    map.put("status", event.getStatus());

                    // Add simplified venue info
                    if (event.getVenue() != null) {
                        Map<String, Object> venueMap = new HashMap<>();
                        venueMap.put("id", event.getVenue().getId());
                        venueMap.put("name", event.getVenue().getName());
                        venueMap.put("city", event.getVenue().getCity());
                        map.put("venue", venueMap);
                    }

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedEvents, HttpStatus.OK);
    }

    @GetMapping("/venue/{venueId}")
    public ResponseEntity<List<Map<String, Object>>> getEventsByVenue(@PathVariable Long venueId) {
        List<Event> events = eventService.findEventsByVenue(venueId);

        List<Map<String, Object>> simplifiedEvents = events.stream()
                .map(event -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", event.getId());
                    map.put("name", event.getName());
                    map.put("description", event.getDescription());
                    map.put("eventDate", event.getEventDate());
                    map.put("imageUrl", event.getImageUrl());
                    map.put("totalTickets", event.getTotalTickets());
                    map.put("availableTickets", event.getAvailableTickets());
                    map.put("eventType", event.getEventType());
                    map.put("status", event.getStatus());

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedEvents, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchEvents(@RequestParam String name) {
        List<Event> events = eventService.searchEventsByName(name);

        List<Map<String, Object>> simplifiedEvents = events.stream()
                .map(event -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", event.getId());
                    map.put("name", event.getName());
                    map.put("description", event.getDescription());
                    map.put("eventDate", event.getEventDate());
                    map.put("imageUrl", event.getImageUrl());
                    map.put("totalTickets", event.getTotalTickets());
                    map.put("availableTickets", event.getAvailableTickets());
                    map.put("eventType", event.getEventType());
                    map.put("status", event.getStatus());

                    // Add simplified venue info
                    if (event.getVenue() != null) {
                        Map<String, Object> venueMap = new HashMap<>();
                        venueMap.put("id", event.getVenue().getId());
                        venueMap.put("name", event.getVenue().getName());
                        venueMap.put("city", event.getVenue().getCity());
                        map.put("venue", venueMap);
                    }

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedEvents, HttpStatus.OK);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Map<String, Object>>> getEventsWithAvailableTickets() {
        List<Event> events = eventService.findUpcomingEventsWithAvailableTickets();

        List<Map<String, Object>> simplifiedEvents = events.stream()
                .map(event -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", event.getId());
                    map.put("name", event.getName());
                    map.put("description", event.getDescription());
                    map.put("eventDate", event.getEventDate());
                    map.put("imageUrl", event.getImageUrl());
                    map.put("totalTickets", event.getTotalTickets());
                    map.put("availableTickets", event.getAvailableTickets());
                    map.put("eventType", event.getEventType());
                    map.put("status", event.getStatus());

                    // Add simplified venue info
                    if (event.getVenue() != null) {
                        Map<String, Object> venueMap = new HashMap<>();
                        venueMap.put("id", event.getVenue().getId());
                        venueMap.put("name", event.getVenue().getName());
                        venueMap.put("city", event.getVenue().getCity());
                        map.put("venue", venueMap);
                    }

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedEvents, HttpStatus.OK);
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<Map<String, Object>>> getEventsByCity(@PathVariable String city) {
        List<Event> events = eventService.findUpcomingEventsByCity(city);

        List<Map<String, Object>> simplifiedEvents = events.stream()
                .map(event -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", event.getId());
                    map.put("name", event.getName());
                    map.put("description", event.getDescription());
                    map.put("eventDate", event.getEventDate());
                    map.put("imageUrl", event.getImageUrl());
                    map.put("totalTickets", event.getTotalTickets());
                    map.put("availableTickets", event.getAvailableTickets());
                    map.put("eventType", event.getEventType());
                    map.put("status", event.getStatus());

                    // Add simplified venue info
                    if (event.getVenue() != null) {
                        Map<String, Object> venueMap = new HashMap<>();
                        venueMap.put("id", event.getVenue().getId());
                        venueMap.put("name", event.getVenue().getName());
                        venueMap.put("city", event.getVenue().getCity());
                        map.put("venue", venueMap);
                    }

                    return map;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedEvents, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Event> createEvent(@Valid @RequestBody Event event) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        Event createdEvent = eventService.createEvent(event, userDetails.getId());
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @Valid @RequestBody Event event) {
        Event updatedEvent = eventService.updateEvent(id, event);
        return new ResponseEntity<>(updatedEvent, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HttpStatus> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}