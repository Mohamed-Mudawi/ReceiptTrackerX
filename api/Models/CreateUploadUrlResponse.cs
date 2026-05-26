namespace api.Models;

public class CreateUploadUrlResponse
{
    public string ReceiptId { get; set; } = "";
    public string BlobName { get; set; } = "";
    public string UploadUrl { get; set; } = "";
}