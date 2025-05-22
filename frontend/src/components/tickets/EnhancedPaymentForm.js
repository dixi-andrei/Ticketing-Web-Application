// frontend/src/components/tickets/EnhancedPaymentForm.js
import React, { useState, useEffect } from 'react';
import { Form, Row, Col, InputGroup, Button, Alert, Card } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { getCurrentBalance } from '../../api/userBalanceApi';

const EnhancedPaymentForm = ({ amount, onPaymentComplete, onCancel, ticketDetails }) => {
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'balance'
    const [userBalance, setUserBalance] = useState(0);
    const [canPayWithBalance, setCanPayWithBalance] = useState(false);
    const [balanceLoading, setBalanceLoading] = useState(true);

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

    const validationSchema = Yup.object().shape({
        cardName: Yup.string().when('paymentMethod', {
            is: 'card',
            then: () => Yup.string().required('Name on card is required'),
            otherwise: () => Yup.string()
        }),
        cardNumber: Yup.string().when('paymentMethod', {
            is: 'card',
            then: () => Yup.string()
                .required('Card number is required')
                .matches(/^[0-9]{16}$/, 'Card number must be 16 digits'),
            otherwise: () => Yup.string()
        }),
        expiryMonth: Yup.string().when('paymentMethod', {
            is: 'card',
            then: () => Yup.string()
                .required('Required')
                .matches(/^(0[1-9]|1[0-2])$/, 'Month must be between 01-12'),
            otherwise: () => Yup.string()
        }),
        expiryYear: Yup.string().when('paymentMethod', {
            is: 'card',
            then: () => Yup.string()
                .required('Required')
                .matches(/^[0-9]{2}$/, 'Year must be 2 digits'),
            otherwise: () => Yup.string()
        }),
        cvv: Yup.string().when('paymentMethod', {
            is: 'card',
            then: () => Yup.string()
                .required('CVV is required')
                .matches(/^[0-9]{3,4}$/, 'CVV must be 3 or 4 digits'),
            otherwise: () => Yup.string()
        }),
        billingAddress: Yup.string().when('paymentMethod', {
            is: 'card',
            then: () => Yup.string().required('Billing address is required'),
            otherwise: () => Yup.string()
        }),
        city: Yup.string().when('paymentMethod', {
            is: 'card',
            then: () => Yup.string().required('City is required'),
            otherwise: () => Yup.string()
        }),
        state: Yup.string().when('paymentMethod', {
            is: 'card',
            then: () => Yup.string().required('State is required'),
            otherwise: () => Yup.string()
        }),
        zipCode: Yup.string().when('paymentMethod', {
            is: 'card',
            then: () => Yup.string()
                .required('Zip code is required')
                .matches(/^[0-9]{5}(-[0-9]{4})?$/, 'Invalid zip code format'),
            otherwise: () => Yup.string()
        })
    });

    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        try {
            setProcessing(true);

            if (paymentMethod === 'balance') {
                // Process balance payment
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

                onPaymentComplete({
                    paymentMethod: 'balance',
                    balanceUsed: amount,
                    paymentId: `balance_${Math.random().toString(36).substring(2, 15)}`,
                    newBalance: userBalance - amount
                });
            } else {
                // Process card payment
                await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

                onPaymentComplete({
                    paymentMethod: 'credit_card',
                    lastFour: values.cardNumber.slice(-4),
                    paymentId: `pi_${Math.random().toString(36).substring(2, 15)}`,
                    billingInfo: {
                        name: values.cardName,
                        address: values.billingAddress,
                        city: values.city,
                        state: values.state,
                        zipCode: values.zipCode
                    }
                });
            }

            setProcessing(false);
            setSubmitting(false);
        } catch (error) {
            setProcessing(false);
            setSubmitting(false);
            setErrors({ submit: 'Payment processing failed. Please try again.' });
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
        <Formik
            initialValues={{
                paymentMethod: paymentMethod,
                cardName: '',
                cardNumber: '',
                expiryMonth: '',
                expiryYear: '',
                cvv: '',
                billingAddress: '',
                city: '',
                state: '',
                zipCode: ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  setFieldValue,
                  isSubmitting
              }) => (
                <Form onSubmit={handleSubmit}>
                    <h5 className="mb-3">Payment Method</h5>

                    {errors.submit && (
                        <Alert variant="danger">{errors.submit}</Alert>
                    )}

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
                                            setFieldValue('paymentMethod', 'balance');
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
                                                        setFieldValue('paymentMethod', 'balance');
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
                                    onClick={() => {
                                        setPaymentMethod('card');
                                        setFieldValue('paymentMethod', 'card');
                                    }}
                                >
                                    <Card.Body className="text-center">
                                        <div className="mb-2">
                                            <Form.Check
                                                type="radio"
                                                name="paymentMethod"
                                                value="card"
                                                checked={paymentMethod === 'card'}
                                                onChange={() => {
                                                    setPaymentMethod('card');
                                                    setFieldValue('paymentMethod', 'card');
                                                }}
                                                className="d-inline-block"
                                            />
                                        </div>
                                        <div className="fs-1 mb-2">💳</div>
                                        <h6>Credit Card</h6>
                                        <p className="mb-2">
                                            Pay with Visa, Mastercard, or American Express
                                        </p>
                                        <small className="text-primary">
                                            ✓ Always available
                                        </small>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </div>

                    {/* Balance Payment Details */}
                    {paymentMethod === 'balance' && (
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
                    )}

                    {/* Credit Card Payment Form */}
                    {paymentMethod === 'card' && (
                        <>
                            <h6 className="mb-3">💳 Credit Card Details</h6>

                            <Form.Group className="mb-3">
                                <Form.Label>Name on Card</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="cardName"
                                    value={values.cardName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.cardName && errors.cardName}
                                    placeholder="John Smith"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.cardName}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Card Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="cardNumber"
                                    value={values.cardNumber}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.cardNumber && errors.cardNumber}
                                    placeholder="1234 5678 9012 3456"
                                    maxLength={16}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.cardNumber}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Row className="mb-3">
                                <Col md={8}>
                                    <Form.Label>Expiration Date</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            name="expiryMonth"
                                            value={values.expiryMonth}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={touched.expiryMonth && errors.expiryMonth}
                                            placeholder="MM"
                                            maxLength={2}
                                        />
                                        <InputGroup.Text>/</InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            name="expiryYear"
                                            value={values.expiryYear}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={touched.expiryYear && errors.expiryYear}
                                            placeholder="YY"
                                            maxLength={2}
                                        />
                                    </InputGroup>
                                    {(touched.expiryMonth && errors.expiryMonth) || (touched.expiryYear && errors.expiryYear) ? (
                                        <div className="invalid-feedback d-block">
                                            {errors.expiryMonth || errors.expiryYear}
                                        </div>
                                    ) : null}
                                </Col>

                                <Col md={4}>
                                    <Form.Label>CVV</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="cvv"
                                        value={values.cvv}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={touched.cvv && errors.cvv}
                                        placeholder="123"
                                        maxLength={4}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.cvv}
                                    </Form.Control.Feedback>
                                </Col>
                            </Row>

                            <h6 className="mb-3 mt-4">🏠 Billing Information</h6>

                            <Form.Group className="mb-3">
                                <Form.Label>Address</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="billingAddress"
                                    value={values.billingAddress}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.billingAddress && errors.billingAddress}
                                    placeholder="123 Main St"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.billingAddress}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Label>City</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="city"
                                        value={values.city}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={touched.city && errors.city}
                                        placeholder="New York"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.city}
                                    </Form.Control.Feedback>
                                </Col>

                                <Col md={3}>
                                    <Form.Label>State</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="state"
                                        value={values.state}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={touched.state && errors.state}
                                        placeholder="NY"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.state}
                                    </Form.Control.Feedback>
                                </Col>

                                <Col md={3}>
                                    <Form.Label>Zip Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="zipCode"
                                        value={values.zipCode}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={touched.zipCode && errors.zipCode}
                                        placeholder="10001"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.zipCode}
                                    </Form.Control.Feedback>
                                </Col>
                            </Row>
                        </>
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

                    {/* Action Buttons */}
                    <div className="d-flex justify-content-between mt-4">
                        <Button
                            variant="secondary"
                            onClick={onCancel}
                            disabled={processing || isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={processing || isSubmitting}
                            size="lg"
                        >
                            {processing ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    {paymentMethod === 'balance' ? 'Processing...' : 'Processing Payment...'}
                                </>
                            ) : (
                                <>
                                    {paymentMethod === 'balance' ? '💰 Pay with Balance' : '💳 Complete Purchase'}
                                    {' '}
                                    ({paymentMethod === 'card' ? formatCurrency(amount * 1.029) : formatCurrency(amount)})
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Security Notice */}
                    <div className="text-center mt-3">
                        <small className="text-muted">
                            🔒 Your payment information is secure and encrypted
                            {paymentMethod === 'balance' && ' • Balance transactions are instant and free'}
                        </small>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default EnhancedPaymentForm;