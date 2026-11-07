package com.loansphere.service;

import com.loansphere.dto.LoanApprovalRequest;
import com.loansphere.entity.Loan;
import com.loansphere.entity.User;
import com.loansphere.repository.AuditLogRepository;
import com.loansphere.repository.LoanOfficerRepository;
import com.loansphere.repository.LoanRepository;
import com.loansphere.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class LoanServiceTest {

    private LoanService loanService;
    private LoanRepository loanRepository;
    private LoanOfficerRepository officerRepository;
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        loanService = new LoanService();
        loanRepository = mock(LoanRepository.class);
        officerRepository = mock(LoanOfficerRepository.class);
        userRepository = mock(UserRepository.class);

        ReflectionTestUtils.setField(loanService, "loanRepository", loanRepository);
        ReflectionTestUtils.setField(loanService, "officerRepository", officerRepository);
        ReflectionTestUtils.setField(loanService, "userRepository", userRepository);
        ReflectionTestUtils.setField(loanService, "auditLogRepository", mock(AuditLogRepository.class));
    }

    @Test
    void adminCanApproveLoanWithoutOfficerProfile() {
        Loan loan = new Loan();
        loan.setId(1L);
        loan.setLoanNumber("LN1001");
        loan.setRequestedAmount(new BigDecimal("180000"));
        loan.setTenureMonths(36);

        User admin = new User("System Admin", "admin@crediflow.com", "password", "9876543210", User.Role.ADMIN);
        when(loanRepository.findById(1L)).thenReturn(Optional.of(loan));
        when(userRepository.findByEmail("admin@crediflow.com")).thenReturn(Optional.of(admin));
        when(officerRepository.findByUserEmail("admin@crediflow.com")).thenReturn(Optional.empty());
        when(loanRepository.save(any(Loan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LoanApprovalRequest request = new LoanApprovalRequest();
        request.setApprovedAmount(new BigDecimal("180000"));
        request.setInterestRate(new BigDecimal("9.5"));
        request.setTenureMonths(36);
        request.setProcessingFee(new BigDecimal("1.2"));

        Loan approvedLoan = loanService.approveLoan(1L, "admin@crediflow.com", request);

        assertEquals(Loan.LoanStatus.APPROVED, approvedLoan.getStatus());
        assertEquals(new BigDecimal("180000"), approvedLoan.getApprovedAmount());
        assertNull(approvedLoan.getOfficer());
    }

    @Test
    void adminCanVerifyLoanWithoutOfficerProfile() {
        Loan loan = new Loan();
        loan.setId(2L);
        loan.setLoanNumber("LN1002");

        User admin = new User("System Admin", "admin@crediflow.com", "password", "9876543210", User.Role.ADMIN);
        when(loanRepository.findById(2L)).thenReturn(Optional.of(loan));
        when(userRepository.findByEmail("admin@crediflow.com")).thenReturn(Optional.of(admin));
        when(officerRepository.findByUserEmail("admin@crediflow.com")).thenReturn(Optional.empty());
        when(loanRepository.save(any(Loan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Loan verifiedLoan = loanService.verifyApplication(2L, "admin@crediflow.com", "Documents checked");

        assertEquals(Loan.LoanStatus.DOCUMENT_VERIFICATION, verifiedLoan.getStatus());
        assertEquals("Documents checked", verifiedLoan.getRemarks());
        assertNull(verifiedLoan.getOfficer());
    }
}
