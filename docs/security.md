# Security

## Authentication

ReceiptTrackerX uses Microsoft Entra ID.

Frontend authentication is handled using:

* MSAL
* OAuth 2.0
* OpenID Connect

---

## Authorization

Protected API endpoints require a valid JWT access token.

The API validates:

* Audience
* Signature
* Expiration

---

## File Upload Security

Receipt uploads use temporary SAS URLs.

Benefits:

* No storage keys exposed to clients
* Limited permissions
* Limited lifetime

---

## Secrets Management

Secrets are never committed to source control.

Production secrets are stored in:

* Azure App Service Configuration
* Azure Function App Configuration
* GitHub Secrets

Examples:

* Cosmos DB connection strings
* Storage connection strings
* Document Intelligence keys

---

## CORS

CORS is restricted to approved frontend origins.

Examples:

```text
http://localhost:5173
https://wonderful-meadow-0dd696d0f.7.azurestaticapps.net
```

---

## Future Improvements

Potential future enhancements:

* Managed Identity
* Azure Key Vault
* Role-based authorization
* API rate limiting
* OpenTelemetry monitoring
* Audit logging
