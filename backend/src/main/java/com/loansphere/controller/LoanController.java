package com.loansphere.controller;

import com.loansphere.dto.LoanApplicationRequest;
import com.loansphere.entity.Customer;
import com.loansphere.entity.Loan;
import com.loansphere.entity.LoanProduct;
import com.loansphere.exception.ResourceNotFoundException;
import com.loansphere.repository.CustomerRepository;
import com.loansphere.repository.LoanProductRepository;
import com.loansphere.service.EligibilityService;
import com.loansphere.service.LoanService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/loans")
public class LoanController {

    @Autowired
    private LoanService loanService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private LoanProductRepository loanProductRepository;

    @Autowired
    private EligibilityService eligibilityService;

    @PostMapping
    public ResponseEntity<Loan> applyForLoan(@Valid @RequestBody LoanApplicationRequest request, Authentication authentication) {
        Loan loan = loanService.applyForLoan(authentication.getName(), request);
        return new ResponseEntity<>(loan, HttpStatus.CREATED);
    }

    @GetMapping("/my-loans")
    public ResponseEntity<List<Loan>> getMyLoans(Authentication authentication) {
        List<Loan> loans = loanService.getCustomerLoans(authentication.getName());
        return ResponseEntity.ok(loans);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Loan> getLoanById(@PathVariable Long id) {
        Loan loan = loanService.getLoanById(id);
        return ResponseEntity.ok(loan);
    }

    @GetMapping("/check-eligibility")
    public ResponseEntity<EligibilityService.EligibilityResult> checkEligibility(
            @RequestParam Long productId,
            @RequestParam BigDecimal amount,
            Authentication authentication) {

        Customer customer = customerRepository.findByUserEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        LoanProduct product = loanProductRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan product not found"));

        EligibilityService.EligibilityResult result = eligibilityService.checkEligibility(customer, product, amount);
        return ResponseEntity.ok(result);
    }
}
