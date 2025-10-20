using System.Collections.Generic;
using System.Threading.Tasks;
using DonationTracker.Models;

namespace DonationTracker.Data
{
    // Defines the contract for the data access layer.
    public interface IDonationRepository
    {
        Task<Donation> AddDonationAsync(Donation donation);
        Task<IEnumerable<Donation>> GetAllDonationsAsync();
        Task<Donation> UpdateDonationAsync(Donation donation);
    }
}
