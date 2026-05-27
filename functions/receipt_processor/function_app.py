import logging
import os
import uuid
import json
from datetime import datetime

import azure.functions as func

from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
from azure.cosmos import CosmosClient
from azure.servicebus import ServiceBusClient, ServiceBusMessage

app = func.FunctionApp()

document_analysis_client = DocumentAnalysisClient(
    endpoint=os.environ["DOCUMENT_INTELLIGENCE_ENDPOINT"],
    credential=AzureKeyCredential(os.environ["DOCUMENT_INTELLIGENCE_KEY"])
)

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

service_bus_client = ServiceBusClient.from_connection_string(
    os.environ["SERVICE_BUS_CONNECTION_STRING"]
)

service_bus_queue_name = os.environ["SERVICE_BUS_QUEUE_NAME"]


def get_user_id_from_blob_name(blob_name: str) -> str:
    parts = blob_name.split("/")

    if len(parts) >= 3 and parts[0] == "receipts":
        return parts[1]

    if len(parts) >= 2:
        return parts[0]

    raise ValueError(f"Could not extract user ID from blob name: {blob_name}")


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
        user_id = get_user_id_from_blob_name(blob.name)

        poller = document_analysis_client.begin_analyze_document(
            "prebuilt-receipt",
            blob_bytes
        )

        result = poller.result()

        receipt_data = {
            "id": str(uuid.uuid4()),
            "userID": user_id,
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

        message_body = {
            "receiptId": receipt_data["id"],
            "userID": receipt_data["userID"],
            "blob_name": receipt_data["blob_name"],
            "merchant_name": receipt_data.get("merchant_name"),
            "transaction_date": receipt_data.get("transaction_date"),
            "total": receipt_data.get("total"),
            "status": receipt_data["status"],
            "processed_at": receipt_data["processed_at"]
        }

        sender = service_bus_client.get_queue_sender(
            queue_name=service_bus_queue_name
        )

        with sender:
            sender.send_messages(ServiceBusMessage(json.dumps(message_body)))

        logging.info("Receipt saved to Cosmos DB and event sent to Service Bus.")

    except Exception as e:
        logging.error(f"Error processing receipt: {str(e)}")
        raise