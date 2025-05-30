// src/pages/ResaleMarketplacePage.js - FIXED VERSION
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAllListings, getListingsByEvent } from '../api/listingApi';
import { getAllEvents } from '../api/eventApi';
import { createListingPurchaseTransaction } from '../api/transactionApi';
import AuthContext from '../contexts/AuthContext';
import EnhancedPaymentForm from '../components/tickets/EnhancedPaymentForm';
import PurchaseConfirmation from '../components/tickets/PurchaseConfirmation';

const ResaleMarketplacePage = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    // States for data
    const [listings, setListings] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [selectedEvent, setSelectedEvent] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [originalListings, setOriginalListings] = useState([]); // Store original data for filtering

    // Purchase states
    const [purchaseInProgress, setPurchaseInProgress] = useState(false);
    const [purchaseError, setPurchaseError] = useState('');
    const [selectedListing, setSelectedListing] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [purchaseStep, setPurchaseStep] = useState('confirm');
    const [purchaseDetails, setPurchaseDetails] = useState(null);
    const [currentTransaction, setCurrentTransaction] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');

            const [listingsResponse, eventsResponse] = await Promise.all([
                getAllListings(),
                getAllEvents()
            ]);

            let activeListings = Array.isArray(listingsResponse.data)
                ? listingsResponse.data.filter(listing => listing.status === "ACTIVE")
                : [];

            setListings(activeListings);
            setOriginalListings(activeListings); // Store original data
            setEvents(Array.isArray(eventsResponse.data) ? eventsResponse.data : []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching resale marketplace data:', err);
            setError('Failed to load resale listings. Please try again later.');
            setLoading(false);
            setMockData();
        }
    };

    const setMockData = () => {
        const mockListings = [
            {
                id: 1,
                askingPrice: 75.00,
                description: "Can't make the event, selling at a discount",
                listingDate: "2025-05-10T14:30:00",
                status: "ACTIVE",
                ticket: {
                    id: 101,
                    ticketNumber: "TKT-12345",
                    originalPrice: 85.00,
                    section: "A",
                    row: "10",
                    seat: "15",
                    event: {
                        id: 1,
                        name: "Summer Music Festival",
                        eventDate: "2025-07-15T18:00:00",
                        venue: { name: "Central Park", city: "New York" }
                    }
                },
                seller: { firstName: "John", lastName: "Doe" }
            }
        ];

        const mockEvents = [
            {
                id: 1,
                name: "Summer Music Festival",
                eventDate: "2025-07-15T18:00:00"
            }
        ];

        setListings(mockListings);
        setOriginalListings(mockListings);
        setEvents(mockEvents);
    };

    const handleEventFilterChange = async (eventId) => {
        setSelectedEvent(eventId);
        if (!eventId) {
            try {
                const response = await getAllListings();
                const activeListings = Array.isArray(response.data)
                    ? response.data.filter(listing => listing.status === "ACTIVE")
                    : [];
                setListings(activeListings);
                setOriginalListings(activeListings);
            } catch (err) {
                console.error('Error fetching all listings:', err);
                setError('Failed to load listings. Please try again.');
            }
        } else {
            try {
                const response = await getListingsByEvent(eventId);
                const eventListings = Array.isArray(response.data) ? response.data : [];
                setListings(eventListings);
                setOriginalListings(eventListings);
            } catch (err) {
                console.error('Error fetching event listings:', err);
                setError('Failed to load event listings. Please try again.');
            }
        }
    };

    const handleSearch = () => {
        let filteredListings = [...originalListings];

        if (priceRange.min) {
            filteredListings = filteredListings.filter(listing =>
                listing.askingPrice >= parseFloat(priceRange.min)
            );
        }

        if (priceRange.max) {
            filteredListings = filteredListings.filter(listing =>
                listing.askingPrice <= parseFloat(priceRange.max)
            );
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredListings = filteredListings.filter(listing =>
                listing.ticket.event.name.toLowerCase().includes(term) ||
                listing.ticket.event.venue.name.toLowerCase().includes(term) ||
                listing.ticket.event.venue.city.toLowerCase().includes(term)
            );
        }

        setListings(filteredListings);
    };

    const handlePurchaseClick = (listing) => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/resale' } });
            return;
        }

        setSelectedListing(listing);
        setPurchaseStep('confirm');
        setShowConfirmModal(true);
        setPurchaseError('');
    };

    // FIXED: Create transaction correctly for listing purchase
    const handlePurchaseConfirm = async () => {
        try {
            setPurchaseInProgress(true);
            setPurchaseError('');

            // Create a transaction for listing purchase
            const transactionResponse = await createListingPurchaseTransaction(
                selectedListing.id,
                'card' // Default payment method, will be changed in payment form
            );

            console.log('Listing transaction created:', transactionResponse.data);
            setCurrentTransaction(transactionResponse.data);
            setPurchaseStep('payment');
            setPurchaseInProgress(false);
        } catch (error) {
            console.error('Error creating transaction:', error);
            setPurchaseError(error.response?.data?.error || error.message || 'Failed to initiate purchase. Please try again.');
            setPurchaseInProgress(false);
        }
    };

    // FIXED: Handle payment completion for resale purchases
    const handlePaymentComplete = async (paymentInfo) => {
        try {
            setPurchaseInProgress(true);

            // The payment has already been processed in the EnhancedPaymentForm
            // We just need to create the purchase confirmation details
            const transactionDetails = {
                transactionId: currentTransaction.transactionNumber || 'TRX-' + Math.random().toString(36).substr(2, 9),
                eventName: selectedListing.ticket.event.name,
                ticketNumber: selectedListing.ticket.ticketNumber,
                section: selectedListing.ticket.section,
                row: selectedListing.ticket.row,
                seat: selectedListing.ticket.seat,
                quantity: 1,
                totalAmount: paymentInfo.paymentMethod === 'balance'
                    ? selectedListing.askingPrice
                    : selectedListing.askingPrice * 1.029,
                paymentMethod: paymentInfo.paymentMethod === 'balance' ? 'Account Balance' : 'Credit Card',
                balanceUsed: paymentInfo.balanceUsed,
                newBalance: paymentInfo.newBalance,
                lastFour: paymentInfo.lastFour,
                purchaseDate: new Date().toISOString(),
                seller: selectedListing.seller,
                originalPrice: selectedListing.ticket.originalPrice,
                savings: (selectedListing.ticket.originalPrice || 0) - selectedListing.askingPrice
            };

            setPurchaseDetails(transactionDetails);
            setPurchaseStep('success');

            // Refresh listings after successful purchase
            fetchData();

            setPurchaseInProgress(false);
        } catch (error) {
            console.error('Payment completion error:', error);
            setPurchaseError(error.message || 'Payment processing failed. Please try again.');
            setPurchaseInProgress(false);
        }
    };

    const resetPurchaseModal = () => {
        setPurchaseStep('confirm');
        setPurchaseDetails(null);
        setCurrentTransaction(null);
        setPurchaseError('');
        setShowConfirmModal(false);
        setPurchaseInProgress(false);
        setSelectedListing(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Date not available";
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            console.error('Error formatting date:', e);
            return "Date format error";
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const calculateDiscount = (listing) => {
        if (!listing || !listing.ticket || !listing.ticket.originalPrice || !listing.askingPrice) {
            return 0;
        }

        const originalPrice = listing.ticket.originalPrice;
        const askingPrice = listing.askingPrice;

        if (originalPrice === askingPrice) {
            return 0;
        }

        return Math.round(((originalPrice - askingPrice) / originalPrice) * 100);
    };

    return (
        <Container className="py-5">
            <h1 className="mb-4">Resale Marketplace</h1>
            <p className="lead">Find tickets at or below original prices from fans who can't attend.</p>

            {/* Filters */}
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Row>
                        <Col md={4} className="mb-3 mb-md-0">
                            <Form.Group>
                                <Form.Label>Event</Form.Label>
                                <Form.Select
                                    value={selectedEvent}
                                    onChange={(e) => handleEventFilterChange(e.target.value)}
                                >
                                    <option value="">All Events</option>
                                    {events.map(event => (
                                        <option key={event.id} value={event.id}>
                                            {event.name} ({formatDate(event.eventDate).split(',')[0]})
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={4} className="mb-3 mb-md-0">
                            <Form.Group>
                                <Form.Label>Price Range</Form.Label>
                                <Row>
                                    <Col>
                                        <Form.Control
                                            type="number"
                                            placeholder="Min"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="number"
                                            placeholder="Max"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                                        />
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Search</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search events, venues..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button variant="primary" onClick={handleSearch}>
                                        Search
                                    </Button>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Results */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-3">Loading resale listings...</p>
                </div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : !Array.isArray(listings) || listings.length === 0 ? (
                <Alert variant="info">
                    No resale tickets found. Try adjusting your filters or check back later.
                </Alert>
            ) : (
                <Row>
                    {listings.map(listing => (
                        <Col key={listing.id} md={6} lg={4} className="mb-4">
                            <Card className="h-100 shadow-sm hover-card">
                                <Card.Header>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted small">Listed {formatDate(listing.listingDate)}</span>
                                        {calculateDiscount(listing) > 0 && (
                                            <Badge bg="success">{calculateDiscount(listing)}% below face value</Badge>
                                        )}
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <h5 className="mb-1">{listing.ticket.event.name}</h5>
                                    <p className="text-muted mb-1">
                                        {formatDate(listing.ticket.event.eventDate)}
                                    </p>
                                    <p className="mb-3">
                                        {listing.ticket.event.venue.name}, {listing.ticket.event.venue.city}
                                    </p>

                                    <div className="d-flex justify-content-between mb-3">
                                        <div>
                                            <strong>Section:</strong> {listing.ticket.section || 'N/A'}<br />
                                            <strong>Row:</strong> {listing.ticket.row || 'N/A'}<br />
                                            <strong>Seat:</strong> {listing.ticket.seat || 'N/A'}
                                        </div>
                                        <div className="text-end">
                                            {calculateDiscount(listing) > 0 && (
                                                <p className="text-muted mb-0">
                                                    <small><del>Was: {formatCurrency(listing.ticket.originalPrice)}</del></small>
                                                </p>
                                            )}
                                            <h4 className="text-success mb-0">{formatCurrency(listing.askingPrice)}</h4>
                                            {calculateDiscount(listing) > 0 && (
                                                <small className="text-success">
                                                    Save {formatCurrency(listing.ticket.originalPrice - listing.askingPrice)}
                                                </small>
                                            )}
                                        </div>
                                    </div>

                                    {listing.description && (
                                        <p className="font-italic text-muted small mb-3">
                                            "{listing.description}"
                                        </p>
                                    )}

                                    <div className="d-grid">
                                        <Button
                                            variant="outline-primary"
                                            onClick={() => handlePurchaseClick(listing)}
                                        >
                                            Purchase Ticket
                                        </Button>
                                    </div>
                                </Card.Body>
                                <Card.Footer className="text-muted text-center">
                                    <small>Sold by {listing.seller.firstName} {listing.seller.lastName.charAt(0)}.</small>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Purchase Modal */}
            <Modal
                show={showConfirmModal}
                onHide={resetPurchaseModal}
                centered
                size={purchaseStep === 'payment' ? 'lg' : 'md'}
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {purchaseStep === 'confirm' && 'Confirm Resale Purchase'}
                        {purchaseStep === 'payment' && 'Choose Payment Method'}
                        {purchaseStep === 'success' && 'Purchase Successful!'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {purchaseStep === 'confirm' && selectedListing && (
                        <>
                            {purchaseError && <Alert variant="danger">{purchaseError}</Alert>}

                            <Card className="mb-3">
                                <Card.Body>
                                    <h5>{selectedListing.ticket.event.name}</h5>
                                    <p className="text-muted mb-2">{formatDate(selectedListing.ticket.event.eventDate)}</p>
                                    <p className="mb-3">
                                        {selectedListing.ticket.event.venue.name}, {selectedListing.ticket.event.venue.city}
                                    </p>

                                    <Row className="mb-3">
                                        <Col>
                                            <p className="mb-0">
                                                <strong>Section:</strong> {selectedListing.ticket.section || 'N/A'}<br />
                                                <strong>Row:</strong> {selectedListing.ticket.row || 'N/A'}<br />
                                                <strong>Seat:</strong> {selectedListing.ticket.seat || 'N/A'}
                                            </p>
                                        </Col>
                                        <Col className="text-end">
                                            {calculateDiscount(selectedListing) > 0 && (
                                                <p className="text-muted mb-1">
                                                    <small><del>Original: {formatCurrency(selectedListing.ticket.originalPrice)}</del></small>
                                                </p>
                                            )}
                                            <h4 className="text-success mb-0">{formatCurrency(selectedListing.askingPrice)}</h4>
                                            {calculateDiscount(selectedListing) > 0 && (
                                                <small className="text-success">
                                                    You save {formatCurrency(selectedListing.ticket.originalPrice - selectedListing.askingPrice)}!
                                                </small>
                                            )}
                                        </Col>
                                    </Row>

                                    {selectedListing.description && (
                                        <>
                                            <hr />
                                            <p className="mb-0">
                                                <strong>Seller Notes:</strong> "{selectedListing.description}"
                                            </p>
                                        </>
                                    )}
                                </Card.Body>
                            </Card>

                            <Alert variant="info">
                                <strong>🛡️ Secure Resale Purchase:</strong>
                                <ul className="mb-0 mt-2">
                                    <li>Guaranteed authentic ticket</li>
                                    <li>Fair price at or below original cost</li>
                                    <li>Instant ticket transfer after payment</li>
                                    <li>Full buyer protection</li>
                                </ul>
                            </Alert>

                            <Alert variant="success">
                                <strong>💰 Payment Options:</strong>
                                <ul className="mb-0 mt-2">
                                    <li>Pay with account balance (no fees)</li>
                                    <li>Pay with credit card (small processing fee)</li>
                                </ul>
                            </Alert>
                        </>
                    )}

                    {purchaseStep === 'payment' && selectedListing && currentTransaction && (
                        <EnhancedPaymentForm
                            amount={selectedListing.askingPrice}
                            onPaymentComplete={handlePaymentComplete}
                            onCancel={() => setPurchaseStep('confirm')}
                            currentTransaction={currentTransaction}
                            ticketDetails={{
                                eventName: selectedListing.ticket.event.name,
                                eventDate: formatDate(selectedListing.ticket.event.eventDate),
                                venue: `${selectedListing.ticket.event.venue.name}, ${selectedListing.ticket.event.venue.city}`,
                                section: selectedListing.ticket.section,
                                row: selectedListing.ticket.row,
                                seat: selectedListing.ticket.seat,
                                seller: `${selectedListing.seller.firstName} ${selectedListing.seller.lastName.charAt(0)}.`
                            }}
                        />
                    )}

                    {purchaseStep === 'payment' && selectedListing && !currentTransaction && (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Creating transaction...</span>
                            </div>
                            <p className="mt-2">Preparing payment...</p>
                        </div>
                    )}

                    {purchaseStep === 'success' && purchaseDetails && (
                        <>
                            <div className="text-center mb-4">
                                <div className="mb-3">
                                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                                </div>
                                <h4 className="text-success">Resale Purchase Successful!</h4>
                                <p>The ticket has been transferred to your account.</p>
                            </div>

                            <Card className="bg-light">
                                <Card.Body>
                                    <h6 className="mb-3">📋 Purchase Summary</h6>
                                    <div className="mb-3">
                                        <strong>{purchaseDetails.eventName}</strong><br />
                                        <small className="text-muted">{formatDate(selectedListing.ticket.event.eventDate)}</small>
                                    </div>

                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Ticket Price:</span>
                                        <span>{formatCurrency(purchaseDetails.totalAmount)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Payment Method:</span>
                                        <span>{purchaseDetails.paymentMethod}</span>
                                    </div>
                                    {purchaseDetails.savings > 0 && (
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-success">Your Savings:</span>
                                            <span className="text-success">{formatCurrency(purchaseDetails.savings)}</span>
                                        </div>
                                    )}
                                    <div className="d-flex justify-content-between">
                                        <span>Transaction ID:</span>
                                        <span>{purchaseDetails.transactionId}</span>
                                    </div>
                                </Card.Body>
                            </Card>

                            <div className="text-center mt-4">
                                <Button
                                    variant="primary"
                                    onClick={() => navigate('/dashboard')}
                                    className="me-2"
                                >
                                    View My Tickets
                                </Button>
                                <Button variant="outline-secondary" onClick={resetPurchaseModal}>
                                    Close
                                </Button>
                            </div>
                        </>
                    )}
                </Modal.Body>

                {purchaseStep === 'confirm' && (
                    <Modal.Footer>
                        <Button variant="secondary" onClick={resetPurchaseModal}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handlePurchaseConfirm}
                            disabled={purchaseInProgress}
                        >
                            {purchaseInProgress ? 'Processing...' : 'Choose Payment Method'}
                        </Button>
                    </Modal.Footer>
                )}
            </Modal>
        </Container>
    );
};

export default ResaleMarketplacePage;