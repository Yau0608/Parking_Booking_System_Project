$(document).ready(function () {
  // Display username from session
  const displayUsername = () => {
    $.get('/api/user/current', function (response) {
      if (response.username) {
        $('#username').text(response.username);
      }
    });
  };

  // Handle logout
  $('#logoutBtn').click(function () {
    $.get('/api/logout', function (response) {
      if (response.success) {
        window.location.href = '/login.html';
      }
    }).fail(function (xhr) {
      alert('Logout failed. Please try again.');
    });
  });

  // Initial load
  displayUsername();
}); 