import logging
import os
import uuid
from datetime import datetime

import azure.functions as func

from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential

from azure.cosmos import CosmosClient

app = func.FunctionApp()

# OCR client
document_analysis_client = DocumentAnalysisClient(
    endpoint=os.environ["DOCUMENT_INTELLIGENCE_ENDPOINT"],
    credential=AzureKeyCredential(
        os.environ["DOCUMENT_INTELLIGENCE_KEY"]
    )
)

# Cosmos client
cosmos_client = CosmosClient(
    os.environ["COSMOS_ENDPOINT"],
    credential=os.environ["COSMOS_KEY"]
)

database = cosmos_client.get_database_client(
    os.environ["COSMOS_DATABASE_NAME"]
)

container = database.get_container_client(
    os.environ["COSMOS_CONTAINER_NAME"]
)


@app.function_name(name="receipt_processor")
@app.blob_trigger(
    arg_name="blob",
    path="receipts/{name}",
    connection="RECEIPT_STORAGE_CONNECTION_STRING",
    source=func.BlobSource.EVENT_GRID
)
def receipt_processor(blob: func.InputStream):

    logging.info("Receipt processor triggered.")
    logging.info(f"Blob name: {blob.name}")

    try:
        blob_bytes = blob.read()

        poller = document_analysis_client.begin_analyze_document(
            "prebuilt-receipt",
            blob_bytes
        )

        result = poller.result()

        receipt_data = {
            "id": str(uuid.uuid4()),
            "userID": "demo-user",
            "blob_name": blob.name,
            "processed_at": datetime.utcnow().isoformat(),
            "status": "processed"
        }

        if result.documents:

            receipt = result.documents[0]

            fields = receipt.fields

            receipt_data["merchant_name"] = (
                fields.get("MerchantName").value
                if fields.get("MerchantName")
                else None
            )

            receipt_data["transaction_date"] = (
                str(fields.get("TransactionDate").value)
                if fields.get("TransactionDate")
                else None
            )

            receipt_data["total"] = (
                fields.get("Total").value
                if fields.get("Total")
                else None
            )

        container.create_item(receipt_data)

        logging.info("Receipt saved to Cosmos DB.")
        logging.info(receipt_data)

    except Exception as e:
        logging.error(f"Error processing receipt: {str(e)}")
        raise