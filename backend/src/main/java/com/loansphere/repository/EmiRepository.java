package com.loansphere.repository;

import com.loansphere.entity.Emi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmiRepository extends JpaRepository<Emi, Long> {
    List<Emi> findByLoanIdOrderByEmiNumberAsc(Long loanId);
    List<Emi> findByLoanIdAndStatus(Long loanId, Emi.EmiStatus status);
}
