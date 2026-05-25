import logging
import os

import azure.functions as func
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential

app = func.FunctionApp()


@app.function_name(name="receipt_processor")
@app.blob_trigger(
    arg_name="blob",
    path="receipts/{name}",
    connection="RECEIPT_STORAGE_CONNECTION_STRING",
    source=func.BlobSource.EVENT_GRID,
)
def receipt_processor(blob: func.InputStream):
    logging.info("Receipt processor triggered.")
    logging.info(f"Blob name: {blob.name}")
    logging.info(f"Blob size: {blob.length} bytes")

    endpoint = os.environ["DOCUMENT_INTELLIGENCE_ENDPOINT"]
    key = os.environ["DOCUMENT_INTELLIGENCE_KEY"]

    client = DocumentAnalysisClient(
        endpoint=endpoint,
        credential=AzureKeyCredential(key),
    )

    receipt_bytes = blob.read()

    poller = client.begin_analyze_document(
        model_id="prebuilt-receipt",
        document=receipt_bytes,
    )

    result = poller.result()

    for document in result.documents:
        fields = document.fields

        merchant = fields.get("MerchantName")
        transaction_date = fields.get("TransactionDate")
        total = fields.get("Total")

        logging.info("OCR result:")
        logging.info(f"Merchant: {merchant.value if merchant else None}")
        logging.info(f"Transaction date: {transaction_date.value if transaction_date else None}")
        logging.info(f"Total: {total.value if total else None}")