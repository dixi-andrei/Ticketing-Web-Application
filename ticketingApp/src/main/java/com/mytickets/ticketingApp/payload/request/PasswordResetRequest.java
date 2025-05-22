package com.mytickets.ticketingApp.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PasswordResetRequest {
    @NotBlank(message = "Token is required")
    private String token;

    @NotBlank(message = "New password is required")
    @Size(min = 6, max = 40, message = "Password must be between 6 and 40 characters")
    private String newPassword;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    public boolean passwordsMatch() {
        return newPassword != null && newPassword.equals(confirmPassword);
    }
}