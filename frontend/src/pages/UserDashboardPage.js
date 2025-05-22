// src/pages/UserDashboardPage.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Tab, Nav, Badge, Button, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import {
    getMyTickets,
    getMyUpcomingTickets,
    getMyListings,
    getMyPurchases,
    getMySales,
    getMyTotalPurchases,
    getMyTotalSales
} from '../api/userApi';
import { getCurrentBalance, getBalanceHistory } from '../api/userBalanceApi';
import { cancelListing } from '../api/listingApi';
import { canTicketBeResold } from '../api/ticketApi';
import AuthContext from '../contexts/AuthContext';
import TicketResellForm from '../components/tickets/TicketResellForm';
import TicketDetail from '../components/tickets/TicketDetail';
import ProfileEditModal from '../components/user/ProfileEditModal';
import BalanceHistoryModal from '../components/user/BalanceHistoryModal';

const UserDashboardPage = () => {
    const { currentUser, updateUserProfile } = useContext(AuthContext);
    const location = useLocation();

    // Get active tab from location state or default to 'upcoming'
    const defaultActiveTab = location.state?.activeTab || 'upcoming';
    const [activeTab, setActiveTab] = useState(defaultActiveTab);
    const [activeSubTab, setActiveSubTab] = useState('purchases');

    // Data states
    const [tickets, setTickets] = useState([]);
    const [upcomingTickets, setUpcomingTickets] = useState([]);
    const [listings, setListings] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [sales, setSales] = useState([]);
    const [totalPurchases, setTotalPurchases] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [userBalance, setUserBalance] = useState(0);
    const [balanceHistory, setBalanceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal states
    const [showResellForm, setShowResellForm] = useState(false);
    const [showTicketDetail, setShowTicketDetail] = useState(false);
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [showBalanceHistory, setShowBalanceHistory] = useState(false);
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
        // Refetch the listings and tickets data
        fetchUserData();
        // Show a success message
        alert('Ticket listed successfully!');
    };

    const handleCancelListing = async (listingId) => {
        try {
            // Call the API to cancel the listing
            await cancelListing(listingId);

            // Refetch the data
            fetchUserData();

            alert('Listing cancelled successfully');
        } catch (err) {
            console.error('Error cancelling listing:', err);
            alert('Failed to cancel listing. Please try again.');
        }
    };

    const handleProfileUpdate = (updatedProfile) => {
        updateUserProfile(updatedProfile);
        setShowProfileEdit(false);
        // You might want to show a success message here
        alert('Profile updated successfully!');
    };

    const fetchUserData = async () => {
        try {
            setLoading(true);
            setError('');

            // Use Promise.all to fetch all data concurrently
            const [
                ticketsRes,
                upcomingTicketsRes,
                listingsRes,
                purchasesRes,
                salesRes,
                totalPurchasesRes,
                totalSalesRes,
                balanceRes,
                balanceHistoryRes
            ] = await Promise.all([
                getMyTickets().catch(() => ({ data: [] })),
                getMyUpcomingTickets().catch(() => ({ data: [] })),
                getMyListings().catch(() => ({ data: [] })),
                getMyPurchases().catch(() => ({ data: [] })),
                getMySales().catch(() => ({ data: [] })),
                getMyTotalPurchases().catch(() => ({ data: { total: 0 } })),
                getMyTotalSales().catch(() => ({ data: { total: 0 } })),
                getCurrentBalance().catch((err) => {
                    console.error('Balance fetch error:', err);
                    return { data: { balance: 0 } };
                }),
                getBalanceHistory().catch((err) => {
                    console.error('Balance history fetch error:', err);
                    return { data: [] };
                })
            ]);

            // Ensure all data is properly formatted as arrays
            setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
            setUpcomingTickets(Array.isArray(upcomingTicketsRes.data) ? upcomingTicketsRes.data : []);
            setListings(Array.isArray(listingsRes.data) ? listingsRes.data : []);
            setPurchases(Array.isArray(purchasesRes.data) ? purchasesRes.data : []);
            setSales(Array.isArray(salesRes.data) ? salesRes.data : []);
            setTotalPurchases(totalPurchasesRes.data?.total || 0);
            setTotalSales(totalSalesRes.data?.total || 0);

            // Fix balance handling
            const balanceValue = balanceRes.data?.balance || 0;
            setUserBalance(balanceValue);
            console.log('Balance fetched:', balanceValue); // Debug log

            // Fix balance history handling
            const historyArray = Array.isArray(balanceHistoryRes.data) ? balanceHistoryRes.data : [];
            setBalanceHistory(historyArray);
            console.log('Balance history fetched:', historyArray); // Debug log

            setLoading(false);
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Failed to load your data. Please try again later.');
            setLoading(false);


            setMockData();
        }
    };

    const setMockData = () => {
        // Mock tickets data
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

        // Mock balance data
        const mockBalanceHistory = [
            {
                id: 1,
                amount: 75.00,
                type: "CREDIT",
                description: "Payment for ticket TKT-24680",
                transactionDate: "2025-05-12T11:20:00",
                referenceType: "Transaction"
            }
        ];

        setTickets(mockTickets);
        setUpcomingTickets(mockTickets);
        setListings([]);
        setPurchases([]);
        setSales([]);
        setTotalPurchases(250.00);
        setTotalSales(75.00);
        setUserBalance(75.00);
        setBalanceHistory(mockBalanceHistory);
    };

    useEffect(() => {
        fetchUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "Date not available";

        try {
            const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
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

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "PURCHASED":
            case "COMPLETED":
            case "ACTIVE":
                return "success";
            case "LISTED":
            case "PENDING":
                return "warning";
            case "SOLD":
                return "primary";
            case "USED":
            case "CANCELLED":
                return "secondary";
            case "FAILED":
                return "danger";
            case "REFUNDED":
                return "info";
            default:
                return "secondary";
        }
    };

    const getInitials = (firstName, lastName) => {
        return (firstName?.charAt(0) || "") + (lastName?.charAt(0) || "");
    };

    return (
        <Container className="py-5">
            <h1 className="mb-4">My Dashboard</h1>

            {/* User Profile Summary with Balance */}
            <Row className="mb-4">
                <Col>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Row>
                                <Col md={2} className="text-center mb-3 mb-md-0">
                                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                        <span className="fs-1">{getInitials(currentUser?.firstName, currentUser?.lastName)}</span>
                                    </div>
                                    <div className="mt-2">
                                        <Button variant="outline-primary" size="sm" onClick={() => setShowProfileEdit(true)}>
                                            Edit Profile
                                        </Button>
                                    </div>
                                </Col>
                                <Col md={5}>
                                    <h3>{currentUser?.firstName} {currentUser?.lastName}</h3>
                                    <p className="text-muted">{currentUser?.email}</p>
                                    <div className="mb-2">
                                        <span className="fw-bold">Total Purchased:</span> {formatCurrency(totalPurchases)}
                                    </div>
                                    <div>
                                        <span className="fw-bold">Total Sales:</span> {formatCurrency(totalSales)}
                                    </div>
                                </Col>
                                <Col md={5}>
                                    <Card className="bg-success text-white">
                                        <Card.Body className="text-center">
                                            <h5 className="mb-1">Account Balance</h5>
                                            <h2 className="mb-2">{formatCurrency(userBalance)}</h2>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                onClick={() => setShowBalanceHistory(true)}
                                            >
                                                View History
                                            </Button>
                                            {userBalance > 0 && (
                                                <div className="mt-2">
                                                    <small>Available for ticket purchases</small>
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Dashboard Tabs */}
            <Row>
                <Col>
                    <Tab.Container id="dashboard-tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
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
                                    <Nav.Item>
                                        <Nav.Link eventKey="balance">Balance Activity</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Header>
                            <Card.Body>
                                {loading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </Spinner>
                                        <p className="mt-3">Loading your dashboard...</p>
                                    </div>
                                ) : error ? (
                                    <Alert variant="danger">{error}</Alert>
                                ) : (
                                    <Tab.Content>
                                        {/* Upcoming Events Tab */}
                                        <Tab.Pane eventKey="upcoming">
                                            {upcomingTickets && upcomingTickets.length > 0 ? (
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
                                                        {Array.isArray(upcomingTickets) && upcomingTickets.map((ticket) => (
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
                                                                    {ticket.status === "PURCHASED" && (
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
                                            {tickets && tickets.length > 0 ? (
                                                <div className="table-responsive">
                                                    <table className="table table-hover">
                                                        <thead>
                                                        <tr>
                                                            <th>Event</th>
                                                            <th>Date</th>
                                                            <th>Ticket #</th>
                                                            <th>Price</th>
                                                            <th>Status</th>
                                                            <th>Actions</th>
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
                                                                    <Badge bg={getStatusBadgeColor(ticket.status)}>
                                                                        {ticket.status}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        onClick={() => handleViewTicketClick(ticket)}
                                                                    >
                                                                        View
                                                                    </Button>
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
                                            {listings && listings.length > 0 ? (
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
                                                                    <Badge bg={getStatusBadgeColor(listing.status)}>
                                                                        {listing.status}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    {listing.status === "ACTIVE" && (
                                                                        <Button
                                                                            variant="outline-danger"
                                                                            size="sm"
                                                                            onClick={() => handleCancelListing(listing.id)}
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                    )}
                                                                    {listing.status === "SOLD" && (
                                                                        <Badge bg="success">
                                                                            Sold - Money added to balance
                                                                        </Badge>
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
                                                        active={activeSubTab === 'purchases'}
                                                        onClick={() => setActiveSubTab('purchases')}
                                                        className="px-4 me-2"
                                                    >
                                                        Purchases
                                                    </Nav.Link>
                                                </Nav.Item>
                                                <Nav.Item>
                                                    <Nav.Link
                                                        active={activeSubTab === 'sales'}
                                                        onClick={() => setActiveSubTab('sales')}
                                                        className="px-4"
                                                    >
                                                        Sales
                                                    </Nav.Link>
                                                </Nav.Item>
                                            </Nav>

                                            {/* Purchases Sub-Tab */}
                                            {activeSubTab === 'purchases' && (
                                                <>
                                                    {purchases && purchases.length > 0 ? (
                                                        <div className="table-responsive">
                                                            <table className="table table-hover">
                                                                <thead>
                                                                <tr>
                                                                    <th>Transaction #</th>
                                                                    <th>Date</th>
                                                                    <th>Event</th>
                                                                    <th>Amount</th>
                                                                    <th>Status</th>
                                                                    <th>Payment Method</th>
                                                                </tr>
                                                                </thead>
                                                                <tbody>
                                                                {purchases.map((transaction) => (
                                                                    <tr key={transaction.id}>
                                                                        <td>{transaction.transactionNumber}</td>
                                                                        <td>{formatDate(transaction.transactionDate)}</td>
                                                                        <td>{transaction.ticket?.event?.name || "N/A"}</td>
                                                                        <td>{formatCurrency(transaction.amount)}</td>
                                                                        <td>
                                                                            <Badge bg={getStatusBadgeColor(transaction.status)}>
                                                                                {transaction.status}
                                                                            </Badge>
                                                                        </td>
                                                                        <td>
                                                                            {transaction.paymentIntentId?.includes('BALANCE') ?
                                                                                <Badge bg="info">Account Balance</Badge> :
                                                                                <Badge bg="primary">Credit Card</Badge>
                                                                            }
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
                                                </>
                                            )}

                                            {/* Sales Sub-Tab */}
                                            {activeSubTab === 'sales' && (
                                                <>
                                                    {sales && sales.length > 0 ? (
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
                                                                {sales.map((transaction) => (
                                                                    <tr key={transaction.id}>
                                                                        <td>{transaction.transactionNumber}</td>
                                                                        <td>{formatDate(transaction.transactionDate)}</td>
                                                                        <td>{transaction.ticket?.event?.name || "N/A"}</td>
                                                                        <td>{formatCurrency(transaction.amount)}</td>
                                                                        <td>
                                                                            <Badge bg={getStatusBadgeColor(transaction.status)}>
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
                                                            You don't have any sales transactions yet. List your tickets for resale to start selling.
                                                        </Alert>
                                                    )}
                                                </>
                                            )}
                                        </Tab.Pane>

                                        {/* Balance Activity Tab */}
                                        <Tab.Pane eventKey="balance">
                                            <div className="mb-3">
                                                <h4>Current Balance: {formatCurrency(userBalance)}</h4>
                                                {userBalance > 0 && (
                                                    <Alert variant="success">
                                                        You can use your balance to purchase tickets without using a credit card!
                                                    </Alert>
                                                )}
                                            </div>

                                            {balanceHistory && balanceHistory.length > 0 ? (
                                                <div className="table-responsive">
                                                    <table className="table table-hover">
                                                        <thead>
                                                        <tr>
                                                            <th>Date</th>
                                                            <th>Type</th>
                                                            <th>Amount</th>
                                                            <th>Description</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {balanceHistory.map((transaction) => (
                                                            <tr key={transaction.id}>
                                                                <td>{formatDate(transaction.transactionDate)}</td>
                                                                <td>
                                                                    <Badge bg={transaction.type === 'CREDIT' ? 'success' : 'warning'}>
                                                                        {transaction.type === 'CREDIT' ? 'Money In' : 'Money Out'}
                                                                    </Badge>
                                                                </td>
                                                                <td className={transaction.type === 'CREDIT' ? 'text-success' : 'text-warning'}>
                                                                    {transaction.type === 'CREDIT' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                                                </td>
                                                                <td>{transaction.description}</td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <Alert variant="info">
                                                    No balance activity yet. Sell tickets to add money to your balance!
                                                </Alert>
                                            )}
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

            {showProfileEdit && (
                <ProfileEditModal
                    user={currentUser}
                    onClose={() => setShowProfileEdit(false)}
                    onSave={handleProfileUpdate}
                />
            )}

            {showBalanceHistory && (
                <BalanceHistoryModal
                    balance={userBalance}
                    history={balanceHistory}
                    onClose={() => setShowBalanceHistory(false)}
                />
            )}
        </Container>
    );
};

export default UserDashboardPage;