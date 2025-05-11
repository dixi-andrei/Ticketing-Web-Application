package com.mytickets.ticketingApp.util;

import com.mytickets.ticketingApp.exception.TicketingAppException;

import java.time.LocalDateTime;

public class ValidationUtils {

    private ValidationUtils() {
        // Private constructor to prevent instantiation
    }

    public static void validateNotNull(Object obj, String fieldName) {
        if (obj == null) {
            throw new TicketingAppException(fieldName + " cannot be null");
        }
    }

    public static void validateNotEmpty(String str, String fieldName) {
        if (StringUtils.isEmpty(str)) {
            throw new TicketingAppException(fieldName + " cannot be empty");
        }
    }

    public static void validateFutureDate(LocalDateTime date, String fieldName) {
        validateNotNull(date, fieldName);

        if (date.isBefore(LocalDateTime.now())) {
            throw new TicketingAppException(fieldName + " must be in the future");
        }
    }

    public static void validatePositive(Number number, String fieldName) {
        validateNotNull(number, fieldName);

        if (number.doubleValue() <= 0) {
            throw new TicketingAppException(fieldName + " must be positive");
        }
    }

    public static void validateNonNegative(Number number, String fieldName) {
        validateNotNull(number, fieldName);

        if (number.doubleValue() < 0) {
            throw new TicketingAppException(fieldName + " cannot be negative");
        }
    }

    public static void validateMaxLength(String str, int maxLength, String fieldName) {
        if (str != null && str.length() > maxLength) {
            throw new TicketingAppException(fieldName + " cannot exceed " + maxLength + " characters");
        }
    }

    public static void validateMinLength(String str, int minLength, String fieldName) {
        if (str != null && str.length() < minLength) {
            throw new TicketingAppException(fieldName + " must be at least " + minLength + " characters");
        }
    }

    public static void validateEmail(String email) {
        validateNotEmpty(email, "Email");

        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
        if (!email.matches(emailRegex)) {
            throw new TicketingAppException("Invalid email format");
        }
    }

    public static void validatePassword(String password) {
        validateNotEmpty(password, "Password");
        validateMinLength(password, 6, "Password");

        if (!password.matches(".*[A-Z].*")) {
            throw new TicketingAppException("Password must contain at least one uppercase letter");
        }

        if (!password.matches(".*[a-z].*")) {
            throw new TicketingAppException("Password must contain at least one lowercase letter");
        }

        if (!password.matches(".*\\d.*")) {
            throw new TicketingAppException("Password must contain at least one digit");
        }
    }
}