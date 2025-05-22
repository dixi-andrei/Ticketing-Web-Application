import React from 'react';
import { Alert } from 'react-bootstrap';

const EmailNotificationInfo = ({ type, userEmail }) => {
    const getNotificationText = () => {
        switch (type) {
            case 'purchase':
                return 'A purchase confirmation email has been sent to your email address with your ticket details.';
            case 'sale':
                return 'A sale notification email has been sent to confirm your ticket sale.';
            case 'verification':
                return 'A verification email has been sent. Please check your inbox and follow the instructions.';
            case 'password_reset':
                return 'If an account with that email exists, a password reset link has been sent.';
            default:
                return 'An email notification has been sent to your email address.';
        }
    };

    return (
        <Alert variant="info" className="d-flex align-items-center">
            <i className="bi bi-envelope-check me-2"></i>
            <div>
                <strong>Email Sent!</strong>
                <p className="mb-0 mt-1">{getNotificationText()}</p>
                {userEmail && (
                    <small className="text-muted">Sent to: {userEmail}</small>
                )}
            </div>
        </Alert>
    );
};

export default EmailNotificationInfo;
