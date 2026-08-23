package com.loansphere.service;

import com.loansphere.dto.AuthResponse;
import com.loansphere.dto.LoginRequest;
import com.loansphere.dto.RegisterRequest;
import com.loansphere.entity.Customer;
import com.loansphere.entity.LoanOfficer;
import com.loansphere.entity.User;
import com.loansphere.exception.LoanException;
import com.loansphere.exception.ResourceNotFoundException;
import com.loansphere.repository.CustomerRepository;
import com.loansphere.repository.LoanOfficerRepository;
import com.loansphere.repository.UserRepository;
import com.loansphere.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private LoanOfficerRepository officerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new LoanException("Email address is already registered: " + request.getEmail());
        }

        User.Role role = User.Role.valueOf(request.getRole().toUpperCase());
        User user = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getMobile(),
                role
        );

        user = userRepository.save(user);
        Long customerId = null;
        Long officerId = null;

        if (role == User.Role.CUSTOMER) {
            Customer customer = new Customer(
                    user,
                    request.getDateOfBirth() != null ? request.getDateOfBirth() : LocalDate.of(1995, 1, 1),
                    request.getGender() != null ? request.getGender() : "MALE",
                    request.getAddress() != null ? request.getAddress() : "Default Address",
                    request.getCity() != null ? request.getCity() : "Mumbai",
                    request.getState() != null ? request.getState() : "Maharashtra",
                    request.getPincode() != null ? request.getPincode() : "400001",
                    request.getPanNumber() != null ? request.getPanNumber() : "ABCDE1234F",
                    request.getEmploymentType() != null ? request.getEmploymentType() : "SALARIED",
                    request.getMonthlyIncome() != null ? request.getMonthlyIncome() : new java.math.BigDecimal("50000")
            );
            customer = customerRepository.save(customer);
            customerId = customer.getId();
        } else if (role == User.Role.OFFICER) {
            String empCode = request.getEmployeeCode() != null ? request.getEmployeeCode() : "OFF-" + System.currentTimeMillis() % 10000;
            LoanOfficer officer = new LoanOfficer(
                    user,
                    empCode,
                    request.getDepartment() != null ? request.getDepartment() : "Loan Verification",
                    request.getDesignation() != null ? request.getDesignation() : "Senior Loan Officer"
            );
            officer = officerRepository.save(officer);
            officerId = officer.getId();
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId(), customerId, officerId);

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name(), customerId, officerId);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new LoanException("Invalid email or password");
        }

        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new LoanException("Account has been deactivated. Please contact system admin.");
        }

        Long customerId = null;
        Long officerId = null;

        if (user.getRole() == User.Role.CUSTOMER) {
            Customer c = customerRepository.findByUserId(user.getId()).orElse(null);
            if (c != null) customerId = c.getId();
        } else if (user.getRole() == User.Role.OFFICER) {
            LoanOfficer o = officerRepository.findByUserId(user.getId()).orElse(null);
            if (o != null) officerId = o.getId();
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId(), customerId, officerId);

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name(), customerId, officerId);
    }
}
