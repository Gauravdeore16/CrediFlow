package com.loansphere.service;

import com.loansphere.entity.AuditLog;
import com.loansphere.entity.Loan;
import com.loansphere.entity.LoanDocument;
import com.loansphere.exception.LoanException;
import com.loansphere.exception.ResourceNotFoundException;
import com.loansphere.repository.AuditLogRepository;
import com.loansphere.repository.DocumentRepository;
import com.loansphere.repository.LoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Transactional
    public LoanDocument uploadDocument(Long loanId, String documentTypeStr, MultipartFile file, String uploaderEmail) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with ID: " + loanId));

        LoanDocument.DocumentType docType;
        try {
            docType = LoanDocument.DocumentType.valueOf(documentTypeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new LoanException("Invalid document type: " + documentTypeStr);
        }

        try {
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "doc.pdf";
            String savedFileName = UUID.randomUUID().toString() + "_" + originalFilename;
            Path filePath = Paths.get(uploadDir, savedFileName);
            Files.copy(file.getInputStream(), filePath);

            LoanDocument document = new LoanDocument(loan, docType, originalFilename, filePath.toString());
            document = documentRepository.save(document);

            auditLogRepository.save(new AuditLog(
                    uploaderEmail, "CUSTOMER", "UPLOAD_DOCUMENT", "LoanDocument", document.getId(),
                    "Uploaded " + docType + " document for loan " + loan.getLoanNumber()
            ));

            return document;
        } catch (IOException e) {
            throw new LoanException("Failed to store file: " + e.getMessage());
        }
    }

    public List<LoanDocument> getLoanDocuments(Long loanId) {
        return documentRepository.findByLoanId(loanId);
    }

    @Transactional
    public LoanDocument verifyDocument(Long documentId, String statusStr, String remarks, String officerEmail) {
        LoanDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + documentId));

        LoanDocument.VerificationStatus status;
        try {
            status = LoanDocument.VerificationStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new LoanException("Invalid verification status: " + statusStr);
        }

        document.setVerificationStatus(status);
        document.setRemarks(remarks);
        document.setVerifiedAt(LocalDateTime.now());

        document = documentRepository.save(document);

        auditLogRepository.save(new AuditLog(
                officerEmail, "OFFICER", "VERIFY_DOCUMENT", "LoanDocument", document.getId(),
                "Document " + document.getDocumentType() + " status updated to " + status
        ));

        return document;
    }
}
