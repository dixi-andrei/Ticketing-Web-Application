// frontend/src/components/admin/PricingTierModal.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Table, Badge } from 'react-bootstrap';
import axiosInstance from '../../api/axiosConfig';

const PricingTierModal = ({ show, onHide, event, onSuccess }) => {
    const [pricingTiers, setPricingTiers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingTier, setEditingTier] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        quantity: '',
        sectionId: ''
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (show && event?.id) {
            fetchPricingTiers();
        }
    }, [show, event]);

    const fetchPricingTiers = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axiosInstance.get(`/pricing-tiers/event/${event.id}`);
            setPricingTiers(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Error fetching pricing tiers:', err);
            setError('Failed to load pricing tiers');
            setPricingTiers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear field-specific errors when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = 'Tier name is required';
        }

        if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
            errors.price = 'Valid price is required';
        }

        if (!formData.quantity || isNaN(parseInt(formData.quantity)) || parseInt(formData.quantity) <= 0) {
            errors.quantity = 'Valid quantity is required';
        }

        return errors;
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            quantity: '',
            sectionId: ''
        });
        setEditingTier(null);
        setShowAddForm(false);
        setError('');
        setFormErrors({});
    };

    const handleAddNew = () => {
        resetForm();
        setShowAddForm(true);
    };

    const handleEdit = (tier) => {
        setFormData({
            name: tier.name || '',
            description: tier.description || '',
            price: tier.price ? tier.price.toString() : '',
            quantity: tier.quantity ? tier.quantity.toString() : '',
            sectionId: tier.sectionId || ''
        });
        setEditingTier(tier);
        setShowAddForm(true);
        setError('');
        setFormErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            // Prepare the data according to your PricingTierRequest structure
            const submitData = {
                name: formData.name.trim(),
                description: formData.description.trim() || null,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity),
                sectionId: formData.sectionId.trim() || null,
                eventId: event.id // Make sure to include eventId
            };

            console.log('Submitting pricing tier data:', submitData); // Debug log

            let response;
            if (editingTier) {
                response = await axiosInstance.put(`/pricing-tiers/${editingTier.id}`, submitData);
            } else {
                response = await axiosInstance.post('/pricing-tiers', submitData);
            }

            console.log('Pricing tier saved successfully:', response.data); // Debug log

            await fetchPricingTiers();
            resetForm();
            if (onSuccess) onSuccess();

        } catch (err) {
            console.error('Error saving pricing tier:', err);

            // Extract meaningful error message
            let errorMessage = 'Failed to save pricing tier';

            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else if (err.response.data.error) {
                    errorMessage = err.response.data.error;
                }
            }

            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (tierId) => {
        if (!window.confirm('Are you sure you want to delete this pricing tier? This action cannot be undone.')) {
            return;
        }

        try {
            setError('');
            await axiosInstance.delete(`/pricing-tiers/${tierId}`);
            await fetchPricingTiers();
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Error deleting pricing tier:', err);
            setError('Failed to delete pricing tier. Make sure no tickets are associated with this tier.');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    Manage Pricing Tiers - {event?.name}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {!showAddForm && (
                    <>
                        <div className="d-flex justify-content-between mb-3">
                            <h5>Current Pricing Tiers</h5>
                            <Button variant="primary" onClick={handleAddNew}>
                                <i className="bi bi-plus-circle me-2"></i>
                                Add New Tier
                            </Button>
                        </div>

                        {loading ? (
                            <div className="text-center py-3">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : pricingTiers.length === 0 ? (
                            <Alert variant="info">
                                <h6>No pricing tiers found</h6>
                                <p className="mb-0">
                                    Add at least one pricing tier to enable ticket generation for this event.
                                </p>
                            </Alert>
                        ) : (
                            <div className="table-responsive">
                                <Table striped hover>
                                    <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Available</th>
                                        <th>Section</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {pricingTiers.map(tier => (
                                        <tr key={tier.id}>
                                            <td>
                                                <strong>{tier.name}</strong>
                                                {tier.description && (
                                                    <small className="d-block text-muted">
                                                        {tier.description}
                                                    </small>
                                                )}
                                            </td>
                                            <td>{formatCurrency(tier.price)}</td>
                                            <td>{tier.quantity || 0}</td>
                                            <td>
                                                <Badge
                                                    bg={(tier.available || 0) > 0 ? 'success' : 'danger'}
                                                >
                                                    {tier.available || 0}
                                                </Badge>
                                            </td>
                                            <td>{tier.sectionId || 'N/A'}</td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleEdit(tier)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(tier.id)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </>
                )}

                {showAddForm && (
                    <Form onSubmit={handleSubmit}>
                        <div className="d-flex justify-content-between mb-3">
                            <h5>{editingTier ? 'Edit Pricing Tier' : 'Add New Pricing Tier'}</h5>
                            <Button variant="outline-secondary" onClick={resetForm}>
                                <i className="bi bi-arrow-left me-2"></i>
                                Back to List
                            </Button>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label>Tier Name *</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., VIP, Standard, Economy"
                                isInvalid={!!formErrors.name}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.name}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Optional description of this tier"
                            />
                        </Form.Group>

                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Price ($) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        isInvalid={!!formErrors.price}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.price}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Quantity *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        placeholder="Number of tickets"
                                        isInvalid={!!formErrors.quantity}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.quantity}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </div>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label>Section ID</Form.Label>
                            <Form.Control
                                type="text"
                                name="sectionId"
                                value={formData.sectionId}
                                onChange={handleInputChange}
                                placeholder="e.g., A, VIP, GA (optional)"
                            />
                            <Form.Text className="text-muted">
                                Optional section identifier for venue seating
                            </Form.Text>
                        </Form.Group>

                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" className="me-2" onClick={resetForm} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        {editingTier ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    editingTier ? 'Update Tier' : 'Create Tier'
                                )}
                            </Button>
                        </div>
                    </Form>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default PricingTierModal;