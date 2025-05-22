package com.mytickets.ticketingApp.repository;

import com.mytickets.ticketingApp.model.PasswordResetToken;
import com.mytickets.ticketingApp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUser(User user);
    void deleteByExpiryDateLessThan(LocalDateTime now);
    List<PasswordResetToken> findAllByExpiryDateLessThan(LocalDateTime now);
}