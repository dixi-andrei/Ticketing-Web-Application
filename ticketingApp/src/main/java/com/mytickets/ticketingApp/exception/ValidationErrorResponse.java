package com.mytickets.ticketingApp.exception;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
public class ValidationErrorResponse extends ErrorResponse {
    private Map<String, String> errors;

    public ValidationErrorResponse(int status, LocalDateTime timestamp, String message, String details, Map<String, String> errors) {
        super(status, timestamp, message, details);
        this.errors = errors;
    }

    public ValidationErrorResponse(Map<String, String> errors) {
        this.errors = errors;
    }


}