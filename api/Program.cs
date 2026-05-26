using api.Endpoints;
using api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<CosmosService>();
builder.Services.AddSingleton<BlobStorageService>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.MapGet("/", () => "ReceiptTrackerX API");

app.MapGet("/health", () =>
{
    return Results.Ok(new
    {
        status = "healthy",
        service = "api",
        timestamp = DateTime.UtcNow
    });
});

app.MapReceiptEndpoints();
app.MapSummaryEndpoints();
app.MapUploadEndpoints();

app.Run();