package com.mytickets.ticketingApp.service;

import com.mytickets.ticketingApp.model.EmailVerificationToken;
import com.mytickets.ticketingApp.model.PasswordResetToken;
import com.mytickets.ticketingApp.model.User;

public interface TokenService {
    EmailVerificationToken createVerificationToken(User user);
    PasswordResetToken createPasswordResetToken(User user);
    boolean verifyEmail(String token);
    boolean validatePasswordResetToken(String token);
    User getUserByPasswordResetToken(String token);
    void deleteUsedTokens();
}