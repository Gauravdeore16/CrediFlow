package com.loansphere.repository;

import com.loansphere.entity.LoanDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<LoanDocument, Long> {
    List<LoanDocument> findByLoanId(Long loanId);
}
