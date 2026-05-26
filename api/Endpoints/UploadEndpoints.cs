using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Endpoints;

public static class UploadEndpoints
{
    private const string DemoUserId = "demo-user";

    public static void MapUploadEndpoints(this WebApplication app)
    {
        app.MapPost("/uploads/sas", ([FromServices] BlobStorageService blobStorageService) =>
        {
            var response = blobStorageService.CreateUploadUrl(DemoUserId);
            return Results.Ok(response);
        });
    }
}