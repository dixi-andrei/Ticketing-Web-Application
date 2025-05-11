package com.mytickets.ticketingApp.mapper;

import com.mytickets.ticketingApp.exception.ResourceNotFoundException;
import com.mytickets.ticketingApp.model.Ticket;
import com.mytickets.ticketingApp.model.TicketListing;
import com.mytickets.ticketingApp.model.User;
import com.mytickets.ticketingApp.payload.request.TicketListingRequest;
import com.mytickets.ticketingApp.payload.response.TicketListingResponse;
import com.mytickets.ticketingApp.repository.TicketRepository;
import com.mytickets.ticketingApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TicketListingMapper {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TicketMapper ticketMapper;

    public TicketListing toEntity(TicketListingRequest ticketListingRequest) {
        if (ticketListingRequest == null) {
            return null;
        }

        TicketListing ticketListing = new TicketListing();
        ticketListing.setAskingPrice(ticketListingRequest.getAskingPrice());
        ticketListing.setDescription(ticketListingRequest.getDescription());

        if (ticketListingRequest.getTicketId() != null) {
            Ticket ticket = ticketRepository.findById(ticketListingRequest.getTicketId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketListingRequest.getTicketId()));
            ticketListing.setTicket(ticket);
        }

        return ticketListing;
    }

    public TicketListingResponse toResponse(TicketListing ticketListing) {
        if (ticketListing == null) {
            return null;
        }

        TicketListingResponse response = new TicketListingResponse();
        response.setId(ticketListing.getId());
        response.setAskingPrice(ticketListing.getAskingPrice());
        response.setDescription(ticketListing.getDescription());
        response.setListingDate(ticketListing.getListingDate());
        response.setStatus(ticketListing.getStatus());

        if (ticketListing.getTicket() != null) {
            response.setTicket(ticketMapper.toResponse(ticketListing.getTicket()));
        }

        User seller = ticketListing.getSeller();
        response.setSellerName(seller != null ? seller.getFirstName() + " " + seller.getLastName() : "Unknown");

        return response;
    }
}