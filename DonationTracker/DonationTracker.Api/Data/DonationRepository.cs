using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DonationTracker.Models;

namespace DonationTracker.Data
{
    // Implements the repository using Entity Framework Core and SQLite.
    public class DonationRepository : IDonationRepository
    {
        private readonly DonationContext _context;

        public DonationRepository(DonationContext context)
        {
            _context = context;
        }

        public async Task<Donation> AddDonationAsync(Donation donation)
        {
            _context.Donations.Add(donation);
            await _context.SaveChangesAsync();
            return donation;
        }

        public async Task<IEnumerable<Donation>> GetAllDonationsAsync()
        {
            return await _context.Donations
                                 .OrderByDescending(d => d.Date)
                                 .ToListAsync();
        }

        public async Task<Donation> UpdateDonationAsync(Donation donation)
        {
            _context.Donations.Update(donation);
            await _context.SaveChangesAsync();
            return donation;
        }
    }
}
