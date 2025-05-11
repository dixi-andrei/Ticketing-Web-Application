package com.mytickets.ticketingApp.mapper;

import com.mytickets.ticketingApp.exception.ResourceNotFoundException;
import com.mytickets.ticketingApp.model.Ticket;
import com.mytickets.ticketingApp.model.Transaction;
import com.mytickets.ticketingApp.model.TransactionStatus;
import com.mytickets.ticketingApp.model.User;
import com.mytickets.ticketingApp.payload.request.TransactionRequest;
import com.mytickets.ticketingApp.payload.response.TransactionResponse;
import com.mytickets.ticketingApp.repository.TicketRepository;
import com.mytickets.ticketingApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketMapper ticketMapper;

    public Transaction toEntity(TransactionRequest request) {
        if (request == null) {
            return null;
        }

        Transaction transaction = new Transaction();
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setStatus(TransactionStatus.PENDING);

        if (request.getBuyerId() != null) {
            User buyer = userRepository.findById(request.getBuyerId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getBuyerId()));
            transaction.setBuyer(buyer);
        }

        if (request.getSellerId() != null) {
            User seller = userRepository.findById(request.getSellerId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getSellerId()));
            transaction.setSeller(seller);
        }

        if (request.getTicketId() != null) {
            Ticket ticket = ticketRepository.findById(request.getTicketId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", request.getTicketId()));
            transaction.setTicket(ticket);
        }

        return transaction;
    }

    public TransactionResponse toResponse(Transaction transaction) {
        if (transaction == null) {
            return null;
        }

        TransactionResponse response = new TransactionResponse();
        response.setId(transaction.getId());
        response.setTransactionNumber(transaction.getTransactionNumber());
        response.setAmount(transaction.getAmount());
        response.setTransactionDate(transaction.getTransactionDate());
        response.setType(transaction.getType());
        response.setStatus(transaction.getStatus());
        response.setPaymentIntentId(transaction.getPaymentIntentId());

        User buyer = transaction.getBuyer();
        response.setBuyerName(buyer != null ? buyer.getFirstName() + " " + buyer.getLastName() : "Unknown");

        User seller = transaction.getSeller();
        response.setSellerName(seller != null ? seller.getFirstName() + " " + seller.getLastName() : "Unknown");

        if (transaction.getTicket() != null) {
            response.setTicket(ticketMapper.toSummaryResponse(transaction.getTicket()));
        }

        return response;
    }
}