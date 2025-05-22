import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { forgotPassword } from '../api/authApi';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setMessage('');

            await forgotPassword(email);
            setMessage('If an account with that email exists, a password reset link has been sent.');
            setEmail(''); // Clear the form
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="shadow">
                        <Card.Body className="p-4">
                            <h2 className="text-center mb-4">Forgot Password</h2>
                            <p className="text-center text-muted mb-4">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>

                            {error && <Alert variant="danger">{error}</Alert>}
                            {message && <Alert variant="success">{message}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Button
                                    type="submit"
                                    className="w-100"
                                    variant="primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </Button>
                            </Form>

                            <div className="text-center mt-3">
                                <p>
                                    Remember your password? <Link to="/login">Sign in here</Link>
                                </p>
                                <p>
                                    Don't have an account? <Link to="/register">Register here</Link>
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ForgotPasswordPage;