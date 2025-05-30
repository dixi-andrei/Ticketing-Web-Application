import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert, Modal } from 'react-bootstrap';
import { getEventById } from '../api/eventApi';
import { getPricingTiersByEvent } from '../api/pricingTierApi';
import { purchaseTicket } from '../api/ticketApi';
import {
    processPaymentWithBalance,
    processPayment,
    createTicketPurchaseTransaction
} from '../api/transactionApi';
import axiosInstance from '../api/axiosConfig';
import EnhancedPaymentForm from '../components/tickets/EnhancedPaymentForm';
import PurchaseConfirmation from '../components/tickets/PurchaseConfirmation';
import AuthContext from '../contexts/AuthContext';
import { getEventImageUrl, handleImageError } from '../utils/imageUtils';

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
    const [showPaymentForm, setShowPaymentForm] = useState(false); // Add this missing state
    const [selectedTier, setSelectedTier] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [purchaseError, setPurchaseError] = useState('');
    const [currentTransaction, setCurrentTransaction] = useState(null);

    const getAvailableTicketForPricingTier = async (pricingTierId) => {
        try {
            // Get available tickets by pricing tier
            const response = await axiosInstance.get(`/tickets/available-by-pricing-tier/${pricingTierId}`);
            return response.data[0]; // Get the first available ticket
        } catch (error) {
            console.error('Error getting available ticket:', error);
            // Fallback: try to get tickets by event and filter by pricing tier
            try {
                const eventTicketsResponse = await axiosInstance.get(`/tickets/event/${id}`);
                const availableTickets = eventTicketsResponse.data.filter(ticket =>
                    ticket.pricingTier?.id === pricingTierId &&
                    ticket.status === 'AVAILABLE'
                );

                if (availableTickets.length > 0) {
                    return availableTickets[0];
                }

                throw new Error('No available tickets found for this pricing tier');
            } catch (fallbackError) {
                console.error('Fallback error:', fallbackError);
                throw new Error('No available tickets found for this pricing tier');
            }
        }
    };


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

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                setLoading(true);
                setError('');

                // Fetch event details
                const eventResponse = await getEventById(id);
                if (eventResponse && eventResponse.data) {
                    setEvent(eventResponse.data);

                    // Fetch pricing tiers
                    try {
                        const tiersResponse = await getPricingTiersByEvent(id);
                        setPricingTiers(Array.isArray(tiersResponse.data) ? tiersResponse.data : []);
                    } catch (tierError) {
                        console.error('Error fetching pricing tiers:', tierError);
                        setPricingTiers([]);
                    }
                } else {
                    setError('Event not found or data is incomplete.');
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching event details:', err);
                setError('Failed to load event details. Please try again later.');
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [id]);

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
        setShowPaymentForm(false); // Reset payment form state
    };

    const handlePurchaseConfirm = async () => {
        try {
            setPurchaseLoading(true);
            setPurchaseError('');

            // Step 1: Get an available ticket for the selected pricing tier
            const availableTicket = await getAvailableTicketForPricingTier(selectedTier.id);

            if (!availableTicket) {
                throw new Error('No available tickets found for this pricing tier');
            }

            // Step 2: Create a transaction for this specific ticket
            const transactionResponse = await createTicketPurchaseTransaction(
                availableTicket.id,
                'card' // Default payment method
            );

            console.log('Transaction created:', transactionResponse.data); // Debug log
            setCurrentTransaction(transactionResponse.data);
            setPurchaseStep('payment');
            setShowPaymentForm(true);
            setPurchaseLoading(false);
        } catch (error) {
            console.error('Error creating transaction:', error);
            setPurchaseError(error.message || 'Failed to initiate purchase. Please try again.');
            setPurchaseLoading(false);
        }
    };

    const handlePaymentComplete = async (paymentInfo) => {
        try {
            setPurchaseLoading(true);
            console.log('Payment completed with info:', paymentInfo);

            // Create transaction details based on payment method
            const transactionDetails = {
                transactionId: paymentInfo.transactionId || currentTransaction.transactionNumber || 'TRX-' + Math.random().toString(36).substr(2, 9),
                eventName: event.name,
                quantity: quantity,
                totalAmount: paymentInfo.paymentMethod === 'balance' ?
                    selectedTier?.price * quantity :
                    selectedTier?.price * quantity * 1.029,
                paymentMethod: paymentInfo.paymentMethod === 'balance' ? 'Account Balance' : 'Credit Card',
                balanceUsed: paymentInfo.balanceUsed,
                newBalance: paymentInfo.newBalance,
                lastFour: paymentInfo.lastFour,
                purchaseDate: new Date().toISOString()
            };

            console.log('Setting purchase details:', transactionDetails);
            setPurchaseDetails(transactionDetails);
            setPurchaseStep('confirmation');

            // Update the event's available tickets (this should come from the API response)
            if (event && selectedTier) {
                const updatedTiers = pricingTiers.map(tier => {
                    if (tier.id === selectedTier.id) {
                        return {
                            ...tier,
                            available: Math.max(0, tier.available - quantity)
                        };
                    }
                    return tier;
                });

                setPricingTiers(updatedTiers);
                setEvent({
                    ...event,
                    availableTickets: Math.max(0, event.availableTickets - quantity)
                });
            }

            setPurchaseLoading(false);
        } catch (error) {
            console.error('Payment processing error:', error);
            setPurchaseError(error.response?.data?.message || error.message || 'Payment processing failed. Please try again.');
            setPurchaseLoading(false);
        }
    };

    const resetPurchaseModal = () => {
        setPurchaseStep('select');
        setPurchaseDetails(null);
        setCurrentTransaction(null);
        setQuantity(1);
        setPurchaseError('');
        setShowPurchaseModal(false);
        setShowPaymentForm(false);
        setPurchaseLoading(false);
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
                            src={getEventImageUrl(event)}
                            alt={event.name || "Event"}
                            style={{ maxHeight: '400px', objectFit: 'cover' }}
                            onError={(e) => handleImageError(e, event.eventType)}
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
                            {pricingTiers.some(tier => tier.available > 0) ? (
                                <>
                                    <p>{event.availableTickets} tickets available out of {event.totalTickets}</p>

                                    {pricingTiers.map((tier) => (
                                        <div key={tier.id} className="mb-3 p-3 border rounded">
                                            <div className="d-flex justify-content-between">
                                                <h5>{tier.name}</h5>
                                                <h5>${tier.price?.toFixed(2)}</h5>
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
                                    <i className="bi bi-wallet2"></i> Pay with account balance or credit card
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
                        {purchaseStep === 'payment' && 'Choose Payment Method'}
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
                                <strong>Price per Ticket:</strong> ${selectedTier?.price?.toFixed(2)}
                            </p>

                            <div className="mb-3">
                                <label className="form-label">Quantity</label>
                                <select
                                    className="form-select"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                >
                                    {[...Array(Math.min(selectedTier?.available || 1, 10))].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
                                <div className="form-text">
                                    Maximum available: {selectedTier?.available}
                                </div>
                            </div>

                            <hr />

                            <div className="d-flex justify-content-between">
                                <span>Subtotal:</span>
                                <span>${(selectedTier?.price * quantity).toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mt-2">
                                <strong>Total:</strong>
                                <strong>${(selectedTier?.price * quantity).toFixed(2)}</strong>
                            </div>
                            <small className="text-muted mt-2 d-block">
                                * Processing fees may apply for credit card payments
                            </small>
                        </>
                    )}

                    {purchaseStep === 'payment' && selectedTier && currentTransaction && (
                        <EnhancedPaymentForm
                            amount={selectedTier.price * quantity}
                            onPaymentComplete={handlePaymentComplete}
                            onCancel={() => setPurchaseStep('select')}
                            currentTransaction={currentTransaction}  // ← Make sure this is passed!
                            ticketDetails={{
                                eventName: event.name,
                                eventDate: formatDate(event.eventDate),
                                venue: `${event.venue?.name}, ${event.venue?.city}`,
                                section: selectedTier.sectionId,
                                quantity: quantity
                            }}
                        />
                    )}
                    {purchaseStep === 'payment' && selectedTier && !currentTransaction && (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Creating transaction...</span>
                            </div>
                            <p className="mt-2">Preparing payment...</p>
                        </div>
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
                            {purchaseLoading ? 'Processing...' : 'Choose Payment Method'}
                        </Button>
                    </Modal.Footer>
                )}
            </Modal>
        </Container>
    );
};

export default EventDetailPage;