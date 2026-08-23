package com.loansphere.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "emis")
public class Emi {

    public enum EmiStatus {
        PENDING, PAID, OVERDUE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "loan_id", nullable = false)
    private Loan loan;

    @Column(name = "emi_number", nullable = false)
    private Integer emiNumber;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "principal_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal principalAmount;

    @Column(name = "interest_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal interestAmount;

    @Column(name = "emi_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal emiAmount;

    @Column(name = "remaining_principal", precision = 12, scale = 2, nullable = false)
    private BigDecimal remainingPrincipal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmiStatus status = EmiStatus.PENDING;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    public Emi() {}

    public Emi(Loan loan, Integer emiNumber, LocalDate dueDate, BigDecimal principalAmount, BigDecimal interestAmount, BigDecimal emiAmount, BigDecimal remainingPrincipal) {
        this.loan = loan;
        this.emiNumber = emiNumber;
        this.dueDate = dueDate;
        this.principalAmount = principalAmount;
        this.interestAmount = interestAmount;
        this.emiAmount = emiAmount;
        this.remainingPrincipal = remainingPrincipal;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Loan getLoan() { return loan; }
    public void setLoan(Loan loan) { this.loan = loan; }

    public Integer getEmiNumber() { return emiNumber; }
    public void setEmiNumber(Integer emiNumber) { this.emiNumber = emiNumber; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public BigDecimal getPrincipalAmount() { return principalAmount; }
    public void setPrincipalAmount(BigDecimal principalAmount) { this.principalAmount = principalAmount; }

    public BigDecimal getInterestAmount() { return interestAmount; }
    public void setInterestAmount(BigDecimal interestAmount) { this.interestAmount = interestAmount; }

    public BigDecimal getEmiAmount() { return emiAmount; }
    public void setEmiAmount(BigDecimal emiAmount) { this.emiAmount = emiAmount; }

    public BigDecimal getRemainingPrincipal() { return remainingPrincipal; }
    public void setRemainingPrincipal(BigDecimal remainingPrincipal) { this.remainingPrincipal = remainingPrincipal; }

    public EmiStatus getStatus() { return status; }
    public void setStatus(EmiStatus status) { this.status = status; }

    public LocalDate getPaidDate() { return paidDate; }
    public void setPaidDate(LocalDate paidDate) { this.paidDate = paidDate; }
}
