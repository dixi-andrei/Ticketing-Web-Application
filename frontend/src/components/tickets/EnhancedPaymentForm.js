// frontend/src/components/tickets/EnhancedPaymentForm.js - UPDATED WITH STRIPE
import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Alert, Card } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getCurrentBalance } from '../../api/userBalanceApi';

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_51RUV4CQKzJAWuSVZP4QE2rpfQaLxSkU6qjfbMoOnwczZcvxT6SplOwGNchG0CeARjHumLJTypW2SqxzbkdamHkJ700EzG59Cf3');

const StripeCardForm = ({ amount, onPaymentComplete, onCancel, currentTransaction }) => {
    // Add this check at the beginning
    if (!currentTransaction) {
        return (
            <Alert variant="danger">
                Transaction not found. Please try again.
                <Button variant="link" onClick={onCancel}>Go back</Button>
            </Alert>
        );
    }

    // Add this check for paymentIntentId
    if (!currentTransaction.paymentIntentId) {
        return (
            <Alert variant="danger">
                Payment setup incomplete. Please try again.
                <Button variant="link" onClick={onCancel}>Go back</Button>
            </Alert>
        );
    }
}
const StripePaymentForm = ({ amount, onPaymentComplete, onCancel, currentTransaction }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleStripePayment = async () => {
        if (!stripe || !elements) {
            setError('Stripe has not loaded yet. Please try again.');
            return;
        }

        // Get the CardElement from elements
        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            setError('Card element not found. Please refresh and try again.');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            // Use the client secret directly from the transaction
            const clientSecret = currentTransaction.paymentIntentId;

            // Verify it's a client secret (should start with 'pi_' and contain '_secret_')
            if (!clientSecret || !clientSecret.includes('_secret_')) {
                throw new Error('Invalid payment setup. Please try again.');
            }

            console.log('Using client secret:', clientSecret); // Debug log

            // Confirm the payment with Stripe using the client secret
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                }
            });

            if (stripeError) {
                setError(stripeError.message);
                setProcessing(false);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                // Confirm payment with your backend using the PaymentIntent ID (not client secret)
                const confirmResponse = await fetch(`/api/transactions/${currentTransaction.id}/confirm-stripe-payment`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!confirmResponse.ok) {
                    throw new Error('Failed to confirm payment with server');
                }

                onPaymentComplete({
                    paymentMethod: 'credit_card',
                    paymentId: paymentIntent.id,
                    lastFour: paymentIntent.payment_method?.card?.last4 || '****'
                });
            }

            setProcessing(false);
        } catch (err) {
            console.error('Payment error:', err); // Debug log
            setError(err.message || 'Payment failed. Please try again.');
            setProcessing(false);
        }
    };

    return (
        <div>
            <h6 className="mb-3">💳 Credit Card Payment</h6>

            {error && <Alert variant="danger">{error}</Alert>}

            <div className="mb-3 p-3 border rounded">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                        },
                    }}
                />
            </div>

            <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={onCancel} disabled={processing}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleStripePayment}
                    disabled={!stripe || processing}
                >
                    {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
                </Button>
            </div>
        </div>
    );
};

