using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Endpoints;

public static class ReceiptEndpoints
{
    public static void MapReceiptEndpoints(this WebApplication app)
    {
        app.MapGet("/receipts", async (
            HttpContext httpContext,
            [FromServices] CosmosService cosmosService) =>
        {
            var userId = httpContext.User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value;

            if (userId is null)
                return Results.Unauthorized();

            var receipts = await cosmosService.GetReceiptsForUserAsync(userId);

            return Results.Ok(receipts);
        })
        .RequireAuthorization();

        app.MapGet("/receipts/{id}", async (
            string id,
            HttpContext httpContext,
            [FromServices] CosmosService cosmosService) =>
        {
            var userId = httpContext.User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value;

            if (userId is null)
                return Results.Unauthorized();

            var receipt = await cosmosService.GetReceiptByIdForUserAsync(id, userId);

            return receipt is null
                ? Results.NotFound()
                : Results.Ok(receipt);
        })
        .RequireAuthorization();
    }
}