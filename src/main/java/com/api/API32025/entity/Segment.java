package com.api.API32025.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Setter
@Getter
@Table(name = "segment")
public class Segment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // ví dụ: A, B, C, D, SUV, MPV...

    @Column(length = 255)
    private String description;

    @OneToMany(mappedBy = "segment", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Car> cars = new ArrayList<>();

}
