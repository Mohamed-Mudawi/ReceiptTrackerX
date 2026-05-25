import logging
import azure.functions as func

app = func.FunctionApp()


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
    logging.info(f"Blob size: {blob.length} bytes")