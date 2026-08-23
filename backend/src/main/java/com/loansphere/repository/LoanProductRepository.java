package com.loansphere.repository;

import com.loansphere.entity.LoanProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanProductRepository extends JpaRepository<LoanProduct, Long> {
    Optional<LoanProduct> findByProductName(String productName);
    List<LoanProduct> findByStatus(LoanProduct.ProductStatus status);
}
