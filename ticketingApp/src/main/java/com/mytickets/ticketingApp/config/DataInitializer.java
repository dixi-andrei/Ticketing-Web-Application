package com.mytickets.ticketingApp.config;

import com.mytickets.ticketingApp.model.*;
import com.mytickets.ticketingApp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Component
@Profile("dev") // Only execute in development environment
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private PricingTierRepository pricingTierRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize roles
        initRoles();

        // Initialize users
        User adminUser = createAdminUser();
        User regularUser = createRegularUser();

        // Initialize venues
        Venue venue1 = createVenue("Madison Square Garden", "4 Pennsylvania Plaza", "New York", "NY", "USA", 20000);
        Venue venue2 = createVenue("Staples Center", "1111 S Figueroa St", "Los Angeles", "CA", "USA", 18000);

        // Initialize events
        Event event1 = createEvent("Summer Concert 2025", "A fantastic summer concert featuring top artists",
                LocalDateTime.now().plusMonths(3), EventType.CONCERT, venue1, adminUser);
        Event event2 = createEvent("Basketball Championship", "The final basketball championship of the season",
                LocalDateTime.now().plusMonths(2), EventType.SPORTS, venue2, adminUser);

        // Initialize pricing tiers
        createPricingTier("VIP", "Best seats with special perks", 200.0, 100, event1);
        createPricingTier("Regular", "Standard seating", 100.0, 500, event1);
        createPricingTier("Economy", "Basic seating", 50.0, 1000, event1);

        createPricingTier("Courtside", "Seats right next to the court", 300.0, 50, event2);
        createPricingTier("Premium", "Great seats with good visibility", 150.0, 200, event2);
        createPricingTier("Standard", "Regular seating", 75.0, 1000, event2);
    }

    private void initRoles() {
        for (ERole role : ERole.values()) {
            if (!roleRepository.existsByName(role)) {
                Role newRole = new Role();
                newRole.setName(role);
                roleRepository.save(newRole);
                System.out.println("Created role: " + role);
            }
        }
    }

    private User createAdminUser() {
        if (!userRepository.existsByEmail("admin@example.com")) {
            User admin = new User();
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("password123"));
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setEnabled(true);
            admin.setProvider(AuthProvider.LOCAL);

            Set<Role> roles = new HashSet<>();
            roles.add(roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Admin role not found.")));
            roles.add(roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: User role not found.")));
            admin.setRoles(roles);

            return userRepository.save(admin);
        }
        return userRepository.findByEmail("admin@example.com").orElse(null);
    }

    private User createRegularUser() {
        if (!userRepository.existsByEmail("user@example.com")) {
            User user = new User();
            user.setEmail("user@example.com");
            user.setPassword(passwordEncoder.encode("password123"));
            user.setFirstName("Regular");
            user.setLastName("User");
            user.setEnabled(true);
            user.setProvider(AuthProvider.LOCAL);

            Set<Role> roles = new HashSet<>();
            roles.add(roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: User role not found.")));
            user.setRoles(roles);

            return userRepository.save(user);
        }
        return userRepository.findByEmail("user@example.com").orElse(null);
    }

    private Venue createVenue(String name, String address, String city, String state, String country, int capacity) {
        Venue venue = new Venue();
        venue.setName(name);
        venue.setAddress(address);
        venue.setCity(city);
        venue.setState(state);
        venue.setCountry(country);
        venue.setCapacity(capacity);
        venue.setVenueMap("https://example.com/venue-maps/" + name.toLowerCase().replace(" ", "-") + ".jpg");

        return venueRepository.save(venue);
    }

    private Event createEvent(String name, String description, LocalDateTime eventDate, EventType eventType, Venue venue, User creator) {
        Event event = new Event();
        event.setName(name);
        event.setDescription(description);
        event.setEventDate(eventDate);
        event.setEventType(eventType);
        event.setStatus(EventStatus.SCHEDULED);
        event.setVenue(venue);
        event.setCreator(creator);
        event.setTotalTickets(0); // Will be updated when pricing tiers are added
        event.setAvailableTickets(0); // Will be updated when pricing tiers are added
        event.setImageUrl("https://example.com/event-images/" + name.toLowerCase().replace(" ", "-") + ".jpg");

        return eventRepository.save(event);
    }

    private PricingTier createPricingTier(String name, String description, Double price, Integer quantity, Event event) {
        PricingTier pricingTier = new PricingTier();
        pricingTier.setName(name);
        pricingTier.setDescription(description);
        pricingTier.setPrice(price);
        pricingTier.setQuantity(quantity);
        pricingTier.setAvailable(quantity);
        pricingTier.setEvent(event);

        // Update event ticket counts
        event.setTotalTickets(event.getTotalTickets() + quantity);
        event.setAvailableTickets(event.getAvailableTickets() + quantity);
        eventRepository.save(event);

        return pricingTierRepository.save(pricingTier);
    }
}