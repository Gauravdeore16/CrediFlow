package com.loansphere.service;

import com.loansphere.entity.Customer;
import com.loansphere.entity.LoanProduct;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class EligibilityService {

    public static class EligibilityResult {
        private boolean eligible;
        private BigDecimal maxEligibleAmount;
        private List<String> reasons = new ArrayList<>();

        public EligibilityResult(boolean eligible, BigDecimal maxEligibleAmount, List<String> reasons) {
            this.eligible = eligible;
            this.maxEligibleAmount = maxEligibleAmount;
            this.reasons = reasons;
        }

        public boolean isEligible() { return eligible; }
        public BigDecimal getMaxEligibleAmount() { return maxEligibleAmount; }
        public List<String> getReasons() { return reasons; }
    }

    public EligibilityResult checkEligibility(Customer customer, LoanProduct product, BigDecimal requestedAmount) {
        List<String> reasons = new ArrayList<>();
        boolean eligible = true;

        if (customer == null || customer.getMonthlyIncome() == null) {
            reasons.add("Customer monthly income profile is missing.");
            return new EligibilityResult(false, BigDecimal.ZERO, reasons);
        }

        BigDecimal monthlyIncome = customer.getMonthlyIncome();
        BigDecimal minRequiredIncome = new BigDecimal("25000");

        if (monthlyIncome.compareTo(minRequiredIncome) < 0) {
            eligible = false;
            reasons.add("Monthly income must be at least ₹25,000. Current income: ₹" + monthlyIncome);
        }

        // Maximum loan capacity based on income (e.g. 20x monthly income)
        BigDecimal maxIncomeBasedLimit = monthlyIncome.multiply(new BigDecimal("20"));
        BigDecimal productMaxLimit = product.getMaxAmount();

        // Effective max eligible amount is min of product limit and 20x income
        BigDecimal maxEligibleAmount = maxIncomeBasedLimit.min(productMaxLimit);

        if (requestedAmount.compareTo(product.getMinAmount()) < 0) {
            eligible = false;
            reasons.add("Requested amount ₹" + requestedAmount + " is below minimum product limit ₹" + product.getMinAmount());
        }

        if (requestedAmount.compareTo(maxEligibleAmount) > 0) {
            eligible = false;
            reasons.add("Requested amount ₹" + requestedAmount + " exceeds maximum allowed eligibility limit of ₹" + maxEligibleAmount);
        }

        if (eligible) {
            reasons.add("Customer meets minimum income and loan limit rules.");
        }

        return new EligibilityResult(eligible, maxEligibleAmount, reasons);
    }
}
