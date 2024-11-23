$(document).ready(function () {
    $.get("assets/drink-menu.json", function (data) {
        console.log(data);
        displayDrinks(data);
    })
        .fail(function (error) {
            console.error(error);
            $(".message")
            .removeClass("d-none")
            .addClass("alert alert-danger")
            .html("Failed to fetch drink menu. Please try again later.");
        });
});

function displayDrinks(drinks) {
    const container = $('.row');
    container.empty();
    container.addClass('mt-4');

    drinks.forEach(drink => {
        const drinkHtml = `
        <div class="col mb-4">
            <div class="card h-100">
                <div class="card-img-top position-relative" style="padding-top: 75%;">
                    <img src="${drink.image}" class="position-absolute top-0 start-0 w-100 h-100" alt="${drink.name}" style="object-fit: cover;">
                </div>
                <div class="card-body d-flex flex-column text-start">
                    <h5 class="card-title">${drink.name}</h5>
                    <span class="badge bg-success mb-2 align-self-start">${drink.type}</span>
                    <p class="card-text mt-auto">${drink.price}</p>
                </div>
            </div>
        </div>
        `;
        container.append(drinkHtml);
    });
}
