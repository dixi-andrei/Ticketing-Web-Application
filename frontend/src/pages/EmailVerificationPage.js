import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Alert, Spinner, Button } from 'react-bootstrap';
import { verifyEmail } from '../api/authApi';

const EmailVerificationPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('');
    const token = searchParams.get('token');

    useEffect(() => {
        if (token) {
            handleVerification();
        } else {
            setVerificationStatus('error');
            setMessage('Invalid verification link. No token provided.');
        }
    }, [token]);

    const handleVerification = async () => {
        try {
            const response = await verifyEmail(token);
            setVerificationStatus('success');
            setMessage(response.data.message || 'Email verified successfully!');

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login', {
                    state: { message: 'Email verified! You can now sign in.' }
                });
            }, 3000);
        } catch (error) {
            setVerificationStatus('error');
            setMessage(error.response?.data?.message || 'Email verification failed. The link may be expired or invalid.');
        }
    };

    const handleGoToLogin = () => {
        navigate('/login');
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="shadow">
                        <Card.Body className="p-4 text-center">
                            <h2 className="mb-4">Email Verification</h2>

                            {verificationStatus === 'verifying' && (
                                <div>
                                    <Spinner animation="border" variant="primary" className="mb-3" />
                                    <p>Verifying your email address...</p>
                                </div>
                            )}

                            {verificationStatus === 'success' && (
                                <div>
                                    <div className="mb-3">
                                        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                                    </div>
                                    <Alert variant="success">
                                        <h4>Email Verified Successfully!</h4>
                                        <p className="mb-0">{message}</p>
                                    </Alert>
                                    <p className="text-muted">Redirecting to login page...</p>
                                    <Button variant="primary" onClick={handleGoToLogin}>
                                        Go to Login Now
                                    </Button>
                                </div>
                            )}

                            {verificationStatus === 'error' && (
                                <div>
                                    <div className="mb-3">
                                        <i className="bi bi-exclamation-circle-fill text-danger" style={{ fontSize: '3rem' }}></i>
                                    </div>
                                    <Alert variant="danger">
                                        <h4>Verification Failed</h4>
                                        <p className="mb-0">{message}</p>
                                    </Alert>
                                    <Button variant="primary" onClick={handleGoToLogin}>
                                        Go to Login
                                    </Button>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};


export default EmailVerificationPage;
