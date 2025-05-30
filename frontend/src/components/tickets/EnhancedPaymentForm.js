// frontend/src/components/tickets/EnhancedPaymentForm.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Alert, Card } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getCurrentBalance } from '../../api/userBalanceApi';
import axiosInstance from '../../api/axiosConfig'; // Import your axios instance

// Use your correct Stripe publishable key
const stripePromise = loadStripe('pk_test_51RUV4CQKzJAWuSVZP4QE2rpfQaLxSkU6qjfbMoOnwczZcvxT6SplOwGNchG0CeARjHumLJTypW2SqxzbkdamHkJ700EzG59Cf3');

const StripePaymentForm = ({ amount, onPaymentComplete, onCancel, currentTransaction }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    // Check for valid transaction
    if (!currentTransaction) {
        return (
            <Alert variant="danger">
                Transaction not found. Please try again.
                <Button variant="link" onClick={onCancel}>Go back</Button>
            </Alert>
        );
    }

    // Check for valid payment intent
    if (!currentTransaction.paymentIntentId || !currentTransaction.paymentIntentId.includes('_secret_')) {
        return (
            <Alert variant="danger">
                Payment setup incomplete. Please try again.
                <Button variant="link" onClick={onCancel}>Go back</Button>
            </Alert>
        );
    }

    const handleStripePayment = async () => {
        if (!stripe || !elements) {
            setError('Stripe has not loaded yet. Please try again.');
            return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            setError('Card element not found. Please refresh and try again.');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            const clientSecret = currentTransaction.paymentIntentId;
            console.log('Confirming payment with client secret:', clientSecret);

            // Confirm the payment with Stripe
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        // Add billing details if needed
                    }
                }
            });

            if (stripeError) {
                console.error('Stripe error:', stripeError);
                setError(stripeError.message);
                setProcessing(false);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                console.log('Payment succeeded:', paymentIntent.id);

                // FIXED: Use axiosInstance instead of fetch to ensure correct base URL
                try {
                    const confirmResponse = await axiosInstance.post(
                        `/transactions/${currentTransaction.id}/confirm-stripe-payment`
                    );

                    console.log('Backend confirmation successful:', confirmResponse.data);

                    onPaymentComplete({
                        paymentMethod: 'credit_card',
                        paymentId: paymentIntent.id,
                        lastFour: paymentIntent.payment_method?.card?.last4 || '****',
                        transactionId: confirmResponse.data.transactionId,
                        success: true // Add success flag
                    });
                } catch (backendError) {
                    console.error('Backend confirmation failed:', backendError);
                    setError('Payment succeeded but confirmation failed. Please contact support.');
                }
            } else {
                setError(`Payment was not successful. Status: ${paymentIntent.status}`);
            }

            setProcessing(false);
        } catch (err) {
            console.error('Payment error:', err);
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
                            invalid: {
                                color: '#9e2146',
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
    const [error, setError] = useState(''); // Add error state to main component

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
        setError(''); // Clear any previous errors
        try {
            // FIXED: Use axiosInstance for consistent API calls
            const response = await axiosInstance.post(
                `/transactions/${currentTransaction.id}/pay-with-balance`
            );

            console.log('Balance payment successful:', response.data);
            const newBalance = userBalance - amount;

            // Call payment completion callback with success info
            onPaymentComplete({
                paymentMethod: 'balance',
                balanceUsed: amount,
                paymentId: response.data.transactionNumber || `balance_${Math.random().toString(36).substring(2, 15)}`,
                newBalance: newBalance,
                transactionId: response.data.transactionId,
                success: true // Add success flag
            });
        } catch (error) {
            console.error('Balance payment error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Balance payment failed';
            setError('Balance payment failed: ' + errorMessage);
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

            {/* Show error if any */}
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

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