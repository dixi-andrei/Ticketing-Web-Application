// src/components/tickets/TicketDetail.js
import React from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';

const TicketDetail = ({ ticket, onClose }) => {
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Modal show={true} onHide={onClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Ticket Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={8}>
                        <h4>{ticket.event?.name}</h4>
                        <p className="text-muted">{formatDate(ticket.event?.eventDate)}</p>
                        <p>
                            <strong>Venue:</strong> {ticket.event?.venue?.name}, {ticket.event?.venue?.city}
                        </p>

                        <hr />

                        <Row className="mb-3">
                            <Col sm={6}>
                                <p>
                                    <strong>Ticket Number:</strong><br />
                                    {ticket.ticketNumber}
                                </p>
                            </Col>
                            <Col sm={6}>
                                <p>
                                    <strong>Purchase Date:</strong><br />
                                    {formatDate(ticket.purchaseDate)}
                                </p>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col sm={4}>
                                <p>
                                    <strong>Section:</strong><br />
                                    {ticket.section || 'N/A'}
                                </p>
                            </Col>
                            <Col sm={4}>
                                <p>
                                    <strong>Row:</strong><br />
                                    {ticket.row || 'N/A'}
                                </p>
                            </Col>
                            <Col sm={4}>
                                <p>
                                    <strong>Seat:</strong><br />
                                    {ticket.seat || 'N/A'}
                                </p>
                            </Col>
                        </Row>

                        <p>
                            <strong>Price Paid:</strong> ${ticket.originalPrice.toFixed(2)}
                        </p>

                        <div className="mt-4">
                            <p className="text-muted small">
                                <em>Present this QR code at the venue entrance. This ticket is valid for one-time entry only.</em>
                            </p>
                        </div>
                    </Col>

                    <Col md={4} className="text-center">
                        <div className="p-3 border rounded">
                            <QRCodeSVG
                                value={ticket.ticketNumber}
                                size={200}
                                level="H"
                            />
                            <p className="mt-2 mb-0 small">Scan for entry</p>
                        </div>

                        <Button
                            variant="outline-primary"
                            className="mt-3 w-100"
                            onClick={() => window.print()}
                        >
                            Print Ticket
                        </Button>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default TicketDetail;