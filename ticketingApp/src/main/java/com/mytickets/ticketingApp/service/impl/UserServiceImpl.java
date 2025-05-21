package com.mytickets.ticketingApp.service.impl;

import com.mytickets.ticketingApp.model.ERole;
import com.mytickets.ticketingApp.model.Role;
import com.mytickets.ticketingApp.model.User;
import com.mytickets.ticketingApp.repository.RoleRepository;
import com.mytickets.ticketingApp.repository.TicketRepository;
import com.mytickets.ticketingApp.repository.EventRepository;
import com.mytickets.ticketingApp.repository.TransactionRepository;
import com.mytickets.ticketingApp.repository.UserRepository;
import com.mytickets.ticketingApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserBalanceServiceImpl userBalanceService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Update UserServiceImpl.java createUser method
    @Override
    @Transactional
    public User createUser(User user) {
        // Encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Add default user role if no roles specified
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
            user.setRoles(roles);
        }

        // Save user
        User savedUser = userRepository.save(user);

        // Initialize user balance
        userBalanceService.getOrCreateUserBalance(savedUser.getId());

        return savedUser;
    }

    @Override
    @Transactional
    public User updateUser(Long id, User updatedUser) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        existingUser.setFirstName(updatedUser.getFirstName());
        existingUser.setLastName(updatedUser.getLastName());

        // Only update password if provided
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        return userRepository.save(existingUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    @Transactional
    public User updateProfile(Long id, String firstName, String lastName) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setFirstName(firstName);
        user.setLastName(lastName);

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User addRoleToUser(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        ERole eRole;
        try {
            eRole = ERole.valueOf(roleName);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Error: Role is not valid.");
        }

        Role role = roleRepository.findByName(eRole)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));

        Set<Role> roles = user.getRoles();
        roles.add(role);
        user.setRoles(roles);

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User removeRoleFromUser(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        ERole eRole;
        try {
            eRole = ERole.valueOf(roleName);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Error: Role is not valid.");
        }

        Role roleToRemove = roleRepository.findByName(eRole)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));

        Set<Role> roles = user.getRoles();
        roles.removeIf(role -> role.getName().equals(eRole));
        user.setRoles(roles);

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void enableUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setEnabled(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void disableUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setEnabled(false);
        userRepository.save(user);
    }

    @Override
    public List<Object> getUserPurchasedTickets(Long userId) {
        return ticketRepository.findByOwnerId(userId).stream()
                .map(ticket -> (Object) ticket)
                .toList();
    }

    @Override
    public List<Object> getUserCreatedEvents(Long userId) {
        return eventRepository.findByCreator(
                        userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId))
                ).stream()
                .map(event -> (Object) event)
                .toList();
    }

    @Override
    public List<Object> getUserTransactionHistory(Long userId) {
        List<Object> buyerTransactions = transactionRepository.findByBuyerId(userId).stream()
                .map(transaction -> (Object) transaction)
                .toList();

        List<Object> sellerTransactions = transactionRepository.findBySellerId(userId).stream()
                .map(transaction -> (Object) transaction)
                .toList();

        // Combine both lists
        List<Object> allTransactions = new ArrayList<>(buyerTransactions);
        allTransactions.addAll(sellerTransactions);

        return allTransactions;
    }
}