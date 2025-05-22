package com.mytickets.ticketingApp.controller;

import com.mytickets.ticketingApp.model.*;
import com.mytickets.ticketingApp.payload.request.LoginRequest;
import com.mytickets.ticketingApp.payload.request.PasswordResetRequest;
import com.mytickets.ticketingApp.payload.request.SignupRequest;
import com.mytickets.ticketingApp.payload.response.JwtResponse;
import com.mytickets.ticketingApp.payload.response.MessageResponse;
import com.mytickets.ticketingApp.repository.RoleRepository;
import com.mytickets.ticketingApp.repository.UserRepository;
import com.mytickets.ticketingApp.security.jwt.JwtUtils;
import com.mytickets.ticketingApp.security.services.UserDetailsImpl;
import com.mytickets.ticketingApp.service.EmailService;
import com.mytickets.ticketingApp.service.TokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    EmailService emailService;

    @Autowired
    TokenService tokenService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        // Check if user exists and is enabled
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: User not found!"));
        }

        User user = userOpt.get();
        if (!user.isEnabled()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Please verify your email address before signing in!"));
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getFirstName(),
                userDetails.getLastName(),
                roles));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());
        user.setProvider(AuthProvider.LOCAL);
        user.setEnabled(false); // Email verification required

        Set<String> strRoles = signUpRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(adminRole);
                        break;
                    case "mod":
                        Role modRole = roleRepository.findByName(ERole.ROLE_MODERATOR)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(modRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        User savedUser = userRepository.save(user);

        // Generate email verification token and send email
        EmailVerificationToken verificationToken = tokenService.createVerificationToken(savedUser);
        emailService.sendVerificationEmail(savedUser, verificationToken.getToken());

        return ResponseEntity.ok(new MessageResponse("User registered successfully! Please check your email to verify your account."));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String token) {
        boolean isVerified = tokenService.verifyEmail(token);

        if (isVerified) {
            return ResponseEntity.ok(new MessageResponse("Email verified successfully! You can now sign in."));
        } else {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Invalid or expired verification token!"));
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerificationEmail(@RequestParam("email") String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: User not found!"));
        }

        User user = userOpt.get();
        if (user.isEnabled()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email is already verified!"));
        }

        // Generate new verification token and send email
        EmailVerificationToken verificationToken = tokenService.createVerificationToken(user);
        emailService.sendVerificationEmail(user, verificationToken.getToken());

        return ResponseEntity.ok(new MessageResponse("Verification email sent successfully!"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam("email") String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            // Don't reveal if email exists or not for security
            return ResponseEntity.ok(new MessageResponse("If the email exists, a password reset link has been sent."));
        }

        User user = userOpt.get();
        PasswordResetToken resetToken = tokenService.createPasswordResetToken(user);
        emailService.sendPasswordResetEmail(user, resetToken.getToken());

        return ResponseEntity.ok(new MessageResponse("If the email exists, a password reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordResetRequest resetRequest) {
        if (!tokenService.validatePasswordResetToken(resetRequest.getToken())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Invalid or expired reset token!"));
        }

        User user = tokenService.getUserByPasswordResetToken(resetRequest.getToken());
        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Invalid reset token!"));
        }

        // Update user password
        user.setPassword(encoder.encode(resetRequest.getNewPassword()));
        userRepository.save(user);

        // Mark token as used (you may want to implement this in TokenService)

        return ResponseEntity.ok(new MessageResponse("Password reset successfully!"));
    }
}