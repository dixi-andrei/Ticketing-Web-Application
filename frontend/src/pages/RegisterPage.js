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

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            setError('');
            setSuccess('');
            setLoading(true);

            await register(
                values.email,
                values.password,
                values.firstName,
                values.lastName
            );

            setSuccess('Registration successful! You can now log in.');
            resetForm();

            // Redirect to login page after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            console.error('Registration error:', err);
            setError(
                err.response?.data?.message ||
                'Failed to register. Please try again.'
            );
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
                            {success && <Alert variant="success">{success}</Alert>}

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

                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100 mt-3"
                                            disabled={isSubmitting}
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