package com.loansphere.controller;

import com.loansphere.dto.PaymentRequest;
import com.loansphere.entity.Payment;
import com.loansphere.exception.ResourceNotFoundException;
import com.loansphere.repository.PaymentRepository;
import com.loansphere.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PaymentRepository paymentRepository;

    @PostMapping("/api/payments")
    public ResponseEntity<Payment> makePayment(@Valid @RequestBody PaymentRequest request, Authentication authentication) {
        Payment payment = paymentService.processPayment(request, authentication.getName());
        return new ResponseEntity<>(payment, HttpStatus.CREATED);
    }

    @GetMapping("/api/payments/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/api/loans/{loanId}/payments")
    public ResponseEntity<List<Payment>> getLoanPayments(@PathVariable Long loanId) {
        List<Payment> payments = paymentService.getPaymentsByLoan(loanId);
        return ResponseEntity.ok(payments);
    }
}
