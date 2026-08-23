package com.loansphere.service;

import com.loansphere.entity.Emi;
import com.loansphere.entity.Loan;
import com.loansphere.repository.EmiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class EmiCalculationService {

    @Autowired
    private EmiRepository emiRepository;

    /**
     * EMI = P * R * (1+R)^N / ((1+R)^N - 1)
     */
    public BigDecimal calculateEmi(BigDecimal principal, BigDecimal annualRate, int tenureMonths) {
        if (principal == null || annualRate == null || tenureMonths <= 0 || principal.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        double p = principal.doubleValue();
        double r = annualRate.doubleValue() / 12.0 / 100.0;
        int n = tenureMonths;

        if (r == 0) {
            return BigDecimal.valueOf(p / n).setScale(2, RoundingMode.HALF_UP);
        }

        double emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        return BigDecimal.valueOf(emi).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateTotalInterest(BigDecimal principal, BigDecimal annualRate, int tenureMonths) {
        BigDecimal emi = calculateEmi(principal, annualRate, tenureMonths);
        BigDecimal totalPayable = emi.multiply(BigDecimal.valueOf(tenureMonths));
        return totalPayable.subtract(principal).setScale(2, RoundingMode.HALF_UP);
    }

    public List<Emi> generateEmiSchedule(Loan loan) {
        BigDecimal principal = loan.getApprovedAmount() != null ? loan.getApprovedAmount() : loan.getRequestedAmount();
        BigDecimal annualRate = loan.getInterestRate() != null ? loan.getInterestRate() : loan.getLoanProduct().getInterestRate();
        int tenure = loan.getTenureMonths();

        BigDecimal monthlyEmi = calculateEmi(principal, annualRate, tenure);
        double monthlyRate = annualRate.doubleValue() / 12.0 / 100.0;

        List<Emi> schedule = new ArrayList<>();
        BigDecimal remainingPrincipal = principal;
        LocalDate startDate = loan.getDisbursementDate() != null ? loan.getDisbursementDate() : LocalDate.now();

        for (int i = 1; i <= tenure; i++) {
            LocalDate dueDate = startDate.plusMonths(i);
            BigDecimal interestForMonth = remainingPrincipal.multiply(BigDecimal.valueOf(monthlyRate)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal principalForMonth = monthlyEmi.subtract(interestForMonth).setScale(2, RoundingMode.HALF_UP);

            if (i == tenure || principalForMonth.compareTo(remainingPrincipal) > 0) {
                principalForMonth = remainingPrincipal;
                monthlyEmi = principalForMonth.add(interestForMonth);
                remainingPrincipal = BigDecimal.ZERO;
            } else {
                remainingPrincipal = remainingPrincipal.subtract(principalForMonth).setScale(2, RoundingMode.HALF_UP);
            }

            Emi emi = new Emi(loan, i, dueDate, principalForMonth, interestForMonth, monthlyEmi, remainingPrincipal);
            schedule.add(emi);
        }

        return emiRepository.saveAll(schedule);
    }
}
