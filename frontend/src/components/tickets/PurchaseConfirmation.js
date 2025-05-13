// src/components/tickets/PurchaseConfirmation.js
import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const PurchaseConfirmation = ({ purchaseDetails, onClose }) => {
    return (
        <div className="text-center">
            <div className="py-4">
                <div className="mb-4">
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                </div>

                <Alert variant="success">
                    <Alert.Heading>Purchase Successful!</Alert.Heading>
                    <p>
                        Thank you for your purchase. Your ticket(s) have been added to your account.
                    </p>
                </Alert>

                <div className="mt-4 mb-3">
                    <h5>Purchase Details</h5>
                    <p className="mb-1">
                        <strong>Transaction #:</strong> {purchaseDetails.transactionId || 'TRX-' + Math.random().toString(36).substr(2, 9)}
                    </p>
                    <p className="mb-1">
                        <strong>Event:</strong> {purchaseDetails.eventName}
                    </p>
                    <p className="mb-1">
                        <strong>Quantity:</strong> {purchaseDetails.quantity} {purchaseDetails.quantity > 1 ? 'tickets' : 'ticket'}
                    </p>
                    <p className="mb-1">
                        <strong>Total Paid:</strong> ${purchaseDetails.totalAmount.toFixed(2)}
                    </p>
                    <p className="mb-1">
                        <strong>Payment Method:</strong> Credit Card ending in {purchaseDetails.lastFour}
                    </p>
                </div>

                <div className="d-flex justify-content-center mt-4">
                    <Button as={Link} to="/dashboard" className="me-2">
                        View My Tickets
                    </Button>
                    <Button variant="outline-primary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseConfirmation;