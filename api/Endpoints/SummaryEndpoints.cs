using api.Services;

namespace api.Endpoints;

public static class SummaryEndpoints
{
    private const string DemoUserId = "demo-user";

    public static void MapSummaryEndpoints(this WebApplication app)
    {
        app.MapGet("/summary", async (CosmosService cosmosService) =>
        {
            var summaries = await cosmosService.GetSummariesForUserAsync(DemoUserId);
            return Results.Ok(summaries);
        });
    }
}