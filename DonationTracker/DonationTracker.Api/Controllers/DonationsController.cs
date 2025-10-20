using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using DonationTracker.Data;
using DonationTracker.Models;
using DonationTracker.Services;

namespace DonationTracker.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DonationsController : ControllerBase
    {
        private readonly IDonationRepository _repository;
        private readonly ICRMService _crmService;

        public DonationsController(IDonationRepository repository, ICRMService crmService)
        {
            _repository = repository;
            _crmService = crmService;
        }

        // GET /donations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Donation>>> GetDonations()
        {
            var donations = await _repository.GetAllDonationsAsync();
            return Ok(donations);
        }

        // POST /donations
        [HttpPost]
        public async Task<ActionResult<Donation>> PostDonation(NewDonationDto donationDto)
        {
            // 1. Convert DTO to Entity and save to DB
            var donation = new Donation
            {
                DonorName = donationDto.DonorName,
                Amount = donationDto.Amount,
                Date = donationDto.Date ?? System.DateTime.UtcNow, // Use provided date or current UTC time
                CrmSynced = false,
                CrmResponse = "Pending"
            };

            var savedDonation = await _repository.AddDonationAsync(donation);

            // 2. Mock external integration call
            var (success, response) = await _crmService.SendToCRM(savedDonation);

            // 3. Update the saved donation with CRM result
            savedDonation.CrmSynced = success;
            savedDonation.CrmResponse = response;
            await _repository.UpdateDonationAsync(savedDonation);

            // Return the updated entity
            return CreatedAtAction(nameof(GetDonations), new { id = savedDonation.Id }, savedDonation);
        }
    }
}
