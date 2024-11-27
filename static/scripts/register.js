$(document).ready(function () {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;

  // Real-time validation feedback
  $('#password').on('input', function () {
    const isValid = passwordRegex.test($(this).val());
    $(this).removeClass('is-valid is-invalid').addClass(isValid ? 'is-valid' : 'is-invalid');
    if (!isValid) {
      $(this).next('.invalid-feedback').remove();
      $(this).after('<div class="invalid-feedback">Password must be at least 8 characters long and contain uppercase, lowercase, and numbers</div>');
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

  $('#registerForm').on('submit', function (e) {
    e.preventDefault();

    const formData = {
      username: $('#username').val().trim(),
      password: $('#password').val(),
      nickname: $('#nickname').val().trim(),
      email: $('#email').val().trim(),
      gender: $('#gender').val(),
      birthdate: $('#birthdate').val()
    };

    // Client-side validation
    if (!usernameRegex.test(formData.username)) {
      alert('Invalid username format');
      return;
    }

    if (!passwordRegex.test(formData.password)) {
      alert('Invalid password format');
      return;
    }

    if (!emailRegex.test(formData.email)) {
      alert('Invalid email format');
      return;
    }

    if (!formData.gender) {
      alert('Please select a gender');
      return;
    }

    if (!formData.birthdate) {
      alert('Please enter your birthdate');
      return;
    }

    $.ajax({
      url: '/api/register',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(formData),
      success: function (response) {
        alert('Registration successful!');
        window.location.href = '/login.html';
      },
      error: function (xhr) {
        const error = xhr.responseJSON?.error || 'Registration failed';
        alert(error);
      }
    });
  });
  $('#backToLogin').click(function () {
    window.location.href = '/login.html';
  });
});