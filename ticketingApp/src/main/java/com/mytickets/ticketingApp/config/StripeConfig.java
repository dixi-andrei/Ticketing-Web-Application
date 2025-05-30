package com.mytickets.ticketingApp.config;

import com.stripe.Stripe;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class StripeConfig {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {

        Stripe.apiKey = "sk_test_51RUV4CQKzJAWuSVZS7I8Wz03CNnh0aLz4rzyRLLAS6KcTKQRQEWxy5JBZsNuI2ancA8V6E66VN2WuzLbj9koRNmd00LKfbbrId";
        System.out.println("Stripe initialized with secret key: " + Stripe.apiKey.substring(0, 10) + "...");
    }
}