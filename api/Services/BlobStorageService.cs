using api.Models;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;

namespace api.Services;

public class BlobStorageService
{
    private readonly BlobContainerClient _containerClient;

    public BlobStorageService(IConfiguration configuration)
    {
        var connectionString = configuration["BlobStorage:ConnectionString"];
        var containerName = configuration["BlobStorage:ContainerName"];

        _containerClient = new BlobContainerClient(connectionString, containerName);
        _containerClient.CreateIfNotExists();
    }

    public CreateUploadUrlResponse CreateUploadUrl(string userId)
    {
        var receiptId = Guid.NewGuid().ToString();

        var blobName = $"{userId}/{receiptId}.png";

        var blobClient = _containerClient.GetBlobClient(blobName);

        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = _containerClient.Name,
            BlobName = blobName,
            Resource = "b",
            ExpiresOn = DateTimeOffset.UtcNow.AddMinutes(5)
        };

        sasBuilder.SetPermissions(
            BlobSasPermissions.Create |
            BlobSasPermissions.Write
        );

        var uploadUrl = blobClient.GenerateSasUri(sasBuilder).ToString();

        return new CreateUploadUrlResponse
        {
            ReceiptId = receiptId,
            BlobName = blobName,
            UploadUrl = uploadUrl
        };
    }
}