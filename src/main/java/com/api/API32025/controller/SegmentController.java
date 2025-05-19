package com.api.API32025.controller;

import com.api.API32025.entity.Segment;
import com.api.API32025.service.SegmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