const EnhancedPaymentForm = ({ amount, onPaymentComplete, onCancel, ticketDetails, currentTransaction }) => {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [userBalance, setUserBalance] = useState(0);
    const [canPayWithBalance, setCanPayWithBalance] = useState(false);
    const [balanceLoading, setBalanceLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Fetch user balance on component mount
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                setBalanceLoading(true);
                const response = await getCurrentBalance();
                const balance = response.data?.balance || 0;
                setUserBalance(balance);
                setCanPayWithBalance(balance >= amount);

                // If user has sufficient balance, default to balance payment
                if (balance >= amount) {
                    setPaymentMethod('balance');
                }
            } catch (error) {
                console.error('Error fetching balance:', error);
                setUserBalance(0);
                setCanPayWithBalance(false);
            } finally {
                setBalanceLoading(false);
            }
        };

        fetchBalance();
    }, [amount]);

    const handleBalancePayment = async () => {
        setProcessing(true);
        try {
            const response = await fetch(`/api/transactions/${currentTransaction.id}/pay-with-balance`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Balance payment failed');
            }

            const newBalance = userBalance - amount;
            onPaymentComplete({
                paymentMethod: 'balance',
                balanceUsed: amount,
                paymentId: `balance_${Math.random().toString(36).substring(2, 15)}`,
                newBalance: newBalance
            });
        } catch (error) {
            alert('Balance payment failed: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    if (balanceLoading) {
        return (
            <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading payment options...</span>
                </div>
                <p className="mt-2">Loading payment options...</p>
            </div>
        );
    }

    return (
        <div>
            <h5 className="mb-3">Payment Method</h5>

            {/* Payment Method Selection */}
            <div className="mb-4">
                <Row>
                    {/* Balance Payment Option */}
                    <Col md={6}>
                        <Card
                            className={`payment-method-card ${paymentMethod === 'balance' ? 'border-success' : ''}`}
                            style={{
                                cursor: canPayWithBalance ? 'pointer' : 'not-allowed',
                                opacity: canPayWithBalance ? 1 : 0.6
                            }}
                            onClick={() => {
                                if (canPayWithBalance) {
                                    setPaymentMethod('balance');
                                }
                            }}
                        >
                            <Card.Body className="text-center">
                                <div className="mb-2">
                                    <Form.Check
                                        type="radio"
                                        name="paymentMethod"
                                        value="balance"
                                        checked={paymentMethod === 'balance'}
                                        onChange={() => {
                                            if (canPayWithBalance) {
                                                setPaymentMethod('balance');
                                            }
                                        }}
                                        disabled={!canPayWithBalance}
                                        className="d-inline-block"
                                    />
                                </div>
                                <div className="fs-1 mb-2">💰</div>
                                <h6>Account Balance</h6>
                                <p className="mb-2">
                                    <strong>Available: {formatCurrency(userBalance)}</strong>
                                </p>
                                {canPayWithBalance ? (
                                    <small className="text-success">
                                        ✓ Sufficient funds available
                                    </small>
                                ) : (
                                    <small className="text-danger">
                                        ✗ Insufficient funds (need {formatCurrency(amount - userBalance)} more)
                                    </small>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Credit Card Payment Option */}
                    <Col md={6}>
                        <Card
                            className={`payment-method-card ${paymentMethod === 'card' ? 'border-primary' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setPaymentMethod('card')}
                        >
                            <Card.Body className="text-center">
                                <div className="mb-2">
                                    <Form.Check
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        checked={paymentMethod === 'card'}
                                        onChange={() => setPaymentMethod('card')}
                                        className="d-inline-block"
                                    />
                                </div>
                                <div className="fs-1 mb-2">💳</div>
                                <h6>Credit Card</h6>
                                <p className="mb-2">
                                    Secure payment with Stripe
                                </p>
                                <small className="text-primary">
                                    ✓ Visa, Mastercard, American Express
                                </small>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Balance Payment Details */}
            {paymentMethod === 'balance' && (
                <div>
                    <Alert variant="success">
                        <h6 className="mb-2">💰 Paying with Account Balance</h6>
                        <Row>
                            <Col>
                                <p className="mb-1"><strong>Total Amount:</strong> {formatCurrency(amount)}</p>
                                <p className="mb-1"><strong>Current Balance:</strong> {formatCurrency(userBalance)}</p>
                                <p className="mb-0"><strong>Remaining Balance:</strong> {formatCurrency(userBalance - amount)}</p>
                            </Col>
                        </Row>
                        <hr className="my-2" />
                        <small>
                            ✓ Instant payment • ✓ No processing fees • ✓ Secure transaction
                        </small>
                    </Alert>

                    <div className="d-flex justify-content-between mt-4">
                        <Button variant="secondary" onClick={onCancel} disabled={processing}>
                            Cancel
                        </Button>
                        <Button
                            variant="success"
                            onClick={handleBalancePayment}
                            disabled={processing}
                            size="lg"
                        >
                            {processing ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Processing...
                                </>
                            ) : (
                                <>💰 Pay with Balance ({formatCurrency(amount)})</>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Credit Card Payment Form */}
            {paymentMethod === 'card' && (
                <Elements stripe={stripePromise}>
                    <StripePaymentForm
                        amount={amount}
                        onPaymentComplete={onPaymentComplete}
                        onCancel={onCancel}
                        currentTransaction={currentTransaction}
                    />
                </Elements>
            )}

            {/* Order Summary */}
            <Card className="mt-4 bg-light">
                <Card.Body>
                    <h6 className="mb-3">📋 Order Summary</h6>
                    {ticketDetails && (
                        <div className="mb-3">
                            <strong>{ticketDetails.eventName}</strong>
                            <br />
                            <small className="text-muted">
                                {ticketDetails.eventDate} • {ticketDetails.venue}
                            </small>
                            {ticketDetails.section && (
                                <>
                                    <br />
                                    <small className="text-muted">
                                        Section {ticketDetails.section}
                                        {ticketDetails.row && `, Row ${ticketDetails.row}`}
                                        {ticketDetails.seat && `, Seat ${ticketDetails.seat}`}
                                    </small>
                                </>
                            )}
                        </div>
                    )}
                    <div className="d-flex justify-content-between mb-2">
                        <span>Ticket Price:</span>
                        <span>{formatCurrency(amount)}</span>
                    </div>
                    {paymentMethod === 'card' && (
                        <div className="d-flex justify-content-between mb-2">
                            <span>Processing Fee:</span>
                            <span>{formatCurrency(amount * 0.029)}</span>
                        </div>
                    )}
                    <hr />
                    <div className="d-flex justify-content-between">
                        <strong>Total Amount:</strong>
                        <strong>
                            {paymentMethod === 'card'
                                ? formatCurrency(amount * 1.029)
                                : formatCurrency(amount)
                            }
                        </strong>
                    </div>
                    {paymentMethod === 'balance' && (
                        <small className="text-success mt-2 d-block">
                            ✓ No processing fees when paying with balance
                        </small>
                    )}
                </Card.Body>
            </Card>

            {/* Security Notice */}
            <div className="text-center mt-3">
                <small className="text-muted">
                    🔒 Your payment information is secure and encrypted
                    {paymentMethod === 'balance' && ' • Balance transactions are instant and free'}
                    {paymentMethod === 'card' && ' • Powered by Stripe'}
                </small>
            </div>
        </div>
    );
};

export default EnhancedPaymentForm;