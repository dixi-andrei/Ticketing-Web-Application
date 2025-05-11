package com.mytickets.ticketingApp.service.impl;

import com.mytickets.ticketingApp.exception.ResourceNotFoundException;
import com.mytickets.ticketingApp.model.Venue;
import com.mytickets.ticketingApp.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VenueServiceImplTest {

    @Mock
    private VenueRepository venueRepository;

    @InjectMocks
    private VenueServiceImpl venueService;

    private Venue venue;

    @BeforeEach
    void setUp() {
        venue = new Venue();
        venue.setId(1L);
        venue.setName("Test Venue");
        venue.setAddress("123 Test St");
        venue.setCity("Test City");
        venue.setState("TS");
        venue.setCountry("Test Country");
        venue.setCapacity(1000);
    }

    @Test
    void getAllVenues_ShouldReturnAllVenues() {
        // Given
        List<Venue> venues = new ArrayList<>();
        venues.add(venue);
        when(venueRepository.findAll()).thenReturn(venues);

        // When
        List<Venue> result = venueService.getAllVenues();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test Venue");
        verify(venueRepository, times(1)).findAll();
    }

    @Test
    void getVenueById_WhenVenueExists_ShouldReturnVenue() {
        // Given
        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));

        // When
        Optional<Venue> result = venueService.getVenueById(1L);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Test Venue");
        verify(venueRepository, times(1)).findById(1L);
    }

    @Test
    void createVenue_ShouldSaveAndReturnVenue() {
        // Given
        when(venueRepository.save(any(Venue.class))).thenReturn(venue);

        // When
        Venue result = venueService.createVenue(venue);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Test Venue");
        verify(venueRepository, times(1)).save(venue);
    }

    @Test
    void updateVenue_WhenVenueExists_ShouldUpdateAndReturnVenue() {
        // Given
        Venue updatedVenue = new Venue();
        updatedVenue.setName("Updated Venue");
        updatedVenue.setAddress("456 Updated St");
        updatedVenue.setCity("Updated City");
        updatedVenue.setState("UP");
        updatedVenue.setCountry("Updated Country");
        updatedVenue.setCapacity(2000);

        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));
        when(venueRepository.save(any(Venue.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        Venue result = venueService.updateVenue(1L, updatedVenue);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Updated Venue");
        assertThat(result.getAddress()).isEqualTo("456 Updated St");
        assertThat(result.getCity()).isEqualTo("Updated City");
        assertThat(result.getState()).isEqualTo("UP");
        assertThat(result.getCountry()).isEqualTo("Updated Country");
        assertThat(result.getCapacity()).isEqualTo(2000);
        verify(venueRepository, times(1)).findById(1L);
        verify(venueRepository, times(1)).save(any(Venue.class));
    }

    @Test
    void updateVenue_WhenVenueDoesNotExist_ShouldThrowException() {
        // Given
        when(venueRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> venueService.updateVenue(1L, venue));
        verify(venueRepository, times(1)).findById(1L);
        verify(venueRepository, never()).save(any(Venue.class));
    }

    @Test
    void deleteVenue_ShouldCallRepositoryDelete() {
        // When
        venueService.deleteVenue(1L);

        // Then
        verify(venueRepository, times(1)).deleteById(1L);
    }

    @Test
    void findVenuesByCity_ShouldReturnVenuesInCity() {
        // Given
        List<Venue> venues = new ArrayList<>();
        venues.add(venue);
        when(venueRepository.findByCity("Test City")).thenReturn(venues);

        // When
        List<Venue> result = venueService.findVenuesByCity("Test City");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test Venue");
        verify(venueRepository, times(1)).findByCity("Test City");
    }

    @Test
    void searchVenuesByName_ShouldReturnVenuesMatchingName() {
        // Given
        List<Venue> venues = new ArrayList<>();
        venues.add(venue);
        when(venueRepository.findByNameContainingIgnoreCase("Test")).thenReturn(venues);

        // When
        List<Venue> result = venueService.searchVenuesByName("Test");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test Venue");
        verify(venueRepository, times(1)).findByNameContainingIgnoreCase("Test");
    }
}