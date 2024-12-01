//Created by
//Ho Cheuk Wing 21106121d
//Wong Hiu Yau 21092461d


$(document).ready(function () {
  let allEvents = [];
  let searchTimeout;

  // Load events on page load
  loadEvents();

  // Event listeners for filters
  $('#eventSearch').on('input', filterEvents);
  $('#venueFilter').on('change', filterEvents);
  $('#dateFilter').on('change', filterEvents);
  $('#clearFilters').click(clearFilters);
  $('#eventSearch').on('input', function () {
    clearTimeout(searchTimeout);
    const searchTerm = $(this).val();

    // Add console log to debug
    console.log('Searching for:', searchTerm);

    if (searchTerm.length < 2) {
      $('#searchSuggestions').hide();
      return;
    }

    searchTimeout = setTimeout(() => {
      // Filter from existing events
      const suggestions = allEvents
        .filter(event => {
          const matchTitle = event.title.toLowerCase().includes(searchTerm.toLowerCase());
          const matchVenue = event.venue.toLowerCase().includes(searchTerm.toLowerCase());
          return matchTitle || matchVenue;
        })
        .slice(0, 5); // Show top 5 matches

      // Add console log to debug
      console.log('Found suggestions:', suggestions);

      // Display suggestions
      if (suggestions.length > 0) {
        const suggestionHtml = suggestions
          .map(suggestion => `
            <div class="suggestion-item p-2" onclick="selectSuggestion('${suggestion.title}')">
              <i class="bi bi-search me-2"></i>
              <span class="suggestion-title">${suggestion.title}</span>
              <small class="text-muted ms-2">${suggestion.venue}</small>
            </div>
          `)
          .join('');

        $('#searchSuggestions')
          .html(suggestionHtml)
          .show();
      } else {
        $('#searchSuggestions').hide();
      }
    }, 300);
  });

  // Add click handler for suggestions
  window.selectSuggestion = function (title) {
    $('#eventSearch').val(title);
    $('#searchSuggestions').hide();
    filterEvents();
  };

  // Hide suggestions when clicking outside
  $(document).on('click', function (event) {
    if (!$(event.target).closest('.event-filters').length) {
      $('#searchSuggestions').hide();
    }
  });

  // Load events from API
  async function loadEvents() {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();

      if (data.success) {
        allEvents = data.events;
        updateVenueFilter(allEvents);
        displayEvents(allEvents);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      $('#eventList').html(
        '<div class="col-12"><div class="alert alert-danger">Error loading events</div></div>'
      );
    }
  }

  // Display events in cards
  function displayEvents(events) {
    const eventList = $('#eventList');
    eventList.empty();

    if (events.length === 0) {
      eventList.html(
        '<div class="col-12"><div class="alert alert-info">No events found</div></div>'
      );
      return;
    }

    events.forEach(event => {
      const eventDate = new Date(event.dateTime);
      const card = `
                <div class="col-md-4">
                    <div class="card h-100">
                        <img src="/api/events/image/${event._id}?${new Date().getTime()}" 
                             class="card-img-top" 
                             alt="${event.title}"
                             style="height: 200px; object-fit: cover;"
                             onerror="this.src='/static/images/default-event.jpg'">
                        <div class="card-body">
                            <h5 class="card-title">${event.title}</h5>
                            <p class="card-text">${event.description}</p>
                            <div class="mt-auto">
                                <p class="mb-1">
                                    <i class="bi bi-geo-alt"></i> ${event.venue}
                                </p>
                                <p class="mb-1">
                                    <i class="bi bi-calendar"></i> ${eventDate.toLocaleDateString()}
                                </p>
                                <p class="mb-0">
                                    <i class="bi bi-clock"></i> ${eventDate.toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
      eventList.append(card);
    });
  }

  // Update venue filter options
  function updateVenueFilter(events) {
    const venues = [...new Set(events.map(event => event.venue))];
    const venueFilter = $('#venueFilter');
    venues.forEach(venue => {
      venueFilter.append(`<option value="${venue}">${venue}</option>`);
    });
  }

  // Filter events based on search input and filters
  function filterEvents() {
    const searchTerm = $('#eventSearch').val().toLowerCase();
    const selectedVenue = $('#venueFilter').val();
    const selectedDate = $('#dateFilter').val();

    const filtered = allEvents.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm);
      const matchesVenue = !selectedVenue || event.venue === selectedVenue;
      const matchesDate = !selectedDate || event.dateTime.startsWith(selectedDate);

      return matchesSearch && matchesVenue && matchesDate;
    });

    displayEvents(filtered);
  }

  // Clear all filters
  function clearFilters() {
    $('#eventSearch').val('');
    $('#venueFilter').val('');
    $('#dateFilter').val('');
    displayEvents(allEvents);
  }
});