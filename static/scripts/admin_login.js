$(document).ready(function () {
  // Admin login form submission handler
  $('#adminLoginForm').submit(async function (e) {
    e.preventDefault();

    const username = $('#username').val().trim();
    const password = $('#password').val();

    if (!username || !password) {
      alert('Please enter both username and password');
      return;
    }

    if (username !== 'admin') {
      alert('Invalid admin credentials');
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = '/admin.html';
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    }
  });

  // Back to login button handler
  $('#back_to_login').click(function () {
    window.location.href = '/login.html';
  });

  // Time display functionality
  function updateTime() {
    const current_date = new Date();
    const currentDateTime = current_date.toLocaleString();
    document.getElementById('time').innerHTML = currentDateTime;
  }

  updateTime();
  setInterval(updateTime, 1000);
}); 