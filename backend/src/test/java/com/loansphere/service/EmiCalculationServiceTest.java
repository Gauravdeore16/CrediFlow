package com.loansphere.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class EmiCalculationServiceTest {

    private EmiCalculationService emiCalculationService;

    @BeforeEach
    void setUp() {
        emiCalculationService = new EmiCalculationService();
    }

    @Test
    @DisplayName("Calculate EMI correctly for standard loan params: ₹5,00,000 @ 12% for 36 months")
    void testCalculateEmiStandard() {
        BigDecimal principal = new BigDecimal("500000");
        BigDecimal annualRate = new BigDecimal("12.0");
        int tenureMonths = 36;

        BigDecimal emi = emiCalculationService.calculateEmi(principal, annualRate, tenureMonths);

        // Expected EMI for 500000 at 12% p.a. for 36 months is ~16607.15 (approx ₹16,607)
        assertNotNull(emi);
        assertTrue(emi.compareTo(new BigDecimal("16000")) > 0);
        assertTrue(emi.compareTo(new BigDecimal("17000")) < 0);
    }

    @Test
    @DisplayName("Calculate Total Interest correctly for ₹5,00,000 @ 12% for 36 months")
    void testCalculateTotalInterest() {
        BigDecimal principal = new BigDecimal("500000");
        BigDecimal annualRate = new BigDecimal("12.0");
        int tenureMonths = 36;

        BigDecimal interest = emiCalculationService.calculateTotalInterest(principal, annualRate, tenureMonths);

        assertNotNull(interest);
        assertTrue(interest.compareTo(new BigDecimal("90000")) > 0);
    }
}
