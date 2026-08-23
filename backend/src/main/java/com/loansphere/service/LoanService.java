package com.loansphere.service;

import com.loansphere.dto.LoanApplicationRequest;
import com.loansphere.dto.LoanApprovalRequest;
import com.loansphere.entity.*;
import com.loansphere.exception.LoanException;
import com.loansphere.exception.ResourceNotFoundException;
import com.loansphere.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class LoanService {

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private LoanProductRepository loanProductRepository;

    @Autowired
    private LoanOfficerRepository officerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmiCalculationService emiCalculationService;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private EligibilityService eligibilityService;

    @Transactional
    public Loan applyForLoan(String userEmail, LoanApplicationRequest request) {
        Customer customer = customerRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for email: " + userEmail));

        LoanProduct product = loanProductRepository.findById(request.getLoanProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Loan product not found with ID: " + request.getLoanProductId()));

        if (product.getStatus() != LoanProduct.ProductStatus.ACTIVE) {
            throw new LoanException("Selected loan product is currently inactive.");
        }

        // Validate requested amount and tenure against product limits
        if (request.getRequestedAmount().compareTo(product.getMinAmount()) < 0 ||
            request.getRequestedAmount().compareTo(product.getMaxAmount()) > 0) {
            throw new LoanException("Requested amount must be between ₹" + product.getMinAmount() + " and ₹" + product.getMaxAmount());
        }

        if (request.getTenureMonths() < product.getMinTenure() || request.getTenureMonths() > product.getMaxTenure()) {
            throw new LoanException("Tenure must be between " + product.getMinTenure() + " and " + product.getMaxTenure() + " months.");
        }

        // Generate loan number
        String loanNumber = "LN" + (1000 + (long) (Math.random() * 9000)) + System.currentTimeMillis() % 1000;

        Loan loan = new Loan();
        loan.setLoanNumber(loanNumber);
        loan.setCustomer(customer);
        loan.setLoanProduct(product);
        loan.setRequestedAmount(request.getRequestedAmount());
        loan.setTenureMonths(request.getTenureMonths());
        loan.setInterestRate(product.getInterestRate());
        loan.setProcessingFee(product.getProcessingFee());
        loan.setPurpose(request.getPurpose());
        loan.setStatus(Loan.LoanStatus.SUBMITTED);
        loan.setApplicationDate(LocalDate.now());

        loan = loanRepository.save(loan);

        auditLogRepository.save(new AuditLog(
                userEmail, "CUSTOMER", "APPLY_LOAN", "Loan", loan.getId(),
                "Submitted loan application " + loanNumber + " for ₹" + request.getRequestedAmount()
        ));

        return loan;
    }

    public List<Loan> getCustomerLoans(String userEmail) {
        return loanRepository.findByCustomerUserIdOrderByCreatedAtDesc(
                userRepository.findByEmail(userEmail)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found")).getId()
        );
    }

    public Loan getLoanById(Long id) {
        return loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with ID: " + id));
    }

    public List<Loan> getAllLoans() {
        return loanRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Loan> getLoansByStatus(Loan.LoanStatus status) {
        return loanRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    @Transactional
    public Loan verifyApplication(Long loanId, String officerEmail, String remarks) {
        Loan loan = getLoanById(loanId);
        LoanOfficer officer = officerRepository.findByUserEmail(officerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Officer profile not found"));

        loan.setOfficer(officer);
        loan.setStatus(Loan.LoanStatus.DOCUMENT_VERIFICATION);
        loan.setRemarks(remarks);
        loan = loanRepository.save(loan);

        auditLogRepository.save(new AuditLog(
                officerEmail, "OFFICER", "VERIFY_DOCUMENT", "Loan", loan.getId(),
                "Loan " + loan.getLoanNumber() + " documents put under verification."
        ));

        return loan;
    }

    @Transactional
    public Loan approveLoan(Long loanId, String officerEmail, LoanApprovalRequest request) {
        Loan loan = getLoanById(loanId);
        LoanOfficer officer = officerRepository.findByUserEmail(officerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Officer profile not found"));

        loan.setOfficer(officer);
        loan.setStatus(Loan.LoanStatus.APPROVED);
        loan.setApprovalDate(LocalDate.now());

        if (request.getApprovedAmount() != null) {
            loan.setApprovedAmount(request.getApprovedAmount());
        } else {
            loan.setApprovedAmount(loan.getRequestedAmount());
        }

        if (request.getInterestRate() != null) {
            loan.setInterestRate(request.getInterestRate());
        }

        if (request.getTenureMonths() != null) {
            loan.setTenureMonths(request.getTenureMonths());
        }

        if (request.getProcessingFee() != null) {
            loan.setProcessingFee(request.getProcessingFee());
        }

        if (request.getRemarks() != null) {
            loan.setRemarks(request.getRemarks());
        }

        loan = loanRepository.save(loan);

        auditLogRepository.save(new AuditLog(
                officerEmail, "OFFICER", "APPROVE_LOAN", "Loan", loan.getId(),
                "Approved loan " + loan.getLoanNumber() + " for ₹" + loan.getApprovedAmount()
        ));

        return loan;
    }

    @Transactional
    public Loan rejectLoan(Long loanId, String officerEmail, String remarks) {
        Loan loan = getLoanById(loanId);
        LoanOfficer officer = officerRepository.findByUserEmail(officerEmail).orElse(null);

        if (officer != null) loan.setOfficer(officer);
        loan.setStatus(Loan.LoanStatus.REJECTED);
        loan.setRemarks(remarks);
        loan = loanRepository.save(loan);

        auditLogRepository.save(new AuditLog(
                officerEmail, "OFFICER", "REJECT_LOAN", "Loan", loan.getId(),
                "Rejected loan " + loan.getLoanNumber() + ". Reason: " + remarks
        ));

        return loan;
    }

    @Transactional
    public Loan disburseLoan(Long loanId, String officerEmail) {
        Loan loan = getLoanById(loanId);
        if (loan.getStatus() != Loan.LoanStatus.APPROVED) {
            throw new LoanException("Only APPROVED loans can be disbursed. Current status: " + loan.getStatus());
        }

        loan.setStatus(Loan.LoanStatus.DISBURSED);
        loan.setDisbursementDate(LocalDate.now());
        loan = loanRepository.save(loan);

        // Generate EMI amortization schedule
        emiCalculationService.generateEmiSchedule(loan);

        // Log disbursement transaction
        BigDecimal amount = loan.getApprovedAmount() != null ? loan.getApprovedAmount() : loan.getRequestedAmount();
        Transaction txn = new Transaction(
                "TXN-DISB-" + System.currentTimeMillis(),
                loan,
                Transaction.TransactionType.DISBURSEMENT,
                amount,
                "Disbursement of ₹" + amount + " for loan " + loan.getLoanNumber()
        );
        transactionRepository.save(txn);

        auditLogRepository.save(new AuditLog(
                officerEmail, "OFFICER", "DISBURSE_LOAN", "Loan", loan.getId(),
                "Disbursed ₹" + amount + " for loan " + loan.getLoanNumber()
        ));

        return loan;
    }
}
