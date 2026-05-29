## CI/CD Architecture

All deployable components use GitHub Actions.

```text
GitHub Repository
       │
       ├── Frontend Workflow
       │      └── Azure Static Web Apps
       │
       ├── API Workflow
       │      └── Azure App Service
       │
       ├── Function Workflow
       │      └── Azure Function App
       │
       └── Analysis Worker Workflow
              └── Analysis Worker Deployment
```

### Frontend Workflow

Responsible for:

* Installing dependencies
* Building React application
* Deploying to Azure Static Web Apps

### API Workflow

Responsible for:

* Restoring NuGet packages
* Building ASP.NET 8 API
* Publishing release artifacts
* Deploying to Azure App Service

### Function Workflow

Responsible for:

* Packaging Azure Function code
* Deploying to Azure Function App

### Analysis Worker Workflow

Responsible for:

* Building Analysis Worker
* Running tests
* Publishing deployment artifacts
* Deploying updated worker code

This allows the frontend, API, receipt processor, and analysis worker to be deployed independently.
