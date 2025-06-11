package com.api.API32025.respository;

import com.api.API32025.entity.Segment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SegmentRepository extends JpaRepository<Segment,Long> {
    boolean existsByName(String name);
    Optional<Segment> findByName(String name);
}
