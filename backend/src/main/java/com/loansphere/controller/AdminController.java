package com.loansphere.controller;

import com.loansphere.entity.AuditLog;
import com.loansphere.entity.LoanOfficer;
import com.loansphere.entity.User;
import com.loansphere.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        return ResponseEntity.ok(adminService.getAdminDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id, Authentication authentication) {
        User updated = adminService.toggleUserStatus(id, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/officers")
    public ResponseEntity<LoanOfficer> createLoanOfficer(@RequestBody Map<String, String> body, Authentication authentication) {
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");
        String mobile = body.get("mobile");
        String employeeCode = body.get("employeeCode");
        String department = body.get("department");
        String designation = body.get("designation");

        LoanOfficer officer = adminService.createLoanOfficer(name, email, password, mobile, employeeCode, department, designation, authentication.getName());
        return new ResponseEntity<>(officer, HttpStatus.CREATED);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(adminService.getAuditLogs());
    }
}
