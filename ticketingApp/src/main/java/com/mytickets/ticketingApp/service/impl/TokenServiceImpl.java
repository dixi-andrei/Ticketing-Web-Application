package com.mytickets.ticketingApp.service.impl;

import com.mytickets.ticketingApp.model.EmailVerificationToken;
import com.mytickets.ticketingApp.model.PasswordResetToken;
import com.mytickets.ticketingApp.model.User;
import com.mytickets.ticketingApp.repository.EmailVerificationTokenRepository;
import com.mytickets.ticketingApp.repository.PasswordResetTokenRepository;
import com.mytickets.ticketingApp.repository.UserRepository;
import com.mytickets.ticketingApp.service.EmailService;
import com.mytickets.ticketingApp.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TokenServiceImpl implements TokenService {

    @Autowired
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Override
    @Transactional
    public EmailVerificationToken createVerificationToken(User user) {
        // Delete any existing tokens for this user first
        Optional<EmailVerificationToken> existingToken = emailVerificationTokenRepository.findByUser(user);
        if (existingToken.isPresent()) {
            emailVerificationTokenRepository.delete(existingToken.get());
            emailVerificationTokenRepository.flush(); // Force immediate execution
        }

        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = new EmailVerificationToken(token, user);
        return emailVerificationTokenRepository.save(verificationToken);
    }

    @Override
    @Transactional
    public PasswordResetToken createPasswordResetToken(User user) {
        // Delete any existing tokens for this user first
        Optional<PasswordResetToken> existingToken = passwordResetTokenRepository.findByUser(user);
        if (existingToken.isPresent()) {
            passwordResetTokenRepository.delete(existingToken.get());
            passwordResetTokenRepository.flush(); // Force immediate execution
        }

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user);
        return passwordResetTokenRepository.save(resetToken);
    }

    @Override
    @Transactional
    public boolean verifyEmail(String token) {
        Optional<EmailVerificationToken> verificationToken = emailVerificationTokenRepository.findByToken(token);

        if (verificationToken.isPresent()) {
            EmailVerificationToken emailToken = verificationToken.get();

            if (!emailToken.isExpired() && !emailToken.isUsed()) {
                User user = emailToken.getUser();
                user.setEnabled(true);
                userRepository.save(user);

                emailToken.setUsed(true);
                emailVerificationTokenRepository.save(emailToken);

                // Send welcome email
                try {
                    emailService.sendWelcomeEmail(user);
                } catch (Exception e) {
                    System.err.println("Failed to send welcome email: " + e.getMessage());
                }

                return true;
            }
        }
        return false;
    }

    @Override
    public boolean validatePasswordResetToken(String token) {
        Optional<PasswordResetToken> resetToken = passwordResetTokenRepository.findByToken(token);
        return resetToken.isPresent() && !resetToken.get().isExpired() && !resetToken.get().isUsed();
    }

    @Override
    public User getUserByPasswordResetToken(String token) {
        Optional<PasswordResetToken> resetToken = passwordResetTokenRepository.findByToken(token);
        return resetToken.map(PasswordResetToken::getUser).orElse(null);
    }

    // Clean up expired tokens every hour
    @Scheduled(fixedRate = 3600000)
    @Override
    @Transactional
    public void deleteUsedTokens() {
        LocalDateTime now = LocalDateTime.now();

        // Delete expired email verification tokens
        List<EmailVerificationToken> expiredEmailTokens = emailVerificationTokenRepository.findAllByExpiryDateLessThan(now);
        if (!expiredEmailTokens.isEmpty()) {
            emailVerificationTokenRepository.deleteAll(expiredEmailTokens);
        }

        // Delete expired password reset tokens
        List<PasswordResetToken> expiredPasswordTokens = passwordResetTokenRepository.findAllByExpiryDateLessThan(now);
        if (!expiredPasswordTokens.isEmpty()) {
            passwordResetTokenRepository.deleteAll(expiredPasswordTokens);
        }
    }

    // Add this method to manually clean up tokens for a user
    @Transactional
    public void cleanupUserTokens(User user) {
        // Clean up email verification tokens
        Optional<EmailVerificationToken> emailToken = emailVerificationTokenRepository.findByUser(user);
        emailToken.ifPresent(emailVerificationTokenRepository::delete);

        // Clean up password reset tokens
        Optional<PasswordResetToken> passwordToken = passwordResetTokenRepository.findByUser(user);
        passwordToken.ifPresent(passwordResetTokenRepository::delete);

        // Force execution
        emailVerificationTokenRepository.flush();
        passwordResetTokenRepository.flush();
    }
}