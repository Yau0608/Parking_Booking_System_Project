$(document).ready(function () {
  async function loadEvents() {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      console.log('Fetched events data:', data); // Debug log

      if (data.success) {
        displayEvents(data.events);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      $('#eventList').html('<div class="alert alert-danger">Error loading events</div>');
    }
  }

  function displayEvents(events) {
    const eventList = $('#eventList');
    eventList.empty();

    if (events.length === 0) {
      eventList.html('<div class="col-12"><div class="alert alert-info">No upcoming events available</div></div>');
      return;
    }

    events.forEach(event => {
      console.log('Event spots:', event.title, event.availableSpots); // Debug log
      const availability = event.availableSpots > 0
        ? `<span class="badge bg-success">${event.availableSpots} spots left</span>`
        : '<span class="badge bg-danger">Fully Booked</span>';

      eventList.append(`
        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">${event.title} ${availability}</h5>
              <p class="card-text">
                <strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}<br>
                <strong>Time:</strong> ${event.timeSlot}<br>
                <strong>Venue:</strong> ${event.venue}<br>
                <strong>Price:</strong> $${event.price}
              </p>
              <p class="card-text"><small class="text-muted">${event.description}</small></p>
              ${event.availableSpots > 0 ?
          `<button class="btn btn-primary book-event" data-event-id="${event._id}">Book Now</button>` :
          '<button class="btn btn-secondary" disabled>Sold Out</button>'
        }
            </div>
          </div>
        </div>
      `);
    });
  }

  // Add this inside your $(document).ready function
  $(document).on('click', '.book-event', function () {
    const eventId = $(this).data('event-id');
    window.location.href = `/booking.html?eventId=${eventId}`;
  });

  // Initial load
  loadEvents();

  // Refresh every 10 seconds instead of 5 minutes
  setInterval(loadEvents, 10000);
});