package com.loansphere.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "loan_products")
public class LoanProduct {

    public enum ProductStatus {
        ACTIVE, INACTIVE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_name", nullable = false, unique = true)
    private String productName;

    @Column(length = 1000)
    private String description;

    @Column(name = "min_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal minAmount;

    @Column(name = "max_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal maxAmount;

    @Column(name = "interest_rate", precision = 5, scale = 2, nullable = false)
    private BigDecimal interestRate; // Annual % e.g. 11.5

    @Column(name = "min_tenure", nullable = false)
    private Integer minTenure; // in months

    @Column(name = "max_tenure", nullable = false)
    private Integer maxTenure; // in months

    @Column(name = "processing_fee", precision = 5, scale = 2)
    private BigDecimal processingFee; // percentage e.g. 1.5

    @Enumerated(EnumType.STRING)
    private ProductStatus status = ProductStatus.ACTIVE;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public LoanProduct() {}

    public LoanProduct(String productName, String description, BigDecimal minAmount, BigDecimal maxAmount, BigDecimal interestRate, Integer minTenure, Integer maxTenure, BigDecimal processingFee) {
        this.productName = productName;
        this.description = description;
        this.minAmount = minAmount;
        this.maxAmount = maxAmount;
        this.interestRate = interestRate;
        this.minTenure = minTenure;
        this.maxTenure = maxTenure;
        this.processingFee = processingFee;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getMinAmount() { return minAmount; }
    public void setMinAmount(BigDecimal minAmount) { this.minAmount = minAmount; }

    public BigDecimal getMaxAmount() { return maxAmount; }
    public void setMaxAmount(BigDecimal maxAmount) { this.maxAmount = maxAmount; }

    public BigDecimal getInterestRate() { return interestRate; }
    public void setInterestRate(BigDecimal interestRate) { this.interestRate = interestRate; }

    public Integer getMinTenure() { return minTenure; }
    public void setMinTenure(Integer minTenure) { this.minTenure = minTenure; }

    public Integer getMaxTenure() { return maxTenure; }
    public void setMaxTenure(Integer maxTenure) { this.maxTenure = maxTenure; }

    public BigDecimal getProcessingFee() { return processingFee; }
    public void setProcessingFee(BigDecimal processingFee) { this.processingFee = processingFee; }

    public ProductStatus getStatus() { return status; }
    public void setStatus(ProductStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
