package com.api.API32025.service;

import com.api.API32025.entity.Segment;
import com.api.API32025.respository.SegmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.*;

import java.util.List;

@Service
public class SegmentService {
    @Autowired
    private SegmentRepository segmentRepository;

    public List<Segment> getAllSegments() {
        return segmentRepository.findAll();
    }
}

