package com.loansphere.controller;

import com.loansphere.dto.CustomerProfileDto;
import com.loansphere.entity.Customer;
import com.loansphere.entity.Loan;
import com.loansphere.exception.ResourceNotFoundException;
import com.loansphere.repository.CustomerRepository;
import com.loansphere.service.LoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private LoanService loanService;

    @GetMapping("/profile")
    public ResponseEntity<CustomerProfileDto> getProfile(Authentication authentication) {
        Customer customer = customerRepository.findByUserEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        CustomerProfileDto dto = new CustomerProfileDto();
        dto.setId(customer.getId());
        dto.setUserId(customer.getUser().getId());
        dto.setName(customer.getUser().getName());
        dto.setEmail(customer.getUser().getEmail());
        dto.setMobile(customer.getUser().getMobile());
        dto.setDateOfBirth(customer.getDateOfBirth());
        dto.setGender(customer.getGender());
        dto.setAddress(customer.getAddress());
        dto.setCity(customer.getCity());
        dto.setState(customer.getState());
        dto.setPincode(customer.getPincode());
        dto.setPanNumber(customer.getPanNumber());
        dto.setEmploymentType(customer.getEmploymentType());
        dto.setMonthlyIncome(customer.getMonthlyIncome());

        return ResponseEntity.ok(dto);
    }

    @PutMapping("/profile")
    public ResponseEntity<Customer> updateProfile(Authentication authentication, @RequestBody CustomerProfileDto dto) {
        Customer customer = customerRepository.findByUserEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        if (dto.getDateOfBirth() != null) customer.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getGender() != null) customer.setGender(dto.getGender());
        if (dto.getAddress() != null) customer.setAddress(dto.getAddress());
        if (dto.getCity() != null) customer.setCity(dto.getCity());
        if (dto.getState() != null) customer.setState(dto.getState());
        if (dto.getPincode() != null) customer.setPincode(dto.getPincode());
        if (dto.getPanNumber() != null) customer.setPanNumber(dto.getPanNumber());
        if (dto.getEmploymentType() != null) customer.setEmploymentType(dto.getEmploymentType());
        if (dto.getMonthlyIncome() != null) customer.setMonthlyIncome(dto.getMonthlyIncome());

        if (dto.getName() != null) customer.getUser().setName(dto.getName());
        if (dto.getMobile() != null) customer.getUser().setMobile(dto.getMobile());

        customer = customerRepository.save(customer);
        return ResponseEntity.ok(customer);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getCustomerDashboard(Authentication authentication) {
        List<Loan> loans = loanService.getCustomerLoans(authentication.getName());

        long activeLoansCount = loans.stream().filter(l -> l.getStatus() == Loan.LoanStatus.DISBURSED).count();
        long totalAppsCount = loans.size();

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("loans", loans);
        dashboard.put("activeLoansCount", activeLoansCount);
        dashboard.put("totalApplicationsCount", totalAppsCount);

        return ResponseEntity.ok(dashboard);
    }
}
