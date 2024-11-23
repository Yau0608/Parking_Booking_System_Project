function calculatePrice() {
    const tea = { small: 30, medium: 35, large: 40 };
    const latte = { small: 31, medium: 36, large: 41 };
    const juice = { small: 32, medium: 37, large: 42 };

    let drinkItem = document.getElementById('drink');
    let selectedSize = getValueSize();

    if (!selectedSize) {
        document.getElementById("price").innerHTML = 0;
        return;
    }

    if (drinkItem.value == 'bubble-milktea') {
        document.getElementById("price").innerHTML = tea[selectedSize];
    } else if (drinkItem.value == 'iced-latte') {
        document.getElementById("price").innerHTML = latte[selectedSize];
    } else if (drinkItem.value == 'pineapple-juice') {
        document.getElementById("price").innerHTML = juice[selectedSize];
    }
}

function placeOrder(event) {
    event = event || {};
    event.preventDefault?.();

    if (validateForm()) {
        $(".message")
            .removeClass("d-none")
            .addClass("alert alert-success")
            .html("Order placed successfully! Thank you for your order.")
            .fadeIn(500)
            .delay(3000)
            .fadeOut(500, function() {
                $(this).remove();
                resetForm();
            });
        localStorage.setItem('orders', initializeOrderData());
    }
}

function resetForm() {
    document.getElementById("order-form").reset();
    document.getElementById("price").innerHTML = 0;
    $("#name").removeClass("error error-free");
    $("#drink").removeClass("error error-free");
    $(".img-container").addClass("d-none");
}


function validateForm() {
    let name = document.getElementById('name').value;
    let drink = document.getElementById('drink').value;
    let size = getValueSize();
    let ice = getValueIce();
    let sweetness = getValueSweetness();
    if (name.trim() == "") {
        alert("Please enter your name");
        return false;
    }
    else if (drink == "Please Select") {
        alert("Please select a drink");
        document.getElementById("price").innerHTML = 0;
        radioButtons = document.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.checked = false;
        });
        return false;
    }
    else if (size == null) {
        alert("Please select a size");
        return false;
    }
    else if (ice == null) {
        alert("Please select a ice");
        return false;
    }
    else if (sweetness == null) {
        alert("Please select a sweetness");
        return false;
    }
    else {
        return true;
    }
}


function clearAll() {
    document.getElementById("price").innerHTML = 0;
}

function getValueSize() {

    let radioSize1 = document.getElementById('small');
    let radioSize2 = document.getElementById('medium');
    let radioSize3 = document.getElementById('large');
    if (radioSize1.checked) {
        return radioSize1.value;
    }
    if (radioSize2.checked) {
        return radioSize2.value;
    }
    if (radioSize3.checked) {
        return radioSize3.value;
    }

}

function getValueIce() {
    let radioIce1 = document.getElementById('normal');
    let radioIce2 = document.getElementById('less');
    let radioIce3 = document.getElementById('without-ice');
    if (radioIce1.checked) {
        return radioIce1.value;
    }
    if (radioIce2.checked) {
        return radioIce2.value;
    }
    if (radioIce3.checked) {
        return radioIce3.value;
    }
}

function getValueSweetness() {
    let radioSweetness1 = document.getElementById('100%');
    let radioSweetness2 = document.getElementById('50%');
    let radioSweetness3 = document.getElementById('0%');
    if (radioSweetness1.checked) {
        return radioSweetness1.value;
    }
    if (radioSweetness2.checked) {
        return radioSweetness2.value;
    }
    if (radioSweetness3.checked) {
        return radioSweetness3.value;
    }
}


function initializeOrderData() {
    const orderData = [];
    orderData[0] = document.getElementById('name')?.value || '';
    orderData[1] = document.getElementById('drink')?.value || '';
    orderData[2] = getValueSize() || '';
    orderData[3] = getValueIce() || '';
    orderData[4] = getValueSweetness() || '';
    return orderData;
}


$(document).ready(function () {
    $("#debug").click(function () {
        console.log($(".message").attr("class"));
        console.log($(".img-container").attr("class"));
    });
});




$(document).ready(function () {
    $("#name").blur(function () {
        validateName();
    });
    $("#drink").on("change", function() {
        let drinkValue = $(this).val();
        $(this).removeClass("error-free error")
               .addClass(drinkValue === "Please Select" ? "error" : "error-free");
        
        changeDrinkImg();
    });

    function validateName() {
        let name = $("#name").val();
        if (name.trim() == "") {
            $("#name").removeClass("error-free")
                .addClass("error")
            console.log($("#name").attr("class"));
        } else {
            $("#name").removeClass("error")
                .addClass("error-free")
            console.log($("#name").attr("class"));
        }
    }
    function changeDrinkImg() {
        let drink = $("#drink").val();
        if (drink == "bubble-milktea") {    
            $("#drink-img").attr("src", "assets/bubble-milktea.png");
            $(".img-container").removeClass("d-none");
            console.log("bubble-milktea");
            console.log($(".img-container").attr("src"));
            console.log($(".img-container").attr("class"));
        } else if (drink == "iced-latte") {
            $("#drink-img").attr("src", "assets/iced-latte.jpg");
            $(".img-container").removeClass("d-none");
            console.log("iced-latte");
            console.log($(".img-container").attr("src"));
            console.log($(".img-container").attr("class"));
        } else if (drink == "pineapple-juice") {
            $("#drink-img").attr("src", "assets/pineapple-juice.jpg");
            $(".img-container").removeClass("d-none");
            console.log("pineapple-juice");
            console.log($(".img-container").attr("src"));
            console.log($(".img-container").attr("class"));
        } else {
            $(".img-container").addClass("d-none");
        }
    }
});




