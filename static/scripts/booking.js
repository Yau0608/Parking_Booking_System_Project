$(document).ready(function () {
  let selectedSpaces = new Set();
  const pricePerSpace = {
    'half': 25,
    'full': 40
  };

  // Handle venue selection change
  $('#venueSelect').change(async function () {
    const selectedVenue = $(this).val();
    if (!selectedVenue) {
      $('.parking-grid').empty();
      $('.selected-spaces-info').addClass('d-none');
      selectedSpaces.clear();
      updateSelectedSpacesDisplay();
      return;
    }

    try {
      const response = await fetch(`/api/parking-status/${selectedVenue}`);
      const data = await response.json();

      if (data.success) {
        displayParkingSpots(data.spaces, selectedVenue);
      }
    } catch (error) {
      console.error('Error fetching parking status:', error);
      alert('Error loading parking spaces');
    }
  });

  // Function to display parking spots
  function displayParkingSpots(spaces, venue) {
    const parkingGrid = $('.parking-grid');
    parkingGrid.empty();

    const startNumber = venue.toLowerCase().includes('ground') ? 1 : 31;

    for (let i = 0; i < 30; i++) {
      const spaceNumber = startNumber + i;
      const space = spaces.find(s => s.spaceNumber === spaceNumber);
      const isOccupied = space && space.status === 'occupied';
      const isSelected = selectedSpaces.has(spaceNumber);

      const spotDiv = $(`<div class="parking-spot ${isOccupied ? 'occupied' : ''} ${isSelected ? 'selected' : ''}" 
                            data-space="${spaceNumber}">
                            ${spaceNumber}
                       </div>`);

      if (!isOccupied) {
        spotDiv.click(function () {
          const spaceNum = $(this).data('space');
          toggleSpaceSelection(spaceNum, venue);
          $(this).toggleClass('selected');
        });
      }

      parkingGrid.append(spotDiv);
    }
  }

  // Function to toggle space selection
  function toggleSpaceSelection(spaceNumber, venue) {
    if (selectedSpaces.has(spaceNumber)) {
      selectedSpaces.delete(spaceNumber);
    } else {
      selectedSpaces.add(spaceNumber);
    }

    updateSelectedSpacesDisplay();

    // Show/hide booking form based on selection
    if (selectedSpaces.size > 0) {
      $('.booking-form, .selected-spaces-info').removeClass('d-none');
    } else {
      $('.booking-form, .selected-spaces-info').addClass('d-none');
    }
  }

  // Function to update selected spaces display
  function updateSelectedSpacesDisplay() {
    const spacesList = $('#selectedSpacesList');
    spacesList.empty();

    selectedSpaces.forEach(space => {
      const tag = $(`<div class="selected-space-tag">
                      Space ${space}
                      <span class="remove-space" data-space="${space}">×</span>
                    </div>`);
      spacesList.append(tag);
    });

    $('#totalSelectedSpaces').text(selectedSpaces.size);
    updateTotalPrice();
  }

  // Function to update total price
  function updateTotalPrice() {
    const duration = $('select[name="duration"]').val();
    const pricePerSpot = pricePerSpace[duration];
    const totalPrice = selectedSpaces.size * pricePerSpot;
    $('#totalPrice').text(totalPrice.toFixed(2));
  }

  // Handle duration change
  $('select[name="duration"]').change(function () {
    updateTotalPrice();
  });

  // Handle removing individual spaces
  $(document).on('click', '.remove-space', function (e) {
    e.stopPropagation();
    const spaceNum = $(this).data('space');
    selectedSpaces.delete(spaceNum);
    $(`.parking-spot[data-space="${spaceNum}"]`).removeClass('selected');
    updateSelectedSpacesDisplay();

    if (selectedSpaces.size === 0) {
      $('.booking-form, .selected-spaces-info').addClass('d-none');
    }
  });

  // Handle booking form submission
  $('#bookingForm').submit(async function (e) {
    e.preventDefault();
    const venue = $('#venueSelect').val();
    const duration = $(this).find('select[name="duration"]').val();
    const date = $(this).find('input[type="date"]').val();

    if (!venue || !duration || !date || selectedSpaces.size === 0) {
      alert('Please fill in all required fields and select at least one parking space');
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          spaceNumbers: Array.from(selectedSpaces),
          venue: venue,
          duration: duration,
          date: date,
          price: selectedSpaces.size * pricePerSpace[duration]
        })
      });

      const result = await response.json();
      if (result.success) {
        window.location.href = `/payment.html?bookingId=${result.bookingId}`;
      } else {
        throw new Error(result.message || 'Booking failed');
      }
    } catch (error) {
      alert('Booking failed: ' + error.message);
      // Refresh the parking status
      $('#venueSelect').trigger('change');
    }
  });

  // Existing logout button functionality
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
});