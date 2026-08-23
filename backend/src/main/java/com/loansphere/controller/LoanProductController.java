package com.loansphere.controller;

import com.loansphere.entity.LoanProduct;
import com.loansphere.exception.ResourceNotFoundException;
import com.loansphere.repository.LoanProductRepository;
import com.loansphere.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loan-products")
public class LoanProductController {

    @Autowired
    private LoanProductRepository loanProductRepository;

    @Autowired
    private AdminService adminService;

    @GetMapping
    public ResponseEntity<List<LoanProduct>> getAllProducts() {
        return ResponseEntity.ok(loanProductRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanProduct> getProductById(@PathVariable Long id) {
        LoanProduct product = loanProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan product not found with ID: " + id));
        return ResponseEntity.ok(product);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanProduct> createProduct(@RequestBody LoanProduct product, Authentication authentication) {
        LoanProduct created = adminService.createOrUpdateLoanProduct(product, authentication.getName());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanProduct> updateProduct(@PathVariable Long id, @RequestBody LoanProduct product, Authentication authentication) {
        product.setId(id);
        LoanProduct updated = adminService.createOrUpdateLoanProduct(product, authentication.getName());
        return ResponseEntity.ok(updated);
    }
}
