# Troubleshooting

## Upload Fails

### Symptom

Frontend displays:

```text
Upload Failed
```

### Possible Causes

* Blob Storage CORS issue
* Expired SAS URL
* Storage account unavailable

### Fix

Verify Blob Storage CORS configuration:

```text
GET
PUT
POST
OPTIONS
```

Allowed Origin:

```text
https://wonderful-meadow-0dd696d0f.7.azurestaticapps.net
```

---

## Login Fails

### Symptom

Microsoft login redirects to an error page.

### Possible Causes

* Incorrect redirect URI
* Missing API permission
* Invalid client ID

### Fix

Verify:

* Redirect URI matches frontend URL
* API scope configured correctly
* MSAL configuration is correct

---

## Receipt Never Appears

### Symptom

Upload succeeds but dashboard never updates.

### Possible Causes

* Azure Function failure
* OCR failure
* Cosmos DB write failure

### Fix

Check:

1. Function logs
2. Application Insights
3. Cosmos DB records

---

## API Returns 500

### Symptom

```text
500 Internal Server Error
```

### Possible Causes

* Missing configuration
* Cosmos DB unavailable
* Storage connection string invalid

### Fix

Check:

```text
Azure App Service
→ Configuration
```

Verify all required settings exist.

---

## Service Bus Issues

### Symptom

Summaries do not update.

### Possible Causes

* Queue missing
* Worker offline
* Service Bus authentication issue

### Fix

Verify:

* Queue exists
* Messages are arriving
* Worker is processing messages

---

## Health Endpoint

Use:

```bash
curl https://receipttrackerx-api.azurewebsites.net/health
```

Expected:

```json
{
  "status": "healthy"
}
```

If this fails, investigate API deployment before checking other services.
