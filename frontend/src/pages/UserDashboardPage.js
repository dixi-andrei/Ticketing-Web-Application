// src/pages/UserDashboardPage.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Tab, Nav, Badge, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
    getMyTickets,
    getMyUpcomingTickets,
    getMyListings,
    getMyPurchases,
    getMySales,
    getMyTotalPurchases,
    getMyTotalSales
} from '../api/userApi';
import AuthContext from '../contexts/AuthContext';
import TicketResellForm from '../components/tickets/TicketResellForm';
import TicketDetail from '../components/tickets/TicketDetail';

const UserDashboardPage = () => {
    const { currentUser } = useContext(AuthContext);

    const [tickets, setTickets] = useState([]);
    const [upcomingTickets, setUpcomingTickets] = useState([]);
    const [listings, setListings] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [sales, setSales] = useState([]);
    const [totalPurchases, setTotalPurchases] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for ticket actions
    const [showResellForm, setShowResellForm] = useState(false);
    const [showTicketDetail, setShowTicketDetail] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    // Functions for ticket actions
    const handleResellClick = (ticket) => {
        setSelectedTicket(ticket);
        setShowResellForm(true);
    };

    const handleViewTicketClick = (ticket) => {
        setSelectedTicket(ticket);
        setShowTicketDetail(true);
    };

    const handleResellSuccess = () => {
        // You would typically refetch listings here
        alert('Ticket listed successfully!');
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);

                // Use Promise.all to fetch all data concurrently
                const [
                    ticketsRes,
                    upcomingTicketsRes,
                    listingsRes,
                    purchasesRes,
                    salesRes,
                    totalPurchasesRes,
                    totalSalesRes
                ] = await Promise.all([
                    getMyTickets().catch(() => ({ data: [] })),
                    getMyUpcomingTickets().catch(() => ({ data: [] })),
                    getMyListings().catch(() => ({ data: [] })),
                    getMyPurchases().catch(() => ({ data: [] })),
                    getMySales().catch(() => ({ data: [] })),
                    getMyTotalPurchases().catch(() => ({ data: { total: 0 } })),
                    getMyTotalSales().catch(() => ({ data: { total: 0 } }))
                ]);

                setTickets(ticketsRes.data);
                setUpcomingTickets(upcomingTicketsRes.data);
                setListings(listingsRes.data);
                setPurchases(purchasesRes.data);
                setSales(salesRes.data);
                setTotalPurchases(totalPurchasesRes.data.total || 0);
                setTotalSales(totalSalesRes.data.total || 0);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to load your data. Please try again later.');
                setLoading(false);

                // Mock data for demonstration
                const mockTickets = [
                    {
                        id: 1,
                        ticketNumber: "TKT-12345",
                        event: {
                            id: 101,
                            name: "Summer Music Festival",
                            eventDate: "2025-07-15T18:00:00",
                            venue: {
                                name: "Central Park",
                                city: "New York"
                            }
                        },
                        section: "A",
                        row: "5",
                        seat: "23",
                        originalPrice: 150.00,
                        currentPrice: 150.00,
                        status: "PURCHASED",
                        purchaseDate: "2025-05-05T14:30:00"
                    },
                    {
                        id: 2,
                        ticketNumber: "TKT-67890",
                        event: {
                            id: 102,
                            name: "Basketball Championship",
                            eventDate: "2025-06-20T19:30:00",
                            venue: {
                                name: "Sports Arena",
                                city: "Los Angeles"
                            }
                        },
                        section: "B",
                        row: "10",
                        seat: "15",
                        originalPrice: 100.00,
                        currentPrice: 100.00,
                        status: "PURCHASED",
                        purchaseDate: "2025-05-10T09:15:00"
                    }
                ];

                const mockListings = [
                    {
                        id: 1,
                        ticket: {
                            id: 3,
                            ticketNumber: "TKT-24680",
                            event: {
                                id: 103,
                                name: "Comedy Night",
                                eventDate: "2025-06-05T20:00:00"
                            },
                            originalPrice: 80.00
                        },
                        askingPrice: 75.00,
                        status: "ACTIVE",
                        listingDate: "2025-05-12T11:20:00"
                    }
                ];

                const mockTransactions = [
                    {
                        id: 1,
                        transactionNumber: "TRX-12345",
                        amount: 150.00,
                        status: "COMPLETED",
                        type: "PRIMARY_PURCHASE",
                        transactionDate: "2025-05-05T14:30:00",
                        ticket: {
                            id: 1,
                            event: {
                                name: "Summer Music Festival"
                            }
                        }
                    },
                    {
                        id: 2,
                        transactionNumber: "TRX-67890",
                        amount: 100.00,
                        status: "COMPLETED",
                        type: "PRIMARY_PURCHASE",
                        transactionDate: "2025-05-10T09:15:00",
                        ticket: {
                            id: 2,
                            event: {
                                name: "Basketball Championship"
                            }
                        }
                    }
                ];

                setTickets(mockTickets);
                setUpcomingTickets(mockTickets);
                setListings(mockListings);
                setPurchases(mockTransactions);
                setSales([]);
                setTotalPurchases(250.00);
                setTotalSales(0);
            }
        };

        fetchUserData();
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <Container className="py-5">
            <h1 className="mb-4">My Dashboard</h1>

            {/* User Profile Summary */}
            <Row className="mb-4">
                <Col>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Row>
                                <Col md={2} className="text-center mb-3 mb-md-0">
                                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                        <span className="fs-1">{currentUser?.firstName?.charAt(0)}{currentUser?.lastName?.charAt(0)}</span>
                                    </div>
                                </Col>
                                <Col md={7}>
                                    <h3>{currentUser?.firstName} {currentUser?.lastName}</h3>
                                    <p className="text-muted">{currentUser?.email}</p>
                                </Col>
                                <Col md={3} className="d-flex flex-column justify-content-center">
                                    <div className="mb-2">
                                        <span className="fw-bold">Total Purchased:</span> {formatCurrency(totalPurchases)}
                                    </div>
                                    <div>
                                        <span className="fw-bold">Total Sales:</span> {formatCurrency(totalSales)}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Dashboard Tabs */}
            <Row>
                <Col>
                    <Tab.Container id="dashboard-tabs" defaultActiveKey="upcoming">
                        <Card className="shadow-sm">
                            <Card.Header>
                                <Nav variant="tabs">
                                    <Nav.Item>
                                        <Nav.Link eventKey="upcoming">Upcoming Events</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="tickets">All Tickets</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="listings">My Listings</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="transactions">Transactions</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Header>
                            <Card.Body>
                                {loading ? (
                                    <div className="text-center py-5">
                                        <p>Loading your dashboard...</p>
                                    </div>
                                ) : error ? (
                                    <Alert variant="danger">{error}</Alert>
                                ) : (
                                    <Tab.Content>
                                        {/* Upcoming Events Tab */}
                                        <Tab.Pane eventKey="upcoming">
                                            {upcomingTickets.length > 0 ? (
                                                <div className="table-responsive">
                                                    <table className="table table-hover">
                                                        <thead>
                                                        <tr>
                                                            <th>Event</th>
                                                            <th>Date</th>
                                                            <th>Ticket #</th>
                                                            <th>Section/Row/Seat</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {upcomingTickets.map((ticket) => (
                                                            <tr key={ticket.id}>
                                                                <td>
                                                                    <Link to={`/events/${ticket.event.id}`} className="text-decoration-none">
                                                                        {ticket.event.name}
                                                                    </Link>
                                                                </td>
                                                                <td>{formatDate(ticket.event.eventDate)}</td>
                                                                <td>{ticket.ticketNumber}</td>
                                                                <td>
                                                                    {ticket.section && `Section ${ticket.section}`}
                                                                    {ticket.row && `, Row ${ticket.row}`}
                                                                    {ticket.seat && `, Seat ${ticket.seat}`}
                                                                </td>
                                                                <td>
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        className="me-2"
                                                                        onClick={() => handleViewTicketClick(ticket)}
                                                                    >
                                                                        View Ticket
                                                                    </Button>
                                                                    {ticket.status !== "LISTED" && (
                                                                        <Button
                                                                            variant="outline-success"
                                                                            size="sm"
                                                                            onClick={() => handleResellClick(ticket)}
                                                                        >
                                                                            Resell
                                                                        </Button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <Alert variant="info">
                                                    You don't have any upcoming events. <Link to="/events">Browse events</Link> to purchase tickets.
                                                </Alert>
                                            )}
                                        </Tab.Pane>

                                        {/* All Tickets Tab */}
                                        <Tab.Pane eventKey="tickets">
                                            {tickets.length > 0 ? (
                                                <div className="table-responsive">
                                                    <table className="table table-hover">
                                                        <thead>
                                                        <tr>
                                                            <th>Event</th>
                                                            <th>Date</th>
                                                            <th>Ticket #</th>
                                                            <th>Price</th>
                                                            <th>Status</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {tickets.map((ticket) => (
                                                            <tr key={ticket.id}>
                                                                <td>
                                                                    <Link to={`/events/${ticket.event.id}`} className="text-decoration-none">
                                                                        {ticket.event.name}
                                                                    </Link>
                                                                </td>
                                                                <td>{formatDate(ticket.event.eventDate)}</td>
                                                                <td>{ticket.ticketNumber}</td>
                                                                <td>{formatCurrency(ticket.currentPrice)}</td>
                                                                <td>
                                                                    <Badge bg={
                                                                        ticket.status === "PURCHASED" ? "success" :
                                                                            ticket.status === "LISTED" ? "warning" :
                                                                                ticket.status === "USED" ? "secondary" : "info"
                                                                    }>
                                                                        {ticket.status}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <Alert variant="info">
                                                    You don't have any tickets. <Link to="/events">Browse events</Link> to purchase tickets.
                                                </Alert>
                                            )}
                                        </Tab.Pane>

                                        {/* Listings Tab */}
                                        <Tab.Pane eventKey="listings">
                                            {listings.length > 0 ? (
                                                <div className="table-responsive">
                                                    <table className="table table-hover">
                                                        <thead>
                                                        <tr>
                                                            <th>Event</th>
                                                            <th>Date</th>
                                                            <th>Original Price</th>
                                                            <th>Asking Price</th>
                                                            <th>Status</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {listings.map((listing) => (
                                                            <tr key={listing.id}>
                                                                <td>
                                                                    <Link to={`/events/${listing.ticket.event.id}`} className="text-decoration-none">
                                                                        {listing.ticket.event.name}
                                                                    </Link>
                                                                </td>
                                                                <td>{formatDate(listing.ticket.event.eventDate)}</td>
                                                                <td>{formatCurrency(listing.ticket.originalPrice)}</td>
                                                                <td>{formatCurrency(listing.askingPrice)}</td>
                                                                <td>
                                                                    <Badge bg={
                                                                        listing.status === "ACTIVE" ? "success" :
                                                                            listing.status === "SOLD" ? "primary" :
                                                                                "secondary"
                                                                    }>
                                                                        {listing.status}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    {listing.status === "ACTIVE" && (
                                                                        <Button
                                                                            variant="outline-danger"
                                                                            size="sm"
                                                                            onClick={() => alert("Cancellation would be processed here")}
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <Alert variant="info">
                                                    You don't have any active listings. You can resell tickets from your upcoming events.
                                                </Alert>
                                            )}
                                        </Tab.Pane>

                                        {/* Transactions Tab */}
                                        <Tab.Pane eventKey="transactions">
                                            <Nav variant="pills" className="mb-3">
                                                <Nav.Item>
                                                    <Nav.Link
                                                        eventKey="purchases"
                                                        className="px-4 me-2"
                                                        active={true}
                                                        onClick={() => {}}
                                                    >
                                                        Purchases
                                                    </Nav.Link>
                                                </Nav.Item>
                                                <Nav.Item>
                                                    <Nav.Link
                                                        eventKey="sales"
                                                        className="px-4"
                                                        onClick={() => {}}
                                                    >
                                                        Sales
                                                    </Nav.Link>
                                                </Nav.Item>
                                            </Nav>

                                            {/* Purchases Sub-Tab */}
                                            <div>
                                                {purchases.length > 0 ? (
                                                    <div className="table-responsive">
                                                        <table className="table table-hover">
                                                            <thead>
                                                            <tr>
                                                                <th>Transaction #</th>
                                                                <th>Date</th>
                                                                <th>Event</th>
                                                                <th>Amount</th>
                                                                <th>Status</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {purchases.map((transaction) => (
                                                                <tr key={transaction.id}>
                                                                    <td>{transaction.transactionNumber}</td>
                                                                    <td>{formatDate(transaction.transactionDate)}</td>
                                                                    <td>{transaction.ticket?.event?.name}</td>
                                                                    <td>{formatCurrency(transaction.amount)}</td>
                                                                    <td>
                                                                        <Badge bg={
                                                                            transaction.status === "COMPLETED" ? "success" :
                                                                                transaction.status === "PENDING" ? "warning" :
                                                                                    transaction.status === "REFUNDED" ? "info" :
                                                                                        "danger"
                                                                        }>
                                                                            {transaction.status}
                                                                        </Badge>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <Alert variant="info">
                                                        You don't have any purchase transactions yet.
                                                    </Alert>
                                                )}
                                            </div>
                                        </Tab.Pane>
                                    </Tab.Content>
                                )}
                            </Card.Body>
                        </Card>
                    </Tab.Container>
                </Col>
            </Row>

            {/* Modals for ticket actions */}
            {showResellForm && selectedTicket && (
                <TicketResellForm
                    ticket={selectedTicket}
                    onClose={() => setShowResellForm(false)}
                    onSuccess={handleResellSuccess}
                />
            )}

            {showTicketDetail && selectedTicket && (
                <TicketDetail
                    ticket={selectedTicket}
                    onClose={() => setShowTicketDetail(false)}
                />
            )}
        </Container>
    );
};

export default UserDashboardPage;