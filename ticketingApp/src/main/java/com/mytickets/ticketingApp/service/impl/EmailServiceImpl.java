package com.mytickets.ticketingApp.service.impl;

import com.mytickets.ticketingApp.model.Transaction;
import com.mytickets.ticketingApp.model.User;
import com.mytickets.ticketingApp.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void sendVerificationEmail(User user, String token) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            Context context = new Context();
            context.setVariable("userName", user.getFirstName());
            context.setVariable("verificationLink", frontendUrl + "/verify-email?token=" + token);

            String htmlContent = templateEngine.process("email-verification", context);

            helper.setTo(user.getEmail());
            helper.setFrom(fromEmail);
            helper.setSubject("Please verify your email address");
            helper.setText(htmlContent, true);

            emailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    @Override
    public void sendPasswordResetEmail(User user, String token) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            Context context = new Context();
            context.setVariable("userName", user.getFirstName());
            context.setVariable("resetLink", frontendUrl + "/reset-password?token=" + token);

            String htmlContent = templateEngine.process("password-reset", context);

            helper.setTo(user.getEmail());
            helper.setFrom(fromEmail);
            helper.setSubject("Reset your password");
            helper.setText(htmlContent, true);

            emailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    @Override
    public void sendPurchaseConfirmationEmail(User user, Transaction transaction) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(Locale.US);
            DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("MMMM d, yyyy 'at' h:mm a");

            Context context = new Context();
            context.setVariable("userName", user.getFirstName());
            context.setVariable("transactionNumber", transaction.getTransactionNumber());
            context.setVariable("eventName", transaction.getTicket().getEvent().getName());
            context.setVariable("eventDate", transaction.getTicket().getEvent().getEventDate().format(dateFormat));
            context.setVariable("venue", transaction.getTicket().getEvent().getVenue().getName());
            context.setVariable("amount", currencyFormat.format(transaction.getAmount()));
            context.setVariable("ticketNumber", transaction.getTicket().getTicketNumber());

            String htmlContent = templateEngine.process("purchase-confirmation", context);

            helper.setTo(user.getEmail());
            helper.setFrom(fromEmail);
            helper.setSubject("Purchase Confirmation - " + transaction.getTicket().getEvent().getName());
            helper.setText(htmlContent, true);

            emailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send purchase confirmation email", e);
        }
    }

    @Override
    public void sendSaleNotificationEmail(User user, Transaction transaction) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(Locale.US);

            Context context = new Context();
            context.setVariable("userName", user.getFirstName());
            context.setVariable("eventName", transaction.getTicket().getEvent().getName());
            context.setVariable("amount", currencyFormat.format(transaction.getAmount()));
            context.setVariable("ticketNumber", transaction.getTicket().getTicketNumber());
            context.setVariable("buyerName", transaction.getBuyer().getFirstName());

            String htmlContent = templateEngine.process("sale-notification", context);

            helper.setTo(user.getEmail());
            helper.setFrom(fromEmail);
            helper.setSubject("Ticket Sold - " + transaction.getTicket().getEvent().getName());
            helper.setText(htmlContent, true);

            emailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send sale notification email", e);
        }
    }

    @Override
    public void sendWelcomeEmail(User user) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            Context context = new Context();
            context.setVariable("userName", user.getFirstName());
            context.setVariable("dashboardLink", frontendUrl + "/dashboard");

            String htmlContent = templateEngine.process("welcome", context);

            helper.setTo(user.getEmail());
            helper.setFrom(fromEmail);
            helper.setSubject("Welcome to Ticketing App!");
            helper.setText(htmlContent, true);

            emailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send welcome email", e);
        }
    }

    @Override
    public void sendTicketTransferEmail(User fromUser, User toUser, String ticketNumber) {
        // Implementation for ticket transfer notifications
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            Context context = new Context();
            context.setVariable("fromUserName", fromUser.getFirstName() + " " + fromUser.getLastName());
            context.setVariable("toUserName", toUser.getFirstName());
            context.setVariable("ticketNumber", ticketNumber);

            String htmlContent = templateEngine.process("ticket-transfer", context);

            helper.setTo(toUser.getEmail());
            helper.setFrom(fromEmail);
            helper.setSubject("Ticket Transfer Notification");
            helper.setText(htmlContent, true);

            emailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send ticket transfer email", e);
        }
    }
}