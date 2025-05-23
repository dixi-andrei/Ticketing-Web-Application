package com.mytickets.ticketingApp.controller;

import com.mytickets.ticketingApp.model.User;
import com.mytickets.ticketingApp.payload.response.MessageResponse;
import com.mytickets.ticketingApp.security.services.UserDetailsImpl;
import com.mytickets.ticketingApp.service.UserBalanceService;
import com.mytickets.ticketingApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserBalanceService userBalanceService;

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userService.getAllUsers();

        List<Map<String, Object>> simplifiedUsers = users.stream()
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("email", user.getEmail());
                    userMap.put("firstName", user.getFirstName());
                    userMap.put("lastName", user.getLastName());
                    userMap.put("enabled", user.isEnabled());
                    userMap.put("provider", user.getProvider());

                    // Add roles as simple strings
                    List<String> roleNames = user.getRoles().stream()
                            .map(role -> role.getName().toString())
                            .collect(Collectors.toList());
                    userMap.put("roles", roleNames);

                    // Add balance if available
                    if (user.getUserBalance() != null) {
                        userMap.put("balance", user.getUserBalance().getBalance());
                    } else {
                        userMap.put("balance", 0.0);
                    }

                    return userMap;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(simplifiedUsers, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> new ResponseEntity<>(user, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email)
                .map(user -> new ResponseEntity<>(user, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Update the getUserProfile method in UserController.java
    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserProfile() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        return userService.getUserById(userDetails.getId())
                .map(user -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", user.getId());
                    response.put("email", user.getEmail());
                    response.put("firstName", user.getFirstName());
                    response.put("lastName", user.getLastName());
                    response.put("roles", user.getRoles());

                    // Add balance info
                    Double balance = userBalanceService.getCurrentBalance(user.getId());
                    response.put("balance", balance);

                    return new ResponseEntity<>(response, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<User> updateUserProfile(@Valid @RequestBody User user) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        User updatedUser = userService.updateUser(userDetails.getId(), user);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @Valid @RequestBody User user) {
        User updatedUser = userService.updateUser(id, user);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HttpStatus> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{id}/roles/add/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> addRoleToUser(@PathVariable Long id, @PathVariable String role) {
        User user = userService.addRoleToUser(id, role);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PostMapping("/{id}/roles/remove/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> removeRoleFromUser(@PathVariable Long id, @PathVariable String role) {
        User user = userService.removeRoleFromUser(id, role);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PostMapping("/{id}/enable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> enableUser(@PathVariable Long id) {
        userService.enableUser(id);
        return ResponseEntity.ok(new MessageResponse("User enabled successfully"));
    }

    @PostMapping("/{id}/disable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> disableUser(@PathVariable Long id) {
        userService.disableUser(id);
        return ResponseEntity.ok(new MessageResponse("User disabled successfully"));
    }

    @GetMapping("/{id}/tickets")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<List<Object>> getUserTickets(@PathVariable Long id) {
        List<Object> tickets = userService.getUserPurchasedTickets(id);
        return new ResponseEntity<>(tickets, HttpStatus.OK);
    }

    @GetMapping("/{id}/events")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<List<Object>> getUserEvents(@PathVariable Long id) {
        List<Object> events = userService.getUserCreatedEvents(id);
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    @GetMapping("/{id}/transactions")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<List<Object>> getUserTransactions(@PathVariable Long id) {
        List<Object> transactions = userService.getUserTransactionHistory(id);
        return new ResponseEntity<>(transactions, HttpStatus.OK);
    }
}