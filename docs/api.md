# API Reference

## Base URL

Production:

```text
https://receipttrackerx-api.azurewebsites.net
```

Local:

```text
http://localhost:5279
```

---

# Health Check

## GET /health

Returns API status.

### Response

```json
{
  "status": "healthy",
  "service": "api",
  "timestamp": "2026-05-29T12:00:00Z"
}
```

---

# Receipts

## GET /receipts

Returns all receipts for the authenticated user.

### Response

```json
[
  {
    "id": "123",
    "merchantName": "Target",
    "transactionDate": "2026-05-28",
    "total": 45.99
  }
]
```

---

## GET /receipts/{id}

Returns a single receipt.

### Response

```json
{
  "id": "123",
  "merchantName": "Target",
  "transactionDate": "2026-05-28",
  "total": 45.99
}
```

---

# Summary

## GET /summary

Returns monthly spending summaries.

### Response

```json
[
  {
    "month": "2026-05",
    "totalSpend": 420.15,
    "receiptCount": 12
  }
]
```

---

# Uploads

## POST /uploads/sas

Generates a temporary SAS upload URL.

### Response

```json
{
  "uploadUrl": "https://..."
}
```

The frontend uploads directly to Azure Blob Storage using this URL.
