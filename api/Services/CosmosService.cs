using api.Models;
using Microsoft.Azure.Cosmos;

namespace api.Services;

public class CosmosService
{
    private readonly Container _receiptsContainer;
    private readonly Container _summariesContainer;

    public CosmosService(IConfiguration configuration)
    {
        var connectionString = configuration["CosmosDb:ConnectionString"];
        var databaseName = configuration["CosmosDb:DatabaseName"];
        var receiptsContainerName = configuration["CosmosDb:ReceiptsContainerName"];
        var summariesContainerName = configuration["CosmosDb:SummariesContainerName"];

        var cosmosClient = new CosmosClient(connectionString);
        var database = cosmosClient.GetDatabase(databaseName);

        _receiptsContainer = database.GetContainer(receiptsContainerName);
        _summariesContainer = database.GetContainer(summariesContainerName);
    }

    public async Task<List<Receipt>> GetReceiptsForUserAsync(string userId)
    {
        var query = new QueryDefinition(
            "SELECT * FROM c WHERE c.userID = @userId"
        ).WithParameter("@userId", userId);

        var options = new QueryRequestOptions
        {
            PartitionKey = new PartitionKey(userId)
        };

        var iterator = _receiptsContainer.GetItemQueryIterator<Receipt>(
            query,
            requestOptions: options
        );

        var receipts = new List<Receipt>();

        while (iterator.HasMoreResults)
        {
            var response = await iterator.ReadNextAsync();
            receipts.AddRange(response);
        }

        return receipts;
    }

    public async Task<Receipt?> GetReceiptByIdForUserAsync(string id, string userId)
    {
        try
        {
            var response = await _receiptsContainer.ReadItemAsync<Receipt>(
                id,
                new PartitionKey(userId)
            );

            return response.Resource;
        }
        catch (CosmosException ex)
            when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public async Task<List<ExpenseSummary>> GetSummariesForUserAsync(string userId)
    {
        var query = new QueryDefinition(
            "SELECT * FROM c WHERE c.userID = @userId AND c.type = @type"
        )
        .WithParameter("@userId", userId)
        .WithParameter("@type", "monthly_summary");

        var options = new QueryRequestOptions
        {
            PartitionKey = new PartitionKey(userId)
        };

        var iterator = _summariesContainer.GetItemQueryIterator<ExpenseSummary>(
            query,
            requestOptions: options
        );

        var summaries = new List<ExpenseSummary>();

        while (iterator.HasMoreResults)
        {
            var response = await iterator.ReadNextAsync();
            summaries.AddRange(response);
        }

        return summaries;
    }
}