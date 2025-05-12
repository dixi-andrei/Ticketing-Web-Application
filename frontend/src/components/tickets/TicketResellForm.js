// src/components/tickets/TicketResellForm.js
import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik } from 'formik';

const TicketResellForm = ({ ticket, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const validationSchema = Yup.object().shape({
        askingPrice: Yup.number()
            .required('Price is required')
            .positive('Price must be positive')
            .max(ticket.originalPrice, `Price cannot exceed original price: $${ticket.originalPrice}`)
            .typeError('Price must be a number'),
        description: Yup.string()
            .max(250, 'Description must be less than 250 characters')
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setLoading(true);
            setError('');

            // Here you would call your API to create the listing
            // await createListing(ticket.id, values.askingPrice, values.description);

            // For demo, just simulate a delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            setLoading(false);
            setSubmitting(false);

            // Call success callback
            if (onSuccess) onSuccess();

            // Close the modal
            onClose();

            // Navigate to listings tab in dashboard
            navigate('/dashboard', { state: { activeTab: 'listings' } });

        } catch (err) {
            console.error('Error creating listing:', err);
            setError('Failed to create listing. Please try again.');
            setLoading(false);
            setSubmitting(false);
        }
    };

    return (
        <Modal show={true} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Resell Ticket</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">
                    <h6>Event: {ticket.event?.name}</h6>
                    <p className="text-muted small mb-0">
                        {new Date(ticket.event?.eventDate).toLocaleDateString(undefined, {
                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </p>
                    <p className="text-muted small">
                        Original Price: ${ticket.originalPrice.toFixed(2)}
                    </p>

                    <Alert variant="info" className="mb-3">
                        <strong>Fair Price Policy:</strong> Tickets can only be resold at or below their original purchase price.
                    </Alert>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Formik
                    initialValues={{
                        askingPrice: ticket.originalPrice,
                        description: ''
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Asking Price ($)</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    name="askingPrice"
                                    value={values.askingPrice}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.askingPrice && errors.askingPrice}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.askingPrice}
                                </Form.Control.Feedback>
                                <Form.Text className="text-muted">
                                    Maximum allowed: ${ticket.originalPrice.toFixed(2)}
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Description (Optional)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="description"
                                    value={values.description}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.description && errors.description}
                                    placeholder="Add details about your ticket"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.description}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <div className="d-flex justify-content-end">
                                <Button variant="secondary" className="me-2" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={isSubmitting || loading}
                                >
                                    {loading ? 'Creating Listing...' : 'List for Sale'}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    );
};

export default TicketResellForm;