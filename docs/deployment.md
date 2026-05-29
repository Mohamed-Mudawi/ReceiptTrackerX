# Deployment Guide

## Production Environment

### Frontend

Hosted on Azure Static Web Apps.

Production URL:

```text
https://wonderful-meadow-0dd696d0f.7.azurestaticapps.net
```

---

### API

Hosted on Azure App Service.

Production URL:

```text
https://receipttrackerx-api.azurewebsites.net
```

---

## Deployment Architecture

```text
GitHub
 │
 ▼
GitHub Actions
 │
 ├── Frontend Deployment
 │       ▼
 │   Azure Static Web Apps
 │
 ├── API Deployment
 │       ▼
 │   Azure App Service
 │
 └── Function Deployment
         ▼
     Azure Function App
```

---

## Frontend Deployment

Trigger:

```text
Push to main
```

Steps:

1. Install dependencies
2. Build React application
3. Deploy build artifacts
4. Publish to Azure Static Web Apps

---

## API Deployment

Trigger:

```text
Push to main
```

Steps:

1. Restore NuGet packages
2. Build ASP.NET application
3. Publish release build
4. Deploy to Azure App Service

---

## Azure Resources

### Resource Group

```text
rg-receipttrackerx
```

### Storage Account

```text
receipttrackerxstorage
```

### Cosmos DB

```text
receipttrackerxdb
```

Database:

```text
receipts-db
```

Containers:

```text
receipts
summaries
```

### Function App

```text
receipt-processor
```

### Service Bus

Queue:

```text
receipt-processing
```

---

## Required Configuration

### API App Settings

* CosmosDb__ConnectionString
* CosmosDb__DatabaseName
* CosmosDb__ReceiptsContainerName
* CosmosDb__SummariesContainerName
* BlobStorage__ConnectionString
* BlobStorage__ContainerName

---

### Function App Settings

* DOCUMENT_INTELLIGENCE_ENDPOINT
* DOCUMENT_INTELLIGENCE_KEY
* COSMOS_ENDPOINT
* COSMOS_KEY
* SERVICE_BUS_CONNECTION_STRING
* SERVICE_BUS_QUEUE_NAME

---

## Verification Checklist

### API

```text
GET /health returns 200 OK
```

### Authentication

```text
User can log in successfully
```

### Upload

```text
Receipt uploads successfully
```

### Processing

```text
Receipt appears in Cosmos DB
```

### Summary

```text
Monthly summary updates automatically
```

If all checks pass, deployment is considered successful.
