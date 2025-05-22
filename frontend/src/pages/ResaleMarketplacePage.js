// src/pages/ResaleMarketplacePage.js - FIXED VERSION
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAllListings, getListingsByEvent, purchaseListing } from '../api/listingApi';
import { getAllEvents } from '../api/eventApi';
import { createListingPurchaseTransaction, processPaymentWithBalance, processPayment } from '../api/transactionApi';
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

    // Purchase states
    const [purchaseInProgress, setPurchaseInProgress] = useState(false);
    const [purchaseError, setPurchaseError] = useState('');
    const [selectedListing, setSelectedListing] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
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
            } catch (err) {
                console.error('Error fetching all listings:', err);
                setError('Failed to load listings. Please try again.');
            }
        } else {
            try {
                const response = await getListingsByEvent(eventId);
                setListings(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error('Error fetching event listings:', err);
                setError('Failed to load event listings. Please try again.');
            }
        }
    };

    const handleSearch = () => {
        let filteredListings = Array.isArray(listings) ? [...listings] : [];

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
        setShowPaymentForm(false);
    };

    // FIXED: Create real transaction instead of mock
    const handlePurchaseConfirm = async () => {
        try {
            setPurchaseInProgress(true);
            setPurchaseError('');

            // Create a real transaction for listing purchase
            const transactionResponse = await createListingPurchaseTransaction(
                selectedListing.id,
                'card' // Default payment method, will be changed in payment form
            );

            setCurrentTransaction(transactionResponse.data);
            setPurchaseStep('payment');
            setShowPaymentForm(true);
            setPurchaseInProgress(false);
        } catch (error) {
            console.error('Error creating transaction:', error);
            setPurchaseError(error.response?.data?.message || 'Failed to initiate purchase. Please try again.');
            setPurchaseInProgress(false);
        }
    };

    // FIXED: Use real payment processing
    const handlePaymentComplete = async (paymentInfo) => {
        try {
            setPurchaseInProgress(true);

            if (paymentInfo.paymentMethod === 'balance') {
                console.log('Processing balance payment for transaction:', currentTransaction.id);

                // Process balance payment using the existing transaction
                const paymentResponse = await processPaymentWithBalance(currentTransaction.id);
                console.log('Balance payment response:', paymentResponse);

                // Complete the actual listing purchase
                const purchaseResponse = await purchaseListing(selectedListing.id);
                console.log('Purchase response:', purchaseResponse);

                const transactionDetails = {
                    transactionId: currentTransaction.transactionNumber || 'TRX-' + Math.random().toString(36).substr(2, 9),
                    eventName: selectedListing.ticket.event.name,
                    ticketNumber: selectedListing.ticket.ticketNumber,
                    section: selectedListing.ticket.section,
                    row: selectedListing.ticket.row,
                    seat: selectedListing.ticket.seat,
                    totalAmount: selectedListing.askingPrice,
                    paymentMethod: 'Account Balance',
                    balanceUsed: selectedListing.askingPrice,
                    newBalance: paymentInfo.newBalance,
                    purchaseDate: new Date().toISOString(),
                    seller: selectedListing.seller
                };

                setPurchaseDetails(transactionDetails);
            } else {
                console.log('Processing card payment for transaction:', currentTransaction.id);

                // Process credit card payment using the existing transaction
                const paymentResponse = await processPayment(
                    currentTransaction.id,
                    'credit_card',
                    JSON.stringify(paymentInfo.billingInfo)
                );
                console.log('Card payment response:', paymentResponse);

                // Complete the actual listing purchase
                const purchaseResponse = await purchaseListing(selectedListing.id);
                console.log('Purchase response:', purchaseResponse);

                const transactionDetails = {
                    transactionId: paymentInfo.paymentId,
                    eventName: selectedListing.ticket.event.name,
                    ticketNumber: selectedListing.ticket.ticketNumber,
                    section: selectedListing.ticket.section,
                    row: selectedListing.ticket.row,
                    seat: selectedListing.ticket.seat,
                    totalAmount: selectedListing.askingPrice * 1.029, // Include processing fee
                    paymentMethod: 'Credit Card',
                    lastFour: paymentInfo.lastFour,
                    purchaseDate: new Date().toISOString(),
                    seller: selectedListing.seller
                };

                setPurchaseDetails(transactionDetails);
            }

            setPurchaseStep('success');

            // Refresh listings after successful purchase
            fetchData();

            setPurchaseInProgress(false);
        } catch (error) {
            console.error('Payment processing error:', error);
            console.error('Error details:', error.response?.data);
            setPurchaseError(error.response?.data?.message || error.message || 'Payment processing failed. Please try again.');
            setPurchaseInProgress(false);
        }
    };

    const resetPurchaseModal = () => {
        setPurchaseStep('confirm');
        setPurchaseDetails(null);
        setCurrentTransaction(null);
        setPurchaseError('');
        setShowConfirmModal(false);
        setShowPaymentForm(false);
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
                            <Card className="h-100 shadow-sm">
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
                                            <p className="text-muted mb-0">
                                                <small>Original price: {formatCurrency(listing.ticket.originalPrice)}</small>
                                            </p>
                                            <h4 className="text-primary mb-0">{formatCurrency(listing.askingPrice)}</h4>
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
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {purchaseStep === 'confirm' && 'Confirm Purchase'}
                        {purchaseStep === 'payment' && 'Choose Payment Method'}
                        {purchaseStep === 'success' && 'Purchase Successful'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {purchaseStep === 'confirm' && selectedListing && (
                        <>
                            {purchaseError && <Alert variant="danger">{purchaseError}</Alert>}

                            <h5>{selectedListing.ticket.event.name}</h5>
                            <p className="text-muted mb-1">{formatDate(selectedListing.ticket.event.eventDate)}</p>
                            <p className="mb-3">
                                {selectedListing.ticket.event.venue.name}, {selectedListing.ticket.event.venue.city}
                            </p>

                            <Row className="mb-3">
                                <Col>
                                    <p>
                                        <strong>Section:</strong> {selectedListing.ticket.section || 'N/A'}<br />
                                        <strong>Row:</strong> {selectedListing.ticket.row || 'N/A'}<br />
                                        <strong>Seat:</strong> {selectedListing.ticket.seat || 'N/A'}
                                    </p>
                                </Col>
                                <Col className="text-end">
                                    <p className="text-muted mb-0">
                                        <small>Original price: {formatCurrency(selectedListing.ticket.originalPrice)}</small>
                                    </p>
                                    <h4 className="text-primary mb-0">{formatCurrency(selectedListing.askingPrice)}</h4>
                                </Col>
                            </Row>

                            <Alert variant="info">
                                <strong>Fair Price Guarantee:</strong> This ticket is being sold at or below its original purchase price.
                            </Alert>

                            <Alert variant="success">
                                <strong>💰 Payment Options Available:</strong>
                                <ul className="mb-0 mt-2">
                                    <li>Pay with your account balance (no processing fees)</li>
                                    <li>Pay with credit card (small processing fee applies)</li>
                                </ul>
                            </Alert>

                            <p className="text-center">
                                Are you sure you want to purchase this ticket?
                            </p>
                        </>
                    )}

                    {purchaseStep === 'payment' && selectedListing && (
                        <EnhancedPaymentForm
                            amount={selectedListing.askingPrice}
                            onPaymentComplete={handlePaymentComplete}
                            onCancel={() => setPurchaseStep('confirm')}
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

                    {purchaseStep === 'success' && purchaseDetails && (
                        <PurchaseConfirmation
                            purchaseDetails={{
                                ...purchaseDetails,
                                eventName: purchaseDetails.eventName,
                                quantity: 1,
                                totalAmount: purchaseDetails.totalAmount,
                                paymentMethod: purchaseDetails.paymentMethod,
                                lastFour: purchaseDetails.lastFour,
                                transactionId: purchaseDetails.transactionId
                            }}
                            onClose={resetPurchaseModal}
                        />
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