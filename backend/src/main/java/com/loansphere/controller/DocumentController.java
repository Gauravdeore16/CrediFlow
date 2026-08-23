package com.loansphere.controller;

import com.loansphere.entity.LoanDocument;
import com.loansphere.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @PostMapping("/api/loans/{loanId}/documents")
    public ResponseEntity<LoanDocument> uploadDocument(
            @PathVariable Long loanId,
            @RequestParam("documentType") String documentType,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        LoanDocument doc = documentService.uploadDocument(loanId, documentType, file, authentication.getName());
        return ResponseEntity.ok(doc);
    }

    @GetMapping("/api/loans/{loanId}/documents")
    public ResponseEntity<List<LoanDocument>> getLoanDocuments(@PathVariable Long loanId) {
        List<LoanDocument> docs = documentService.getLoanDocuments(loanId);
        return ResponseEntity.ok(docs);
    }

    @PutMapping("/api/documents/{id}/verify")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<LoanDocument> verifyDocument(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        String status = body.getOrDefault("status", "VERIFIED");
        String remarks = body.getOrDefault("remarks", "");

        LoanDocument doc = documentService.verifyDocument(id, status, remarks, authentication.getName());
        return ResponseEntity.ok(doc);
    }
}
