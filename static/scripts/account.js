$(document).ready(function () {
  // Add this at the top of document.ready
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Load user profile data
  loadUserProfile();

  // Profile image change handler
  $('#profileImage').change(function () {
    const file = this.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        this.value = '';
        return;
      }

      if (!file.type.match(/image.*/)) {
        alert('Only image files are allowed');
        this.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        $('#profilePreview').attr('src', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  // Profile update form handler
  $('#profileForm').submit(async function (e) {
    e.preventDefault();

    const email = $('#email').val();
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    const formData = new FormData();
    formData.append('nickname', $('#nickname').val());
    formData.append('email', email);
    formData.append('gender', $('#gender').val());
    formData.append('birthdate', $('#birthdate').val());

    const profileImage = $('#profileImage')[0].files[0];
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        alert('Profile updated successfully!');
        loadUserProfile(); // Reload profile data
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('An error occurred while updating profile');
    }
  });

  // Password change form handler
  $('#passwordForm').submit(async function (e) {
    e.preventDefault();

    const currentPassword = $('#currentPassword').val();
    const newPassword = $('#newPassword').val();
    const confirmPassword = $('#confirmPassword').val();

    if (!passwordRegex.test(newPassword)) {
      alert('New password must be at least 8 characters long and contain uppercase, lowercase, and numbers');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Password changed successfully!');
        $('#passwordForm')[0].reset();
      } else {
        alert(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      alert('An error occurred while changing password');
    }
  });

  // Logout functionality
  $('#logoutBtn').click(async function () {
    if (confirm('Are you sure you want to logout?')) {
      try {
        const response = await fetch('/api/logout', {
          method: 'GET'
        });

        const data = await response.json();
        if (data.success) {
          window.location.href = '/login.html';
        }
      } catch (error) {
        console.error('Logout error:', error);
        alert('Error occurred during logout');
      }
    }
  });

  // Function to load user profile data
  async function loadUserProfile() {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();

      if (data.success) {
        $('#username').val(data.user.username);
        $('#nickname').val(data.user.nickname);
        $('#email').val(data.user.email);
        $('#gender').val(data.user.gender);
        $('#birthdate').val(data.user.birthdate.split('T')[0]);

        // Load profile image
        $('#profilePreview').attr('src', `/api/profile-image/${data.user.username}?${new Date().getTime()}`);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Failed to load profile data');
    }
  }
}); 