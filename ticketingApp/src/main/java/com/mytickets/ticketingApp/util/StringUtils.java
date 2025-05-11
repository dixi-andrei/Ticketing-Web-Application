package com.mytickets.ticketingApp.util;

import java.util.UUID;

public class StringUtils {

    private StringUtils() {
        // Private constructor to prevent instantiation
    }

    public static boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    public static boolean isNotEmpty(String str) {
        return !isEmpty(str);
    }

    public static String generateUniqueId() {
        return UUID.randomUUID().toString();
    }

    public static String generateShortUniqueId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    public static String generateTicketNumber() {
        return "TKT-" + System.currentTimeMillis() + "-" + generateShortUniqueId();
    }

    public static String generateTransactionNumber() {
        return "TRX-" + System.currentTimeMillis() + "-" + generateShortUniqueId();
    }

    public static String truncate(String str, int maxLength) {
        if (str == null) {
            return null;
        }

        if (str.length() <= maxLength) {
            return str;
        }

        return str.substring(0, maxLength) + "...";
    }

    public static String capitalize(String str) {
        if (isEmpty(str)) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    public static String formatName(String firstName, String lastName) {
        StringBuilder sb = new StringBuilder();

        if (isNotEmpty(firstName)) {
            sb.append(firstName.trim());
        }

        if (isNotEmpty(lastName)) {
            if (sb.length() > 0) {
                sb.append(" ");
            }
            sb.append(lastName.trim());
        }

        return sb.toString();
    }
}