package com.loansphere.repository;

import com.loansphere.entity.LoanOfficer;
import com.loansphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoanOfficerRepository extends JpaRepository<LoanOfficer, Long> {
    Optional<LoanOfficer> findByUser(User user);
    Optional<LoanOfficer> findByUserId(Long userId);
    Optional<LoanOfficer> findByUserEmail(String email);
    Optional<LoanOfficer> findByEmployeeCode(String employeeCode);
}
