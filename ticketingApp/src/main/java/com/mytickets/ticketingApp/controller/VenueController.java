package com.mytickets.ticketingApp.controller;

import com.mytickets.ticketingApp.model.Venue;
import com.mytickets.ticketingApp.service.VenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/venues")
public class VenueController {

    @Autowired
    private VenueService venueService;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Venue>> getAllVenues() {
        List<Venue> venues = venueService.getAllVenues();
        return new ResponseEntity<>(venues, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venue> getVenueById(@PathVariable Long id) {
        return venueService.getVenueById(id)
                .map(venue -> new ResponseEntity<>(venue, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Venue> createVenue(@Valid @RequestBody Venue venue) {
        Venue newVenue = venueService.createVenue(venue);
        return new ResponseEntity<>(newVenue, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Venue> updateVenue(@PathVariable Long id, @Valid @RequestBody Venue venue) {
        Venue updatedVenue = venueService.updateVenue(id, venue);
        return new ResponseEntity<>(updatedVenue, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HttpStatus> deleteVenue(@PathVariable Long id) {
        venueService.deleteVenue(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<Venue>> getVenuesByCity(@PathVariable String city) {
        List<Venue> venues = venueService.findVenuesByCity(city);
        return new ResponseEntity<>(venues, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Venue>> searchVenues(@RequestParam String name) {
        List<Venue> venues = venueService.searchVenuesByName(name);
        return new ResponseEntity<>(venues, HttpStatus.OK);
    }
}