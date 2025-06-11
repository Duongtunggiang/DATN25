package com.api.API32025.controller.car;

import com.api.API32025.entity.Account;
import com.api.API32025.entity.CarOwner;
import com.api.API32025.entity.Segment;
import com.api.API32025.service.SegmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/segments")
public class SegmentController {

    @Autowired
    private SegmentService segmentService;

    @GetMapping
    public ResponseEntity<List<Segment>> getAllSegments() {
        return ResponseEntity.ok(segmentService.getAllSegments());
    }
}

