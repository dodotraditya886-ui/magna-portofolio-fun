document.addEventListener("DOMContentLoaded", () => {
    // =========================================================
    // 1. SMOOTH SCROLL FOR NAVIGATION LINKS & BACK TO TOP BUTTON
    // =========================================================
    const scrollLinks = document.querySelectorAll('a[href^="#"]');

    scrollLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href");

            if (targetId === "#") {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });
                return;
            }

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                });
            }
        });
    });

    // =========================================================
    // 2. CURSOR FLOATING IMAGE PREVIEW EFFECT (SECTION 02)
    // =========================================================
    const jutsuItems = document.querySelectorAll(".jutsu-item");
    const previewContainer = document.getElementById("cursor-preview");
    const previewImg = document.getElementById("cursor-preview-img");

    if (jutsuItems.length > 0 && previewContainer && previewImg) {
        jutsuItems.forEach((item) => {
            item.addEventListener("mouseenter", (e) => {
                const imageSrc = item.getAttribute("data-image");
                if (imageSrc) {
                    previewImg.src = imageSrc;
                    gsap.to(previewContainer, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.3,
                        ease: "power2.out",
                    });
                }
            });

            item.addEventListener("mousemove", (e) => {
                gsap.to(previewContainer, {
                    x: e.clientX + 20,
                    y: e.clientY - 160,
                    duration: 0.2,
                    ease: "power1.out",
                });
            });

            item.addEventListener("mouseleave", () => {
                gsap.to(previewContainer, {
                    opacity: 0,
                    scale: 0.75,
                    duration: 0.3,
                    ease: "power2.in",
                });
            });
        });
    }

    // =========================================================
    // 3. FOOTER MAGNA SWING SCROLL REVEAL (INTERSECTION OBSERVER)
    //    Animasi dijalankan 1x saat footer pertama kali terlihat.
    //    Urutan & delay (MAGNA -> SWING -> copyright) diatur di style.css.
    // =========================================================
    const footerContainer = document.getElementById("footer-reveal-container");
    const footerItems = document.querySelectorAll(
        ".footer-reveal-word, .footer-reveal-copyright"
    );

    if (footerContainer && footerItems.length > 0 && "IntersectionObserver" in window) {
        // State awal (.reveal-ready) sudah dipasang di <head> index.html

        const footerObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    footerItems.forEach((el) => el.classList.add("is-visible"));
                    observer.unobserve(entry.target); // hanya 1 kali
                });
            },
            { root: null, rootMargin: "0px 0px -40px 0px", threshold: 0.15 }
        );

        footerObserver.observe(footerContainer);
    }

    // =========================================================
    // 4. GALERI ARSIP - SEAMLESS INFINITE AUTO SCROLL
    //    - HTML sudah berisi 2 set card identik (loop dasar tanpa JS).
    //    - Script menambah salinan set bila layar lebih lebar dari 1 set
    //      (mencegah area kosong di monitor lebar) dan menghitung durasi
    //      agar kecepatan selalu konsisten (px per detik).
    // =========================================================
    const galleryViewport = document.querySelector(".gallery-viewport");
    const galleryTrack = document.querySelector(".gallery-track");

    if (galleryViewport && galleryTrack) {
        const SPEED = 80; // px per detik, searah kanan -> kiri
        const baseCards = Array.from(galleryTrack.children);
        const setSize = Math.floor(baseCards.length / 2); // jumlah card per set
        let currentSets = 2;

        // Set kedua (duplikat) disembunyikan dari screen reader
        baseCards.slice(setSize).forEach((c) => c.setAttribute("aria-hidden", "true"));

        const buildGallery = () => {
            const firstSet = baseCards.slice(0, setSize);
            const lastCard = firstSet[firstSet.length - 1];
            const gap = parseFloat(getComputedStyle(lastCard).marginRight) || 0;
            const setWidth = lastCard.offsetLeft + lastCard.offsetWidth + gap;
            if (!setWidth) return;

            // Jarak geser (setengah track) harus >= lebar viewport agar tak ada celah
            const pairs = Math.max(1, Math.ceil(galleryViewport.clientWidth / setWidth));
            const wantedSets = pairs * 2;

            if (wantedSets !== currentSets) {
                galleryTrack.querySelectorAll("[data-clone]").forEach((n) => n.remove());
                for (let i = 0; i < wantedSets - 2; i++) {
                    firstSet.forEach((card) => {
                        const clone = card.cloneNode(true);
                        clone.setAttribute("data-clone", "");
                        clone.setAttribute("aria-hidden", "true");
                        galleryTrack.appendChild(clone);
                    });
                }
                currentSets = wantedSets;
            }

            const shiftDistance = setWidth * pairs;
            galleryTrack.style.setProperty(
                "--gallery-duration",
                (shiftDistance / SPEED).toFixed(2) + "s"
            );
        };

        buildGallery();

        // Tailwind CDN menerapkan style secara asinkron & font/gambar bisa mengubah
        // layout -> ukur ulang setelah semuanya siap dan saat ukuran card berubah.
        window.addEventListener("load", buildGallery);
        if ("ResizeObserver" in window) {
            const ro = new ResizeObserver(() => buildGallery());
            ro.observe(baseCards[0]);
            ro.observe(galleryViewport);
        }

        let resizeTimer;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(buildGallery, 150);
        });
    }
});
