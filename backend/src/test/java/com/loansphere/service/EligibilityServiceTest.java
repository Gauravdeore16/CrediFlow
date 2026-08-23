package com.loansphere.service;

import com.loansphere.entity.Customer;
import com.loansphere.entity.LoanProduct;
import com.loansphere.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class EligibilityServiceTest {

    private EligibilityService eligibilityService;
    private LoanProduct product;

    @BeforeEach
    void setUp() {
        eligibilityService = new EligibilityService();

        product = new LoanProduct(
                "Personal Loan",
                "Description",
                new BigDecimal("50000"),
                new BigDecimal("1000000"),
                new BigDecimal("11.5"),
                12,
                60,
                new BigDecimal("1.5")
        );
    }

    @Test
    @DisplayName("Customer with high income (₹45,000) requesting ₹5,00,000 should be eligible")
    void testEligibleCustomer() {
        User user = new User("Gaurav", "gaurav@example.com", "pass", "9876543210", User.Role.CUSTOMER);
        Customer customer = new Customer(
                user, LocalDate.of(1994, 1, 1), "MALE", "Addr", "City", "State", "400001",
                "PAN123", "SALARIED", new BigDecimal("45000")
        );

        EligibilityService.EligibilityResult result = eligibilityService.checkEligibility(customer, product, new BigDecimal("500000"));

        assertTrue(result.isEligible());
        assertTrue(result.getMaxEligibleAmount().compareTo(new BigDecimal("500000")) >= 0);
    }

    @Test
    @DisplayName("Customer with income below ₹25,000 should NOT be eligible")
    void testIneligibleLowIncomeCustomer() {
        User user = new User("LowIncome", "low@example.com", "pass", "9876543210", User.Role.CUSTOMER);
        Customer customer = new Customer(
                user, LocalDate.of(1994, 1, 1), "MALE", "Addr", "City", "State", "400001",
                "PAN123", "SALARIED", new BigDecimal("18000")
        );

        EligibilityService.EligibilityResult result = eligibilityService.checkEligibility(customer, product, new BigDecimal("100000"));

        assertFalse(result.isEligible());
        assertTrue(result.getReasons().stream().anyMatch(r -> r.contains("Monthly income must be at least ₹25,000")));
    }
}
