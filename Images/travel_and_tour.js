document.addEventListener('DOMContentLoaded', function() {
    Array.from(document.getElementsByTagName('input')).forEach((input, index) => {
        input.addEventListener('keyup', (event) => {
            if (event.target.value.length > 0) {
                document.querySelectorAll('.bi-caret-down-fill')[index].style.transform = "rotate(180deg)";
            } else {
                document.querySelectorAll('.bi-caret-down-fill')[index].style.transform = "rotate(0deg)";
            }
        });
    });
});
