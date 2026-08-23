package com.loansphere.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class EmiSummaryDto {

    private BigDecimal monthlyEmi;
    private BigDecimal totalInterest;
    private BigDecimal totalAmountPayable;
    private BigDecimal remainingPrincipal;
    private Integer totalTenureMonths;
    private Integer paidEmisCount;
    private Integer pendingEmisCount;
    private LocalDate nextEmiDueDate;
    private BigDecimal nextEmiAmount;

    public EmiSummaryDto() {}

    public BigDecimal getMonthlyEmi() { return monthlyEmi; }
    public void setMonthlyEmi(BigDecimal monthlyEmi) { this.monthlyEmi = monthlyEmi; }

    public BigDecimal getTotalInterest() { return totalInterest; }
    public void setTotalInterest(BigDecimal totalInterest) { this.totalInterest = totalInterest; }

    public BigDecimal getTotalAmountPayable() { return totalAmountPayable; }
    public void setTotalAmountPayable(BigDecimal totalAmountPayable) { this.totalAmountPayable = totalAmountPayable; }

    public BigDecimal getRemainingPrincipal() { return remainingPrincipal; }
    public void setRemainingPrincipal(BigDecimal remainingPrincipal) { this.remainingPrincipal = remainingPrincipal; }

    public Integer getTotalTenureMonths() { return totalTenureMonths; }
    public void setTotalTenureMonths(Integer totalTenureMonths) { this.totalTenureMonths = totalTenureMonths; }

    public Integer getPaidEmisCount() { return paidEmisCount; }
    public void setPaidEmisCount(Integer paidEmisCount) { this.paidEmisCount = paidEmisCount; }

    public Integer getPendingEmisCount() { return pendingEmisCount; }
    public void setPendingEmisCount(Integer pendingEmisCount) { this.pendingEmisCount = pendingEmisCount; }

    public LocalDate getNextEmiDueDate() { return nextEmiDueDate; }
    public void setNextEmiDueDate(LocalDate nextEmiDueDate) { this.nextEmiDueDate = nextEmiDueDate; }

    public BigDecimal getNextEmiAmount() { return nextEmiAmount; }
    public void setNextEmiAmount(BigDecimal nextEmiAmount) { this.nextEmiAmount = nextEmiAmount; }
}
