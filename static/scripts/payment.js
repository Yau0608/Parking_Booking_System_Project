$(document).ready(async function () {
    $("#backBtn").click(function () {
        //const park_num = $("#park_num").text();
        let floor = '';
        var selected_num = data.parkNums;

        if (selected_num[0].startsWith('0')) {
            floor = 'floorG';
        } else if (selected_num[0].startsWith('1')) {
            floor = 'floor1';
        } else if (selected_num[0].startsWith('2')) {
            floor = 'floor2';
        }

        window.location.href = `/${floor}.html`;
    });

    try {
        const response = await fetch('/api/payment');
        const data = await response.json();
        var selected_num = data.parkNums;
        var total_price = data.totalPrice;
        let park_num = selected_num.join(', ');
        $("#park_num").text(park_num);
        $("#total_price").text(total_price);
       
    } catch (error) {
        console.error('Error:', error);
        $("#park_num").text("Error loading parking number");
    }

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

    async function toggleParkingSpot(park_num) {
        try {
            const response = await fetch(`/api/toggle-spot/${park_num}`, {
                method: 'POST'
            });
            const data = await response.json();

            if (data.success) {
                await updateParkingSpot(park_num);
                if (data.status === 'booked') {
                    $("#book").addClass("d-none");
                    $("#confirm_msg").removeClass("d-none");
                    $("#park_num").text(park_num);
                } else {
                    $("#confirm_msg").addClass("d-none");
                    $("#book").removeClass("d-none");
                }
            } else {
                alert("Failed to update parking spot status: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error('Error updating parking spot:', error);
            alert("An error occurred while updating the parking spot: " + error.message);
        }
    }

    $("#confirm").click(async function () {
        var park_num = $("#park_num").text();
        await toggleParkingSpot(park_num);
        alert("Payment successfully processed.");
        window.location.href = '/normal.html';
    });
});

