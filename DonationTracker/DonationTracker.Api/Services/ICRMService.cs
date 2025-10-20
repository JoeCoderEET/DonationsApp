using System.Threading.Tasks;
using DonationTracker.Models;

namespace DonationTracker.Services
{
    // Defines the contract for integrating with an external system (e.g., Blackbaud, Dynamics).
    // This allows for easy swapping of implementations.
    public interface ICRMService
    {
        Task<(bool success, string response)> SendToCRM(Donation donation);
    }
}
