package com.api.API32025.initializer;

import com.api.API32025.entity.Category;
import com.api.API32025.entity.Segment;
import com.api.API32025.respository.CategoryRepository;
import com.api.API32025.respository.SegmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private SegmentRepository segmentRepository;

    @Autowired
    private CategoryRepository categoryRepository;


    @Override
    public void run(String... args) throws Exception {
        // Khởi tạo segment
        List<String> segmentNames = Arrays.asList("A", "B", "C", "D");
        for (String name : segmentNames) {
            if (!segmentRepository.existsByName(name)) {
                Segment segment = new Segment();
                segment.setName(name);
                segment.setDescription(getDescription(name));
                segmentRepository.save(segment);
            }
        }
        List<String> categoryNames = Arrays.asList("Sedan", "SUV", "Hatchback", "MPV");
        for (String name : categoryNames) {
            if (!categoryRepository.existsByName(name)) {
                Category category = new Category();
                category.setName(name);
                category.setCategoryImage(getImagePath(name));
                categoryRepository.save(category);
            }
        }
    }

    private String getDescription(String name) {
        switch (name) {
            case "A": return "Xe nhỏ gọn cho đô thị, tiết kiệm nhiên liệu";
            case "B": return "Xe phổ thông, rộng rãi hơn phân khúc A";
            case "C": return "Xe gia đình, vừa phải, tiện nghi";
            case "D": return "Xe cao cấp, sang trọng, phù hợp doanh nhân";
            default: return "";
        }
    }

    private String getImagePath(String categoryName) {
        switch (categoryName) {
            case "Sedan": return "/Images/category/sedan.png";
            case "SUV": return "/Images/category/suv.png";
            case "Hatchback": return "/Images/category/hatchback.png";
            case "MPV": return "/Images/category/mpv.png";
            default: return "/Images/category/default.png";
        }
    }
}
