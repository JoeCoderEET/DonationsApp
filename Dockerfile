# 1. Use the official .NET SDK image for building the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY *.csproj .
RUN dotnet restore

# Copy the rest of the source code and build
COPY . .
RUN dotnet build -c Release -o /app/build

# 2. Publish the application
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# 3. Use the minimal ASP.NET Core runtime image for the final container
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# The application runs on port 80 by default in the ASP.NET runtime image
EXPOSE 80

# This command runs the application. The DB is created by the Program.cs migration logic.
ENTRYPOINT ["dotnet", "DonationTracker.dll"]