import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { register } from '../api/authApi';

const RegisterSchema = Yup.object().shape({
    firstName: Yup.string()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters'),
    lastName: Yup.string()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
});

const RegisterPage = () => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (values, { setSubmitting, resetForm, setFieldError }) => {
        try {
            setError('');
            setSuccess('');
            setLoading(true);

            const response = await register(
                values.email,
                values.password,
                values.firstName,
                values.lastName
            );

            setSuccess('Registration successful! Please check your email to verify your account before signing in.');
            resetForm();

            // Redirect to login page after 5 seconds
            setTimeout(() => {
                navigate('/login', {
                    state: {
                        message: 'Registration successful! Please check your email and verify your account before signing in.'
                    }
                });
            }, 5000);

        } catch (err) {
            console.error('Registration error:', err);

            // Handle specific error types
            if (err.response?.status === 400) {
                const errorMessage = err.response.data?.message;
                if (errorMessage?.includes('Email is already in use')) {
                    setFieldError('email', 'This email is already registered');
                } else {
                    setError(errorMessage || 'Registration failed. Please try again.');
                }
            } else if (err.response?.status === 500) {
                setError('Email service is currently unavailable. Please try again later.');
            } else {
                setError('Registration failed. Please check your connection and try again.');
            }
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="shadow">
                        <Card.Body className="p-4">
                            <h2 className="text-center mb-4">Register</h2>

                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && (
                                <Alert variant="success">
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-check-circle-fill me-2"></i>
                                        <div>
                                            <strong>Registration Successful!</strong>
                                            <p className="mb-0 mt-1">{success}</p>
                                            <small className="text-muted">
                                                Redirecting to login page in a few seconds...
                                            </small>
                                        </div>
                                    </div>
                                </Alert>
                            )}

                            <Formik
                                initialValues={{
                                    firstName: '',
                                    lastName: '',
                                    email: '',
                                    password: '',
                                    confirmPassword: ''
                                }}
                                validationSchema={RegisterSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ isSubmitting }) => (
                                    <Form>
                                        <div className="mb-3">
                                            <label htmlFor="firstName" className="form-label">First Name</label>
                                            <Field
                                                type="text"
                                                name="firstName"
                                                className="form-control"
                                                placeholder="Enter your first name"
                                            />
                                            <ErrorMessage
                                                name="firstName"
                                                component="div"
                                                className="text-danger mt-1"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="lastName" className="form-label">Last Name</label>
                                            <Field
                                                type="text"
                                                name="lastName"
                                                className="form-control"
                                                placeholder="Enter your last name"
                                            />
                                            <ErrorMessage
                                                name="lastName"
                                                component="div"
                                                className="text-danger mt-1"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label">Email</label>
                                            <Field
                                                type="email"
                                                name="email"
                                                className="form-control"
                                                placeholder="Enter your email"
                                            />
                                            <ErrorMessage
                                                name="email"
                                                component="div"
                                                className="text-danger mt-1"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="password" className="form-label">Password</label>
                                            <Field
                                                type="password"
                                                name="password"
                                                className="form-control"
                                                placeholder="Enter your password"
                                            />
                                            <ErrorMessage
                                                name="password"
                                                component="div"
                                                className="text-danger mt-1"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                            <Field
                                                type="password"
                                                name="confirmPassword"
                                                className="form-control"
                                                placeholder="Confirm your password"
                                            />
                                            <ErrorMessage
                                                name="confirmPassword"
                                                component="div"
                                                className="text-danger mt-1"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <small className="text-muted">
                                                By registering, you agree to receive email notifications for account verification,
                                                purchase confirmations, and ticket sales.
                                            </small>
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100 mt-3"
                                            disabled={isSubmitting || loading}
                                        >
                                            {loading ? 'Registering...' : 'Register'}
                                        </button>
                                    </Form>
                                )}
                            </Formik>

                            <div className="text-center mt-3">
                                <p>
                                    Already have an account? <Link to="/login">Login here</Link>
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default RegisterPage;