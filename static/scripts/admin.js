$(document).ready(function () {
  // Logout button functionality
  $('#logoutBtn').click(async function () {
    if (confirm('Are you sure you want to logout?')) {
      try {
        const response = await fetch('/api/logout', {
          method: 'GET'
        });

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

  // Admin control buttons
  $('#viewBookings').click(function () {
    // TODO: Implement view bookings functionality
    alert('View bookings functionality coming soon');
  });

  $('#manageSpaces').click(function () {
    // TODO: Implement manage spaces functionality
    alert('Manage spaces functionality coming soon');
  });

  $('#viewUsers').click(function () {
    window.location.href = '/admin_users.html';
  });

  $('#generateReport').click(function () {
    // TODO: Implement report generation functionality
    alert('Report generation functionality coming soon');
  });

  // Update the manageEvents button handler
  $('#manageEvents').click(function () {
    window.location.href = '/admin_events.html';
  });

  // Time display functionality
  function updateTime() {
    const current_date = new Date();
    const currentDateTime = current_date.toLocaleString();
    document.getElementById('time').innerHTML = currentDateTime;
  }

  // Initial time update
  updateTime();
  // Update time every second
  setInterval(updateTime, 1000);

  // TODO: Add function to load and display parking space data
  // TODO: Add function to update quick stats
}); 