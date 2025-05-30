package com.mytickets.ticketingApp.controller;

import com.mytickets.ticketingApp.service.StripeService;
import com.stripe.model.PaymentIntent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class StripeTestController {

    @Autowired
    private StripeService stripeService;

    @PostMapping("/stripe")
    public ResponseEntity<?> testStripe() {
        try {
            PaymentIntent paymentIntent = stripeService.createPaymentIntent(10.0, "usd", "Test payment");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("clientSecret", paymentIntent.getClientSecret());
            response.put("paymentIntentId", paymentIntent.getId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}