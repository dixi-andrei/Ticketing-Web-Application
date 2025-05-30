package com.mytickets.ticketingApp.service.impl;

import com.mytickets.ticketingApp.service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PaymentIntentConfirmParams;
import com.stripe.param.RefundCreateParams;
import org.springframework.stereotype.Service;

@Service
public class StripeServiceImpl implements StripeService {

    @Override
    public PaymentIntent createPaymentIntent(Double amount, String currency, String description) throws StripeException {
        // Stripe expects amounts in cents
        long amountInCents = Math.round(amount * 100);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(currency)
                .setDescription(description)
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .build();

        return PaymentIntent.create(params);
    }

    @Override
    public PaymentIntent confirmPaymentIntent(String paymentIntentId) throws StripeException {
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

        PaymentIntentConfirmParams params = PaymentIntentConfirmParams.builder()
                .setReturnUrl("https://your-frontend-url.com/payment-confirmation")
                .build();

        return paymentIntent.confirm(params);
    }

    @Override
    public Refund createRefund(String paymentIntentId, Double amount) throws StripeException {
        long amountInCents = Math.round(amount * 100);

        RefundCreateParams params = RefundCreateParams.builder()
                .setPaymentIntent(paymentIntentId)
                .setAmount(amountInCents)
                .build();

        return Refund.create(params);
    }

    @Override
    public PaymentIntent retrievePaymentIntent(String paymentIntentId) throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId);
    }
}