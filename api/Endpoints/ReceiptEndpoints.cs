using api.Services;

namespace api.Endpoints;

public static class ReceiptEndpoints
{
    private const string DemoUserId = "demo-user";

    public static void MapReceiptEndpoints(this WebApplication app)
    {
        app.MapGet("/receipts", async (CosmosService cosmosService) =>
        {
            var receipts = await cosmosService.GetReceiptsForUserAsync(DemoUserId);
            return Results.Ok(receipts);
        });

        app.MapGet("/receipts/{id}", async (string id, CosmosService cosmosService) =>
        {
            var receipt = await cosmosService.GetReceiptByIdForUserAsync(id, DemoUserId);

            return receipt is null
                ? Results.NotFound()
                : Results.Ok(receipt);
        });
    }
}