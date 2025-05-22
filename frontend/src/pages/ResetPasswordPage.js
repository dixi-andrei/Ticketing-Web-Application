import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { resetPassword } from '../api/authApi';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const token = searchParams.get('token');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            setError('Invalid reset link. Token not found.');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await resetPassword(token, formData.newPassword, formData.confirmPassword);

            // Show success message and redirect
            navigate('/login', {
                state: {
                    message: 'Password reset successfully! You can now sign in with your new password.'
                }
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={6}>
                        <Card className="shadow">
                            <Card.Body className="p-4 text-center">
                                <h2 className="mb-4">Invalid Reset Link</h2>
                                <Alert variant="danger">
                                    This password reset link is invalid or has expired.
                                </Alert>
                                <Button variant="primary" onClick={() => navigate('/forgot-password')}>
                                    Request New Reset Link
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="shadow">
                        <Card.Body className="p-4">
                            <h2 className="text-center mb-4">Reset Password</h2>
                            <p className="text-center text-muted mb-4">
                                Enter your new password below.
                            </p>

                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>New Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="newPassword"
                                        placeholder="Enter new password"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                    />
                                    <Form.Text className="text-muted">
                                        Password must be at least 6 characters long.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Confirm New Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm new password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Button
                                    type="submit"
                                    className="w-100"
                                    variant="primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ResetPasswordPage;