(function () {
    const sequence = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight"
    ];
    const destination = "https://www.youtube.com/watch?v=QDia3e12czc";
    let index = 0;

    function reset() {
        index = 0
    }

    function showToast() {
        const existing = document.getElementById("konami-toast");
        if (existing) {
            existing.remove();
        }

        const toast = document.createElement("div");
        toast.id = "konami-toast";
        toast.textContent = "🎉 Git Master trouvé ! Vidéo bonus en cours...";
        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.classList.add("show");
        });

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 350);
        }, 3500);
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === sequence[index]) {
            index += 1;
            if (index === sequence.length) {
                reset();
                showToast();
                window.open(destination, "_blank", "noopener");
            }
        } else {
            reset();
        }
    });
})();
