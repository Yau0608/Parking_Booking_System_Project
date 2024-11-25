$(document).ready(function () {
  // Form submission handler
  $('#loginForm').submit(async function (e) {
    e.preventDefault(); // Prevent default form submission

    const username = $('#username').val().trim();
    const password = $('#password').val();

    if (!username || !password) {
      alert('Please enter both username and password');
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
        window.location.href = '/normal.html';
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    }
  });

  // Admin login button click handler
  $('#admin_login').click(function () {
    window.location.href = '/admin_login.html';
  });

  // Register button click handler
  $('#register').click(function () {
    window.location.href = '/register.html';
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