// src/pages/ResaleMarketplacePage.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAllListings, getListingsByEvent, purchaseListing } from '../api/listingApi';
import { getAllEvents } from '../api/eventApi';
import AuthContext from '../contexts/AuthContext';
import PaymentForm from '../components/tickets/PaymentForm';

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
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch all available resale listings
            const listingsResponse = await getAllListings();
            setListings(Array.isArray(listingsResponse.data) ? listingsResponse.data : []);

            // Fetch events for filtering
            const eventsResponse = await getAllEvents();
            setEvents(Array.isArray(eventsResponse.data?.content) ? eventsResponse.data.content : []);

            setLoading(false);
        } catch (err) {
            console.error('Error fetching resale marketplace data:', err);
            setError('Failed to load resale listings. Please try again later.');
            setLoading(false);

            // Set mock data for demonstration
            setMockData();
        }
    };

    const setMockData = () => {
        // Mock listings (your existing mock data)
        const mockListings = [
            // Your existing mock data
        ];

        // Mock events
        const mockEvents = [
            // Your existing mock data
        ];

        setListings(mockListings);
        setEvents(mockEvents);
    };

    const handleEventFilterChange = async (eventId) => {
        setSelectedEvent(eventId);
        if (!eventId) {
            // If no event selected, show all listings
            try {
                const response = await getAllListings();
                setListings(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error('Error fetching all listings:', err);
                setError('Failed to load listings. Please try again.');
            }
        } else {
            // Filter listings by event
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
        // Filter listings based on price range and search term
        // This is client-side filtering for simplicity

        // Make sure listings is an array before filtering
        let filteredListings = Array.isArray(listings) ? [...listings] : [];

        // Filter by price range
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

        // Filter by search term (event name, venue, etc.)
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
        setShowConfirmModal(true);
        setPurchaseError('');
        setShowPaymentForm(false);  // Reset payment form visibility
        setPurchaseSuccess(false);  // Reset success state
    };

    const handlePurchaseConfirm = async () => {
        try {
            setPurchaseInProgress(true);
            setPurchaseError('');

            // Instead of immediately completing the purchase,
            // set a state to show payment form
            setShowPaymentForm(true);

            // The actual purchase will happen after payment form is submitted

        } catch (err) {
            console.error('Error initiating purchase:', err);
            setPurchaseError(err.response?.data?.message || 'Failed to initiate purchase. Please try again.');
            setPurchaseInProgress(false);
        }
    };

    const completePurchaseWithPayment = async (listingId, paymentDetails) => {
        try {
            // Call API to purchase the listing with payment details
            await purchaseListing(listingId);

            setPurchaseSuccess(true);
            setPurchaseInProgress(false);

            // Refresh listings after purchase
            fetchData();

            // Close modal after success
            setTimeout(() => {
                setShowConfirmModal(false);
                navigate('/dashboard', { state: { activeTab: 'tickets' } });
            }, 2000);
        } catch (err) {
            console.error('Error completing purchase:', err);
            setPurchaseError(err.response?.data?.message || 'Failed to complete purchase. Please try again.');
            setPurchaseInProgress(false);
        }
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
                                    <small>Sold by {listing.seller.firstName} {listing.seller.lastName.charAt(0)}</small>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Purchase Confirmation Modal */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Purchase</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {purchaseSuccess ? (
                        <Alert variant="success">
                            <Alert.Heading>Purchase Successful!</Alert.Heading>
                            <p>Your ticket has been purchased successfully. You can view it in your dashboard.</p>
                        </Alert>
                    ) : (
                        <>
                            {purchaseError && <Alert variant="danger">{purchaseError}</Alert>}

                            {selectedListing && !showPaymentForm && (
                                <>
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

                                    <p className="text-center">
                                        Are you sure you want to purchase this ticket?
                                    </p>
                                </>
                            )}

                            {showPaymentForm && selectedListing && (
                                <PaymentForm
                                    amount={selectedListing.askingPrice}
                                    onPaymentComplete={(paymentDetails) => {
                                        // Now complete the purchase with payment info
                                        completePurchaseWithPayment(selectedListing.id, paymentDetails);
                                    }}
                                    onCancel={() => {
                                        setShowPaymentForm(false);
                                        setPurchaseInProgress(false);
                                    }}
                                />
                            )}
                        </>
                    )}
                </Modal.Body>
                {!purchaseSuccess && !showPaymentForm && (
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handlePurchaseConfirm}
                            disabled={purchaseInProgress}
                        >
                            {purchaseInProgress ? 'Processing...' : 'Proceed to Payment'}
                        </Button>
                    </Modal.Footer>
                )}
            </Modal>
        </Container>
    );
};

export default ResaleMarketplacePage;