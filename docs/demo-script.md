# ReceiptTrackerX Demo Script

Estimated Length: 3–5 Minutes

---

# Introduction

Hi, I'm Mohamed, and this is ReceiptTrackerX.

ReceiptTrackerX is a cloud-native expense tracking application built on Microsoft Azure that automatically extracts data from receipt images and generates spending summaries.

The project uses:

* React
* ASP.NET 8
* Azure Functions
* Azure Blob Storage
* Azure Cosmos DB
* Azure Service Bus
* Azure Document Intelligence

---

# Architecture Overview

Before showing the application, here's the processing flow.

When a user uploads a receipt:

1. The frontend requests a SAS upload URL.
2. The image uploads directly to Azure Blob Storage.
3. Event Grid triggers an Azure Function.
4. The function calls Azure Document Intelligence.
5. Receipt data is extracted.
6. Data is stored in Cosmos DB.
7. A Service Bus message is published.
8. An analysis worker updates monthly summaries.
9. The frontend retrieves updated data through the API.

This architecture is fully event-driven and asynchronous.

---

# Login

First, I'll log in using Microsoft authentication.

The frontend uses MSAL and Microsoft Entra ID to obtain access tokens that are used when calling the backend API.

---

# Uploading a Receipt

Next, I'll upload a receipt image.

The frontend requests a temporary SAS URL from the API and uploads directly to Azure Blob Storage.

Notice that the upload completes immediately because processing happens asynchronously in the background.

---

# Processing

Behind the scenes:

* Azure Event Grid detects the upload.
* Azure Function executes.
* Document Intelligence extracts receipt information.
* Data is stored in Cosmos DB.
* The analysis worker updates spending summaries.

---

# Results

After processing completes, the receipt appears in the dashboard.

We can see:

* Merchant name
* Transaction date
* Total amount

The monthly summary also updates automatically.

---

# Azure Services

This project uses:

* Azure Static Web Apps
* Azure App Service
* Azure Blob Storage
* Azure Event Grid
* Azure Functions
* Azure Document Intelligence
* Azure Cosmos DB
* Azure Service Bus

---

# Closing

ReceiptTrackerX demonstrates:

* Cloud-native architecture
* Event-driven design
* Serverless computing
* Authentication and authorization
* Asynchronous processing
* Automated deployment using GitHub Actions

Thank you for watching.