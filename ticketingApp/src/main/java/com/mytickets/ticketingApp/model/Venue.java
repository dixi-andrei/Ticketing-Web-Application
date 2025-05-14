package com.mytickets.ticketingApp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "venues")
public class Venue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @NotBlank
    private String address;

    @NotBlank
    private String city;

    private String state;

    @NotBlank
    private String country;

    private Integer capacity;

    private String venueMap; // URL to venue map image

    @OneToMany(mappedBy = "venue")
    @JsonIgnoreProperties("venue")
    private List<Event> events = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getAddress() {
        return address;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getCountry() {
        return country;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public String getVenueMap() {
        return venueMap;
    }

    public List<Event> getEvents() {
        return events;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setState(String state) {
        this.state = state;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public void setVenueMap(String venueMap) {
        this.venueMap = venueMap;
    }

    public void setEvents(List<Event> events) {
        this.events = events;
    }
}