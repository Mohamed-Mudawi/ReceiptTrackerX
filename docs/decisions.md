# Architecture Decisions

## ADR-001: Direct Blob Uploads

### Decision

Upload files directly to Azure Blob Storage using SAS URLs.

### Why

Avoid routing large files through the API.

### Benefits

* Lower API bandwidth
* Better scalability
* Reduced hosting costs

---

## ADR-002: Event-Driven Processing

### Decision

Process receipts asynchronously.

### Why

OCR can take several seconds.

### Benefits

* Faster user experience
* Better reliability
* Easier scaling

---

## ADR-003: Azure Functions

### Decision

Use Azure Functions for receipt processing.

### Why

Receipt processing only occurs after uploads.

### Benefits

* Serverless
* Cost efficient
* Automatic scaling

---

## ADR-004: Cosmos DB

### Decision

Store receipt data in Cosmos DB.

### Why

Receipts naturally fit a document model.

### Benefits

* Flexible schema
* Easy scaling
* JSON-native

---

## ADR-005: Service Bus

### Decision

Use Azure Service Bus between OCR and analytics.

### Why

Separate ingestion from aggregation.

### Benefits

* Loose coupling
* Reliability
* Future scalability

---

## ADR-006: Azure Static Web Apps

### Decision

Host frontend in Azure Static Web Apps.

### Why

Simple deployment and Azure integration.

### Benefits

* Global CDN
* SSL included
* GitHub integration
