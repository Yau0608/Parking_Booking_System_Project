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

    async function updateSelectedSpotsUI() {
        let spotsList = selectedSpots.join(', ');
        let totalPrice = 0;

        selectedSpots.forEach(spot => {
            if (['001', '002', '003', '004', '005', '101', '102', '103', '104', '105', '201', '202', '203', '204', '205'].includes(spot)) {
                totalPrice += 50;
            } else {
                totalPrice += 100;
            }
        });

        $("#park_num").text(spotsList);
        $("#price").text(`$${totalPrice}`);
        
        if (selectedSpots.length > 0) {
            $("#book").addClass("d-none");
            $("#confirm_msg").removeClass("d-none");
        } else {
            $("#book").removeClass("d-none");
            $("#confirm_msg").addClass("d-none");
        }

        return totalPrice;
    }

    // Initial update
    await updateAllParkingSpots();

    // Periodically update (e.g., every 30 seconds)
    setInterval(updateAllParkingSpots, 300);

    // Add a variable to store selected spots
    let selectedSpots = [];

    // Modify the click event handler
    $(".parking-spot").click(async function (event) {
        var park_num = $(this).attr("id");
        
        try {
            const response = await fetch(`/api/parking-spot/${park_num}`);
            const spotData = await response.json();

            if (spotData.status === 'booked') {
                alert("This spot is already booked.");
            } else {
                // Toggle selection
                if (selectedSpots.includes(park_num)) {
                    selectedSpots = selectedSpots.filter(spot => spot !== park_num);
                    $(this).removeClass('selected');
                } else {
                    selectedSpots.push(park_num);
                    $(this).addClass('selected');
                }
                await updateSelectedSpotsUI();
                // Update UI to show selected spots and total price
            }
        } catch (error) {
            console.error(`Error fetching parking spot ${park_num}:`, error);
            alert("Error checking parking spot status. Please try again.");
        }
    });

    // Modify the confirm button click handler
    $("#confirm").click(async function () {
        try {
            let totalPrice = await updateSelectedSpotsUI();

            const response = await fetch('/api/select-spot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    parkNums: selectedSpots,
                    totalPrice: totalPrice
                })
            });

            if (!response.ok) {
                throw new Error('HTTP error: status ' + response.status);
            }

            const data = await response.json();
            if (data.success) {
                window.location.href = '/payment.html';
            } else {
                alert('Error selecting parking spots');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error communicating with server ' + error.message);
        }
    });

    $("#dismiss").click(async function () {
        selectedSpots.forEach(spot => {
            $(`#${spot}`).removeClass('selected');
        })
        selectedSpots = [];

        await updateSelectedSpotsUI();

        $("#confirm_msg").addClass("d-none");
        $("#book").removeClass("d-none");
    });
});
