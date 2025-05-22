import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import EmailNotificationInfo from '../common/EmailNotificationInfo';

const PurchaseConfirmation = ({ purchaseDetails, onClose, userEmail }) => {
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

                {/* Email notification info */}
                <EmailNotificationInfo type="purchase" userEmail={userEmail} />

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
                        <strong>Payment Method:</strong> {purchaseDetails.paymentMethod}
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