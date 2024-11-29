$(document).ready (function (){
function updateParkingSpot(spotNumber) {
    $.ajax({
        url: `/api/parking-spot/${spotNumber}`,
        method: 'GET',
        success: function(spotData) {
            const $parkingSpot = $(`#${spotNumber}`);
            if (spotData && spotData.status === 'booked') {
                $parkingSpot.removeClass('available').addClass('booked');
            } else {
                $parkingSpot.removeClass('booked').addClass('available');
            }
        },
        error: function(err) {
            console.error(`Error fetching parking spot ${spotNumber}:`, err);
        }
    });
}

function updateAllParkingSpots() {
    $(".parking-spot").each(function() {
        updateParkingSpot($(this).attr("id"));
    })
}

// Initial update
updateAllParkingSpots();

// Periodically update (e.g., every 30 seconds)
setInterval(updateAllParkingSpots, 300);

$(".parking-spot").click(function(event){
    var park_num = $(this).attr("id");
    if (park_num == "001" || "002" || "003" || "004" || "005" || "101" || "102" || "103" || "104" || "105" || "201" || "202" || "203" || "204" || "205") {
        $("#price").text("$50");
    } else {
        $("#price").text("$100");
    }

    // First, check the current status of the spot
    $.ajax({
        url: `/api/parking-spot/${park_num}`,
        method: 'GET',
        success: function(spotData) {
            if (spotData.status === 'booked') {
                alert("This spot is already booked.");
            } else {
                $("#book").addClass("d-none");
                $("#confirm_msg").removeClass("d-none");
                $("#park_num").text(park_num);
                req.session.parkNum = park_num;
            }
        },
        error: function(err) {
            console.error(`Error fetching parking spot ${park_num}:`, err);
            alert("Error checking parking spot status. Please try again.");
        }
    });
});


$("#confirm").click(function(){
    var park_num = $("#park_num").text();
    $.ajax({
        url: '/api/select-spot',
        method: 'POST',
        data: { parkNum: park_num },
        success: function(response) {
            if (response.success) {
                window.location.href = '/payment.html';
            } else {
                alert('Error selecting parking spot');
            }
        },
        error: function() {
            alert('Error communicating with server');
        }
    });
});


$("#dismiss").click(function(){
    $("#confirm_msg").addClass("d-none");
    $("#book").removeClass("d-none");
});

function toggleParkingSpot(park_num) {
    $.ajax({
        url: `/api/toggle-spot/${park_num}`,
        method: 'POST',
        success: function(response) {
            if (response.success) {
                updateParkingSpot(park_num);
                if (response.status === 'booked') {
                    $("#book").addClass("d-none");
                    $("#confirm_msg").removeClass("d-none");
                    $("#park_num").text(park_num);
                } else {
                    $("#confirm_msg").addClass("d-none");
                    $("#book").removeClass("d-none");
                }
            } else {
                alert("Failed to update parking spot status: " + (response.error || "Unknown error"));
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error updating parking spot:', textStatus, errorThrown);
            alert("An error occurred while updating the parking spot: " + textStatus + " - " + errorThrown);
        }
    });
}
});
