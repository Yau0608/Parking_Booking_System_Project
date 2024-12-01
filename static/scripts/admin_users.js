$(document).ready(function () {
  let userTable;

  // Session check
  fetch('/api/admin/check-session')
    .then(res => res.json())
    .then(data => {
      console.log('Session check:', data);
      if (!data.success) {
        window.location.href = '/admin_login.html';
        return;
      }
      initializeUserTable();
    })
    .catch(err => {
      console.error('Session error:', err);
      window.location.href = '/admin_login.html';
    });

  // Logout button handler
  $('#logoutBtn').click(handleLogout);

  async function initializeUserTable() {
    userTable = $('#userTable').DataTable({
      ajax: {
        url: '/api/admin/users',
        dataSrc: function (json) {
          if (!json.success) {
            console.error('Server returned error:', json.message);
            if (json.message === 'Admin authentication required') {
              window.location.href = '/admin_login.html';
            }
            return [];
          }
          return json.data || [];
        },
        error: function (xhr, error, thrown) {
          console.error('DataTable error:', error, thrown);
          if (xhr.status === 401) {
            window.location.href = '/admin_login.html';
          } else {
            alert('Error loading user data. Please try again.');
          }
        }
      },
      columns: [
        { data: 'username' },
        { data: 'nickname' },
        { data: 'email' },
        {
          data: 'createdAt',
          render: function (data) {
            return new Date(data).toLocaleDateString();
          }
        },
        {
          data: 'status',
          render: function (data) {
            return `<span class="badge ${data === 'active' ? 'bg-success' : 'bg-danger'}">${data}</span>`;
          }
        },
        {
          data: null,
          render: function (data) {
            const suspendBtn = `<button class="btn btn-sm ${data.status === 'active' ? 'btn-warning' : 'btn-success'} me-1 action-btn" 
                            data-action="${data.status === 'active' ? 'suspend' : 'activate'}" data-username="${data.username}">
                            ${data.status === 'active' ? 'Suspend' : 'Activate'}</button>`;

            const resetPwdBtn = `<button class="btn btn-sm btn-info me-1 action-btn" 
                            data-action="resetPassword" data-username="${data.username}">Reset Password</button>`;

            const viewBtn = `<button class="btn btn-sm btn-primary action-btn" 
                            data-action="viewDetails" data-username="${data.username}">View Details</button>`;

            return suspendBtn + resetPwdBtn + viewBtn;
          }
        }
      ],
      order: [[3, 'desc']], // Sort by registration date by default
      responsive: true,
      processing: true,
      serverSide: false,
      language: {
        loadingRecords: 'Loading...'
      }
    });

    // Handle action buttons
    $('#userTable').on('click', '.action-btn', handleUserAction);
  }

  async function handleUserAction(e) {
    const button = $(e.currentTarget);
    const action = button.data('action');
    const username = button.data('username');

    try {
      switch (action) {
        case 'suspend':
        case 'activate': {
          if (confirm(`Are you sure you want to ${action} this user?`)) {
            const response = await fetch(`/api/admin/users/${username}/status`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                status: action === 'suspend' ? 'suspended' : 'active'
              })
            });

            const data = await response.json();
            if (data.success) {
              alert(`User ${action}d successfully`);
              userTable.ajax.reload();
            } else {
              throw new Error(data.message);
            }
          }
          break;
        }

        case 'resetPassword': {
          if (confirm('Are you sure you want to reset this user\'s password?')) {
            const response = await fetch(`/api/admin/users/${username}/reset-password`, {
              method: 'POST'
            });

            const data = await response.json();
            if (data.success) {
              alert(`Password has been reset to: ${data.temporaryPassword}`);
            } else {
              throw new Error(data.message);
            }
          }
          break;
        }

        case 'viewDetails': {
          const response = await fetch(`/api/admin/users/${username}/details`);
          const data = await response.json();
          if (data.success) {
            showUserDetailsModal(data.user);
          } else {
            throw new Error(data.message);
          }
          break;
        }
      }
    } catch (error) {
      console.error('Action error:', error);
      alert('Error: ' + error.message);
    }
  }

  function showUserDetailsModal(user) {
    // Remove existing modal if any
    $('.user-details-modal').remove();

    const modal = `
      <div class="modal user-details-modal" tabindex="-1">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">User Details: ${user.username}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-4 text-center mb-3">
                  <img src="/api/profile-image/${user.username}" 
                    class="rounded-circle" 
                    style="width: 150px; height: 150px; object-fit: cover;"
                    onerror="this.src='/images/default-profile.png'">
                </div>
                <div class="col-md-8">
                  <table class="table">
                    <tr>
                      <th>Nickname:</th>
                      <td>${user.nickname}</td>
                    </tr>
                    <tr>
                      <th>Email:</th>
                      <td>${user.email}</td>
                    </tr>
                    <tr>
                      <th>Gender:</th>
                      <td>${user.gender}</td>
                    </tr>
                    <tr>
                      <th>Birthdate:</th>
                      <td>${new Date(user.birthdate).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <th>Registration Date:</th>
                      <td>${new Date(user.createdAt).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <th>Status:</th>
                      <td><span class="badge ${user.status === 'active' ? 'bg-success' : 'bg-danger'}">${user.status}</span></td>
                    </tr>
                  </table>
                </div>
              </div>
              
              <div class="mt-4">
                <h5>Transaction History</h5>
                <div class="btn-group mb-3" role="group">
                  <button type="button" class="btn btn-outline-primary filter-btn active" data-status="all">All</button>
                  <button type="button" class="btn btn-outline-success filter-btn" data-status="confirmed">Confirmed</button>
                  <button type="button" class="btn btn-outline-danger filter-btn" data-status="cancelled">Cancelled</button>
                </div>
                <div id="userTransactions" class="accordion">
                  Loading transactions...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    const $modal = $(modal);
    $('body').append($modal);
    $modal.modal('show');

    // Load user transactions
    loadUserTransactions(user.username);

    // Handle transaction filters
    $modal.find('.filter-btn').click(function () {
      const status = $(this).data('status');
      $modal.find('.filter-btn').removeClass('active');
      $(this).addClass('active');
      filterTransactions(status);
    });
  }

  let currentTransactions = [];

  async function loadUserTransactions(username) {
    try {
      const response = await fetch(`/api/admin/users/${username}/transactions`);
      const data = await response.json();

      if (data.success) {
        currentTransactions = data.transactions;
        displayTransactions(currentTransactions);
      } else {
        throw new Error(data.message || 'Failed to load transactions');
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      $('#userTransactions').html(
        `<div class="alert alert-danger">Error loading transactions: ${error.message}</div>`
      );
    }
  }

  function displayTransactions(transactions) {
    const transactionsList = $('#userTransactions');
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

  function filterTransactions(status) {
    let filtered = currentTransactions;
    if (status !== 'all') {
      filtered = currentTransactions.filter(t => t.status === status);
    }
    displayTransactions(filtered);
  }

  function getStatusBadge(status) {
    const badges = {
      confirmed: '<span class="badge bg-success">Confirmed</span>',
      cancelled: '<span class="badge bg-danger">Cancelled</span>',
      pending: '<span class="badge bg-warning">Pending</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">Unknown</span>';
  }

  async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      try {
        const response = await fetch('/api/logout');
        const data = await response.json();
        if (data.success) {
          window.location.href = '/login.html';
        }
      } catch (error) {
        console.error('Logout error:', error);
        alert('Error occurred during logout');
      }
    }
  }
});