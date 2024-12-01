//Created by
//Ho Cheuk Wing 21106121d
//Wong Hiu Yau 21092461d


$(document).ready(function () {
  let eventTable;
  let currentEvents = [];

  // Session check
  fetch('/api/admin/check-session')
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        window.location.href = '/admin_login.html';
        return;
      }
      loadEvents();
    })
    .catch(err => {
      console.error('Session error:', err);
      window.location.href = '/admin_login.html';
    });

  // Load events
  async function loadEvents() {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      if (data.success) {
        currentEvents = data.events;
        displayEvents(currentEvents);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }

  // Display events
  function displayEvents(events) {
    const eventsList = $('#eventsList');
    eventsList.empty();

    events.forEach(event => {
      const eventDate = new Date(event.dateTime);
      eventsList.append(`
        <div class="col-md-4 mb-4">
          <div class="card">
            <img src="/api/events/image/${event._id}?${new Date().getTime()}" 
                 class="card-img-top" 
                 alt="${event.title}"
                 style="height: 200px; object-fit: cover;"
                 onerror="this.src='/static/images/default-event.jpg'">
            <div class="card-body">
              <h5 class="card-title">${event.title}</h5>
              <p class="card-text">${event.description.substring(0, 100)}...</p>
              <p class="card-text">
                <small class="text-muted">
                  ${eventDate.toLocaleString()}<br>
                  Venue: ${event.venue}
                </small>
              </p>
              <div class="btn-group w-100">
                <button class="btn btn-primary edit-event" data-id="${event._id}">Edit</button>
                <button class="btn btn-danger delete-event" data-id="${event._id}">Delete</button>
              </div>
            </div>
          </div>
        </div>
      `);
    });
  }

  // Create/Edit event handler
  $('#createEventBtn').click(() => {
    $('#eventId').val('');
    $('#eventForm')[0].reset();
    $('#currentImage').empty();
    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
  });

  // Add this function after document.ready
  function validateImage(file) {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return false;
    }

    // Check file type
    if (!file.type.match(/image.*/)) {
      alert('Only image files are allowed');
      return false;
    }

    return true;
  }

  // Update the save event handler
  $('#saveEvent').click(async () => {
    const formData = new FormData();
    const eventId = $('#eventId').val();
    const coverImage = $('#coverImage')[0].files[0];

    if (coverImage && !validateImage(coverImage)) {
      return;
    }

    formData.append('title', $('#eventTitle').val());
    formData.append('venue', $('#eventVenue').val());
    formData.append('dateTime', $('#eventDateTime').val());
    formData.append('description', $('#eventDescription').val());

    if (coverImage) {
      formData.append('image', coverImage);
    }

    try {
      const url = eventId ? `/api/events/${eventId}` : '/api/events';
      const method = eventId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('eventModal'));
        modal.hide();
        await loadEvents(); // Reload events to show new images
      } else {
        alert('Error saving event: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event');
    }
  });

  // Add image preview functionality
  $('#coverImage').change(function () {
    const file = this.files[0];
    if (file && validateImage(file)) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $('#currentImage').html(`
          <img src="${e.target.result}" class="img-thumbnail" style="height: 100px">
        `);
      };
      reader.readAsDataURL(file);
    } else {
      this.value = '';
      $('#currentImage').empty();
    }
  });

  // Edit event
  $(document).on('click', '.edit-event', async function () {
    const eventId = $(this).data('id');
    try {
      const response = await fetch(`/api/events/${eventId}`);
      const data = await response.json();

      if (data.success) {
        const event = data.event;
        $('#eventId').val(event._id);
        $('#eventTitle').val(event.title);
        $('#eventVenue').val(event.venue);
        $('#eventDateTime').val(event.dateTime);
        $('#eventDescription').val(event.description);
        $('#currentImage').html(`
          <img src="/api/events/image/${event._id}?${new Date().getTime()}" 
               class="img-thumbnail" 
               style="height: 100px; object-fit: cover;"
               onerror="this.src='/static/images/default-event.jpg'">
        `);
        const modal = new bootstrap.Modal(document.getElementById('eventModal'));
        modal.show();
      }
    } catch (error) {
      console.error('Error loading event:', error);
    }
  });

  // Delete event
  $(document).on('click', '.delete-event', async function () {
    const eventId = $(this).data('id');
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`/api/events/${eventId}`, {
          method: 'DELETE'
        });
        const data = await response.json();

        if (data.success) {
          await loadEvents(); // Reload the events list
        } else {
          alert('Error deleting event: ' + (data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event');
      }
    }
  });

  // Filter events
  function filterEvents() {
    const title = $('#titleFilter').val().toLowerCase();
    const venue = $('#venueFilter').val().toLowerCase();
    const date = $('#dateFilter').val();

    const filtered = currentEvents.filter(event => {
      return (!title || event.title.toLowerCase().includes(title)) &&
        (!venue || event.venue.toLowerCase().includes(venue)) &&
        (!date || event.dateTime.startsWith(date));
    });

    displayEvents(filtered);
  }

  // Filter handlers
  $('#titleFilter, #venueFilter, #dateFilter').on('input', filterEvents);
  $('#clearFilters').click(() => {
    $('#titleFilter, #venueFilter, #dateFilter').val('');
    displayEvents(currentEvents);
  });

  // Logout handler
  $('#logoutBtn').click(async function () {
    if (confirm('Are you sure you want to logout?')) {
      try {
        const response = await fetch('/api/logout');
        const data = await response.json();
        if (data.success) {
          window.location.href = '/login.html';
        }
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  });
}); 