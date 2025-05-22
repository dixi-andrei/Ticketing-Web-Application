// frontend/src/components/user/BalanceHistoryModal.js
import React from 'react';
import { Modal, Table, Badge, Alert } from 'react-bootstrap';

const BalanceHistoryModal = ({ balance, history, onClose }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Date not available";

        try {
            const options = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            console.error('Error formatting date:', e);
            return "Date format error";
        }
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'CREDIT':
                return '💰';
            case 'DEBIT':
                return '💳';
            case 'REFUND':
                return '↩️';
            case 'WITHDRAWAL':
                return '🏦';
            default:
                return '💼';
        }
    };

    const getTransactionBadgeVariant = (type) => {
        switch (type) {
            case 'CREDIT':
            case 'REFUND':
                return 'success';
            case 'DEBIT':
            case 'WITHDRAWAL':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    const getTransactionLabel = (type) => {
        switch (type) {
            case 'CREDIT':
                return 'Money In';
            case 'DEBIT':
                return 'Money Out';
            case 'REFUND':
                return 'Refund';
            case 'WITHDRAWAL':
                return 'Withdrawal';
            default:
                return type;
        }
    };

    return (
        <Modal show={true} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Balance History</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Current Balance Summary */}
                <div className="text-center mb-4">
                    <div className="bg-success text-white rounded p-3">
                        <h4 className="mb-1">Current Balance</h4>
                        <h2 className="mb-0">{formatCurrency(balance)}</h2>
                    </div>
                </div>

                {/* Balance Information */}
                <Alert variant="info" className="mb-4">
                    <h6 className="mb-2">💡 How Your Balance Works:</h6>
                    <ul className="mb-0">
                        <li><strong>Earn Money:</strong> When you sell tickets, the money goes directly to your balance</li>
                        <li><strong>Spend Money:</strong> Use your balance to buy tickets without using a credit card</li>
                        <li><strong>No Refunds:</strong> Balance money cannot be withdrawn or refunded to your credit card</li>
                        <li><strong>Safe & Secure:</strong> Your balance is protected and ready to use anytime</li>
                    </ul>
                </Alert>

                {/* Transaction History */}
                {history && history.length > 0 ? (
                    <div className="table-responsive">
                        <h5 className="mb-3">Transaction History</h5>
                        <Table striped hover>
                            <thead>
                            <tr>
                                <th style={{ width: '15%' }}>Date</th>
                                <th style={{ width: '15%' }}>Type</th>
                                <th style={{ width: '15%' }}>Amount</th>
                                <th style={{ width: '55%' }}>Description</th>
                            </tr>
                            </thead>
                            <tbody>
                            {history.map((transaction, index) => (
                                <tr key={transaction.id || index}>
                                    <td className="text-muted small">
                                        {formatDate(transaction.transactionDate)}
                                    </td>
                                    <td>
                                        <Badge bg={getTransactionBadgeVariant(transaction.type)}>
                                            {getTransactionIcon(transaction.type)} {getTransactionLabel(transaction.type)}
                                        </Badge>
                                    </td>
                                    <td>
                                            <span className={`fw-bold ${
                                                transaction.type === 'CREDIT' || transaction.type === 'REFUND'
                                                    ? 'text-success'
                                                    : 'text-warning'
                                            }`}>
                                                {transaction.type === 'CREDIT' || transaction.type === 'REFUND' ? '+' : '-'}
                                                {formatCurrency(transaction.amount)}
                                            </span>
                                    </td>
                                    <td>
                                            <span className="text-muted">
                                                {transaction.description}
                                            </span>
                                        {transaction.referenceType && (
                                            <small className="d-block text-secondary">
                                                Reference: {transaction.referenceType}
                                                {transaction.referenceId && ` #${transaction.referenceId}`}
                                            </small>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </div>
                ) : (
                    <Alert variant="info">
                        <h6 className="mb-2">No Balance Activity Yet</h6>
                        <p className="mb-0">
                            Your balance history will appear here when you:
                        </p>
                        <ul className="mb-0 mt-2">
                            <li>Sell tickets to other users</li>
                            <li>Use your balance to purchase tickets</li>
                            <li>Receive refunds from canceled events</li>
                        </ul>
                    </Alert>
                )}

                {/* Balance Usage Tips */}
                <Alert variant="light" className="mt-4 border">
                    <h6 className="mb-2">💡 Pro Tips:</h6>
                    <ul className="mb-0 small">
                        <li>Sell tickets you can't use to build up your balance</li>
                        <li>Use your balance for instant ticket purchases without payment processing delays</li>
                        <li>Keep track of your earnings from ticket sales</li>
                        <li>Your balance never expires and is always available for future purchases</li>
                    </ul>
                </Alert>
            </Modal.Body>
            <Modal.Footer>
                <div className="d-flex justify-content-between w-100">
                    <div className="text-muted small">
                        💳 Balance can be used for ticket purchases • 🚫 No cash withdrawals
                    </div>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default BalanceHistoryModal;