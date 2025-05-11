package com.mytickets.ticketingApp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class TicketingAppException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public TicketingAppException(String message) {
        super(message);
    }

    public TicketingAppException(String message, Throwable cause) {
        super(message, cause);
    }
}