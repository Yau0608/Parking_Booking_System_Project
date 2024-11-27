$(document).ready(function () {
  // Regular login button click handler
  $('#login').click(function () {
    handleLogin();
  });

  // Admin login button click handler
  $('#admin_login').click(function () {
    window.location.href = '/admin-login.html';
  });

  function handleLogin() {
    const username = $('#username').val();
    const password = $('#password').val();

    // Basic validation
    if (!username || !password) {
      alert('Please fill in all fields');
      return;
    }

    $.ajax({
      url: 'api/login',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ username, password }),
      success: function (response) {
        if (response.success) {
          window.location.href = response.isAdmin ? '/admin.html' : '/normal.html';
        }
      },
      error: function (xhr) {
        const response = xhr.responseJSON;
        console.error('Login error:', xhr.status, response);
        alert(response?.message || 'Login failed. Please try again.');
      }
    });
  }
});