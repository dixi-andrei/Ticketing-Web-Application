package com.mytickets.ticketingApp.service;

import com.mytickets.ticketingApp.model.User;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface UserService {
    List<User> getAllUsers();

    Optional<User> getUserById(Long id);

    Optional<User> getUserByEmail(String email);

    User createUser(User user);

    User updateUser(Long id, User user);

    void deleteUser(Long id);

    boolean existsByEmail(String email);

    // User profile methods
    User updateProfile(Long id, String firstName, String lastName);

    @Transactional
    User enableUserWithWelcomeEmail(Long userId);

    // User role management
    User addRoleToUser(Long userId, String roleName);

    User removeRoleFromUser(Long userId, String roleName);

    // Account status management
    void enableUser(Long id);

    void disableUser(Long id);

    // Get user's tickets, events, and transactions
    List<Object> getUserPurchasedTickets(Long userId);

    List<Object> getUserCreatedEvents(Long userId);

    List<Object> getUserTransactionHistory(Long userId);
}