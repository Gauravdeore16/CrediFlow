package com.loansphere.service;

import com.loansphere.entity.*;
import com.loansphere.exception.ResourceNotFoundException;
import com.loansphere.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private LoanOfficerRepository officerRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private LoanProductRepository loanProductRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private EmiRepository emiRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Map<String, Object> getAdminDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = userRepository.count();
        long totalCustomers = customerRepository.count();
        long totalOfficers = officerRepository.count();

        List<Loan> allLoans = loanRepository.findAll();
        long totalApplications = allLoans.size();

        long approvedCount = allLoans.stream().filter(l -> l.getStatus() == Loan.LoanStatus.APPROVED).count();
        long rejectedCount = allLoans.stream().filter(l -> l.getStatus() == Loan.LoanStatus.REJECTED).count();
        long activeCount = allLoans.stream().filter(l -> l.getStatus() == Loan.LoanStatus.DISBURSED).count();
        long closedCount = allLoans.stream().filter(l -> l.getStatus() == Loan.LoanStatus.CLOSED).count();

        BigDecimal totalDisbursed = allLoans.stream()
                .filter(l -> l.getStatus() == Loan.LoanStatus.DISBURSED || l.getStatus() == Loan.LoanStatus.CLOSED)
                .map(l -> l.getApprovedAmount() != null ? l.getApprovedAmount() : l.getRequestedAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Payment> allPayments = paymentRepository.findAll();
        BigDecimal totalCollected = allPayments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.SUCCESS)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal outstandingAmount = totalDisbursed.subtract(totalCollected);
        if (outstandingAmount.compareTo(BigDecimal.ZERO) < 0) {
            outstandingAmount = BigDecimal.ZERO;
        }

        stats.put("totalUsers", totalUsers);
        stats.put("totalCustomers", totalCustomers);
        stats.put("totalOfficers", totalOfficers);
        stats.put("totalApplications", totalApplications);
        stats.put("approvedLoans", approvedCount);
        stats.put("rejectedLoans", rejectedCount);
        stats.put("activeLoans", activeCount);
        stats.put("closedLoans", closedCount);
        stats.put("totalDisbursed", totalDisbursed);
        stats.put("totalCollected", totalCollected);
        stats.put("outstandingAmount", outstandingAmount);

        return stats;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User toggleUserStatus(Long userId, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (user.getStatus() == User.UserStatus.ACTIVE) {
            user.setStatus(User.UserStatus.INACTIVE);
        } else {
            user.setStatus(User.UserStatus.ACTIVE);
        }

        user = userRepository.save(user);

        auditLogRepository.save(new AuditLog(
                adminEmail, "ADMIN", "TOGGLE_USER_STATUS", "User", user.getId(),
                "User " + user.getEmail() + " status updated to " + user.getStatus()
        ));

        return user;
    }

    @Transactional
    public LoanOfficer createLoanOfficer(String name, String email, String password, String mobile, String employeeCode, String department, String designation, String adminEmail) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists: " + email);
        }

        User user = new User(name, email, passwordEncoder.encode(password), mobile, User.Role.OFFICER);
        user = userRepository.save(user);

        LoanOfficer officer = new LoanOfficer(user, employeeCode, department, designation);
        officer = officerRepository.save(officer);

        auditLogRepository.save(new AuditLog(
                adminEmail, "ADMIN", "CREATE_LOAN_OFFICER", "LoanOfficer", officer.getId(),
                "Created Loan Officer: " + email + " (" + employeeCode + ")"
        ));

        return officer;
    }

    @Transactional
    public LoanProduct createOrUpdateLoanProduct(LoanProduct product, String adminEmail) {
        boolean isNew = (product.getId() == null);
        LoanProduct saved = loanProductRepository.save(product);

        auditLogRepository.save(new AuditLog(
                adminEmail, "ADMIN", isNew ? "CREATE_PRODUCT" : "UPDATE_PRODUCT", "LoanProduct", saved.getId(),
                (isNew ? "Created" : "Updated") + " loan product: " + saved.getProductName()
        ));

        return saved;
    }

    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
