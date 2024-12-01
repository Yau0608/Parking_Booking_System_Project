$(document).ready(function () {
  let currentBookings = new Map(); // Store booking data for spaces

  // Initialize parking overview
  $('#adminVenueSelect').change(async function () {
    const selectedVenue = $(this).val();
    if (!selectedVenue) {
      $('#parkingSpaces').empty();
      return;
    }
    await loadParkingOverview(selectedVenue);
  });

  async function loadParkingOverview(venue) {
    try {
      // Destroy all existing tooltips before clearing the parking spaces
      $('[data-bs-toggle="tooltip"]').tooltip('dispose');

      console.log('Loading parking overview for venue:', venue);

      const [parkingResponse, bookingsResponse] = await Promise.all([
        fetch(`/api/parking-status/${venue}`),
        fetch('/api/bookings/current', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
      ]);

      if (!parkingResponse.ok || !bookingsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const parkingData = await parkingResponse.json();
      const bookingsData = await bookingsResponse.json();

      console.log('Parking data:', parkingData);
      console.log('Bookings data:', bookingsData);

      currentBookings.clear();
      if (bookingsData.success && bookingsData.bookings) {
        bookingsData.bookings.forEach(booking => {
          if (booking && booking.spaceNumber && booking.venue === venue) {
            console.log('Mapping booking for space:', booking.spaceNumber, booking);
            currentBookings.set(booking.spaceNumber, booking);
          }
        });
      }

      displayParkingOverview(parkingData.spaces);
    } catch (error) {
      console.error('Error loading parking overview:', error);
      $('#parkingSpaces').empty().append(
        '<div class="alert alert-danger">Failed to load parking spaces. Please refresh the page.</div>'
      );
    }
  }

  function getSpotClass(status) {
    switch (status) {
      case 'occupied': return 'occupied';
      case 'pending': return 'pending';
      case 'maintenance': return 'maintenance';
      default: return '';
    }
  }

  function getSpotTooltip(space, booking) {
    if (space.status === 'occupied' && booking) {
      return `Space ${space.spaceNumber} - ${booking.userId}`;
    }
    return `Space ${space.spaceNumber} - ${space.status.charAt(0).toUpperCase() + space.status.slice(1)}`;
  }

  function displayParkingOverview(spaces) {
    // Destroy existing tooltips before clearing the grid
    $('[data-bs-toggle="tooltip"]').tooltip('dispose');

    const parkingGrid = $('#parkingSpaces');
    parkingGrid.empty();

    spaces.forEach(space => {
      const booking = currentBookings.get(space.spaceNumber);
      const spotClass = getSpotClass(space.status);
      const spotDiv = $(`
        <div class="parking-spot ${spotClass}" 
             data-space="${space.spaceNumber}"
             data-bs-toggle="tooltip"
             data-bs-placement="top"
             title="${getSpotTooltip(space, booking)}">
            ${space.spaceNumber}
        </div>
      `);

      if (booking) {
        spotDiv.click(() => showBookingDetails(booking));
      }

      parkingGrid.append(spotDiv);
    });

    // Initialize tooltips with minimal configuration
    $('[data-bs-toggle="tooltip"]').tooltip({
      container: 'body',
      trigger: 'hover'
    });
  }

  function showBookingDetails(booking) {
    console.log('Booking details:', booking);
    const formattedDate = new Date(booking.date).toLocaleDateString();
    const formattedDuration = booking.duration === 'half' ? 'Half Day' : 'Full Day';

    const modalContent = `
      <div class="modal fade" id="bookingDetailsModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Booking Details</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p><strong>Space Number:</strong> ${booking.spaceNumber}</p>
              <p><strong>User ID:</strong> ${booking.userId}</p>
              <p><strong>Duration:</strong> ${formattedDuration}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Status:</strong> ${booking.status}</p>
              <p><strong>Price:</strong> $${booking.price}</p>
              <p><strong>Venue:</strong> ${booking.venue}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    $('#bookingDetailsModal').remove();
    // Add new modal to body
    $('body').append(modalContent);
    // Show the modal
    new bootstrap.Modal('#bookingDetailsModal').show();
  }

  // Logout functionality
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

  // Admin control button handlers
  $('#viewUsers').click(function () {
    window.location.href = '/admin_users.html';
  });

  $('#manageEvents').click(function () {
    window.location.href = '/admin_events.html';
  });

  // Initial load of first venue
  if ($('#adminVenueSelect').val()) {
    $('#adminVenueSelect').trigger('change');
  }
}); 