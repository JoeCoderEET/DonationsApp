import React, { useState, useEffect } from 'react';
import { RefreshCcw, Send, CheckCircle, XCircle, DollarSign, Calendar, AlertTriangle, Loader2 } from 'lucide-react';

// --- CONFIGURATION ---
// The API URL should match the Docker setup or local development environment
const API_BASE_URL = 'http://localhost:5003'; 

// --- TYPE DEFINITION ---
/**
 * @typedef {object} Donation
 * @property {number} id
 * @property {string} donorName
 * @property {number} amount
 * @property {string} donationDate
 * @property {string} crmResponse
 */

// --- HELPER COMPONENTS ---

/**
 * Custom Loading Spinner component.
 */
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <Loader2 className="button-icon spinning" />
    <span>Loading Data...</span>
  </div>
);

/**
 * Custom Alert Box component for displaying success or error messages.
 */
const AlertMessage = ({ message, type, onClose }) => {
  const classes = {
    success: 'alert-success',
    error: 'alert-error',
  };

  return (
    <div className={`alert-container ${classes[type]}`} role="alert">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <AlertTriangle style={{ marginRight: '0.5rem', width: '1.25rem', height: '1.25rem' }} />
        <p>{message}</p>
      </div>
      <button onClick={onClose} className="alert-close-btn">
        &times;
      </button>
    </div>
  );
};


// --- MAIN COMPONENTS ---

/**
 * 1. Donation Submission Form component.
 * Handles state for the form inputs and submits data to the backend API.
 */
const DonationForm = ({ onDonationSubmitted }) => {
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      const parsedAmount = parseFloat(amount);
      if (parsedAmount <= 0 || isNaN(parsedAmount)) {
        setMessage({ type: 'error', text: 'Please enter a valid positive donation amount.' });
        setIsSubmitting(false);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donorName,
          amount: parsedAmount,
          // Date is omitted so backend uses UtcNow
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText} (${response.status})`);
      }

      const newDonation = await response.json();
      // Assuming the backend returns the donation object with crmResponse field
      const crmStatus = newDonation.crmResponse ? newDonation.crmResponse : 'Processing'; 
      setMessage({ type: 'success', text: `Donation submitted successfully! CRM Status: ${crmStatus}` });
      onDonationSubmitted(); // Trigger the main app to re-fetch the list
      setDonorName('');
      setAmount('');

    } catch (error) {
      console.error('Submission Error:', error);
      setMessage({ type: 'error', text: `Failed to submit donation. Ensure the backend is running at ${API_BASE_URL}. Error: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="donation-form-card">
      <h2 className="form-title">
        <DollarSign className="form-icon" />
        Record a New Donation
      </h2>
      
      {message && <AlertMessage message={message.text} type={message.type} onClose={() => setMessage(null)} />}

      <form onSubmit={handleSubmit} className="form-group-container">
        <div className="form-group">
          <label htmlFor="donorName" className="form-label" >Donor Name</label>
          <input
            id="donorName"
            type="text"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            className="form-input"
            placeholder="e.g., Jane Doe"
            required
            disabled={isSubmitting}
            style={{ backgroundColor: 'rgba(29, 72, 147, 1)' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount" className="form-label">Amount ($)</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="form-input"
            placeholder="e.g., 50.00"
            required
            min="0.01"
            disabled={isSubmitting}
            style={{ backgroundColor: 'rgba(29, 72, 147, 1)' }}
          />
        </div>

        <button type="submit" className="submit-button" disabled={isSubmitting || !donorName || !amount}>
          {isSubmitting ? (
            <Loader2 className="button-icon spinning" />
          ) : (
            <Send className="button-icon" />
          )}
          {isSubmitting ? 'Submitting...' : 'Record Donation'}
        </button>
      </form>
    </div>
  );
};


/**
 * 2. Donation Display Table component.
 * Displays the list of donations and calculates the total.
 * * @param {Donation[]} donations
 * @param {function} onRefresh
 * @param {boolean} isLoading
 */
const DonationTable = ({ donations, onRefresh, isLoading }) => {
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString); 
      
      // CRITICAL: Check if the date object is valid
      if (isNaN(date.getTime())) {
          return 'Invalid Date';
      }

      // Format to a readable local date string with specific options for reliability
      return date.toLocaleDateString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

    } catch (e) {
      console.error("Date formatting error:", e);
      return 'Invalid Date';
    }
  };

  const getStatusIcon = (response) => {
    if (response && response.toLowerCase().includes('success')) {
      return <CheckCircle className="status-icon success-color" />;
    }
    return <XCircle className="status-icon error-color" />;
  };

  return (
    <div className="donation-table-card">
      <div className="table-header">
        <h2 className="form-title" style={{ marginBottom: '0' }}>
          <Calendar className="form-icon" />
          Recent Donations
        </h2>
        <button onClick={onRefresh} className="refresh-button" disabled={isLoading}>
          <RefreshCcw className={`button-icon ${isLoading ? 'spinning' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="total-display">
        Total Raised: **{formatCurrency(totalAmount)}**
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : donations.length === 0 ? (
        <p className="empty-state">No donations recorded yet. Start by submitting the form!</p>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table className="donation-table">
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Amount</th>
                <th>Date</th>
                <th>CRM Status</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((donation) => (
                <tr key={donation.id}>
                  <td>{donation.donorName}</td>
                  <td>{formatCurrency(donation.amount)}</td>
                  <td>{formatDate(donation.date)}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      {getStatusIcon(donation.crmResponse)}
                      {donation.crmResponse}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


/**
 * 3. Main App Component
 * Fetches and manages the list of donations.
 */
export default function App() {
  /** @type {[Donation[], React.Dispatch<React.SetStateAction<Donation[]>>]} */
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDonations = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/donations`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      console.log('Fetched Donations:', data);
      // Ensure data is sorted by date descending for display
      const sortedData = data.sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime());
      
      setDonations(sortedData);
    } catch (err) {
      console.error('Fetch Error:', err);
      setError(`Error connecting to API. Is the backend running at ${API_BASE_URL}?`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on initial load
  useEffect(() => {
    fetchDonations();
  }, []); // Empty dependency array means run once on mount

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Donation Tracker Dashboard</h1>
        <p className="app-subtitle">Real-time monitoring and entry for incoming donations.</p>
      </header>
      
      {error && <AlertMessage message={error} type="error" onClose={() => setError(null)} />}

      <main className="main-content-wrapper">
        <DonationForm onDonationSubmitted={fetchDonations} />
        <DonationTable 
          donations={donations} 
          onRefresh={fetchDonations} 
          isLoading={isLoading} 
        />
      </main>

      <footer className="app-footer">
        &copy; 2025 Donation Tracker. Built with React and C# ASP.NET Core by Joe Polgrabia.
      </footer>
    </div>
  );
}