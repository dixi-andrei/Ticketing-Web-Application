// src/components/common/Footer.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-dark text-white py-4 mt-auto">
            <Container>
                <Row>
                    <Col md={4} className="mb-3 mb-md-0">
                        <h5>🎟️ Ticketing App</h5>
                        <p className="text-muted">
                            Your reliable platform for event tickets and secure reselling.
                        </p>
                    </Col>
                    <Col md={4} className="mb-3 mb-md-0">
                        <h5>Quick Links</h5>
                        <ul className="list-unstyled">
                            <li><Link to="/" className="text-white">Home</Link></li>
                            <li><Link to="/events" className="text-white">Events</Link></li>
                            <li><Link to="/dashboard" className="text-white">My Tickets</Link></li>
                        </ul>
                    </Col>
                    <Col md={4}>
                        <h5>Contact</h5>
                        <ul className="list-unstyled">
                            <li><a href="mailto:support@ticketingapp.com" className="text-white">support@ticketingapp.com</a></li>
                            <li><a href="tel:+1234567890" className="text-white">+1 (234) 567-890</a></li>
                        </ul>
                    </Col>
                </Row>
                <hr className="my-3" />
                <div className="text-center">
                    <p className="mb-0">&copy; {new Date().getFullYear()} Ticketing App. All rights reserved.</p>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;