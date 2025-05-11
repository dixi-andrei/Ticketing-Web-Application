package com.mytickets.ticketingApp.aspect;

import com.mytickets.ticketingApp.security.services.UserDetailsImpl;
import com.mytickets.ticketingApp.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.util.Arrays;

@Aspect
@Component
public class AuditLogAspect {

    @Autowired
    private AuditService auditService;

    // Log ticket purchase operations
    @AfterReturning(
            pointcut = "execution(* com.mytickets.ticketingApp.service.impl.TicketServiceImpl.purchaseTicket(..))",
            returning = "result")
    public void logTicketPurchase(JoinPoint joinPoint, Object result) {
        Object[] args = joinPoint.getArgs();
        Long ticketId = (Long) args[0];
        Long buyerId = (Long) args[1];

        String actionDetails = "Ticket ID: " + ticketId + " purchased by User ID: " + buyerId;
        createAuditLog("TICKET_PURCHASE", actionDetails, "Ticket", ticketId, buyerId);
    }

    // Log ticket resale operations
    @AfterReturning(
            pointcut = "execution(* com.mytickets.ticketingApp.service.impl.TicketListingServiceImpl.purchaseListing(..))",
            returning = "result")
    public void logTicketResale(JoinPoint joinPoint, Object result) {
        Object[] args = joinPoint.getArgs();
        Long listingId = (Long) args[0];
        Long buyerId = (Long) args[1];

        String actionDetails = "Listing ID: " + listingId + " purchased by User ID: " + buyerId;
        createAuditLog("TICKET_RESALE", actionDetails, "TicketListing", listingId, buyerId);
    }

    // Log payment operations
    @AfterReturning(
            pointcut = "execution(* com.mytickets.ticketingApp.service.impl.TransactionServiceImpl.processPayment(..))",
            returning = "result")
    public void logPaymentProcess(JoinPoint joinPoint, Object result) {
        Object[] args = joinPoint.getArgs();
        Long transactionId = (Long) args[0];
        String paymentMethod = (String) args[1];

        String actionDetails = "Transaction ID: " + transactionId + " processed with payment method: " + paymentMethod;
        createAuditLog("PAYMENT_PROCESS", actionDetails, "Transaction", transactionId, getCurrentUserId());
    }

    // Log refund operations
    @AfterReturning(
            pointcut = "execution(* com.mytickets.ticketingApp.service.impl.TransactionServiceImpl.refundTransaction(..))",
            returning = "result")
    public void logRefundProcess(JoinPoint joinPoint, Object result) {
        Object[] args = joinPoint.getArgs();
        Long transactionId = (Long) args[0];
        String reason = (String) args[1];

        String actionDetails = "Transaction ID: " + transactionId + " refunded. Reason: " + reason;
        createAuditLog("TRANSACTION_REFUND", actionDetails, "Transaction", transactionId, getCurrentUserId());
    }

    // Log event creation
    @AfterReturning(
            pointcut = "execution(* com.mytickets.ticketingApp.service.impl.EventServiceImpl.createEvent(..))",
            returning = "result")
    public void logEventCreation(JoinPoint joinPoint, Object result) {
        Object[] args = joinPoint.getArgs();
        Long creatorId = (Long) args[1];

        Long eventId = ((com.mytickets.ticketingApp.model.Event) result).getId();
        String eventName = ((com.mytickets.ticketingApp.model.Event) result).getName();

        String actionDetails = "Event created: " + eventName;
        createAuditLog("EVENT_CREATION", actionDetails, "Event", eventId, creatorId);
    }

    // Log venue creation
    @AfterReturning(
            pointcut = "execution(* com.mytickets.ticketingApp.service.impl.VenueServiceImpl.createVenue(..))",
            returning = "result")
    public void logVenueCreation(JoinPoint joinPoint, Object result) {
        Long venueId = ((com.mytickets.ticketingApp.model.Venue) result).getId();
        String venueName = ((com.mytickets.ticketingApp.model.Venue) result).getName();

        String actionDetails = "Venue created: " + venueName;
        createAuditLog("VENUE_CREATION", actionDetails, "Venue", venueId, getCurrentUserId());
    }

    // Log user registration
    @AfterReturning(
            pointcut = "execution(* com.mytickets.ticketingApp.controller.AuthController.registerUser(..))",
            returning = "result")
    public void logUserRegistration(JoinPoint joinPoint, Object result) {
        Object[] args = joinPoint.getArgs();
        String email = ((com.mytickets.ticketingApp.payload.request.SignupRequest) args[0]).getEmail();

        String actionDetails = "User registered with email: " + email;
        createAuditLog("USER_REGISTRATION", actionDetails, "User", null, null);
    }

    // Helper method to create audit log
    private void createAuditLog(String action, String details, String entityType, Long entityId, Long userId) {
        try {
            Long currentUserId = userId != null ? userId : getCurrentUserId();
            String userEmail = getCurrentUserEmail();

            HttpServletRequest request = getRequest();
            String ipAddress = request != null ? getClientIp(request) : null;
            String userAgent = request != null ? request.getHeader("User-Agent") : null;

            auditService.createLog(action, details, entityType, entityId, currentUserId, userEmail, ipAddress, userAgent);
        } catch (Exception e) {
            // Log but don't disrupt the main operation
            System.err.println("Error creating audit log: " + e.getMessage());
        }
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        return null;
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) authentication.getPrincipal()).getEmail();
        } else if (authentication != null) {
            return authentication.getName();
        }
        return "anonymous";
    }

    private HttpServletRequest getRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || "unknown".equalsIgnoreCase(xfHeader)) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}