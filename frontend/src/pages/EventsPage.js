// src/pages/EventsPage.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getAllEvents, getEventsByType, searchEvents } from '../api/eventApi';

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [eventType, setEventType] = useState('');
    const [page, setPage] = useState(0);
    const [size] = useState(9); // Items per page
    const [totalPages, setTotalPages] = useState(0);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            let response;

            if (searchTerm) {
                response = await searchEvents(searchTerm);
                setEvents(response.data || []); // Add fallback empty array
            } else if (eventType) {
                response = await getEventsByType(eventType);
                setEvents(response.data || []); // Add fallback empty array
            } else {
                response = await getAllEvents(page, size);
                // Handle potential undefined data from paginated response
                if (response.data && response.data.content) {
                    setEvents(response.data.content);
                    setTotalPages(response.data.totalPages || 0);
                } else {
                    setEvents([]);
                    setTotalPages(0);
                }
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Failed to load events. Please try again later.');
            setLoading(false);

            // For demo purposes - mock data if API fails
            const mockEvents = [
                {
                    id: 1,
                    name: "Summer Music Festival",
                    description: "A fantastic summer festival featuring top artists",
                    eventDate: "2025-07-15T18:00:00",
                    imageUrl: "https://placehold.co/600x400?text=Summer+Festival",
                    venue: { name: "Central Park", city: "New York" },
                    eventType: "CONCERT",
                    availableTickets: 250
                },
                {
                    id: 2,
                    name: "Basketball Championship",
                    description: "The final championship game of the season",
                    eventDate: "2025-06-20T19:30:00",
                    imageUrl: "https://placehold.co/600x400?text=Basketball+Game",
                    venue: { name: "Sports Arena", city: "Los Angeles" },
                    eventType: "SPORTS",
                    availableTickets: 120
                },
                {
                    id: 3,
                    name: "Broadway Musical",
                    description: "Award-winning broadway show",
                    eventDate: "2025-08-05T20:00:00",
                    imageUrl: "https://placehold.co/600x400?text=Broadway+Show",
                    venue: { name: "Theater District", city: "New York" },
                    eventType: "THEATER",
                    availableTickets: 75
                },
                {
                    id: 4,
                    name: "Tech Conference 2025",
                    description: "Annual technology conference with industry leaders",
                    eventDate: "2025-09-10T09:00:00",
                    imageUrl: "https://placehold.co/600x400?text=Tech+Conference",
                    venue: { name: "Convention Center", city: "San Francisco" },
                    eventType: "CONFERENCE",
                    availableTickets: 500
                },
                {
                    id: 5,
                    name: "Food Festival",
                    description: "Celebrating culinary delights from around the world",
                    eventDate: "2025-08-22T11:00:00",
                    imageUrl: "https://placehold.co/600x400?text=Food+Festival",
                    venue: { name: "City Park", city: "Chicago" },
                    eventType: "FESTIVAL",
                    availableTickets: 350
                },
                {
                    id: 6,
                    name: "Comedy Night",
                    description: "An evening of laughs with top comedians",
                    eventDate: "2025-07-25T20:00:00",
                    imageUrl: "https://placehold.co/600x400?text=Comedy+Night",
                    venue: { name: "Laugh Factory", city: "Los Angeles" },
                    eventType: "OTHER",
                    availableTickets: 100
                }
            ];
            setEvents(mockEvents);
            setTotalPages(1);
        }
    };

    useEffect(() => {
        fetchEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, eventType]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchEvents();
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Event type options - match your backend enum
    const eventTypes = ['CONCERT', 'SPORTS', 'THEATER', 'CONFERENCE', 'FESTIVAL', 'OTHER'];

    const renderPagination = () => {
        let items = [];
        for (let number = 0; number < totalPages; number++) {
            items.push(
                <Pagination.Item key={number} active={number === page} onClick={() => handlePageChange(number)}>
                    {number + 1}
                </Pagination.Item>,
            );
        }

        return (
            <Pagination className="justify-content-center">
                <Pagination.Prev
                    onClick={() => handlePageChange(Math.max(0, page - 1))}
                    disabled={page === 0}
                />
                {items}
                <Pagination.Next
                    onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
                    disabled={page === totalPages - 1}
                />
            </Pagination>
        );
    };

    return (
        <Container className="py-5">
            <h1 className="text-center mb-5">Browse Events</h1>

            {/* Search and Filter */}
            <Row className="mb-4">
                <Col md={6}>
                    <Form onSubmit={handleSearch}>
                        <InputGroup>
                            <Form.Control
                                placeholder="Search events..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button variant="primary" type="submit">Search</Button>
                        </InputGroup>
                    </Form>
                </Col>
                <Col md={6}>
                    <Form.Select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                    >
                        <option value="">All Event Types</option>
                        {eventTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>

            {/* Events Display */}
            {loading ? (
                <div className="text-center py-5">
                    <p>Loading events...</p>
                </div>
            ) : error ? (
                <div className="text-center text-danger py-5">
                    <p>{error}</p>
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-5">
                    <p>No events found. Try adjusting your search or filters.</p>
                    <Button variant="primary" onClick={() => {
                        setSearchTerm('');
                        setEventType('');
                        setPage(0);
                    }}>
                        Reset Filters
                    </Button>
                </div>
            ) : (
                <>
                    <Row>
                        {events.map((event) => (
                            <Col key={event.id} md={6} lg={4} className="mb-4">
                                <Card className="h-100 shadow hover-card">
                                    <Card.Img
                                        variant="top"
                                        src={event.imageUrl || "https://placehold.co/600x400?text=Event+Image"}
                                        alt={event.name}
                                        style={{ height: '180px', objectFit: 'cover' }}
                                    />
                                    <Card.Body>
                                        <Card.Title>{event.name}</Card.Title>
                                        <Card.Text className="text-muted mb-1">
                                            {formatDate(event.eventDate)}
                                        </Card.Text>
                                        <Card.Text className="mb-1">
                                            {event.venue?.name}, {event.venue?.city}
                                        </Card.Text>
                                        <Card.Text className="mb-3">
                                            <span className="badge bg-primary me-2">{event.eventType}</span>
                                            <span className={`badge ${event.availableTickets > 0 ? 'bg-success' : 'bg-danger'}`}>
                        {event.availableTickets > 0 ? `${event.availableTickets} tickets available` : 'Sold Out'}
                      </span>
                                        </Card.Text>
                                        <Link to={`/events/${event.id}`}>
                                            <Button variant="outline-primary" size="sm">View Details</Button>
                                        </Link>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Pagination */}
                    {!searchTerm && !eventType && totalPages > 1 && renderPagination()}
                </>
            )}
        </Container>
    );
};

export default EventsPage;