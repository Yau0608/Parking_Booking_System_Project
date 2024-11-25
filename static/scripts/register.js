$(document).ready(function () {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;

  // Real-time password confirmation validation
  $('#confirmPassword').on('input', function () {
    const password = $('#password').val();
    const confirmPassword = $(this).val();
    const isValid = password === confirmPassword;

    $(this).removeClass('is-valid is-invalid').addClass(isValid ? 'is-valid' : 'is-invalid');
    if (!isValid) {
      $(this).next('.invalid-feedback').remove();
      $(this).after('<div class="invalid-feedback">Passwords do not match</div>');
    }
  });

  // Update password field to also check confirmation when changed
  $('#password').on('input', function () {
    const isValid = passwordRegex.test($(this).val());
    $(this).removeClass('is-valid is-invalid').addClass(isValid ? 'is-valid' : 'is-invalid');
    if (!isValid) {
      $(this).next('.invalid-feedback').remove();
      $(this).after('<div class="invalid-feedback">Password must be at least 8 characters long and contain uppercase, lowercase, and numbers</div>');
    }

    // Recheck confirm password field
    const confirmPassword = $('#confirmPassword');
    if (confirmPassword.val()) {
      const confirmIsValid = $(this).val() === confirmPassword.val();
      confirmPassword.removeClass('is-valid is-invalid').addClass(confirmIsValid ? 'is-valid' : 'is-invalid');
    }
  });

  $('#email').on('input', function () {
    const isValid = emailRegex.test($(this).val());
    $(this).removeClass('is-valid is-invalid').addClass(isValid ? 'is-valid' : 'is-invalid');
  });

  $('#username').on('input', function () {
    const isValid = usernameRegex.test($(this).val());
    $(this).removeClass('is-valid is-invalid').addClass(isValid ? 'is-valid' : 'is-invalid');
    if (!isValid) {
      $(this).next('.invalid-feedback').remove();
      $(this).after('<div class="invalid-feedback">Username must be 4-20 characters long and contain only letters, numbers, and underscores</div>');
    }
  });

  $('#registerForm').on('submit', async function (e) {
    e.preventDefault();

    const password = $('#password').val();
    const confirmPassword = $('#confirmPassword').val();

    // Check if passwords match
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const formData = {
      username: $('#username').val().trim(),
      password: password,
      nickname: $('#nickname').val().trim(),
      email: $('#email').val().trim(),
      gender: $('#gender').val(),
      birthdate: $('#birthdate').val()
    };

    // Client-side validation (keep existing validation)
    if (!usernameRegex.test(formData.username)) {
      alert('Invalid username format');
      return;
    }
    if (!passwordRegex.test(formData.password)) {
      alert('Invalid password format');
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registration successful!');
        window.location.href = '/login.html';
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred during registration');
    }
  });

  // Add back to login button functionality
  $('#backToLogin').on('click', function () {
    window.location.href = '/login.html';
  });
});