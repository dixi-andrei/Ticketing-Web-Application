package com.mytickets.ticketingApp.service;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;

public interface StripeService {
    PaymentIntent createPaymentIntent(Double amount, String currency, String description) throws StripeException;
    PaymentIntent confirmPaymentIntent(String paymentIntentId) throws StripeException;
    Refund createRefund(String paymentIntentId, Double amount) throws StripeException;
    PaymentIntent retrievePaymentIntent(String paymentIntentId) throws StripeException;
}