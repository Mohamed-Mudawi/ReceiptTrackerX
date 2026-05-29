# Testing

## Manual Testing Checklist

### Authentication

* [ ] User can log in
* [ ] User can log out
* [ ] Access token is acquired successfully

---

### Upload Flow

* [ ] User can request SAS URL
* [ ] Receipt uploads successfully
* [ ] Blob appears in Azure Storage

---

### OCR Processing

* [ ] Azure Function triggers
* [ ] Document Intelligence returns receipt data
* [ ] Receipt saved to Cosmos DB

---

### Service Bus

* [ ] Processing message published
* [ ] Analysis Worker receives message

---

### Summaries

* [ ] Monthly summary updates
* [ ] Dashboard refreshes automatically

---

### Error Cases

* [ ] Invalid image upload
* [ ] Non-receipt image upload
* [ ] Missing blob
* [ ] Expired SAS URL
* [ ] Cosmos DB unavailable

---

## Deployment Testing

Verify:

```bash
curl https://receipttrackerx-api.azurewebsites.net/health
```

Expected:

```json
{
  "status": "healthy"
}
```

---

## End-to-End Test

1. Log in
2. Upload receipt
3. Verify blob exists
4. Verify receipt appears in dashboard
5. Verify summary updates

Expected result:

Complete processing pipeline succeeds without manual intervention.
