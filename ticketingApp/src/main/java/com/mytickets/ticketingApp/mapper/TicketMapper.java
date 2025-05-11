package com.mytickets.ticketingApp.mapper;

import com.mytickets.ticketingApp.model.Event;
import com.mytickets.ticketingApp.model.PricingTier;
import com.mytickets.ticketingApp.model.Ticket;
import com.mytickets.ticketingApp.model.User;
import com.mytickets.ticketingApp.payload.response.EventSummaryResponse;
import com.mytickets.ticketingApp.payload.response.TicketResponse;
import com.mytickets.ticketingApp.payload.response.TicketSummaryResponse;
import org.mapstruct.*;

import java.time.format.DateTimeFormatter;

@Mapper(componentModel = "spring")
public interface TicketMapper {

    @Mapping(target = "event", source = "event")
    @Mapping(target = "ownerName", expression = "java(getOwnerName(ticket))")
    TicketResponse toResponse(Ticket ticket);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "ticketNumber", source = "ticketNumber")
    @Mapping(target = "eventName", source = "event.name")
    @Mapping(target = "eventDate", expression = "java(formatEventDate(ticket))")
    @Mapping(target = "price", source = "currentPrice")
    TicketSummaryResponse toSummaryResponse(Ticket ticket);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "eventDate", source = "eventDate")
    @Mapping(target = "imageUrl", source = "imageUrl")
    @Mapping(target = "eventType", source = "eventType")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "venueName", source = "venue.name")
    @Mapping(target = "venueCity", source = "venue.city")
    EventSummaryResponse eventToSummary(Event event);

    default String getOwnerName(Ticket ticket) {
        User owner = ticket.getOwner();
        return owner != null ? owner.getFirstName() + " " + owner.getLastName() : "Unassigned";
    }

    default String formatEventDate(Ticket ticket) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        return ticket.getEvent() != null && ticket.getEvent().getEventDate() != null
                ? ticket.getEvent().getEventDate().format(formatter)
                : "N/A";
    }
}