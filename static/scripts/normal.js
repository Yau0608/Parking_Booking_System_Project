//Created by
//Ho Cheuk Wing 21106121d
//Wong Hiu Yau 21092461d


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