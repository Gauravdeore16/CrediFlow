package com.loansphere.service;

import com.loansphere.dto.EmiSummaryDto;
import com.loansphere.dto.PaymentRequest;
import com.loansphere.entity.*;
import com.loansphere.exception.LoanException;
import com.loansphere.exception.ResourceNotFoundException;
import com.loansphere.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private EmiRepository emiRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Transactional
    public Payment processPayment(PaymentRequest request, String userEmail) {
        Emi emi = emiRepository.findById(request.getEmiId())
                .orElseThrow(() -> new ResourceNotFoundException("EMI not found with ID: " + request.getEmiId()));

        if (emi.getStatus() == Emi.EmiStatus.PAID) {
            throw new LoanException("EMI #" + emi.getEmiNumber() + " has already been paid.");
        }

        Loan loan = emi.getLoan();

        String paymentRef = "PAY-" + System.currentTimeMillis();
        String txnId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Payment payment = new Payment(
                paymentRef,
                loan,
                emi,
                request.getAmount() != null ? request.getAmount() : emi.getEmiAmount(),
                request.getPaymentMethod(),
                txnId
        );
        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        payment = paymentRepository.save(payment);

        // Update EMI state
        emi.setStatus(Emi.EmiStatus.PAID);
        emi.setPaidDate(LocalDate.now());
        emiRepository.save(emi);

        // Record Financial Transaction
        Transaction txn = new Transaction(
                txnId,
                loan,
                Transaction.TransactionType.EMI_PAYMENT,
                payment.getAmount(),
                "EMI #" + emi.getEmiNumber() + " Payment via " + request.getPaymentMethod()
        );
        transactionRepository.save(txn);

        // Check if all EMIs for this loan are paid -> CLOSE LOAN
        List<Emi> allEmis = emiRepository.findByLoanIdOrderByEmiNumberAsc(loan.getId());
        boolean allPaid = allEmis.stream().allMatch(e -> e.getStatus() == Emi.EmiStatus.PAID);
        if (allPaid) {
            loan.setStatus(Loan.LoanStatus.CLOSED);
            loanRepository.save(loan);
        }

        auditLogRepository.save(new AuditLog(
                userEmail, "CUSTOMER", "PAY_EMI", "Payment", payment.getId(),
                "Paid EMI #" + emi.getEmiNumber() + " amount ₹" + payment.getAmount() + " via " + request.getPaymentMethod()
        ));

        return payment;
    }

    public List<Payment> getPaymentsByLoan(Long loanId) {
        return paymentRepository.findByLoanIdOrderByPaymentDateDesc(loanId);
    }

    public List<Emi> getEmisByLoan(Long loanId) {
        return emiRepository.findByLoanIdOrderByEmiNumberAsc(loanId);
    }

    public EmiSummaryDto getEmiSummary(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with ID: " + loanId));

        List<Emi> emis = emiRepository.findByLoanIdOrderByEmiNumberAsc(loanId);
        EmiSummaryDto dto = new EmiSummaryDto();

        if (emis.isEmpty()) {
            dto.setMonthlyEmi(BigDecimal.ZERO);
            dto.setTotalInterest(BigDecimal.ZERO);
            dto.setTotalAmountPayable(BigDecimal.ZERO);
            dto.setRemainingPrincipal(BigDecimal.ZERO);
            dto.setTotalTenureMonths(loan.getTenureMonths());
            dto.setPaidEmisCount(0);
            dto.setPendingEmisCount(0);
            return dto;
        }

        BigDecimal monthlyEmi = emis.get(0).getEmiAmount();
        BigDecimal totalInterest = emis.stream().map(Emi::getInterestAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPayable = emis.stream().map(Emi::getEmiAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        int paidCount = (int) emis.stream().filter(e -> e.getStatus() == Emi.EmiStatus.PAID).count();
        int pendingCount = emis.size() - paidCount;

        Emi nextPendingEmi = emis.stream()
                .filter(e -> e.getStatus() == Emi.EmiStatus.PENDING)
                .findFirst()
                .orElse(null);

        BigDecimal remainingPrincipal;
        if (nextPendingEmi != null) {
            remainingPrincipal = nextPendingEmi.getRemainingPrincipal().add(nextPendingEmi.getPrincipalAmount());
            dto.setNextEmiDueDate(nextPendingEmi.getDueDate());
            dto.setNextEmiAmount(nextPendingEmi.getEmiAmount());
        } else {
            remainingPrincipal = BigDecimal.ZERO;
        }

        dto.setMonthlyEmi(monthlyEmi);
        dto.setTotalInterest(totalInterest);
        dto.setTotalAmountPayable(totalPayable);
        dto.setRemainingPrincipal(remainingPrincipal);
        dto.setTotalTenureMonths(emis.size());
        dto.setPaidEmisCount(paidCount);
        dto.setPendingEmisCount(pendingCount);

        return dto;
    }
}
