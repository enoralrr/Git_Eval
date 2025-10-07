(function () {
    const obfuscationOffset = 7;
    const encodedSequence = [
        [72, 121, 121, 118, 126, 92, 119],
        [72, 121, 121, 118, 126, 75, 118, 126, 117],
        [72, 121, 121, 118, 126, 83, 108, 109, 123],
        [72, 121, 121, 118, 126, 89, 112, 110, 111, 123]
    ];
    const sequence = encodedSequence.map((codes) =>
        String.fromCharCode(...codes.map((code) => code - obfuscationOffset))
    );
    const destination = "https://www.youtube.com/watch?v=QDia3e12czc&autoplay=1";
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
