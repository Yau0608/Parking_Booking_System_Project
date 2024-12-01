//Created by
//Ho Cheuk Wing 21106121d
//Wong Hiu Yau 21092461d


$(document).ready(function () {
  // Check for remembered username when page loads
  const rememberedUsername = getCookie('remembered_username');
  if (rememberedUsername) {
    $('#username').val(rememberedUsername);
    $('#rememberMe').prop('checked', true);
  }

  // Form submission handler
  $('#loginForm').submit(async function (e) {
    e.preventDefault();

    const username = $('#username').val().trim();
    const password = $('#password').val();

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
        if ($('#rememberMe').is(':checked')) {
          setCookie('remembered_username', username, 30);
        } else {
          deleteCookie('remembered_username');
        }

        window.location.href = '/normal.html';
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    }
  });

  // Cookie utility functions
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }

  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
  }

  // Admin login button click handler
  $('#admin_login').click(function () {
    window.location.href = '/admin_login.html';
  });

  // Register button click handler
  $('#register').click(function () {
    window.location.href = '/register.html';
  });
}); 