import React, { useState } from 'react';
import { Form, Row, Col, InputGroup, Button, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';

const PaymentForm = ({ amount, onPaymentComplete, onCancel }) => {
    const [processing, setProcessing] = useState(false);

    const validationSchema = Yup.object().shape({
        cardName: Yup.string().required('Name on card is required'),
        cardNumber: Yup.string()
            .required('Card number is required')
            .matches(/^[0-9]{16}$/, 'Card number must be 16 digits'),
        expiryMonth: Yup.string()
            .required('Required')
            .matches(/^(0[1-9]|1[0-2])$/, 'Month must be between 01-12'),
        expiryYear: Yup.string()
            .required('Required')
            .matches(/^[0-9]{2}$/, 'Year must be 2 digits'),
        cvv: Yup.string()
            .required('CVV is required')
            .matches(/^[0-9]{3,4}$/, 'CVV must be 3 or 4 digits'),
        billingAddress: Yup.string().required('Billing address is required'),
        city: Yup.string().required('City is required'),
        state: Yup.string().required('State is required'),
        zipCode: Yup.string()
            .required('Zip code is required')
            .matches(/^[0-9]{5}(-[0-9]{4})?$/, 'Invalid zip code format')
    });

    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        try {
            setProcessing(true);

            // Simulate API call to process payment
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Payment successful
            setProcessing(false);
            setSubmitting(false);
            onPaymentComplete({
                paymentMethod: 'credit_card',
                lastFour: values.cardNumber.slice(-4),
                paymentId: `pi_${Math.random().toString(36).substring(2, 15)}`, // Mock payment ID
                billingInfo: {
                    name: values.cardName,
                    address: values.billingAddress,
                    city: values.city,
                    state: values.state,
                    zipCode: values.zipCode
                }
            });
        } catch (error) {
            setProcessing(false);
            setSubmitting(false);
            setErrors({ submit: 'Payment processing failed. Please try again.' });
        }
    };

    return (
        <Formik
            initialValues={{
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
        >
            {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  isSubmitting
              }) => (
                <Form onSubmit={handleSubmit}>
                    <h5 className="mb-3">Payment Details</h5>

                    {errors.submit && (
                        <Alert variant="danger">{errors.submit}</Alert>
                    )}

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
                                <Form.Control.Feedback type="invalid">
                                    {errors.expiryMonth || errors.expiryYear}
                                </Form.Control.Feedback>
                            </InputGroup>
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

                    <h5 className="mb-3 mt-4">Billing Information</h5>

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

                    <div className="d-flex justify-content-between mt-4">
                        <div>
                            <strong>Total Amount:</strong> ${amount.toFixed(2)}
                        </div>
                        <div>
                            <Button
                                variant="secondary"
                                className="me-2"
                                onClick={onCancel}
                                disabled={processing || isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={processing || isSubmitting}
                            >
                                {processing ? 'Processing...' : 'Complete Purchase'}
                            </Button>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default PaymentForm;