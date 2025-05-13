// src/pages/EventDetailPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert, Modal, Form } from 'react-bootstrap';
import { getEventById } from '../api/eventApi';
import { getPricingTiersByEvent } from '../api/pricingTierApi';
import { purchaseTicket } from '../api/ticketApi';
import PaymentForm from '../components/tickets/PaymentForm';
import PurchaseConfirmation from '../components/tickets/PurchaseConfirmation';
import AuthContext from '../contexts/AuthContext';

const EventDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext);

    const [event, setEvent] = useState(null);
    const [pricingTiers, setPricingTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [purchaseStep, setPurchaseStep] = useState('select'); // 'select', 'payment', 'confirmation'
    const [purchaseDetails, setPurchaseDetails] = useState(null);

    // Purchase states
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [selectedTier, setSelectedTier] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [purchaseError, setPurchaseError] = useState('');
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                setLoading(true);
                const eventResponse = await getEventById(id);
                setEvent(eventResponse.data);

                const tiersResponse = await getPricingTiersByEvent(id);
                setPricingTiers(tiersResponse.data);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching event details:', err);
                setError('Failed to load event details. Please try again later.');
                setLoading(false);

                // Mock data for demonstration if API fails
                const mockEvent = {
                    id: parseInt(id),
                    name: "Sample Event Title",
                    description: "This is a detailed sample event description. Join us for an amazing experience with great performances and activities. This event is designed to provide entertainment and fun for all attendees.",
                    eventDate: "2025-08-15T19:00:00",
                    imageUrl: "https://placehold.co/800x400?text=Event+Image",
                    totalTickets: 1000,
                    availableTickets: 500,
                    eventType: "CONCERT",
                    status: "SCHEDULED",
                    venue: {
                        id: 1,
                        name: "Grand Arena",
                        address: "123 Event Street",
                        city: "New York",
                        state: "NY",
                        country: "USA",
                        capacity: 1500
                    },
                    creatorName: "Event Organizer"
                };

                const mockPricingTiers = [
                    {
                        id: 1,
                        name: "VIP",
                        description: "Best seats with special perks",
                        price: 200.0,
                        quantity: 100,
                        available: 40
                    },
                    {
                        id: 2,
                        name: "Regular",
                        description: "Standard seating",
                        price: 100.0,
                        quantity: 500,
                        available: 300
                    },
                    {
                        id: 3,
                        name: "Economy",
                        description: "Basic seating",
                        price: 50.0,
                        quantity: 400,
                        available: 160
                    }
                ];

                setEvent(mockEvent);
                setPricingTiers(mockPricingTiers);
            }
        };

        fetchEventDetails();
    }, [id]);

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return "Date not available";
            }
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            return date.toLocaleDateString(undefined, options);
        } catch (e) {
            console.error("Error formatting date:", e);
            return "Date not available";
        }
    };

    const handlePurchaseClick = (tier) => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/events/${id}` } });
            return;
        }

        setSelectedTier(tier);
        setQuantity(1);
        setPurchaseError('');
        setPurchaseStep('select');
        setShowPurchaseModal(true);
    };

    const handlePaymentComplete = (paymentInfo) => {
        // In a real app, you would call your API to create the ticket and transaction
        const transactionDetails = {
            transactionId: 'TRX-' + Math.random().toString(36).substr(2, 9),
            eventName: event.name,
            quantity: quantity,
            totalAmount: selectedTier?.price * quantity * 1.05,
            lastFour: paymentInfo.lastFour,
            paymentMethod: 'Credit Card',
            purchaseDate: new Date().toISOString()
        };

        setPurchaseDetails(transactionDetails);
        setPurchaseStep('confirmation');

        // Update the event's available tickets (this would be handled by the backend in a real app)
        if (event && selectedTier) {
            const updatedTiers = pricingTiers.map(tier => {
                if (tier.id === selectedTier.id) {
                    return {
                        ...tier,
                        available: tier.available - quantity
                    };
                }
                return tier;
            });

            setPricingTiers(updatedTiers);
            setEvent({
                ...event,
                availableTickets: event.availableTickets - quantity
            });
        }
    };

    const handlePurchaseConfirm = () => {
        // Move to payment step
        setPurchaseStep('payment');
    };

    const resetPurchaseModal = () => {
        setPurchaseStep('select');
        setPurchaseDetails(null);
        setQuantity(1);
        setPurchaseError('');
        setShowPurchaseModal(false);
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <p>Loading event details...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
                <Button variant="primary" onClick={() => navigate('/events')}>
                    Back to Events
                </Button>
            </Container>
        );
    }

    if (!event) {
        return (
            <Container className="py-5">
                <Alert variant="warning">Event not found</Alert>
                <Button variant="primary" onClick={() => navigate('/events')}>
                    Back to Events
                </Button>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            {/* Event Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <h1>{event.name}</h1>
                        <Badge bg="primary" className="fs-6">{event.eventType}</Badge>
                    </div>
                    <p className="text-muted">
                        <i className="bi bi-calendar"></i> {formatDate(event.eventDate)}
                    </p>
                </Col>
            </Row>

            {/* Event Details */}
            <Row className="mb-5">
                <Col md={8}>
                    <Card className="mb-4 shadow-sm">
                        <Card.Img
                            variant="top"
                            src={event.imageUrl || "https://placehold.co/800x400?text=Event+Image"}
                            alt={event.name}
                            style={{ maxHeight: '400px', objectFit: 'cover' }}
                        />
                        <Card.Body>
                            <h4>About This Event</h4>
                            <p>{event.description || "No description available for this event."}</p>

                            <hr />

                            <h4>Venue Information</h4>
                            {event.venue ? (
                                <p>
                                    <strong>{event.venue.name || "Venue name not available"}</strong><br />
                                    {event.venue.address || "Address not available"}<br />
                                    {event.venue.city || ""}{event.venue.state ? `, ${event.venue.state}` : ""} {event.venue.country || ""}
                                </p>
                            ) : (
                                <p>Venue information not available</p>
                            )}
                            <p>
                                <strong>Venue Capacity:</strong> {event.venue?.capacity || "Not specified"} attendees
                            </p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    {/* Ticket Purchase Card */}
                    <Card className="shadow-sm sticky-top" style={{ top: '2rem' }}>
                        <Card.Header className="bg-primary text-white">
                            <h4 className="my-1">Tickets</h4>
                        </Card.Header>
                        <Card.Body>
                            {/* Check if there are any available tickets in pricing tiers instead of just event.availableTickets */}
                            {pricingTiers.some(tier => tier.available > 0) ? (
                                <>
                                    <p>{event.availableTickets} tickets available out of {event.totalTickets}</p>

                                    {pricingTiers.map((tier) => (
                                        <div key={tier.id} className="mb-3 p-3 border rounded">
                                            <div className="d-flex justify-content-between">
                                                <h5>{tier.name}</h5>
                                                <h5>${tier.price.toFixed(2)}</h5>
                                            </div>
                                            <p className="text-muted mb-1">{tier.description}</p>
                                            <p className="mb-2">
                                                <Badge bg={tier.available > 0 ? 'success' : 'danger'}>
                                                    {tier.available} available
                                                </Badge>
                                            </p>
                                            <Button
                                                variant="outline-primary"
                                                className="w-100"
                                                disabled={tier.available <= 0}
                                                onClick={() => handlePurchaseClick(tier)}
                                            >
                                                {tier.available > 0 ? 'Purchase' : 'Sold Out'}
                                            </Button>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <Alert variant="danger">
                                    This event is sold out!
                                </Alert>
                            )}

                            <div className="mt-3">
                                <p className="text-muted small">
                                    <i className="bi bi-shield-check"></i> Secure checkout
                                </p>
                                <p className="text-muted small">
                                    <i className="bi bi-arrow-repeat"></i> All tickets include our safe resale guarantee
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Purchase Modal */}
            <Modal
                show={showPurchaseModal}
                onHide={resetPurchaseModal}
                size={purchaseStep === 'payment' ? 'lg' : 'md'}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {purchaseStep === 'select' && 'Purchase Tickets'}
                        {purchaseStep === 'payment' && 'Complete Your Purchase'}
                        {purchaseStep === 'confirmation' && 'Purchase Confirmation'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {purchaseStep === 'select' && (
                        <>
                            {purchaseError && <Alert variant="danger">{purchaseError}</Alert>}

                            <p>
                                <strong>Event:</strong> {event.name}<br />
                                <strong>Date:</strong> {formatDate(event.eventDate)}<br />
                                <strong>Venue:</strong> {event.venue?.name}, {event.venue?.city}<br />
                                <strong>Ticket Type:</strong> {selectedTier?.name}<br />
                                <strong>Price per Ticket:</strong> ${selectedTier?.price.toFixed(2)}
                            </p>

                            <Form.Group className="mb-3">
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    max={selectedTier?.available}
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                />
                                <Form.Text className="text-muted">
                                    Maximum available: {selectedTier?.available}
                                </Form.Text>
                            </Form.Group>

                            <hr />

                            <div className="d-flex justify-content-between">
                                <span>Subtotal:</span>
                                <span>${(selectedTier?.price * quantity).toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Service Fee:</span>
                                <span>${(selectedTier?.price * quantity * 0.05).toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mt-2">
                                <strong>Total:</strong>
                                <strong>${(selectedTier?.price * quantity * 1.05).toFixed(2)}</strong>
                            </div>
                        </>
                    )}

                    {purchaseStep === 'payment' && selectedTier && (
                        <PaymentForm
                            amount={selectedTier.price * quantity * 1.05}
                            onPaymentComplete={handlePaymentComplete}
                            onCancel={() => setPurchaseStep('select')}
                        />
                    )}

                    {purchaseStep === 'confirmation' && purchaseDetails && (
                        <PurchaseConfirmation
                            purchaseDetails={purchaseDetails}
                            onClose={resetPurchaseModal}
                        />
                    )}
                </Modal.Body>

                {purchaseStep === 'select' && (
                    <Modal.Footer>
                        <Button variant="secondary" onClick={resetPurchaseModal}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handlePurchaseConfirm}
                            disabled={purchaseLoading}
                        >
                            {purchaseLoading ? 'Processing...' : 'Proceed to Payment'}
                        </Button>
                    </Modal.Footer>
                )}
            </Modal>
        </Container>
    );
};

export default EventDetailPage;