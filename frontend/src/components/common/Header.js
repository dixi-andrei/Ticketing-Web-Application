// src/components/common/Header.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import AuthContext from '../../contexts/AuthContext';

const Header = () => {
    const { currentUser, isAuthenticated, isAdmin, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    🎟️ SmartTickets
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/events">Events</Nav.Link>
                        <Nav.Link as={Link} to="/resale">Resale Marketplace</Nav.Link>
                    </Nav>
                    <Nav>
                        {isAuthenticated ? (
                            <>
                                {isAdmin && (
                                    <Nav.Link as={Link} to="/admin">Admin</Nav.Link>
                                )}
                                <NavDropdown
                                    title={`Hello, ${currentUser.firstName}`}
                                    id="user-dropdown"
                                >
                                    <NavDropdown.Item as={Link} to="/dashboard">My Dashboard</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                                </NavDropdown>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline-light"
                                    className="me-2"
                                    onClick={() => navigate('/login')}
                                >
                                    Login
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => navigate('/register')}
                                >
                                    Register
                                </Button>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;