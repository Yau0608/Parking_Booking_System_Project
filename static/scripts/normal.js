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

  // Update time display
  function updateTime() {
    const current_date = new Date();
    const currentDateTime = current_date.toLocaleString();
    document.getElementById('time').innerHTML = currentDateTime;
  }

  // Initial time update
  updateTime();
  // Update time every second
  setInterval(updateTime, 1000);
}); 