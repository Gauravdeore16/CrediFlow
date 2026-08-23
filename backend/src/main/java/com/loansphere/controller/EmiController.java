package com.loansphere.controller;

import com.loansphere.dto.EmiSummaryDto;
import com.loansphere.entity.Emi;
import com.loansphere.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans/{loanId}")
public class EmiController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/emis")
    public ResponseEntity<List<Emi>> getEmis(@PathVariable Long loanId) {
        List<Emi> emis = paymentService.getEmisByLoan(loanId);
        return ResponseEntity.ok(emis);
    }

    @GetMapping("/emi-summary")
    public ResponseEntity<EmiSummaryDto> getEmiSummary(@PathVariable Long loanId) {
        EmiSummaryDto summary = paymentService.getEmiSummary(loanId);
        return ResponseEntity.ok(summary);
    }
}
