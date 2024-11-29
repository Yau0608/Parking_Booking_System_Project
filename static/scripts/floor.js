$(document).ready(async function () {
    $("#backBtn").click(function () {
        window.location.href = '/booking.html';
    });

    async function updateParkingSpot(spotNumber) {
        try {
            const response = await fetch(`/api/parking-spot/${spotNumber}`);
            const spotData = await response.json();
            const $parkingSpot = $(`#${spotNumber}`);
            if (spotData && spotData.status === 'booked') {
                $parkingSpot.removeClass('available').addClass('booked');
            } else {
                $parkingSpot.removeClass('booked').addClass('available');
            }
        } catch (error) {
            console.error(`Error fetching parking spot ${spotNumber}:`, error);
        }
    }

    async function updateAllParkingSpots() {
        const spots = $(".parking-spot");
        for (let spot of spots) {
            await updateParkingSpot($(spot).attr("id"));
        }
    }

    // Initial update
    await updateAllParkingSpots();

    // Periodically update (e.g., every 30 seconds)
    setInterval(updateAllParkingSpots, 300);

    $(".parking-spot").click(async function (event) {
        var park_num = $(this).attr("id");
        $("#show_price").removeClass("d-none");
        if (park_num == "001" || park_num == "002" || park_num == "003" || park_num == "004" || park_num == "005" || park_num == "101" || park_num == "102" || park_num == "103" || park_num == "104" || park_num == "105" || park_num == "201" || park_num == "202" || park_num == "203" || park_num == "204" || park_num == "205") {
            $("#price").text("$50");
        } else {
            $("#price").text("$100");
        }

        try {
            const response = await fetch(`/api/parking-spot/${park_num}`);
            const spotData = await response.json();

            if (spotData.status === 'booked') {
                alert("This spot is already booked.");
                $("#show_price").addClass("d-none");
            } else {
                $("#book").addClass("d-none");
                $("#confirm_msg").removeClass("d-none");
                $("#park_num").text(park_num);
            }
        } catch (error) {
            console.error(`Error fetching parking spot ${park_num}:`, error);
            alert("Error checking parking spot status. Please try again.");
        }
    });

    $("#confirm").click(async function () {
        var park_num = $("#park_num").text();
        try {
            const response = await fetch('/api/select-spot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ parkNum: park_num })
            });
            const data = await response.json();
            if (data.success) {
                window.location.href = '/payment.html';
            } else {
                alert('Error selecting parking spot');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error communicating with server');
        }
    });

    $("#dismiss").click(function () {
        $("#confirm_msg").addClass("d-none");
        $("#book").removeClass("d-none");
    });
});
