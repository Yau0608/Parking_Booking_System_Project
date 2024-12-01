//Created by
//Ho Cheuk Wing 21106121d
//Wong Hiu Yau 21092461d


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

  // Add this after your document.ready function
  function readURL(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();

      reader.onload = function (e) {
        $('#profilePreview').attr('src', e.target.result);
      }

      reader.readAsDataURL(input.files[0]);
    }
  }

  $('#profileImage').change(function () {
    const file = this.files[0];
    if (file) {
      // Check file size
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        this.value = '';
        return;
      }

      // Check file type
      if (!file.type.match(/image.*/)) {
        alert('Only image files are allowed');
        this.value = '';
        return;
      }

      readURL(this);
    }
  });

  // Modify your form submission to include the image
  $('#registerForm').on('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('username', $('#username').val().trim());
    formData.append('password', $('#password').val());
    formData.append('nickname', $('#nickname').val().trim());
    formData.append('email', $('#email').val().trim());
    formData.append('gender', $('#gender').val());
    formData.append('birthdate', $('#birthdate').val());

    // Append the profile image if one was selected
    const profileImage = $('#profileImage')[0].files[0];
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        body: formData // Note: Don't set Content-Type header when sending FormData
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