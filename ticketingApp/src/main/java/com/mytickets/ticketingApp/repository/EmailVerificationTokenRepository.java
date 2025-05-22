package com.mytickets.ticketingApp.repository;

import com.mytickets.ticketingApp.model.EmailVerificationToken;
import com.mytickets.ticketingApp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    Optional<EmailVerificationToken> findByToken(String token);
    Optional<EmailVerificationToken> findByUser(User user);
    void deleteByExpiryDateLessThan(LocalDateTime now);
    List<EmailVerificationToken> findAllByExpiryDateLessThan(LocalDateTime now);
}