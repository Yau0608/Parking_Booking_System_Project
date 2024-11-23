$(document).ready(function () {
    let selectedTable = null;
    
    if (!localStorage.getItem('bookedTable')) {
        localStorage.setItem('bookedTable', JSON.stringify([]));
    }
    
    updateTableAppearance();

    $(".table").click(function() {
        const tableId = $(this).attr('id');
        if (isTableBooked(tableId)) {
            alert("This table is already booked.");
            return;
        }
        selectedTable = tableId;
        $(".selected-table p").text(`Do you want to book Table ${tableId}?`);
        $(".btn-container").removeClass("d-none");
    });

    $(".btn-primary").click(function() {
        if (selectedTable) {
            bookTable(selectedTable);
            $(".selected-table p").text("Table booked successfully!");
            $(".btn-container").addClass("d-none");
            updateTableAppearance();
        }
    });

    $(".btn-secondary").click(function() {
        dismissBooking();
    });

    function updateTableAppearance() {
        const bookedTables = getBookedTables();
        $(".table").each(function() {
            const tableId = $(this).attr('id');
            $(this).toggleClass('booked', bookedTables.includes(tableId));
        });
    }

    function isTableBooked(tableId) {
        const bookedTables = getBookedTables();
        return bookedTables.includes(tableId);
    }

    function bookTable(tableId) {
        let bookedTables = getBookedTables();
        bookedTables.push(tableId);
        localStorage.setItem('bookedTable', JSON.stringify(bookedTables));
    }

    function getBookedTables() {
        const bookedInformation = localStorage.getItem('bookedTable');
        return bookedInformation ? JSON.parse(bookedInformation) : [];
    }

    function dismissBooking() {
        selectedTable = null;
        $(".selected-table p").text("Click a Table to book");
        $(".btn-container").addClass("d-none");
    }
});
