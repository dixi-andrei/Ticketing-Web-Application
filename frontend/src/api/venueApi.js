// src/pages/AdminDashboardPage.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Nav, Table, Badge, Button, Alert, Spinner, Form, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import * as adminAPI from '../api/adminApi';

const AdminDashboardPage = () => {
    const [activeTab, setActiveTab] = useState('events');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Data states
    const [events, setEvents] = useState([]);
    const [venues, setVenues] = useState([]);
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [tickets, setTickets] = useState([]);

    // Modals and forms states
    const [showEventModal, setShowEventModal] = useState(false);
    const [showVenueModal, setShowVenueModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showBatchTicketModal, setBatchTicketModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'

    // Pagination and filtering
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, [activeTab]);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError('');

        try {
            // Fetch data based on active tab
            switch (activeTab) {
                case 'events':
                    const eventsResponse = await adminAPI.getAllEvents();
                    setEvents(Array.isArray(eventsResponse.data) ? eventsResponse.data :
                        (eventsResponse.data?.content ? eventsResponse.data.content : []));
                    break;
                case 'venues':
                    const venuesResponse = await adminAPI.getAllVenues();
                    setVenues(Array.isArray(venuesResponse.data) ? venuesResponse.data : []);
                    break;
                case 'users':
                    const usersResponse = await adminAPI.getAllUsers();
                    setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
                    break;
                case 'transactions':
                    const transactionsResponse = await adminAPI.getAllTransactions();
                    setTransactions(Array.isArray(transactionsResponse.data) ? transactionsResponse.data : []);
                    break;
                case 'tickets':
                    const ticketsResponse = await adminAPI.getAllTickets();
                    setTickets(Array.isArray(ticketsResponse.data) ? ticketsResponse.data : []);
                    break;
                default:
                    break;
            }
            setLoading(false);
        } catch (err) {
            console.error(`Error fetching ${activeTab} data:`, err);
            setError(`Failed to load ${activeTab} data. Please try again.`);
            setLoading(false);

            // Set mock data for demonstration if API fails
            setMockData(activeTab);
        }
    };

    // Set mock data for testing UI
    const setMockData = (tabName) => {
        switch (tabName) {
            case 'events':
                setEvents([
                    {
                        id: 1,
                        name: "Summer Music Festival",
                        eventDate: "2025-07-15T18:00:00",
                        venue: { name: "Central Park", city: "New York" },
                        totalTickets: 1000,
                        availableTickets: 450,
                        eventType: "CONCERT",
                        status: "SCHEDULED"
                    },
                    {
                        id: 2,
                        name: "Basketball Championship",
                        eventDate: "2025-06-20T19:30:00",
                        venue: { name: "Sports Arena", city: "Los Angeles" },
                        totalTickets: 800,
                        availableTickets: 120,
                        eventType: "SPORTS",
                        status: "SCHEDULED"
                    },
                    {
                        id: 3,
                        name: "Broadway Musical",
                        eventDate: "2025-08-05T20:00:00",
                        venue: { name: "Theater District", city: "New York" },
                        totalTickets: 500,
                        availableTickets: 75,
                        eventType: "THEATER",
                        status: "SCHEDULED"
                    }
                ]);
                break;
            case 'venues':
                setVenues([
                    {
                        id: 1,
                        name: "Central Park",
                        address: "Central Park, New York, NY 10022",
                        city: "New York",
                        state: "NY",
                        country: "USA",
                        capacity: 5000
                    },
                    {
                        id: 2,
                        name: "Sports Arena",
                        address: "1111 S Figueroa St",
                        city: "Los Angeles",
                        state: "CA",
                        country: "USA",
                        capacity: 18000
                    },
                    {
                        id: 3,
                        name: "Theater District",
                        address: "226 W 46th St",
                        city: "New York",
                        state: "NY",
                        country: "USA",
                        capacity: 1200
                    }
                ]);
                break;
            case 'users':
                setUsers([
                    {
                        id: 1,
                        email: "admin@example.com",
                        firstName: "Admin",
                        lastName: "User",
                        enabled: true,
                        roles: [{ name: "ROLE_ADMIN" }, { name: "ROLE_USER" }]
                    },
                    {
                        id: 2,
                        email: "user1@example.com",
                        firstName: "John",
                        lastName: "Doe",
                        enabled: true,
                        roles: [{ name: "ROLE_USER" }]
                    },
                    {
                        id: 3,
                        email: "user2@example.com",
                        firstName: "Jane",
                        lastName: "Smith",
                        enabled: true,
                        roles: [{ name: "ROLE_USER" }]
                    }
                ]);
                break;
            case 'transactions':
                setTransactions([
                    {
                        id: 1,
                        transactionNumber: "TRX-12345",
                        amount: 150.00,
                        transactionDate: "2025-05-05T14:30:00",
                        type: "PRIMARY_PURCHASE",
                        status: "COMPLETED",
                        buyer: { firstName: "John", lastName: "Doe" },
                        seller: { firstName: "System", lastName: "Admin" },
                        ticket: {
                            ticketNumber: "TKT-67890",
                            event: { name: "Summer Music Festival" }
                        }
                    },
                    {
                        id: 2,
                        transactionNumber: "TRX-67890",
                        amount: 130.00,
                        transactionDate: "2025-05-10T09:15:00",
                        type: "SECONDARY_PURCHASE",
                        status: "COMPLETED",
                        buyer: { firstName: "Jane", lastName: "Smith" },
                        seller: { firstName: "John", lastName: "Doe" },
                        ticket: {
                            ticketNumber: "TKT-67890",
                            event: { name: "Basketball Championship" }
                        }
                    },
                    {
                        id: 3,
                        transactionNumber: "TRX-24680",
                        amount: 80.00,
                        transactionDate: "2025-05-12T11:20:00",
                        type: "PRIMARY_PURCHASE",
                        status: "REFUNDED",
                        buyer: { firstName: "Alice", lastName: "Johnson" },
                        seller: { firstName: "System", lastName: "Admin" },
                        ticket: {
                            ticketNumber: "TKT-13579",
                            event: { name: "Comedy Night" }
                        }
                    }
                ]);
                break;
            case 'tickets':
                setTickets([
                    {
                        id: 1,
                        ticketNumber: "TKT-12345",
                        originalPrice: 150.00,
                        currentPrice: 150.00,
                        section: "A",
                        row: "5",
                        seat: "23",
                        status: "PURCHASED",
                        event: {
                            id: 1,
                            name: "Summer Music Festival",
                            eventDate: "2025-07-15T18:00:00"
                        },
                        owner: { firstName: "John", lastName: "Doe" }
                    },
                    {
                        id: 2,
                        ticketNumber: "TKT-67890",
                        originalPrice: 100.00,
                        currentPrice: 80.00,
                        section: "B",
                        row: "10",
                        seat: "15",
                        status: "LISTED",
                        event: {
                            id: 2,
                            name: "Basketball Championship",
                            eventDate: "2025-06-20T19:30:00"
                        },
                        owner: { firstName: "Jane", lastName: "Smith" }
                    },
                    {
                        id: 3,
                        ticketNumber: "TKT-24680",
                        originalPrice: 80.00,
                        currentPrice: 80.00,
                        section: "C",
                        row: "15",
                        seat: "7",
                        status: "AVAILABLE",
                        event: {
                            id: 3,
                            name: "Broadway Musical",
                            eventDate: "2025-08-05T20:00:00"
                        },
                        owner: null
                    }
                ]);
                break;
            default:
                break;
        }
    };

    const handleOpenModal = (mode, item = null) => {
        setSelectedItem(item);
        setModalMode(mode);

        switch (activeTab) {
            case 'events':
                setShowEventModal(true);
                break;
            case 'venues':
                setShowVenueModal(true);
                break;
            case 'users':
                setShowUserModal(true);
                break;
            default:
                break;
        }
    };

    const handleCloseModal = () => {
        setShowEventModal(false);
        setShowVenueModal(false);
        setShowUserModal(false);
        setSelectedItem(null);
    };

    const handleCreateItem = async (formData) => {
        try {
            let response;

            switch (activeTab) {
                case 'events':
                    response = await adminAPI.createEvent(formData);
                    break;
                case 'venues':
                    response = await adminAPI.createVenue(formData);
                    break;
                case 'users':
                    response = await adminAPI.createUser(formData);
                    break;
                default:
                    break;
            }

            handleCloseModal();
            fetchDashboardData();
            return response;
        } catch (err) {
            console.error(`Error creating ${activeTab.slice(0, -1)}:`, err);
            throw err;
        }
    };

    const handleUpdateItem = async (id, formData) => {
        try {
            let response;

            switch (activeTab) {
                case 'events':
                    response = await adminAPI.updateEvent(id, formData);
                    break;
                case 'venues':
                    response = await adminAPI.updateVenue(id, formData);
                    break;
                case 'users':
                    response = await adminAPI.updateUser(id, formData);
                    break;
                default:
                    break;
            }

            handleCloseModal();
            fetchDashboardData();
            return response;
        } catch (err) {
            console.error(`Error updating ${activeTab.slice(0, -1)}:`, err);
            throw err;
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
            return;
        }

        try {
            switch (activeTab) {
                case 'events':
                    await adminAPI.deleteEvent(id);
                    break;
                case 'venues':
                    await adminAPI.deleteVenue(id);
                    break;
                case 'users':
                    await adminAPI.deleteUser(id);
                    break;
                default:
                    break;
            }

            fetchDashboardData();
        } catch (err) {
            console.error(`Error deleting ${activeTab.slice(0, -1)}:`, err);
            setError(`Failed to delete ${activeTab.slice(0, -1)}. Please try again.`);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            return "Invalid date";
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "SCHEDULED":
            case "ACTIVE":
            case "COMPLETED":
            case "PURCHASED":
                return "success";
            case "ONGOING":
            case "PENDING":
            case "LISTED":
                return "warning";
            case "CANCELLED":
            case "FAILED":
                return "danger";
            case "POSTPONED":
            case "REFUNDED":
                return "info";
            default:
                return "secondary";
        }
    };

    // Render appropriate content based on active tab
    const renderTabContent = () => {
        if (loading) {
            return (
                <div className="text-center py-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-3">Loading data...</p>
                </div>
            );
        }

        if (error) {
            return <Alert variant="danger">{error}</Alert>;
        }

        switch (activeTab) {
            case 'events':
                return renderEventsTab();
            case 'venues':
                return renderVenuesTab();
            case 'users':
                return renderUsersTab();
            case 'transactions':
                return renderTransactionsTab();
            case 'tickets':
                return renderTicketsTab();
            default:
                return <Alert variant="warning">Invalid tab selected</Alert>;
        }
    };

    // Tab content rendering functions
    const renderEventsTab = () => {
        return (
            <>
                <div className="d-flex justify-content-between mb-3">
                    <h3>Events Management</h3>
                    <Button variant="primary" onClick={() => handleOpenModal('create')}>
                        <i className="bi bi-plus-circle me-2"></i>Create New Event
                    </Button>
                </div>

                <Form className="mb-3">
                    <Row>
                        <Col md={6} lg={4}>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Search events..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6} lg={4}>
                            <Form.Group className="mb-3">
                                <Form.Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="SCHEDULED">Scheduled</option>
                                    <option value="ONGOING">Ongoing</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                    <option value="POSTPONED">Postponed</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Button variant="outline-primary" className="w-100" onClick={fetchDashboardData}>
                                <i className="bi bi-search me-2"></i>Apply Filters
                            </Button>
                        </Col>
                    </Row>
                </Form>

                {events.length === 0 ? (
                    <Alert variant="info">No events found. Create a new event to get started.</Alert>
                ) : (
                    <div className="table-responsive">
                        <Table striped hover>
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Date</th>
                                <th>Venue</th>
                                <th>Type</th>
                                <th>Tickets</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {events.map(event => (
                                <tr key={event.id}>
                                    <td>{event.name}</td>
                                    <td>{formatDate(event.eventDate)}</td>
                                    <td>{event.venue?.name}, {event.venue?.city}</td>
                                    <td>{event.eventType}</td>
                                    <td>
                                        {event.availableTickets} / {event.totalTickets} available
                                    </td>
                                    <td>
                                        <Badge bg={getStatusBadgeColor(event.status)}>
                                            {event.status}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleOpenModal('edit', event)}
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDeleteItem(event.id)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </>
        );
    };

    const renderVenuesTab = () => {
        return (
            <>
                <div className="d-flex justify-content-between mb-3">
                    <h3>Venues Management</h3>
                    <Button variant="primary" onClick={() => handleOpenModal('create')}>
                        <i className="bi bi-plus-circle me-2"></i>Add New Venue
                    </Button>
                </div>

                <Form className="mb-3">
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Search venues by name, city, or address..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Button variant="outline-primary" className="w-100" onClick={fetchDashboardData}>
                                <i className="bi bi-search me-2"></i>Search
                            </Button>
                        </Col>
                    </Row>
                </Form>

                {venues.length === 0 ? (
                    <Alert variant="info">No venues found. Add a new venue to get started.</Alert>
                ) : (
                    <div className="table-responsive">
                        <Table striped hover>
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Address</th>
                                <th>City</th>
                                <th>State</th>
                                <th>Country</th>
                                <th>Capacity</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {venues.map(venue => (
                                <tr key={venue.id}>
                                    <td>{venue.name}</td>
                                    <td>{venue.address}</td>
                                    <td>{venue.city}</td>
                                    <td>{venue.state}</td>
                                    <td>{venue.country}</td>
                                    <td>{venue.capacity}</td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleOpenModal('edit', venue)}
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDeleteItem(venue.id)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </>
        );
    };

    const renderUsersTab = () => {
        return (
            <>
                <div className="d-flex justify-content-between mb-3">
                    <h3>User Management</h3>
                    <Button variant="primary" onClick={() => handleOpenModal('create')}>
                        <i className="bi bi-plus-circle me-2"></i>Create New User
                    </Button>
                </div>

                <Form className="mb-3">
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Select>
                                    <option value="">All Roles</option>
                                    <option value="ROLE_USER">Users</option>
                                    <option value="ROLE_ADMIN">Admins</option>
                                    <option value="ROLE_MODERATOR">Moderators</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Button variant="outline-primary" className="w-100" onClick={fetchDashboardData}>
                                <i className="bi bi-search me-2"></i>Search
                            </Button>
                        </Col>
                    </Row>
                </Form>

                {users.length === 0 ? (
                    <Alert variant="info">No users found.</Alert>
                ) : (
                    <div className="table-responsive">
                        <Table striped hover>
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Roles</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.firstName} {user.lastName}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        {user.roles?.map(role => (
                                            <Badge
                                                key={role.name}
                                                bg={role.name === "ROLE_ADMIN" ? "danger" :
                                                    role.name === "ROLE_MODERATOR" ? "warning" : "primary"}
                                                className="me-1"
                                            >
                                                {role.name.replace('ROLE_', '')}
                                            </Badge>
                                        ))}
                                    </td>
                                    <td>
                                        <Badge bg={user.enabled ? "success" : "danger"}>
                                            {user.enabled ? "Active" : "Disabled"}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleOpenModal('edit', user)}
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </Button>
                                        {user.enabled ? (
                                            <Button
                                                variant="outline-warning"
                                                size="sm"
                                                className="me-2"
                                                title="Disable user"
                                                onClick={() => adminAPI.disableUser(user.id).then(fetchDashboardData)}
                                            >
                                                <i className="bi bi-person-x"></i>
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                className="me-2"
                                                title="Enable user"
                                                onClick={() => adminAPI.enableUser(user.id).then(fetchDashboardData)}
                                            >
                                                <i className="bi bi-person-check"></i>
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDeleteItem(user.id)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </>
        );
    };

    const renderTransactionsTab = () => {
        return (
            <>
                <div className="mb-3">
                    <h3>Transaction Management</h3>
                </div>

                <Form className="mb-3">
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Transaction Type</Form.Label>
                                <Form.Select>
                                    <option value="">All Types</option>
                                    <option value="PRIMARY_PURCHASE">Primary Purchase</option>
                                    <option value="SECONDARY_PURCHASE">Secondary Purchase</option>
                                    <option value="REFUND">Refund</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Status</Form.Label>
                                <Form.Select>
                                    <option value="">All Statuses</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="FAILED">Failed</option>
                                    <option value="REFUNDED">Refunded</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Date Range</Form.Label>
                                <Row>
                                    <Col>
                                        <Form.Control
                                            type="date"
                                            placeholder="From"
                                            value={dateFilter.start}
                                            onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="date"
                                            placeholder="To"
                                            value={dateFilter.end}
                                            onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})}
                                        />
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button variant="primary" onClick={fetchDashboardData}>
                        <i className="bi bi-filter me-2"></i>Apply Filters
                    </Button>
                </Form>

                {transactions.length === 0 ? (
                    <Alert variant="info">No transactions found.</Alert>
                ) : (
                    <div className="table-responsive">
                        <Table striped hover>
                            <thead>
                            <tr>
                                <th>Transaction #</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Buyer</th>
                                <th>Seller</th>
                                <th>Event</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {transactions.map(transaction => (
                                <tr key={transaction.id}>
                                    <td>{transaction.transactionNumber}</td>
                                    <td>{formatDate(transaction.transactionDate)}</td>
                                    <td>{transaction.type}</td>
                                    <td>${transaction.amount ? transaction.amount.toFixed(2) : '0.00'}</td>
                                    <td>
                                        <Badge bg={getStatusBadgeColor(transaction.status)}>
                                            {transaction.status}
                                        </Badge>
                                    </td>
                                    <td>{transaction.buyer?.firstName} {transaction.buyer?.lastName}</td>
                                    <td>{transaction.seller?.firstName} {transaction.seller?.lastName}</td>
                                    <td>{transaction.ticket?.event?.name}</td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                            title="View details"
                                        >
                                            <i className="bi bi-eye"></i>
                                        </Button>
                                        {transaction.status === "COMPLETED" && (
                                            <Button
                                                variant="outline-warning"
                                                size="sm"
                                                title="Process refund"
                                                onClick={() => {
                                                    const reason = prompt('Enter refund reason:');
                                                    if (reason) {
                                                        adminAPI.refundTransaction(transaction.id, reason)
                                                            .then(fetchDashboardData)
                                                            .catch(err => console.error('Refund error:', err));
                                                    }
                                                }}
                                            >
                                                <i className="bi bi-arrow-return-left"></i>
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </>
        );
    };

    const renderTicketsTab = () => {
        return (
            <>
                <div className="mb-3">
                    <h3>Ticket Management</h3>
                </div>

                <Form className="mb-3">
                    <Row>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Event</Form.Label>
                                <Form.Select>
                                    <option value="">All Events</option>
                                    {events.map(event => (
                                        <option key={event.id} value={event.id}>{event.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Status</Form.Label>
                                <Form.Select>
                                    <option value="">All Statuses</option>
                                    <option value="AVAILABLE">Available</option>
                                    <option value="PURCHASED">Purchased</option>
                                    <option value="LISTED">Listed</option>
                                    <option value="RESOLD">Resold</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Search</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by ticket number or owner..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="d-flex justify-content-between">
                        <Button variant="primary" onClick={fetchDashboardData}>
                            <i className="bi bi-filter me-2"></i>Apply Filters
                        </Button>
                        <Button variant="outline-success" onClick={() => setBatchTicketModal(true)}>
                            <i className="bi bi-plus-circle me-2"></i>Generate Batch Tickets
                        </Button>
                    </div>
                </Form>

                {tickets.length === 0 ? (
                    <Alert variant="info">No tickets found.</Alert>
                ) : (
                    <div className="table-responsive">
                        <Table striped hover>
                            <thead>
                            <tr>
                                <th>Ticket #</th>
                                <th>Event</th>
                                <th>Section/Row/Seat</th>
                                <th>Price</th>
                                <th>Owner</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {tickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td>{ticket.ticketNumber}</td>
                                    <td>{ticket.event?.name}</td>
                                    <td>
                                        {ticket.section && `Section ${ticket.section}`}
                                        {ticket.row && `, Row ${ticket.row}`}
                                        {ticket.seat && `, Seat ${ticket.seat}`}
                                    </td>
                                    <td>${ticket.currentPrice ? ticket.currentPrice.toFixed(2) : '0.00'}</td>
                                    <td>
                                        {ticket.owner ?
                                            `${ticket.owner.firstName} ${ticket.owner.lastName}` :
                                            "Not assigned"}
                                    </td>
                                    <td>
                                        <Badge bg={getStatusBadgeColor(ticket.status)}>
                                            {ticket.status}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                            title="View details"
                                        >
                                            <i className="bi bi-eye"></i>
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            className="me-2"
                                            title="Generate QR Code"
                                            onClick={() => {
                                                adminAPI.getTicketQRCode(ticket.id)
                                                    .then(response => {
                                                        alert('QR Code generated successfully!');
                                                    })
                                                    .catch(err => console.error('QR generation error:', err));
                                            }}
                                        >
                                            <i className="bi bi-qr-code"></i>
                                        </Button>
                                        {ticket.status === "AVAILABLE" && (
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                title="Remove ticket"
                                                onClick={() => adminAPI.deleteTicket(ticket.id).then(fetchDashboardData)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </>
        );
    };

    // Event Form Modal
    const EventFormModal = () => {
        const [formData, setFormData] = useState({
            name: selectedItem?.name || '',
            description: selectedItem?.description || '',
            eventDate: selectedItem?.eventDate ? new Date(selectedItem.eventDate).toISOString().split('T')[0] : '',
            eventTime: selectedItem?.eventDate ? new Date(selectedItem.eventDate).toISOString().split('T')[1].substring(0, 5) : '',
            imageUrl: selectedItem?.imageUrl || '',
            eventType: selectedItem?.eventType || 'CONCERT',
            status: selectedItem?.status || 'SCHEDULED',
            venueId: selectedItem?.venue?.id || '',
            totalTickets: selectedItem?.totalTickets || 0
        });

        const [formErrors, setFormErrors] = useState({});
        const [isSubmitting, setIsSubmitting] = useState(false);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData({ ...formData, [name]: value });
        };

        const validateForm = () => {
            const errors = {};
            if (!formData.name) errors.name = "Event name is required";
            if (!formData.description) errors.description = "Description is required";
            if (!formData.eventDate) errors.eventDate = "Event date is required";
            if (!formData.eventTime) errors.eventTime = "Event time is required";
            if (!formData.venueId) errors.venueId = "Venue is required";
            if (!formData.eventType) errors.eventType = "Event type is required";
            return errors;
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            const errors = validateForm();
            setFormErrors(errors);

            if (Object.keys(errors).length === 0) {
                setIsSubmitting(true);

                try {
                    // Combine date and time for eventDate
                    const combinedDateTime = `${formData.eventDate}T${formData.eventTime}:00`;

                    // Create a new object for submission, removing the separate time field
                    const submitData = {
                        ...formData,
                        eventDate: combinedDateTime,
                    };

                    // If it's an edit, make sure we have the venue in the correct format
                    if (modalMode === 'edit' && selectedItem?.venue) {
                        submitData.venue = {
                            id: formData.venueId,
                            name: selectedItem.venue.name,
                            city: selectedItem.venue.city
                        };
                    }

                    delete submitData.eventTime;

                    if (modalMode === 'create') {
                        await handleCreateItem(submitData);
                    } else {
                        await handleUpdateItem(selectedItem.id, submitData);
                    }

                    handleCloseModal();
                } catch (err) {
                    console.error('Form submission error:', err);
                    setFormErrors({
                        submit: err.response?.data?.message || 'Failed to save event. Please try again.'
                    });
                } finally {
                    setIsSubmitting(false);
                }
            }
        };

        return (
            <Modal show={showEventModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{modalMode === 'create' ? 'Create New Event' : 'Edit Event'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        {formErrors.submit && (
                            <Alert variant="danger">{formErrors.submit}</Alert>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Event Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                isInvalid={!!formErrors.name}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.name}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                isInvalid={!!formErrors.description}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.description}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Event Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="eventDate"
                                        value={formData.eventDate}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.eventDate}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.eventDate}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Event Time</Form.Label>
                                    <Form.Control
                                        type="time"
                                        name="eventTime"
                                        value={formData.eventTime}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.eventTime}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.eventTime}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Venue</Form.Label>
                                    <Form.Select
                                        name="venueId"
                                        value={formData.venueId}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.venueId}
                                    >
                                        <option value="">Select a venue</option>
                                        {venues.map(venue => (
                                            <option key={venue.id} value={venue.id}>
                                                {venue.name}, {venue.city}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.venueId}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Event Type</Form.Label>
                                    <Form.Select
                                        name="eventType"
                                        value={formData.eventType}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.eventType}
                                    >
                                        <option value="CONCERT">Concert</option>
                                        <option value="SPORTS">Sports</option>
                                        <option value="THEATER">Theater</option>
                                        <option value="CONFERENCE">Conference</option>
                                        <option value="FESTIVAL">Festival</option>
                                        <option value="OTHER">Other</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.eventType}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Image URL</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                    />
                                    <Form.Text className="text-muted">
                                        Provide a URL to an image for this event (optional)
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="SCHEDULED">Scheduled</option>
                                        <option value="ONGOING">Ongoing</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                        <option value="POSTPONED">Postponed</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end mt-4">
                            <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : (modalMode === 'create' ? 'Create Event' : 'Update Event')}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        );
    };

    // Venue Form Modal
    const VenueFormModal = () => {
        const [formData, setFormData] = useState({
            name: selectedItem?.name || '',
            address: selectedItem?.address || '',
            city: selectedItem?.city || '',
            state: selectedItem?.state || '',
            country: selectedItem?.country || '',
            capacity: selectedItem?.capacity || '',
            venueMap: selectedItem?.venueMap || ''
        });

        const [formErrors, setFormErrors] = useState({});
        const [isSubmitting, setIsSubmitting] = useState(false);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData({ ...formData, [name]: value });
        };

        const validateForm = () => {
            const errors = {};
            if (!formData.name) errors.name = "Venue name is required";
            if (!formData.address) errors.address = "Address is required";
            if (!formData.city) errors.city = "City is required";
            if (!formData.country) errors.country = "Country is required";
            return errors;
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            const errors = validateForm();
            setFormErrors(errors);

            if (Object.keys(errors).length === 0) {
                setIsSubmitting(true);

                try {
                    const submitData = {
                        ...formData,
                        capacity: parseInt(formData.capacity) || 0
                    };

                    if (modalMode === 'create') {
                        await adminAPI.createVenue(submitData);
                    } else {
                        await adminAPI.updateVenue(selectedItem.id, submitData);
                    }

                    handleCloseModal();
                    fetchDashboardData();
                } catch (err) {
                    console.error('Form submission error:', err);
                    setFormErrors({
                        submit: err.response?.data?.message || 'Failed to save venue. Please try again.'
                    });
                } finally {
                    setIsSubmitting(false);
                }
            }
        };

        return (
            <Modal show={showVenueModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalMode === 'create' ? 'Add New Venue' : 'Edit Venue'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        {formErrors.submit && (
                            <Alert variant="danger">{formErrors.submit}</Alert>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Venue Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                isInvalid={!!formErrors.name}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.name}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                isInvalid={!!formErrors.address}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.address}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>City</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.city}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.city}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>State/Province</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Country</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.country}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.country}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Capacity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Venue Map URL</Form.Label>
                            <Form.Control
                                type="text"
                                name="venueMap"
                                value={formData.venueMap}
                                onChange={handleChange}
                            />
                            <Form.Text className="text-muted">
                                Provide a URL to a map or seating chart image (optional)
                            </Form.Text>
                        </Form.Group>

                        <div className="d-flex justify-content-end mt-4">
                            <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : (modalMode === 'create' ? 'Add Venue' : 'Update Venue')}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        );
    };

    // User Form Modal
    const UserFormModal = () => {
        const [formData, setFormData] = useState({
            firstName: selectedItem?.firstName || '',
            lastName: selectedItem?.lastName || '',
            email: selectedItem?.email || '',
            password: '',
            confirmPassword: '',
            roles: selectedItem?.roles?.map(role => role.name) || ['ROLE_USER'],
            enabled: selectedItem?.enabled !== undefined ? selectedItem.enabled : true
        });

        const [formErrors, setFormErrors] = useState({});
        const [isSubmitting, setIsSubmitting] = useState(false);

        const handleChange = (e) => {
            const { name, value, type, checked } = e.target;
            if (type === 'checkbox') {
                setFormData({ ...formData, [name]: checked });
            } else {
                setFormData({ ...formData, [name]: value });
            }
        };

        const handleRoleChange = (e) => {
            const { value, checked } = e.target;
            if (checked) {
                // Add role if checked
                setFormData({
                    ...formData,
                    roles: [...formData.roles, value]
                });
            } else {
                // Remove role if unchecked
                setFormData({
                    ...formData,
                    roles: formData.roles.filter(role => role !== value)
                });
            }
        };

        const validateForm = () => {
            const errors = {};
            if (!formData.firstName) errors.firstName = "First name is required";
            if (!formData.lastName) errors.lastName = "Last name is required";
            if (!formData.email) errors.email = "Email is required";
            if (!formData.email.includes('@')) errors.email = "Invalid email format";

            if (modalMode === 'create') {
                if (!formData.password) errors.password = "Password is required";
                if (formData.password && formData.password.length < 6) {
                    errors.password = "Password must be at least 6 characters";
                }
                if (formData.password !== formData.confirmPassword) {
                    errors.confirmPassword = "Passwords do not match";
                }
            }

            if (formData.roles.length === 0) {
                errors.roles = "At least one role must be selected";
            }

            return errors;
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            const errors = validateForm();
            setFormErrors(errors);

            if (Object.keys(errors).length === 0) {
                setIsSubmitting(true);

                try {
                    const submitData = {
                        ...formData,
                        // Only include password if it's provided
                        password: formData.password || undefined,
                        // Remove confirmPassword as it's not needed in the backend
                        confirmPassword: undefined
                    };

                    if (modalMode === 'create') {
                        await adminAPI.createUser(submitData);
                    } else {
                        await adminAPI.updateUser(selectedItem.id, submitData);
                    }

                    handleCloseModal();
                    fetchDashboardData();
                } catch (err) {
                    console.error('Form submission error:', err);
                    setFormErrors({
                        submit: err.response?.data?.message || 'Failed to save user. Please try again.'
                    });
                } finally {
                    setIsSubmitting(false);
                }
            }
        };

        return (
            <Modal show={showUserModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalMode === 'create' ? 'Create New User' : 'Edit User'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        {formErrors.submit && (
                            <Alert variant="danger">{formErrors.submit}</Alert>
                        )}

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.firstName}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.firstName}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.lastName}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.lastName}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                isInvalid={!!formErrors.email}
                                disabled={modalMode === 'edit'} // Email can't be changed in edit mode
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.email}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {modalMode === 'create' && (
                            <>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                isInvalid={!!formErrors.password}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.password}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Confirm Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                isInvalid={!!formErrors.confirmPassword}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.confirmPassword}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </>
                        )}

                        {modalMode === 'edit' && (
                            <Form.Group className="mb-3">
                                <Form.Label>New Password (leave blank to keep current password)</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    isInvalid={!!formErrors.password}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.password}
                                </Form.Control.Feedback>
                            </Form.Group>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Roles</Form.Label>
                            {formErrors.roles && (
                                <div className="text-danger mb-2">{formErrors.roles}</div>
                            )}
                            <div>
                                <Form.Check
                                    type="checkbox"
                                    id="role-user"
                                    label="User"
                                    value="ROLE_USER"
                                    checked={formData.roles.includes('ROLE_USER')}
                                    onChange={handleRoleChange}
                                    className="mb-2"
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="role-admin"
                                    label="Admin"
                                    value="ROLE_ADMIN"
                                    checked={formData.roles.includes('ROLE_ADMIN')}
                                    onChange={handleRoleChange}
                                    className="mb-2"
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="role-moderator"
                                    label="Moderator"
                                    value="ROLE_MODERATOR"
                                    checked={formData.roles.includes('ROLE_MODERATOR')}
                                    onChange={handleRoleChange}
                                />
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="switch"
                                id="user-enabled"
                                label="Account Active"
                                name="enabled"
                                checked={formData.enabled}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-end mt-4">
                            <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : (modalMode === 'create' ? 'Create User' : 'Update User')}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        );
    };

    // Batch Ticket Generation Modal
    const BatchTicketModal = () => {
        const [formData, setFormData] = useState({
            eventId: '',
            pricingTierId: '',
            quantity: 1,
            section: '',
            startRow: '',
            startSeat: ''
        });

        const [formErrors, setFormErrors] = useState({});
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [selectedEvent, setSelectedEvent] = useState(null);
        const [pricingTiers, setPricingTiers] = useState([]);

        // Fetch pricing tiers when an event is selected
        useEffect(() => {
            if (formData.eventId) {
                const event = events.find(e => e.id.toString() === formData.eventId.toString());
                setSelectedEvent(event);

                // Fetch pricing tiers for this event
                const fetchPricingTiers = async () => {
                    try {
                        const response = await adminAPI.getPricingTiersByEvent(formData.eventId);
                        setPricingTiers(response.data || []);
                    } catch (err) {
                        console.error('Error fetching pricing tiers:', err);
                        setPricingTiers([]);
                    }
                };

                fetchPricingTiers();
            } else {
                setSelectedEvent(null);
                setPricingTiers([]);
            }
        }, [formData.eventId, events]);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData({ ...formData, [name]: value });
        };

        const validateForm = () => {
            const errors = {};
            if (!formData.eventId) errors.eventId = "Event is required";
            if (!formData.pricingTierId) errors.pricingTierId = "Pricing tier is required";
            if (!formData.quantity || formData.quantity < 1) errors.quantity = "Quantity must be at least 1";
            return errors;
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            const errors = validateForm();
            setFormErrors(errors);

            if (Object.keys(errors).length === 0) {
                setIsSubmitting(true);

                try {
                    // Call the API to create batch tickets
                    await adminAPI.generateBatchTickets(
                        formData.eventId,
                        formData.pricingTierId,
                        formData.quantity,
                        {
                            section: formData.section || null,
                            startRow: formData.startRow || null,
                            startSeat: formData.startSeat || null
                        }
                    );

                    // Close the modal and refresh the tickets data
                    setBatchTicketModal(false);
                    fetchDashboardData();

                    // Show success message
                    alert(`Successfully generated ${formData.quantity} tickets`);
                } catch (err) {
                    console.error('Error generating tickets:', err);
                    setFormErrors({
                        submit: err.response?.data?.message || 'Failed to generate tickets. Please try again.'
                    });
                } finally {
                    setIsSubmitting(false);
                }
            }
        };

        return (
            <Modal show={showBatchTicketModal} onHide={() => setBatchTicketModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Generate Batch Tickets</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        {formErrors.submit && (
                            <Alert variant="danger">{formErrors.submit}</Alert>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Event</Form.Label>
                            <Form.Select
                                name="eventId"
                                value={formData.eventId}
                                onChange={handleChange}
                                isInvalid={!!formErrors.eventId}
                            >
                                <option value="">Select an event</option>
                                {events.map(event => (
                                    <option key={event.id} value={event.id}>
                                        {event.name} ({formatDate(event.eventDate)})
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {formErrors.eventId}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Pricing Tier</Form.Label>
                            <Form.Select
                                name="pricingTierId"
                                value={formData.pricingTierId}
                                onChange={handleChange}
                                isInvalid={!!formErrors.pricingTierId}
                                disabled={!formData.eventId}
                            >
                                <option value="">Select a pricing tier</option>
                                {pricingTiers.map(tier => (
                                    <option key={tier.id} value={tier.id}>
                                        {tier.name} - ${tier.price?.toFixed(2)}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {formErrors.pricingTierId}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                min="1"
                                isInvalid={!!formErrors.quantity}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.quantity}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <h5 className="mt-4 mb-3">Seating Information (Optional)</h5>

                        <Form.Group className="mb-3">
                            <Form.Label>Section</Form.Label>
                            <Form.Control
                                type="text"
                                name="section"
                                value={formData.section}
                                onChange={handleChange}
                                placeholder="e.g., A, VIP, etc."
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Starting Row</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="startRow"
                                        value={formData.startRow}
                                        onChange={handleChange}
                                        placeholder="e.g., 1, A, etc."
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Starting Seat</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="startSeat"
                                        value={formData.startSeat}
                                        onChange={handleChange}
                                        placeholder="e.g., 1, A, etc."
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end mt-4">
                            <Button variant="secondary" onClick={() => setBatchTicketModal(false)} className="me-2">
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Generating...' : 'Generate Tickets'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        );
    };

    return (
        <Container fluid className="py-4">
            <h1 className="mb-4">Admin Dashboard</h1>

            {/* Dashboard Stats */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="shadow-sm bg-primary text-white">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">Total Events</h6>
                                    <h2 className="mb-0">{events.length}</h2>
                                </div>
                                <div>
                                    <i className="bi bi-calendar-event" style={{ fontSize: '2rem' }}></i>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm bg-success text-white">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">Total Users</h6>
                                    <h2 className="mb-0">{users.length}</h2>
                                </div>
                                <div>
                                    <i className="bi bi-people" style={{ fontSize: '2rem' }}></i>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm bg-warning text-dark">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">Total Tickets</h6>
                                    <h2 className="mb-0">{tickets.length}</h2>
                                </div>
                                <div>
                                    <i className="bi bi-ticket-perforated" style={{ fontSize: '2rem' }}></i>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm bg-info text-white">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">Total Sales</h6>
                                    <h2 className="mb-0">
                                        ${Array.isArray(transactions)
                                        ? transactions
                                            .filter(t => t.status === 'COMPLETED')
                                            .reduce((total, transaction) => total + (transaction.amount || 0), 0)
                                            .toFixed(2)
                                        : '0.00'}
                                    </h2>
                                </div>
                                <div>
                                    <i className="bi bi-graph-up" style={{ fontSize: '2rem' }}></i>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Main Dashboard Content */}
            <Card className="shadow-sm">
                <Card.Header>
                    <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                        <Nav.Item>
                            <Nav.Link eventKey="events">Events</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="venues">Venues</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="tickets">Tickets</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="users">Users</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="transactions">Transactions</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body>
                    {renderTabContent()}
                </Card.Body>
            </Card>

            {/* Modals */}
            {showEventModal && <EventFormModal />}
            {showVenueModal && <VenueFormModal />}
            {showUserModal && <UserFormModal />}
            {showBatchTicketModal && <BatchTicketModal />}
        </Container>
    );
};

export default AdminDashboardPage;