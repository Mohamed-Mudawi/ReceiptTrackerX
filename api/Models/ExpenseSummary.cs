using Newtonsoft.Json;

namespace api.Models;

public class ExpenseSummary
{
    [JsonProperty("id")]
    public string Id { get; set; } = "";

    [JsonProperty("userID")]
    public string UserId { get; set; } = "";

    [JsonProperty("type")]
    public string Type { get; set; } = "";

    [JsonProperty("month")]
    public string Month { get; set; } = "";

    [JsonProperty("total_spend")]
    public decimal TotalSpend { get; set; }

    [JsonProperty("receipt_count")]
    public int ReceiptCount { get; set; }

    [JsonProperty("processed_receipt_ids")]
    public List<string> ProcessedReceiptIds { get; set; } = new();

    [JsonProperty("updated_at")]
    public string UpdatedAt { get; set; } = "";
}