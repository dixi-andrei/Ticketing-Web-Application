package com.mytickets.ticketingApp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mytickets.ticketingApp.model.AuthProvider;
import com.mytickets.ticketingApp.model.ERole;
import com.mytickets.ticketingApp.model.Role;
import com.mytickets.ticketingApp.model.User;
import com.mytickets.ticketingApp.payload.request.VenueRequest;
import com.mytickets.ticketingApp.repository.RoleRepository;
import com.mytickets.ticketingApp.repository.UserRepository;
import com.mytickets.ticketingApp.repository.VenueRepository;
import com.mytickets.ticketingApp.security.jwt.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashSet;
import java.util.Set;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Sql(scripts = "classpath:test-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "classpath:cleanup.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
public class VenueControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    private String adminToken;
    private String userToken;

    @BeforeEach
    void setUp() {
        // Prepare roles if they don't exist
        if (!roleRepository.existsByName(ERole.ROLE_USER)) {
            Role userRole = new Role();
            userRole.setName(ERole.ROLE_USER);
            roleRepository.save(userRole);
        }

        if (!roleRepository.existsByName(ERole.ROLE_ADMIN)) {
            Role adminRole = new Role();
            adminRole.setName(ERole.ROLE_ADMIN);
            roleRepository.save(adminRole);
        }

        // Create admin user if it doesn't exist
        if (!userRepository.existsByEmail("admin@example.com")) {
            User admin = new User();
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("password123"));
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setEnabled(true);
            admin.setProvider(AuthProvider.LOCAL);

            Set<Role> adminRoles = new HashSet<>();
            adminRoles.add(roleRepository.findByName(ERole.ROLE_ADMIN).get());
            adminRoles.add(roleRepository.findByName(ERole.ROLE_USER).get());
            admin.setRoles(adminRoles);

            userRepository.save(admin);
        }

        // Create regular user if it doesn't exist
        if (!userRepository.existsByEmail("user@example.com")) {
            User user = new User();
            user.setEmail("user@example.com");
            user.setPassword(passwordEncoder.encode("password123"));
            user.setFirstName("Regular");
            user.setLastName("User");
            user.setEnabled(true);
            user.setProvider(AuthProvider.LOCAL);

            Set<Role> userRoles = new HashSet<>();
            userRoles.add(roleRepository.findByName(ERole.ROLE_USER).get());
            user.setRoles(userRoles);

            userRepository.save(user);
        }

        // Generate JWT tokens
        Authentication adminAuth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken("admin@example.com", "password123"));
        SecurityContextHolder.getContext().setAuthentication(adminAuth);
        adminToken = jwtUtils.generateJwtToken(adminAuth);

        Authentication userAuth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken("user@example.com", "password123"));
        SecurityContextHolder.getContext().setAuthentication(userAuth);
        userToken = jwtUtils.generateJwtToken(userAuth);
    }

    @Test
    public void testGetAllVenues() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/venues"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    public void testCreateVenue_WhenAdmin_ShouldCreateVenue() throws Exception {
        // Given
        VenueRequest venueRequest = new VenueRequest();
        venueRequest.setName("Test Venue");
        venueRequest.setAddress("123 Test St");
        venueRequest.setCity("Test City");
        venueRequest.setState("TS");
        venueRequest.setCountry("Test Country");
        venueRequest.setCapacity(1000);

        // When & Then
        mockMvc.perform(post("/api/venues")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(venueRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Test Venue")))
                .andExpect(jsonPath("$.address", is("123 Test St")))
                .andExpect(jsonPath("$.city", is("Test City")))
                .andExpect(jsonPath("$.state", is("TS")))
                .andExpect(jsonPath("$.country", is("Test Country")))
                .andExpect(jsonPath("$.capacity", is(1000)));
    }

    @Test
    public void testCreateVenue_WhenUser_ShouldReturnForbidden() throws Exception {
        // Given
        VenueRequest venueRequest = new VenueRequest();
        venueRequest.setName("Test Venue");
        venueRequest.setAddress("123 Test St");
        venueRequest.setCity("Test City");
        venueRequest.setState("TS");
        venueRequest.setCountry("Test Country");
        venueRequest.setCapacity(1000);

        // When & Then
        mockMvc.perform(post("/api/venues")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(venueRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testGetVenuesByCity() throws Exception {
        // Given
        // Venues are pre-loaded from test-data.sql

        // When & Then
        mockMvc.perform(get("/api/venues/city/New York"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    public void testSearchVenuesByName() throws Exception {
        // Given
        // Venues are pre-loaded from test-data.sql

        // When & Then
        mockMvc.perform(get("/api/venues/search")
                        .param("name", "Arena"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray());
    }
}