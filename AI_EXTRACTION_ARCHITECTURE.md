# AI Medical Report Extraction - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                    (React Frontend - Port 3000)                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ 1. User uploads file
                            │    (JPG/PNG/PDF)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MedicalReportUploader.js                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • File validation (type, size)                          │  │
│  │  • Image preview                                         │  │
│  │  • Loading states                                        │  │
│  │  • Error handling                                        │  │
│  │  • Success feedback                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ 2. POST /api/ai/extract-medical-report
                            │    FormData: { file, reportType }
                            │    Headers: { Authorization: Bearer token }
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER                              │
│                   (Node.js/Express - Port 5000)                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              aiExtractionRoutes.js                       │  │
│  │  • Multer file upload middleware                         │  │
│  │  • Authentication check (protect)                        │  │
│  │  • File type validation                                  │  │
│  │  • Size limit enforcement (10MB)                         │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│                       │ 3. Process file                          │
│                       ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          aiExtractionController.js                       │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────┐    │  │
│  │  │  File Type Check                               │    │  │
│  │  └────────────┬───────────────────────────────────┘    │  │
│  │               │                                          │  │
│  │       ┌───────┴────────┐                                │  │
│  │       │                │                                │  │
│  │       ▼                ▼                                │  │
│  │  ┌─────────┐    ┌──────────┐                           │  │
│  │  │  Image  │    │   PDF    │                           │  │
│  │  │  (JPG/  │    │          │                           │  │
│  │  │  PNG)   │    │          │                           │  │
│  │  └────┬────┘    └────┬─────┘                           │  │
│  │       │              │                                  │  │
│  │       │              │                                  │  │
│  │       ▼              ▼                                  │  │
│  │  ┌─────────┐    ┌──────────┐                           │  │
│  │  │ Convert │    │ Extract  │                           │  │
│  │  │   to    │    │   Text   │                           │  │
│  │  │ Base64  │    │ (pdf-    │                           │  │
│  │  │         │    │  parse)  │                           │  │
│  │  └────┬────┘    └────┬─────┘                          