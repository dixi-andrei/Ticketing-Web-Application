package com.mytickets.ticketingApp.mapper;

import com.mytickets.ticketingApp.model.Venue;
import com.mytickets.ticketingApp.payload.request.VenueRequest;
import com.mytickets.ticketingApp.payload.response.VenueResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface VenueMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "events", ignore = true)
    Venue toEntity(VenueRequest venueRequest);

    @Mapping(target = "eventCount", expression = "java(venue.getEvents() != null ? venue.getEvents().size() : 0)")
    VenueResponse toResponse(Venue venue);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "events", ignore = true)
    void updateVenueFromRequest(VenueRequest venueRequest, @MappingTarget Venue venue);
}