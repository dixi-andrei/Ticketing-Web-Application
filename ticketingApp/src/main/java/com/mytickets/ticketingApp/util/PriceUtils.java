package com.mytickets.ticketingApp.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.util.Currency;
import java.util.Locale;

public class PriceUtils {

    private PriceUtils() {
        // Private constructor to prevent instantiation
    }

    public static BigDecimal roundPrice(BigDecimal price) {
        return price.setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal roundPrice(Double price) {
        return roundPrice(BigDecimal.valueOf(price));
    }

    public static String formatPrice(BigDecimal price) {
        return formatPrice(price, Locale.US);
    }

    public static String formatPrice(BigDecimal price, Locale locale) {
        NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(locale);
        return currencyFormatter.format(price);
    }

    public static String formatPrice(Double price) {
        return formatPrice(BigDecimal.valueOf(price));
    }

    public static String formatPrice(Double price, Locale locale) {
        return formatPrice(BigDecimal.valueOf(price), locale);
    }

    public static BigDecimal calculateTax(BigDecimal price, BigDecimal taxRate) {
        return price.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal calculateTax(Double price, Double taxRate) {
        return calculateTax(BigDecimal.valueOf(price), BigDecimal.valueOf(taxRate));
    }

    public static BigDecimal calculateTotal(BigDecimal price, BigDecimal taxAmount) {
        return price.add(taxAmount).setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal calculateTotal(Double price, Double taxAmount) {
        return calculateTotal(BigDecimal.valueOf(price), BigDecimal.valueOf(taxAmount));
    }

    public static BigDecimal calculateServiceFee(BigDecimal price, BigDecimal feeRate) {
        return price.multiply(feeRate).setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal calculateServiceFee(Double price, Double feeRate) {
        return calculateServiceFee(BigDecimal.valueOf(price), BigDecimal.valueOf(feeRate));
    }
}