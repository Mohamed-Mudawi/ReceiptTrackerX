using api.Endpoints;
using api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "https://wonderful-meadow-0dd696d0f7.azurestaticapps.net"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://login.microsoftonline.com/common/v2.0";

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidAudiences =
            [
                "api://edd6dde2-5be3-4ec4-8fa0-eb2fb1e8025a",
                "edd6dde2-5be3-4ec4-8fa0-eb2fb1e8025a"
            ],

            ValidateIssuer = false
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine("AUTH FAILED:");
                Console.WriteLine(context.Exception.Message);
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                Console.WriteLine("AUTH CHALLENGE:");
                Console.WriteLine(context.Error);
                Console.WriteLine(context.ErrorDescription);
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddSingleton<CosmosService>();
builder.Services.AddSingleton<BlobStorageService>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

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