import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { login } from '../api/authApi';
import AuthContext from '../contexts/AuthContext';

const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
});

const LoginPage = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login: authLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setError('');
            setLoading(true);

            const response = await login(values.email, values.password);

            // Store user details and token in auth context
            authLogin(response.data, response.data.token);

            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            setError(
                err.response?.data?.message ||
                'Failed to log in. Please check your credentials.'
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
                            <h2 className="text-center mb-4">Login</h2>

                            {error && <Alert variant="danger">{error}</Alert>}

                            <Formik
                                initialValues={{ email: '', password: '' }}
                                validationSchema={LoginSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ isSubmitting }) => (
                                    <Form>
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

                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100 mt-3"
                                            disabled={isSubmitting}
                                        >
                                            {loading ? 'Logging in...' : 'Login'}
                                        </button>
                                    </Form>
                                )}
                            </Formik>

                            <div className="text-center mt-3">
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

export default LoginPage;