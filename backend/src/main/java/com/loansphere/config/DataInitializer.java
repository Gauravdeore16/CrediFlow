package com.loansphere.config;

import com.loansphere.entity.*;
import com.loansphere.repository.*;
import com.loansphere.service.EmiCalculationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private LoanOfficerRepository officerRepository;

    @Autowired
    private LoanProductRepository loanProductRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private EmiCalculationService emiCalculationService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Create Admin if not present
        User adminUser = userRepository.findByEmail("admin@crediflow.com")
                .or(() -> userRepository.findByEmail("admin@loansphere.com"))
                .orElseGet(() -> {
                    User admin = new User("System Admin", "admin@crediflow.com", passwordEncoder.encode("Admin@123"), "9876543210", User.Role.ADMIN);
                    return userRepository.save(admin);
                });

        // 2. Create Loan Officer if not present
        User officerUser = userRepository.findByEmail("officer@crediflow.com")
                .or(() -> userRepository.findByEmail("officer@loansphere.com"))
                .orElseGet(() -> {
                    User officerU = new User("Rajesh Kumar", "officer@crediflow.com", passwordEncoder.encode("Officer@123"), "9876543211", User.Role.OFFICER);
                    return userRepository.save(officerU);
                });

        LoanOfficer officer = officerRepository.findByUserId(officerUser.getId()).orElseGet(() -> {
            LoanOfficer o = new LoanOfficer(officerUser, "OFF1001", "Loan Processing", "Senior Credit Analyst");
            return officerRepository.save(o);
        });

        // 3. Create Customer if not present
        User customerUser = userRepository.findByEmail("gaurav@example.com").orElseGet(() -> {
            User custU = new User("Gaurav Sharma", "gaurav@example.com", passwordEncoder.encode("Customer@123"), "9876543212", User.Role.CUSTOMER);
            return userRepository.save(custU);
        });

        Customer customer = customerRepository.findByUserId(customerUser.getId()).orElseGet(() -> {
            Customer c = new Customer(
                    customerUser,
                    LocalDate.of(1994, 5, 15),
                    "MALE",
                    "123 Green Park Colony",
                    "Mumbai",
                    "Maharashtra",
                    "400001",
                    "ABCDE1234F",
                    "SALARIED",
                    new BigDecimal("45000")
            );
            return customerRepository.save(c);
        });

        // 4. Create Loan Products if not present
        if (loanProductRepository.count() == 0) {
            LoanProduct p1 = new LoanProduct("Personal Loan", "Quick unsecured personal loan for financial emergency or home renovation.", new BigDecimal("50000"), new BigDecimal("1000000"), new BigDecimal("11.5"), 12, 60, new BigDecimal("1.5"));
            LoanProduct p2 = new LoanProduct("Home Loan", "Affordable home loans with low interest rates for buying or building houses.", new BigDecimal("500000"), new BigDecimal("10000000"), new BigDecimal("8.5"), 60, 360, new BigDecimal("1.0"));
            LoanProduct p3 = new LoanProduct("Vehicle Loan", "Flexible car and two-wheeler financing options with instant approvals.", new BigDecimal("100000"), new BigDecimal("2500000"), new BigDecimal("9.5"), 12, 84, new BigDecimal("1.2"));
            LoanProduct p4 = new LoanProduct("Education Loan", "Low interest loans for higher education studies in India or overseas.", new BigDecimal("50000"), new BigDecimal("3000000"), new BigDecimal("7.5"), 12, 120, new BigDecimal("0.5"));

            loanProductRepository.save(p1);
            loanProductRepository.save(p2);
            loanProductRepository.save(p3);
            loanProductRepository.save(p4);
        }

        // 5. Create Sample Loans if not present
        if (loanRepository.count() == 0) {
            LoanProduct p1 = loanProductRepository.findByProductName("Personal Loan").orElse(null);
            LoanProduct p3 = loanProductRepository.findByProductName("Vehicle Loan").orElse(null);

            if (p1 != null) {
                Loan loan1 = new Loan();
                loan1.setLoanNumber("LN1001");
                loan1.setCustomer(customer);
                loan1.setLoanProduct(p1);
                loan1.setOfficer(officer);
                loan1.setRequestedAmount(new BigDecimal("500000"));
                loan1.setApprovedAmount(new BigDecimal("500000"));
                loan1.setInterestRate(new BigDecimal("11.5"));
                loan1.setTenureMonths(36);
                loan1.setProcessingFee(new BigDecimal("1.5"));
                loan1.setPurpose("Home renovation");
                loan1.setStatus(Loan.LoanStatus.DISBURSED);
                loan1.setApplicationDate(LocalDate.now().minusMonths(3));
                loan1.setApprovalDate(LocalDate.now().minusMonths(3));
                loan1.setDisbursementDate(LocalDate.now().minusMonths(3));
                loan1.setRemarks("Verified documents and income proofs. Approved.");
                loan1 = loanRepository.save(loan1);

                emiCalculationService.generateEmiSchedule(loan1);
            }

            if (p3 != null) {
                Loan loan2 = new Loan();
                loan2.setLoanNumber("LN1002");
                loan2.setCustomer(customer);
                loan2.setLoanProduct(p3);
                loan2.setOfficer(officer);
                loan2.setRequestedAmount(new BigDecimal("200000"));
                loan2.setTenureMonths(24);
                loan2.setInterestRate(new BigDecimal("9.5"));
                loan2.setProcessingFee(new BigDecimal("1.2"));
                loan2.setPurpose("New electric scooter purchase");
                loan2.setStatus(Loan.LoanStatus.UNDER_REVIEW);
                loan2.setApplicationDate(LocalDate.now().minusDays(2));
                loan2.setRemarks("Pending document verification");
                loanRepository.save(loan2);
            }
        }

        System.out.println(">>> CrediFlow Initial Seed Data Verified & Loaded! <<<");
    }
}
