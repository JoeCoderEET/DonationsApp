using System;
using System.ComponentModel.DataAnnotations;

namespace DonationTracker.Models
{
    // Represents a single donation entity.
    public class Donation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string DonorName { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        public DateTime Date { get; set; } = DateTime.UtcNow;

        // Metadata for the CRM integration status (simulated)
        public bool CrmSynced { get; set; } = false;
        public string CrmResponse { get; set; } = string.Empty;
    }

    // DTO for receiving new donations via POST request
    public class NewDonationDto
    {
        [Required]
        public string DonorName { get; set; }

        [Required]
        public decimal Amount { get; set; }
        
        // Date is optional in the DTO; if not provided, the controller will use UtcNow
        public DateTime? Date { get; set; }
    }
}
