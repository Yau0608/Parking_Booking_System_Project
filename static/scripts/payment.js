$(document).ready(function() {
    $.ajax({
        url: '/api/payment',
        method: 'GET',
        success: function(response) {
            var park_num = response.parkNum;
            $("#park_num").text(park_num);
            if (park_num == "001" && "002" && "003" && "004" && "005" && "101" && "102" && "103" && "104" && "105" && "201" && "202" && "203" && "204" && "205") {
                $("#price").text("$50");
            } else {
                $("#price").text("$100");
            }
        },
        error: function() {
            $("#park_num").text("Error loading parking number");
        }
    });

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

    $("#confirm").click(function(){
        var park_num = $("#park_num").text();
        toggleParkingSpot(park_num);
        alert("Payment successfully processed.");
        window.location.href = '/normal.html';
    });
});

