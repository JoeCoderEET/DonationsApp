using System.Threading.Tasks;
using System;
using DonationTracker.Models;

namespace DonationTracker.Services
{
    // A mock implementation that simulates a successful or failed CRM call.
    public class MockCRMService : ICRMService
    {
        public Task<(bool success, string response)> SendToCRM(Donation donation)
        {
            // Simulate a delay for an external API call
            // await Task.Delay(500); 

            // Simple logic for simulation: successful if amount > 100, otherwise it "fails" validation.
            if (donation.Amount > 100m)
            {
                var response = $"Successfully synced donation ID {donation.Id} for ${donation.Amount} to Dynamics 365. External ID: {Guid.NewGuid()}";
                Console.WriteLine($"[CRM SUCCESS]: {response}");
                return Task.FromResult((true, response));
            }
            else
            {
                var response = $"CRM Validation Error: Donation amount ${donation.Amount} is below minimum threshold for sync.";
                Console.WriteLine($"[CRM FAILURE]: {response}");
                return Task.FromResult((false, response));
            }
        }
    }
}
