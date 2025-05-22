package com.mytickets.ticketingApp.service;

import com.mytickets.ticketingApp.model.Transaction;
import com.mytickets.ticketingApp.model.User;

public interface EmailService {
    void sendVerificationEmail(User user, String token);
    void sendPasswordResetEmail(User user, String token);
    void sendPurchaseConfirmationEmail(User user, Transaction transaction);
    void sendSaleNotificationEmail(User user, Transaction transaction);
    void sendWelcomeEmail(User user);
    void sendTicketTransferEmail(User fromUser, User toUser, String ticketNumber);
}