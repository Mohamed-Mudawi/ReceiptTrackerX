using Newtonsoft.Json;

namespace api.Models;

public class Receipt
{
    [JsonProperty("id")]
    public string Id { get; set; } = "";

    [JsonProperty("userID")]
    public string UserId { get; set; } = "";

    [JsonProperty("merchant_name")]
    public string? MerchantName { get; set; }

    [JsonProperty("transaction_date")]
    public string? TransactionDate { get; set; }

    [JsonProperty("total")]
    public decimal? Total { get; set; }

    [JsonProperty("status")]
    public string Status { get; set; } = "";

    [JsonProperty("blob_name")]
    public string? BlobName { get; set; }

    [JsonProperty("processed_at")]
    public string? ProcessedAt { get; set; }
}