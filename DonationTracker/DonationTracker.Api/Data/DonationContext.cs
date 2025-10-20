using Microsoft.EntityFrameworkCore;
using DonationTracker.Models;

namespace DonationTracker.Data
{
    // The DbContext manages the session with the database.
    public class DonationContext : DbContext
    {
        public DonationContext(DbContextOptions<DonationContext> options) : base(options)
        {
        }

        public DbSet<Donation> Donations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Enforce precision and scale for currency field
            modelBuilder.Entity<Donation>()
                .Property(d => d.Amount)
                .HasColumnType("decimal(18, 2)");
        }
    }
}
