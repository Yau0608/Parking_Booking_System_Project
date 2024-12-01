//Created by
//Ho Cheuk Wing 21106121d
//Wong Hiu Yau 21092461d


$(document).ready(async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get('bookingId');
  let bookingDetails = null;

  if (!bookingId) {
    alert('Invalid booking');
    window.location.href = '/normal.html';
    return;
  }

  // Format card number input
  $('#cardNumber').on('input', function () {
    let value = $(this).val().replace(/\D/g, '');
    if (value.length > 16) value = value.substr(0, 16);
    $(this).val(value);
  });

  // Format expiry date input
  $('#expiryDate').on('input', function () {
    let value = $(this).val().replace(/\D/g, '');
    if (value.length > 4) value = value.substr(0, 4);
    if (value.length > 2) {
      value = value.substr(0, 2) + '/' + value.substr(2);
    }
    $(this).val(value);
  });

  // Load booking details
  try {
    const response = await fetch(`/api/bookings/${bookingId}`);
    const data = await response.json();

    if (data.success) {
      bookingDetails = data.booking;
      displayBookingDetails(data.booking);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error loading booking:', error);
    alert('Error loading booking details');
    window.location.href = '/normal.html';
  }

  function displayBookingDetails(booking) {
    // Check if this is a primary booking with related bookings
    if (booking.primaryBookingId) {
      // This is a secondary booking, we should redirect to the primary booking
      window.location.href = `/payment.html?bookingId=${booking.primaryBookingId}`;
      return;
    }

    // Get all related bookings
    fetch(`/api/bookings/${booking._id}/related`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const allBookings = data.bookings;
          const spaceNumbers = allBookings.map(b => b.spaceNumber).join(', ');

          $('#spaceNumber').text(spaceNumbers);
          $('#duration').text(booking.duration === 'half' ? 'Half Day (4 hours)' : 'Full Day (8 hours)');
          $('#bookingDate').text(new Date(booking.date).toLocaleDateString());
          $('#amount').text(`$${booking.price.toFixed(2)}`);
        }
      })
      .catch(error => {
        console.error('Error loading related bookings:', error);
      });
  }

  function generateTicket(booking, transactionId) {
    return fetch(`/api/bookings/${booking._id}/related`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const allBookings = data.bookings;
          const spaceNumbers = allBookings.map(b => b.spaceNumber).join(', ');
          const date = new Date(booking.date).toLocaleDateString();

          return `
            <div class="e-ticket">
              <h4 class="text-center mb-4">Parking Ticket</h4>
              <div class="row">
                <div class="col-6">
                  <p><strong>Booking ID:</strong><br>${booking._id}</p>
                  <p><strong>Transaction ID:</strong><br>${transactionId}</p>
                  <p><strong>Space Numbers:</strong><br>${spaceNumbers}</p>
                </div>
                <div class="col-6">
                  <p><strong>Duration:</strong><br>${booking.duration === 'half' ? 'Half Day (4 hours)' : 'Full Day (8 hours)'}</p>
                  <p><strong>Date:</strong><br>${date}</p>
                  <p><strong>Amount Paid:</strong><br>$${booking.price.toFixed(2)}</p>
                </div>
              </div>
              <div class="qr-code">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking._id}" alt="QR Code">
              </div>
              <p class="text-center mt-3"><small>Please show this ticket when entering the parking area</small></p>
            </div>
          `;
        }
      });
  }

  // Back button handler
  $('#backButton').click(async function () {
    try {
      // Cancel the booking when going back
      const cancelResponse = await fetch('/api/cancel-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId: bookingId
        })
      });

      const data = await cancelResponse.json();
      if (data.success) {
        window.history.back();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error cancelling booking: ' + error.message);
      window.location.href = '/normal.html';
    }
  });

  // Cancel payment button handler
  $('#cancelPayment').click(async function () {
    if (confirm('Are you sure you want to cancel this payment?')) {
      try {
        const cancelResponse = await fetch('/api/cancel-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            bookingId: bookingId
          })
        });

        const data = await cancelResponse.json();

        if (data.success) {
          if (data.eventId) {
            window.location.href = `/booking.html?eventId=${data.eventId}`;
          } else {
            window.location.href = '/normal.html';
          }
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error cancelling payment: ' + error.message);
        window.location.href = '/normal.html';
      }
    }
  });

  // Return to home button handler
  $('#returnToHome').click(function () {
    window.location.href = '/normal.html';
  });

  // Update the payment success handler
  async function handlePaymentSuccess(data) {
    const ticketHtml = await generateTicket(bookingDetails, data.transactionId);
    $('#ticketContent').html(ticketHtml);
    $('#ticketContainer').show();
    $('#paymentFormCard').hide();

    // Show success message
    const successAlert = `
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        Payment successful! Your e-ticket has been generated.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
    $('#ticketContainer').before(successAlert);
  }

  // Update the payment form submission
  $('#paymentForm').submit(async function (e) {
    e.preventDefault();

    try {
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId: bookingId,
          amount: bookingDetails.price,
          cardNumber: $('#cardNumber').val(),
          expiryDate: $('#expiryDate').val(),
          cvv: $('#cvv').val()
        })
      });

      const data = await response.json();

      if (data.success) {
        await handlePaymentSuccess(data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorAlert = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          Error processing payment: ${error.message}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      `;
      $('#paymentForm').before(errorAlert);
    }
  });
}); 