package com.api.API32025.controller.car;

import com.api.API32025.dto.car.CarDTO;
import com.api.API32025.entity.*;
import com.api.API32025.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteCarController {
    @Autowired
    private FavoriteCarService favoriteCarService;

    @Autowired
    private AccountService accountService;

    // Thêm xe vào danh sách yêu thích
    @PostMapping("/{carId}")
    public ResponseEntity<?> addFavoriteCar(
            @PathVariable Long carId,
            @AuthenticationPrincipal Account account) {
        try {
            Customer customer = account.getCustomer();
            if (customer == null) {
                return ResponseEntity.badRequest().body("Không tìm thấy thông tin khách hàng");
            }

            FavoriteCar favoriteCar = favoriteCarService.addFavoriteCar(customer.getId(), carId);
            return ResponseEntity.ok(favoriteCar);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Xóa xe khỏi danh sách yêu thích
    @DeleteMapping("/{carId}")
    public ResponseEntity<?> removeFavoriteCar(
            @PathVariable Long carId,
            @AuthenticationPrincipal Account account) {
        try {
            Customer customer = account.getCustomer();
            if (customer == null) {
                return ResponseEntity.badRequest().body("Không tìm thấy thông tin khách hàng");
            }

            favoriteCarService.removeFavoriteCar(customer.getId(), carId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Lấy danh sách xe yêu thích
    @GetMapping
    public ResponseEntity<?> getFavoriteCars(@AuthenticationPrincipal Account account) {
        try {
            Customer customer = account.getCustomer();
            if (customer == null) {
                return ResponseEntity.badRequest().body("Không tìm thấy thông tin khách hàng");
            }

            List<CarDTO> favoriteCars = favoriteCarService.getFavoriteCars(customer.getId());
            return ResponseEntity.ok(favoriteCars);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Kiểm tra xe có trong danh sách yêu thích không
    @GetMapping("/check/{carId}")
    public ResponseEntity<?> checkFavoriteCar(
            @PathVariable Long carId,
            @AuthenticationPrincipal Account account) {
        try {
            Customer customer = account.getCustomer();
            if (customer == null) {
                return ResponseEntity.badRequest().body("Không tìm thấy thông tin khách hàng");
            }

            boolean isFavorite = favoriteCarService.isCarFavorite(customer.getId(), carId);
            return ResponseEntity.ok(isFavorite);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
