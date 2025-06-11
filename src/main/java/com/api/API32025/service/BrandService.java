package com.api.API32025.service;

import com.api.API32025.controller.car.SegmentController;
import com.api.API32025.dto.car.BrandDTO;
import com.api.API32025.entity.*;
import com.api.API32025.respository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BrandService {
    @Autowired
    private CarRepository carRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private CarOwnerRepository carOwnerRepository;

    @Autowired
    private CarImgRepository carImgRepository;

    @Autowired
    private SegmentRepository segmentRepository;
    @Autowired
    private CategoryRepository categoryRepository;

    public Brand getBrandByCarId(Long carId){
        Car car = carRepository.findById(carId)
                .orElseThrow(()-> new RuntimeException("Không tìm thấy xe!"));
        return car.getBrand();
    }
    public void addBrand(BrandDTO brandDTO){
        Brand brand = new Brand();
        brand.setBrandName(brandDTO.getBrandName());
        brandRepository.save(brand);
    }
}
