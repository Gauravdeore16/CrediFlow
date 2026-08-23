package com.loansphere.repository;

import com.loansphere.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    Optional<Loan> findByLoanNumber(String loanNumber);
    List<Loan> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Loan> findByCustomerUserIdOrderByCreatedAtDesc(Long userId);
    List<Loan> findByStatusOrderByCreatedAtDesc(Loan.LoanStatus status);
    List<Loan> findByOfficerId(Long officerId);

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.status = :status")
    long countByStatus(Loan.LoanStatus status);

    List<Loan> findAllByOrderByCreatedAtDesc();
}
