import React from 'react';
import { Modal, Button, Row, Col, Card, Badge } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';

const EnhancedTicketDetail = ({ ticket, onClose }) => {
    const formatDate = (dateString) => {
        if (!dateString) return "Date not available";
        try {
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            console.error("Error formatting date:", e);
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'PURCHASED':
                return 'success';
            case 'AVAILABLE':
                return 'primary';
            case 'LISTED':
                return 'warning';
            case 'RESOLD':
                return 'info';
            case 'CANCELLED':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    const handlePrint = () => {
        const printContent = document.getElementById('printable-ticket');
        const originalBody = document.body.innerHTML;

        // Add print-specific styles
        const printStyles = `
            <style>
                @media print {
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 20px;
                        background: white;
                    }
                    .ticket-container {
                        border: 2px solid #000;
                        border-radius: 10px;
                        padding: 20px;
                        margin: 0;
                        background: white;
                    }
                    .ticket-header {
                        text-align: center;
                        border-bottom: 2px dashed #ccc;
                        padding-bottom: 15px;
                        margin-bottom: 15px;
                    }
                    .ticket-body {
                        display: flex;
                        justify-content: space-between;
                    }
                    .ticket-info {
                        flex: 1;
                    }
                    .ticket-qr {
                        text-align: center;
                        padding-left: 20px;
                    }
                    .seat-info {
                        background: #f8f9fa;
                        border: 1px solid #dee2e6;
                        border-radius: 5px;
                        padding: 10px;
                        margin: 10px 0;
                    }
                    .ticket-footer {
                        border-top: 2px dashed #ccc;
                        padding-top: 10px;
                        margin-top: 15px;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                    }
                }
            </style>
        `;

        document.body.innerHTML = printStyles + printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalBody;
        window.location.reload();
    };

    const getSeatDisplay = () => {
        const parts = [];
        if (ticket.section) parts.push(`Section ${ticket.section}`);
        if (ticket.row) parts.push(`Row ${ticket.row}`);
        if (ticket.seat) parts.push(`Seat ${ticket.seat}`);

        if (parts.length === 0) {
            return "General Admission";
        }

        return parts.join(' • ');
    };

    return (
        <Modal show={true} onHide={onClose} centered size="xl">
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>
                    <i className="bi bi-ticket-perforated me-2"></i>
                    Digital Ticket
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-0">
                <div id="printable-ticket" className="ticket-container">
                    {/* Ticket Header */}
                    <div className="ticket-header bg-light p-4">
                        <Row className="text-center">
                            <Col>
                                <h2 className="mb-1 text-primary">{ticket.event?.name}</h2>
                                <h5 className="text-muted mb-2">{formatDate(ticket.event?.eventDate)}</h5>
                                <Badge bg={getStatusColor(ticket.status)} className="fs-6">
                                    {ticket.status}
                                </Badge>
                            </Col>
                        </Row>
                    </div>

                    {/* Ticket Body */}
                    <div className="ticket-body p-4">
                        <Row>
                            {/* Left Column - Event & Seat Info */}
                            <Col lg={8}>
                                {/* Venue Information */}
                                <Card className="mb-3 border-0 bg-light">
                                    <Card.Body>
                                        <h5 className="card-title text-primary">
                                            <i className="bi bi-geo-alt me-2"></i>
                                            Venue Information
                                        </h5>
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <strong>Venue:</strong><br />
                                                {ticket.event?.venue?.name || 'N/A'}
                                            </div>
                                            <div className="col-sm-6">
                                                <strong>Location:</strong><br />
                                                {ticket.event?.venue?.city || 'N/A'}, {ticket.event?.venue?.state || ''}
                                            </div>
                                        </div>
                                        {ticket.event?.venue?.address && (
                                            <div className="mt-2">
                                                <strong>Address:</strong><br />
                                                {ticket.event.venue.address}
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>

                                {/* Seating Information */}
                                <Card className="mb-3 border-0 bg-light">
                                    <Card.Body>
                                        <h5 className="card-title text-primary">
                                            <i className="bi bi-pin-map me-2"></i>
                                            Seating Information
                                        </h5>
                                        <div className="seat-info text-center p-3 bg-white border rounded">
                                            <h4 className="text-success mb-0">{getSeatDisplay()}</h4>
                                            {ticket.section || ticket.row || ticket.seat ? (
                                                <small className="text-muted">
                                                    Please arrive early to find your seat
                                                </small>
                                            ) : (
                                                <small className="text-muted">
                                                    First come, first served seating
                                                </small>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>

                                {/* Ticket Details */}
                                <Card className="mb-3 border-0 bg-light">
                                    <Card.Body>
                                        <h5 className="card-title text-primary">
                                            <i className="bi bi-info-circle me-2"></i>
                                            Ticket Details
                                        </h5>
                                        <Row>
                                            <Col sm={6}>
                                                <p className="mb-2">
                                                    <strong>Ticket Number:</strong><br />
                                                    <code className="bg-white p-1 border rounded">
                                                        {ticket.ticketNumber}
                                                    </code>
                                                </p>
                                            </Col>
                                            <Col sm={6}>
                                                <p className="mb-2">
                                                    <strong>Purchase Date:</strong><br />
                                                    {formatDate(ticket.purchaseDate)}
                                                </p>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col sm={6}>
                                                <p className="mb-2">
                                                    <strong>Original Price:</strong><br />
                                                    <span className="text-success fw-bold">
                                                        {formatCurrency(ticket.originalPrice)}
                                                    </span>
                                                </p>
                                            </Col>
                                            <Col sm={6}>
                                                <p className="mb-2">
                                                    <strong>Current Price:</strong><br />
                                                    <span className="text-success fw-bold">
                                                        {formatCurrency(ticket.currentPrice)}
                                                    </span>
                                                </p>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Right Column - QR Code */}
                            <Col lg={4} className="ticket-qr">
                                <Card className="border-0 bg-light h-100">
                                    <Card.Body className="d-flex flex-column justify-content-center text-center">
                                        <h5 className="card-title text-primary mb-3">
                                            <i className="bi bi-qr-code me-2"></i>
                                            Entry Code
                                        </h5>

                                        <div className="p-3 bg-white border rounded mb-3">
                                            {ticket.qrCodeUrl ? (
                                                <img
                                                    src={`data:image/png;base64,${ticket.qrCodeUrl}`}
                                                    alt="Ticket QR Code"
                                                    style={{ width: '100%', maxWidth: '200px' }}
                                                />
                                            ) : (
                                                <QRCodeSVG
                                                    value={ticket.ticketNumber || 'TICKET'}
                                                    size={200}
                                                    level="H"
                                                    includeMargin={true}
                                                    bgColor="#ffffff"
                                                    fgColor="#000000"
                                                />
                                            )}
                                        </div>

                                        <p className="small text-muted mb-3">
                                            <strong>Present this code at venue entrance</strong>
                                        </p>

                                        <Button
                                            variant="outline-primary"
                                            className="w-100"
                                            onClick={handlePrint}
                                        >
                                            <i className="bi bi-printer me-2"></i>
                                            Print Ticket
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </div>

                    {/* Ticket Footer */}
                    <div className="ticket-footer bg-light p-3">
                        <Row className="text-center">
                            <Col>
                                <p className="mb-1">
                                    <strong>Important:</strong> This ticket is valid for one-time entry only.
                                </p>
                                <p className="mb-1">
                                    Please arrive at least 30 minutes before the event starts.
                                </p>
                                <p className="mb-0 small text-muted">
                                    For support, contact: support@smarttickets.com |
                                    Ticket ID: {ticket.ticketNumber}
                                </p>
                            </Col>
                        </Row>
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handlePrint}>
                    <i className="bi bi-printer me-2"></i>
                    Print Ticket
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EnhancedTicketDetail;