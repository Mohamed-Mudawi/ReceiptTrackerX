# ReceiptTrackerX

Intelligent receipt-processing and expense-tracking application built with Azure services.

![License](https://img.shields.io/badge/license-MIT-green.svg)
![Azure](https://img.shields.io/badge/Azure-%230078D4.svg?style=flat&logo=microsoftazure&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Overview

ReceiptTrackerX is an intelligent receipt-processing and expense-tracking application that leverages Azure cloud services to automate the capture, extraction, categorization, and analysis of receipt data. Users can upload receipt images, which are automatically processed using Azure Document Intelligence to extract key information like merchant name, transaction date, line items, and totals. The extracted data is stored in Azure Cosmos DB and made available through a RESTful API for visualization and analysis in the frontend application.

This project follows Azure best practices with a serverless architecture using Azure Functions, Container Apps, and various Azure data services.

## Features

- **Automatic Receipt Processing**: Upload receipt images and automatically extract structured data
- **Intelligent Data Extraction**: Uses Azure Document Intelligence's prebuilt receipt model
- **Secure Storage**: Raw receipt images stored in Azure Blob Storage
- **Scalable Data Storage**: Structured data stored in Azure Cosmos DB
- **Decoupled Processing**: Event-driven architecture using Azure Event Grid and Service Bus
- **Modern Frontend**: React-based interface for uploading receipts and viewing expenses
- **Authentication & Security**: Integrated with Azure AD B2C/Microsoft Entra ID
- **Monitoring & Analytics**: Application Insights for performance monitoring
- **Cost Management**: Track Azure resource consumption
- **CI/CD Pipeline**: Automated builds and deployments with GitHub Actions

## Architecture

![Architecture Diagram](docs/architecture.png)

The application follows a microservices architecture with the following components:

1. **Frontend Application** (React)
   - User interface for uploading receipts and viewing expense data
   - Secure authentication via Azure AD B2C
   - Calls to backend RESTful APIs

2. **Receipt Processing Function** (Azure Function)
   - Triggered by Azure Event Grid when new blobs are uploaded
   - Downloads receipt images from Blob Storage
   - Processes images using Azure Document Intelligence
   - Stores extracted data in Cosmos DB
   - Publishes messages to Service Bus for downstream processing

3. **Analysis Worker** (Azure Function/Container App)
   - Listens to Service Bus queue
   - Performs additional processing (categorization, aggregation)
   - Updates aggregated data in Cosmos DB

4. **API Service** (Azure Container App)
   - Provides RESTful endpoints for frontend consumption
   - Retrieves receipt and summary data from Cosmos DB

5. **Data Storage**
   - **Azure Blob Storage**: Stores raw receipt images
   - **Azure Cosmos DB**: Stores structured receipt data and aggregates
   - **Azure Service Bus**: Decouples processing components

6. **Infrastructure**
   - Defined as code (Bicep/Terraform) for reproducibility
   - Managed via GitHub with CI/CD pipelines

## Getting Started

### Prerequisites

- [Azure Account](https://azure.microsoft.com/free/) (Azure for Students recommended)
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ReceiptTrackerX.git
   cd ReceiptTrackerX
   ```

2. **Set up Azure resources**
   ```bash
   # Login to Azure
   az login
   
   # Create resource group
   az group create --name rg-receipttracker --location eastus
   
   # Deploy infrastructure (Bicep/Terraform templates)
   # ./deploy-infra.sh  # or your preferred IaC tool
   ```

3. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend functions
   cd ../functions
   npm install
   
   # API service
   cd ../api
   npm install
   ```

4. **Configure environment variables**
   Copy the example environment files and fill in your values:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Azure resource names and keys
   ```

### Configuration

Update the following configuration files with your Azure resource details:

- `frontend/src/config.js` - Frontend API endpoints and auth settings
- `functions/local.settings.json` - Azure Function app settings
- `api/.env` - API service environment variables
- `infra/main.bicep` or `infra/main.tf` - Infrastructure parameters

## Usage

### Development

1. **Start the frontend development server**
   ```bash
   cd frontend
   npm start
   ```

2. **Start Azure Functions locally**
   ```bash
   cd functions
   func start
   ```

3. **Start the API service**
   ```bash
   cd api
   npm run dev
   ```

4. **Upload a receipt**
   - Navigate to `http://localhost:3000`
   - Sign up/log in using Azure AD B2C
   - Click "Upload Receipt" and select an image file
   - View processed data in your dashboard

### Production Deployment

The application is designed for deployment to Azure using GitHub Actions:

1. Push changes to the `main` branch
2. GitHub Actions will automatically:
   - Build and test the frontend
   - Build and publish Docker images to Azure Container Registry
   - Deploy Azure Functions
   - Deploy Container Apps
   - Update infrastructure as needed

## Project Structure

```
ReceiptTrackerX/
├── .github/                  # GitHub Actions workflows
├── docs/                     # Documentation and diagrams
├── frontend/                 # React frontend application
│   ├── public/
│   ├── src/
│   └── package.json
├── functions/                # Azure Functions for processing
│   ├── ReceiptProcessor/
│   ├── AnalysisWorker/
│   └── host.json
├── api/                      # Node.js API service (Container App)
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── infra/                    # Infrastructure as Code (Bicep/Terraform)
│   ├── main.bicep
│   └── parameters.json
├── scripts/                  # Deployment and utility scripts
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and follow the existing code style.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Azure Document Intelligence](https://azure.microsoft.com/services/ai-document-intelligence/) for receipt processing capabilities
- [Azure Functions](https://azure.microsoft.com/services/functions/) for serverless compute
- [Azure Cosmos DB](https://azure.microsoft.com/services/cosmos-db/) for globally distributed database
- [Azure Service Bus](https://azure.microsoft.com/services/service-bus/) for reliable messaging
- [Azure Container Apps](https://azure.microsoft.com/services/container-apps/) for microservices hosting
- [React](https://reactjs.org/) for the frontend framework
- GitHub's [README guidelines](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes) for documentation best practices
