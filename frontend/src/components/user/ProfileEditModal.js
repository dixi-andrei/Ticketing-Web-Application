// frontend/src/components/user/ProfileEditModal.js
import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { updateCurrentUserProfile } from '../../api/userApi';

const ProfileEditModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        profileImage: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [previewImage, setPreviewImage] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file');
                return;
            }

            setFormData(prev => ({
                ...prev,
                profileImage: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // For now, we'll just update the basic profile info
            // In a real implementation, you'd handle image upload separately
            const updateData = {
                firstName: formData.firstName,
                lastName: formData.lastName
                // Note: email updates might require additional verification
            };

            const response = await updateCurrentUserProfile(updateData);

            // Call the parent's save handler with updated data
            onSave({
                ...user,
                ...updateData
            });

        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        return formData.firstName.trim() && formData.lastName.trim() && formData.email.trim();
    };

    return (
        <Modal show={true} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit Profile</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Row>
                        <Col md={4} className="text-center mb-4">
                            <div className="mb-3">
                                {previewImage ? (
                                    <img
                                        src={previewImage}
                                        alt="Profile Preview"
                                        className="rounded-circle"
                                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div
                                        className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                                        style={{ width: '120px', height: '120px' }}
                                    >
                                        <span className="fs-1">
                                            {(formData.firstName?.charAt(0) || "") + (formData.lastName?.charAt(0) || "")}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <Form.Group>
                                <Form.Label className="btn btn-outline-primary btn-sm">
                                    Choose Photo
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />
                                </Form.Label>
                            </Form.Group>

                            {formData.profileImage && (
                                <div className="mt-2">
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, profileImage: null }));
                                            setPreviewImage(null);
                                        }}
                                    >
                                        Remove Photo
                                    </Button>
                                </div>
                            )}
                        </Col>

                        <Col md={8}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>First Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Last Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled // For now, disable email editing
                                />
                                <Form.Text className="text-muted">
                                    Contact support to change your email address
                                </Form.Text>
                            </Form.Group>

                            <Alert variant="info">
                                <strong>Note:</strong> Profile changes will be reflected across the platform.
                                Your profile photo will be visible to other users when you list tickets for resale.
                            </Alert>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={loading || !validateForm()}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ProfileEditModal;