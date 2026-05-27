using api.Services;

namespace api.Endpoints;

public static class SummaryEndpoints
{
    public static void MapSummaryEndpoints(this WebApplication app)
    {
        app.MapGet("/summary", async (
            HttpContext httpContext,
            CosmosService cosmosService) =>
        {
            var userId = httpContext.User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value;

            if (userId is null)
                return Results.Unauthorized();

            var summaries = await cosmosService.GetSummariesForUserAsync(userId);

            return Results.Ok(summaries);
        })
        .RequireAuthorization();
    }
}