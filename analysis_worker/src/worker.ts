import "dotenv/config";
import { ServiceBusClient } from "@azure/service-bus";
import type { ServiceBusReceivedMessage } from "@azure/service-bus";
import { CosmosClient } from "@azure/cosmos";

const serviceBusConnectionString = process.env.SERVICE_BUS_CONNECTION_STRING;
const queueName = process.env.SERVICE_BUS_QUEUE_NAME;

const cosmosEndpoint = process.env.COSMOS_ENDPOINT;
const cosmosKey = process.env.COSMOS_KEY;
const cosmosDatabaseName = process.env.COSMOS_DATABASE_NAME;
const cosmosContainerName = process.env.COSMOS_CONTAINER_NAME;

if (!serviceBusConnectionString) throw new Error("Missing SERVICE_BUS_CONNECTION_STRING");
if (!queueName) throw new Error("Missing SERVICE_BUS_QUEUE_NAME");
if (!cosmosEndpoint) throw new Error("Missing COSMOS_ENDPOINT");
if (!cosmosKey) throw new Error("Missing COSMOS_KEY");
if (!cosmosDatabaseName) throw new Error("Missing COSMOS_DATABASE_NAME");
if (!cosmosContainerName) throw new Error("Missing COSMOS_CONTAINER_NAME");

type ReceiptMessage = {
  receiptId: string;
  userID: string;
  blob_name: string;
  merchant_name?: string | null;
  transaction_date?: string | null;
  total?: number | null;
  status: string;
  processed_at: string;
};

type MonthlySummary = {
  id: string;
  userID: string;
  type: "monthly_summary";
  month: string;
  total_spend: number;
  receipt_count: number;
  processed_receipt_ids: string[];
  updated_at: string;
};

const serviceBusClient = new ServiceBusClient(serviceBusConnectionString);
const receiver = serviceBusClient.createReceiver(queueName);

const cosmosClient = new CosmosClient({
  endpoint: cosmosEndpoint,
  key: cosmosKey
});

const database = cosmosClient.database(cosmosDatabaseName);
const container = database.container(cosmosContainerName);

function getMonthFromReceipt(message: ReceiptMessage): string {
  const dateSource = message.transaction_date || message.processed_at;
  return dateSource.slice(0, 7);
}

async function updateMonthlySummary(message: ReceiptMessage): Promise<void> {
  const total = message.total ?? 0;
  const month = getMonthFromReceipt(message);
  const summaryId = `${message.userID}-${month}`;
  const partitionKey = message.userID;

  const summaryRef = container.item(summaryId, partitionKey);

  try {
    const { resource: existingSummary } =
      await summaryRef.read<MonthlySummary>();

    if (existingSummary) {
      const processedReceiptIds =
        existingSummary.processed_receipt_ids ?? [];

      if (processedReceiptIds.includes(message.receiptId)) {
        console.log(
          `Receipt ${message.receiptId} already counted. Skipping update.`
        );
        return;
      }

      const updatedSummary: MonthlySummary = {
        ...existingSummary,
        total_spend: existingSummary.total_spend + total,
        receipt_count: existingSummary.receipt_count + 1,
        processed_receipt_ids: [
          ...processedReceiptIds,
          message.receiptId
        ],
        updated_at: new Date().toISOString()
      };

      await summaryRef.replace(updatedSummary);

      console.log("Updated monthly summary:", updatedSummary);
      return;
    }
  } catch (error: any) {
    if (error.code !== 404) {
      throw error;
    }
  }

  const newSummary: MonthlySummary = {
    id: summaryId,
    userID: message.userID,
    type: "monthly_summary",
    month,
    total_spend: total,
    receipt_count: 1,
    processed_receipt_ids: [message.receiptId],
    updated_at: new Date().toISOString()
  };

  await container.items.create(newSummary);

  console.log("Created monthly summary:", newSummary);
}

async function handleMessage(message: ServiceBusReceivedMessage): Promise<void> {
  console.log("Received message:");

  const body = message.body as ReceiptMessage;

  console.log(JSON.stringify(body, null, 2));

  console.log("Receipt ID:", body.receiptId);
  console.log("User ID:", body.userID);
  console.log("Merchant:", body.merchant_name);
  console.log("Total:", body.total);

  await updateMonthlySummary(body);

  await receiver.completeMessage(message);

  console.log("Message completed.");
}

async function main(): Promise<void> {
  console.log("Analysis worker started.");
  console.log("Analysis worker version: CI/CD test v4");
  console.log(`Listening on queue: ${queueName}`);

  receiver.subscribe({
    processMessage: async (message) => {
      try {
        await handleMessage(message);
      } catch (error) {
        console.error("Error handling message:", error);
        await receiver.abandonMessage(message);
      }
    },

    processError: async (error) => {
      console.error("Service Bus error:", error);
    }
  });
}

main().catch(async (error) => {
  console.error("Worker failed to start:", error);

  await receiver.close();
  await serviceBusClient.close();

  process.exit(1);
});