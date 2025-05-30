package com.mytickets.ticketingApp.controller;

import com.mytickets.ticketingApp.service.TransactionService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stripe")
public class StripeWebhookController {

    @Autowired
    private TransactionService transactionService;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            // Invalid signature
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        // Handle the event
        switch (event.getType()) {
            case "payment_intent.succeeded":
                PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
                if (paymentIntent != null) {
                    handlePaymentIntentSucceeded(paymentIntent);
                }
                break;
            case "payment_intent.payment_failed":
                PaymentIntent failedPaymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
                if (failedPaymentIntent != null) {
                    handlePaymentIntentFailed(failedPaymentIntent);
                }
                break;
            default:
                System.out.println("Unhandled event type: " + event.getType());
        }

        return ResponseEntity.ok("Success");
    }

    private void handlePaymentIntentSucceeded(PaymentIntent paymentIntent) {
        try {
            // Find transaction by payment intent ID
            String paymentIntentId = paymentIntent.getId();
            // You'll need to add a method to find transaction by payment intent ID
            // transactionService.updateTransactionByPaymentIntentId(paymentIntentId, TransactionStatus.COMPLETED);
            System.out.println("Payment succeeded for PaymentIntent: " + paymentIntentId);
        } catch (Exception e) {
            System.err.println("Error handling payment success: " + e.getMessage());
        }
    }

    private void handlePaymentIntentFailed(PaymentIntent paymentIntent) {
        try {
            // Find transaction by payment intent ID and mark as failed
            String paymentIntentId = paymentIntent.getId();
            // You'll need to add a method to find transaction by payment intent ID
            // transactionService.updateTransactionByPaymentIntentId(paymentIntentId, TransactionStatus.FAILED);
            System.out.println("Payment failed for PaymentIntent: " + paymentIntentId);
        } catch (Exception e) {
            System.err.println("Error handling payment failure: " + e.getMessage());
        }
    }
}