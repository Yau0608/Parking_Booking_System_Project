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
                <div class="modal-dialog modal-lg">
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
                            <div class="mt-3">
                                <h6>Future Features:</h6>
                                <ul class="nav nav-tabs" role="tablist">
                                    <li class="nav-item">
                                        <a class="nav-link active" data-bs-toggle="tab" href="#bookings">Bookings</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" data-bs-toggle="tab" href="#payments">Payments</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" data-bs-toggle="tab" href="#activity">Activity</a>
                                    </li>
                                </ul>
                                <div class="tab-content p-3">
                                    <div id="bookings" class="tab-pane active">
                                        <p class="text-muted">Booking history will be available soon...</p>
                                    </div>
                                    <div id="payments" class="tab-pane fade">
                                        <p class="text-muted">Payment history will be available soon...</p>
                                    </div>
                                    <div id="activity" class="tab-pane fade">
                                        <p class="text-muted">User activity will be available soon...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

    $(modal).modal('show');
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