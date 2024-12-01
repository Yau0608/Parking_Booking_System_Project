$(document).ready(function () {
  let allTransactions = [];

  // Load transactions
  async function loadTransactions() {
    try {
      const response = await fetch('/api/transactions', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.redirected || response.url.includes('login.html')) {
        window.location.href = '/login.html';
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Received non-JSON response from server');
      }

      const data = await response.json();

      if (data.success) {
        allTransactions = data.transactions;
        displayTransactions(allTransactions);
      } else {
        throw new Error(data.message || 'Failed to load transactions');
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      if (error.message.includes('Received non-JSON response')) {
        window.location.href = '/login.html';
      } else {
        $('#transactionsList').html(
          `<div class="alert alert-danger">Error loading transactions: ${error.message}</div>`
        );
      }
    }
  }

  function displayTransactions(transactions) {
    const transactionsList = $('#transactionsList');
    transactionsList.empty();

    if (transactions.length === 0) {
      transactionsList.html(
        '<div class="alert alert-info">No transactions found</div>'
      );
      return;
    }

    transactions.forEach((transaction, index) => {
      const statusBadge = getStatusBadge(transaction.status);
      const spaces = transaction.bookings.map(b => b.spaceNumber).join(', ');

      transactionsList.append(`
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" 
                    data-bs-toggle="collapse" data-bs-target="#transaction${index}">
              <div class="d-flex w-100 justify-content-between align-items-center">
                <div>
                  <strong>Date:</strong> ${new Date(transaction.date).toLocaleDateString()}
                  <strong class="ms-3">Spaces:</strong> ${spaces}
                </div>
                <div>
                  ${statusBadge}
                  <span class="badge bg-primary ms-2">$${transaction.totalPrice}</span>
                </div>
              </div>
            </button>
          </h2>
          <div id="transaction${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}">
            <div class="accordion-body">
              <div class="row">
                <div class="col-md-6">
                  <p><strong>Transaction ID:</strong> ${transaction._id.transactionId || 'N/A'}</p>
                  <p><strong>Booking Date:</strong> ${new Date(transaction.date).toLocaleDateString()}</p>
                  <p><strong>Created:</strong> ${new Date(transaction.createdAt).toLocaleString()}</p>
                </div>
                <div class="col-md-6">
                  <p><strong>Venue:</strong> ${transaction.bookings[0].venue}</p>
                  <p><strong>Duration:</strong> ${transaction.bookings[0].duration === 'half' ? 'Half Day' : 'Full Day'}</p>
                  <p><strong>Price per Space:</strong> $${transaction.bookings[0].pricePerSpace}</p>
                </div>
              </div>
              <div class="mt-3">
                <h6>Parking Spaces:</h6>
                <ul class="list-group">
                  ${transaction.bookings.map(booking => `
                    <li class="list-group-item">
                      Space #${booking.spaceNumber} - ${booking.venue}
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          </div>
        </div>
      `);
    });
  }

  function getStatusBadge(status) {
    const badges = {
      confirmed: '<span class="badge bg-success">Confirmed</span>',
      cancelled: '<span class="badge bg-danger">Cancelled</span>',
      pending: '<span class="badge bg-warning">Pending</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">Unknown</span>';
  }

  // Filter handlers
  $('.filter-btn').click(function () {
    const status = $(this).data('status');
    $('.filter-btn').removeClass('active');
    $(this).addClass('active');

    let filtered = allTransactions;
    if (status !== 'all') {
      filtered = allTransactions.filter(t => t.status === status);
    }

    displayTransactions(filtered);
  });

  // Logout handler
  $(document).ready(function () {
    // Logout button functionality
    $('#logoutBtn').click(async function () {
      if (confirm('Are you sure you want to logout?')) {
        try {
          const response = await fetch('/api/logout', { method: 'GET' });
          const data = await response.json();

          if (data.success) {
            alert('Successfully logged out!');
            window.location.href = '/login.html';
          }
        } catch (error) {
          console.error('Logout error:', error);
          alert('Error occurred during logout');
        }
      }
    });
  });

  // Initial load
  loadTransactions();
}); 