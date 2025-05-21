// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { getUpcomingEvents } from '../api/eventApi';
import { getEventImageUrl, handleImageError } from '../utils/imageUtils';

const HomePage = () => {
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUpcomingEvents = async () => {
            try {
                const response = await getUpcomingEvents();
                // Add a check to ensure data exists before trying to slice it
                if (response && response.data) {
                    setUpcomingEvents(response.data.slice(0, 6)); // Get up to 6 events for featured section
                } else {
                    setUpcomingEvents([]);
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching upcoming events:', err);
                setError('Failed to load upcoming events');
                setLoading(false);
            }
        };

        fetchUpcomingEvents();
    }, []);

    // For demonstration, we'll add some mock events if the API call fails
    useEffect(() => {
        if (loading === false && upcomingEvents.length === 0 && !error) {
            // Sample data for demonstration
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
                }
            ];
            setUpcomingEvents(mockEvents);
        }
    }, [loading, upcomingEvents.length, error]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <>
            {/* Hero Section */}
            <section className="bg-dark text-white py-5">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6} className="mb-4 mb-lg-0">
                            <h1 className="display-4 fw-bold">Find Your Next Experience</h1>
                            <p className="lead">
                                Discover events, buy tickets securely, and resell tickets with price ceiling protection.
                            </p>
                            <Link to="/events">
                                <Button size="lg" variant="primary" className="mt-3">
                                    Browse Events
                                </Button>
                            </Link>
                        </Col>
                        <Col lg={6}>
                            <Carousel>
                                {upcomingEvents.slice(0, 3).map((event) => (
                                    <Carousel.Item key={event.id}>
                                        <img
                                            className="d-block w-100 rounded"
                                            src={getEventImageUrl(event)}
                                            alt={event.name || "Event"}
                                            style={{ height: '300px', objectFit: 'cover' }}
                                            onError={(e) => handleImageError(e, event.eventType)}
                                        />
                                        <Carousel.Caption>
                                            <h3>{event.name}</h3>
                                            <p>{event.venue?.name}, {event.venue?.city}</p>
                                        </Carousel.Caption>
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Featured Events Section */}
            <section className="py-5">
                <Container>
                    <h2 className="text-center mb-4">Featured Events</h2>

                    {loading ? (
                        <div className="text-center">
                            <p>Loading events...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center text-danger">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <Row>
                            {upcomingEvents.map((event) => (
                                <Col key={event.id} md={6} lg={4} className="mb-4">
                                    <Card className="h-100 shadow">
                                        <Card.Img
                                            variant="top"
                                            src={getEventImageUrl(event)}
                                            alt={event.name || "Event"}
                                            style={{ height: '180px', objectFit: 'cover' }}
                                            onError={(e) => handleImageError(e, event.eventType)}
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
                                                <span className="badge bg-success">{event.availableTickets} tickets available</span>
                                            </Card.Text>
                                            <Link to={`/events/${event.id}`}>
                                                <Button variant="outline-primary" size="sm">View Details</Button>
                                            </Link>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}

                    <div className="text-center mt-4">
                        <Link to="/events">
                            <Button variant="primary">View All Events</Button>
                        </Link>
                    </div>
                </Container>
            </section>

            {/* How It Works Section */}
            <section className="py-5 bg-light">
                <Container>
                    <h2 className="text-center mb-5">How It Works</h2>
                    <Row>
                        <Col md={4} className="text-center mb-4">
                            <div className="display-3 mb-3">🔍</div>
                            <h4>Find Events</h4>
                            <p>Browse our catalog of upcoming events and find something you'll love</p>
                        </Col>
                        <Col md={4} className="text-center mb-4">
                            <div className="display-3 mb-3">🎟️</div>
                            <h4>Secure Purchase</h4>
                            <p>Buy tickets with confidence through our secure platform</p>
                        </Col>
                        <Col md={4} className="text-center mb-4">
                            <div className="display-3 mb-3">💰</div>
                            <h4>Fair Resale</h4>
                            <p>Can't attend? Resell your tickets (never above original price)</p>
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    );
};

export default HomePage;