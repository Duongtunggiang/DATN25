package com.api.API32025.service;

import com.api.API32025.dto.auth.AccountDTO;
import com.api.API32025.entity.Account;
import com.api.API32025.entity.Car;
import com.api.API32025.respository.AccountRepository;
import com.api.API32025.respository.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminCarService {

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private AccountRepository accountRepository;

    public List<Car> getPendingCars() {
        return carRepository.findByStatus(Car.CarStatus.PENDING);
    }

    public Car approveCar(Long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));
        car.setStatus(Car.CarStatus.AVAILABLE);
        return carRepository.save(car);
    }

    public List<AccountDTO> getAllAccounts() {
        List<Account> accounts = accountRepository.findAll();
        return accounts.stream()
                .map(AccountDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public AccountDTO blockAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
        account.setStatus(Account.AccountStatus.BLOCK);
        accountRepository.save(account);
        return AccountDTO.fromEntity(account);
    }

}
