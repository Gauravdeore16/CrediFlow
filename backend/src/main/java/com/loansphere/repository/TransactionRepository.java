package com.loansphere.repository;

import com.loansphere.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByLoanIdOrderByTransactionDateDesc(Long loanId);
    List<Transaction> findAllByOrderByTransactionDateDesc();
}
