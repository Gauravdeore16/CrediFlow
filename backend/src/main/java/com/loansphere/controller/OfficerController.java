package com.loansphere.controller;

import com.loansphere.dto.LoanApprovalRequest;
import com.loansphere.entity.Loan;
import com.loansphere.repository.LoanRepository;
import com.loansphere.service.LoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/officer")
@PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
public class OfficerController {

    @Autowired
    private LoanService loanService;

    @Autowired
    private LoanRepository loanRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getOfficerDashboard() {
        Map<String, Object> stats = new HashMap<>();

        List<Loan> allLoans = loanRepository.findAllByOrderByCreatedAtDesc();

        long totalApps = allLoans.size();
        long pendingVerification = allLoans.stream().filter(l -> l.getStatus() == Loan.LoanStatus.SUBMITTED || l.getStatus() == Loan.LoanStatus.UNDER_REVIEW).count();
        long pendingApproval = allLoans.stream().filter(l -> l.getStatus() == Loan.LoanStatus.DOCUMENT_VERIFICATION).count();
        long approvedCount = allLoans.stream().filter(l -> l.getStatus() == Loan.LoanStatus.APPROVED).count();
        long rejectedCount = allLoans.stream().filter(l -> l.getStatus() == Loan.LoanStatus.REJECTED).count();
        long disbursedCount = allLoans.stream().filter(l -> l.getStatus() == Loan.LoanStatus.DISBURSED).count();

        stats.put("totalApplications", totalApps);
        stats.put("pendingVerification", pendingVerification);
        stats.put("pendingApproval", pendingApproval);
        stats.put("approvedCount", approvedCount);
        stats.put("rejectedCount", rejectedCount);
        stats.put("disbursedCount", disbursedCount);
        stats.put("recentLoans", allLoans);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/loans")
    public ResponseEntity<List<Loan>> getLoans(@RequestParam(required = false) String status) {
        if (status != null && !status.isEmpty()) {
            try {
                Loan.LoanStatus s = Loan.LoanStatus.valueOf(status.toUpperCase());
                return ResponseEntity.ok(loanService.getLoansByStatus(s));
            } catch (IllegalArgumentException e) {
                // Return all if invalid status filter
            }
        }
        return ResponseEntity.ok(loanService.getAllLoans());
    }

    @PutMapping("/loans/{id}/verify")
    public ResponseEntity<Loan> verifyLoan(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {

        String remarks = body != null ? body.getOrDefault("remarks", "Document verification initiated.") : "Document verification initiated.";
        Loan loan = loanService.verifyApplication(id, authentication.getName(), remarks);
        return ResponseEntity.ok(loan);
    }

    @PutMapping("/loans/{id}/approve")
    public ResponseEntity<Loan> approveLoan(
            @PathVariable Long id,
            @RequestBody LoanApprovalRequest request,
            Authentication authentication) {

        Loan loan = loanService.approveLoan(id, authentication.getName(), request);
        return ResponseEntity.ok(loan);
    }

    @PutMapping("/loans/{id}/reject")
    public ResponseEntity<Loan> rejectLoan(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        String remarks = body != null ? body.getOrDefault("remarks", "Loan application rejected after review.") : "Loan application rejected after review.";
        Loan loan = loanService.rejectLoan(id, authentication.getName(), remarks);
        return ResponseEntity.ok(loan);
    }

    @PutMapping("/loans/{id}/disburse")
    public ResponseEntity<Loan> disburseLoan(@PathVariable Long id, Authentication authentication) {
        Loan loan = loanService.disburseLoan(id, authentication.getName());
        return ResponseEntity.ok(loan);
    }
}
