using api.Services;

namespace api.Endpoints;

public static class UploadEndpoints
{
    public static void MapUploadEndpoints(this WebApplication app)
    {
        app.MapPost("/uploads/sas", (
            HttpContext httpContext,
            BlobStorageService blobStorageService) =>
        {
            var userId = httpContext.User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value;

            if (userId is null)
                return Results.Unauthorized();

            var response = blobStorageService.CreateUploadUrl(userId);

            return Results.Ok(response);
        })
        .RequireAuthorization();
    }
}