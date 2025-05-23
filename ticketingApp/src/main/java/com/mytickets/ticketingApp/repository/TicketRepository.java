package com.mytickets.ticketingApp.repository;

import com.mytickets.ticketingApp.model.Event;
import com.mytickets.ticketingApp.model.Ticket;
import com.mytickets.ticketingApp.model.TicketStatus;
import com.mytickets.ticketingApp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByEvent(Event event);

    List<Ticket> findByEventId(Long eventId);

    List<Ticket> findByOwner(User owner);

    List<Ticket> findByOwnerId(Long ownerId);

    List<Ticket> findByEventAndStatus(Event event, TicketStatus status);

    Optional<Ticket> findByTicketNumber(String ticketNumber);

    @Query("SELECT t FROM Ticket t JOIN t.event e WHERE t.owner.id = ?1 AND e.eventDate > CURRENT_TIMESTAMP ORDER BY e.eventDate")
    List<Ticket> findUpcomingTicketsByOwner(Long ownerId);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.event.id = ?1")
    Long countByEventId(Long eventId);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.event.id = ?1 AND t.status = ?2")
    Long countByEventIdAndStatus(Long eventId, TicketStatus status);
    List<Ticket> findByPricingTierIdAndStatus(Long pricingTierId, TicketStatus status);


}