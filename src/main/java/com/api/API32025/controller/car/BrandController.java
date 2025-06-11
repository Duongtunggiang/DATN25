package com.api.API32025.controller.car;

import com.api.API32025.dto.car.*;
import com.api.API32025.entity.Brand;
import com.api.API32025.jwt.JwtUtil;
import com.api.API32025.service.BrandService;
import com.api.API32025.service.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/brand")
public class BrandController {

    @Autowired
    private CarService carService;

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private BrandService brandService;

    @GetMapping("/all")
    public ResponseEntity<List<BrandDTO>> getAllBrands() {
        return ResponseEntity.ok(carService.getAllBrands());
    }

    @GetMapping("/car/{carId}")
    public ResponseEntity<BrandDTO> getBrandByCarId(@PathVariable Long carId) {
        Brand brand = brandService.getBrandByCarId(carId);
        BrandDTO brandDTO = new BrandDTO(brand);
        return ResponseEntity.ok(brandDTO);
    }
    @GetMapping("/segments/all")
    public ResponseEntity<List<SegmentDTO>> getAllSegments() {
        return ResponseEntity.ok(carService.getAllSegments());
    }

    @GetMapping("/categories/all")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(carService.getAllCategories());
    }


}
