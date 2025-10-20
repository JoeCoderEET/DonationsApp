using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using DonationTracker.Data;
using DonationTracker.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure EF Core with SQLite
// The connection string will create 'DonationTracker.db' in the application directory.
builder.Services.AddDbContext<DonationContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("SQLiteConnection") ?? "Data Source=DonationTracker.db"));

// Dependency Injection Setup (Key for swappable integrations)
builder.Services.AddScoped<IDonationRepository, DonationRepository>();
// Register the MockCRMService as the implementation for ICRMService
builder.Services.AddScoped<ICRMService, MockCRMService>(); 
// To swap to a real BlackbaudService, you would just change the line above:
// builder.Services.AddScoped<ICRMService, BlackbaudService>();

// Configure CORS for React frontend (assuming it runs on a different port, e.g., 3000)
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        policy =>
        {
            // Add common React dev ports. The React front end is configured to talk to localhost:5000
            policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:5173") 
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); 
        });
});


var app = builder.Build();

// Apply migrations on startup (ensures DB is created/updated on container start)
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<DonationContext>();
    context.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("CorsPolicy"); // Use the CORS policy

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
