package com.loansphere.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class LoanApplicationRequest {

    @NotNull(message = "Loan Product ID is required")
    private Long loanProductId;

    @NotNull(message = "Requested amount is required")
    @Min(value = 1000, message = "Minimum requested amount is 1000")
    private BigDecimal requestedAmount;

    @NotNull(message = "Tenure in months is required")
    @Min(value = 1, message = "Minimum tenure is 1 month")
    private Integer tenureMonths;

    private String purpose;

    public LoanApplicationRequest() {}

    public LoanApplicationRequest(Long loanProductId, BigDecimal requestedAmount, Integer tenureMonths, String purpose) {
        this.loanProductId = loanProductId;
        this.requestedAmount = requestedAmount;
        this.tenureMonths = tenureMonths;
        this.purpose = purpose;
    }

    public Long getLoanProductId() { return loanProductId; }
    public void setLoanProductId(Long loanProductId) { this.loanProductId = loanProductId; }

    public BigDecimal getRequestedAmount() { return requestedAmount; }
    public void setRequestedAmount(BigDecimal requestedAmount) { this.requestedAmount = requestedAmount; }

    public Integer getTenureMonths() { return tenureMonths; }
    public void setTenureMonths(Integer tenureMonths) { this.tenureMonths = tenureMonths; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
}
