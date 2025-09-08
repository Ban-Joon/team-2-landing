// --- 썸네일 이미지 교체 스크립트 ---
const subThumbnails = document.querySelectorAll('.sub-thumbnail');
const mainThumbnail = document.getElementById('main-thumbnail');
subThumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', function () {
        mainThumbnail.src = this.src;
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // --- 예약 날짜 및 시간 관련 스크립트 ---
    const dateInput = document.getElementById('reservation-date');
    const timeSelect = document.getElementById('reservation-time');
    const warningEl = document.getElementById('date-warning');

    for (let h = 7; h <= 18; h++) {
        for (let m = 0; m < 60; m += 30) {
            if (h === 18 && m > 0) continue;
            const timeString = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            const option = new Option(timeString, timeString);
            timeSelect.add(option);
        }
    }

    dateInput.addEventListener('change', () => {
        const selectedDate = new Date(dateInput.value);
        const userTimezoneOffset = selectedDate.getTimezoneOffset() * 60000;
        const localDate = new Date(selectedDate.getTime() + userTimezoneOffset);

        if (localDate.getDay() === 0) { // 0: Sunday
            dateInput.value = '';
            warningEl.classList.remove('hidden');
            setTimeout(() => warningEl.classList.add('hidden'), 3000);
        } else {
            warningEl.classList.add('hidden');
        }
    });

    // --- 높이 및 간격 조절 스크립트 ---
    const alignHeights = () => {
        const imageCol = document.getElementById('image-column');
        const detailsBox = document.getElementById('details-box');
        const reservationBox = document.getElementById('reservation-box');
        const mapBox = document.getElementById('map-box');
        const spacer1 = document.getElementById('spacer1');
        const spacer2 = document.getElementById('spacer2');

        if (!imageCol || !detailsBox || !reservationBox || !mapBox || !spacer1 || !spacer2) return;

        requestAnimationFrame(() => {
            // Reset dynamic styles to get base heights
            spacer1.style.height = '0px';
            spacer2.style.height = '0px';
            [detailsBox, reservationBox, mapBox].forEach(el => {
                el.style.paddingTop = '';
                el.style.paddingBottom = '';
            });

            const imageColHeight = imageCol.offsetHeight;
            const baseContentHeight = detailsBox.offsetHeight + reservationBox.offsetHeight + mapBox.offsetHeight;
            const totalAvailableSpace = imageColHeight - baseContentHeight;

            if (totalAvailableSpace > 8) {
                const totalGapSpace = totalAvailableSpace / 4;
                const totalPaddingSpace = totalAvailableSpace * 3 / 4;

                const individualGapHeight = totalGapSpace / 2;
                const extraPaddingPerBox = totalPaddingSpace / 3;
                const extraPaddingPerSide = extraPaddingPerBox / 2;

                spacer1.style.height = `${individualGapHeight}px`;
                spacer2.style.height = `${individualGapHeight}px`;

                [detailsBox, reservationBox, mapBox].forEach(el => {
                    const basePadding = parseFloat(getComputedStyle(el).paddingTop);
                    el.style.paddingTop = `${basePadding + extraPaddingPerSide}px`;
                    el.style.paddingBottom = `${basePadding + extraPaddingPerSide}px`;
                });
            } else {
                const defaultGap = 4;
                spacer1.style.height = `${defaultGap}px`;
                spacer2.style.height = `${defaultGap}px`;
            }
        });
    };

    // --- 캐러셀 기능 스크립트 ---
    const carousel = document.getElementById('carousel-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (!carousel || !prevBtn || !nextBtn) return;

    const originalItems = Array.from(carousel.children);
    const itemCount = originalItems.length;
    if (itemCount === 0) return;

    const itemsToClone = Math.min(itemCount, 4);

    for (let i = 0; i < itemsToClone; i++) {
        carousel.appendChild(originalItems[i].cloneNode(true));
    }
    for (let i = itemCount - 1; i >= itemCount - itemsToClone; i--) {
        carousel.prepend(originalItems[i].cloneNode(true));
    }

    const itemWidth = () => carousel.querySelector('a').offsetWidth + 24;

    const setInitialPosition = () => {
        carousel.style.scrollBehavior = 'auto';
        carousel.scrollLeft = itemWidth() * itemsToClone;
        carousel.style.scrollBehavior = 'smooth';
    };

    const positionCarouselButtons = () => {
        const firstImageContainer = carousel.querySelector('.placeholder');
        if (firstImageContainer) {
            const topPosition = firstImageContainer.offsetHeight / 2;
            prevBtn.style.top = `${topPosition}px`;
            nextBtn.style.top = `${topPosition}px`;
        }
    };

    const handleResizeAndLoad = () => {
        alignHeights();
        positionCarouselButtons();
        setInitialPosition();
    }

    window.addEventListener('load', handleResizeAndLoad);
    window.addEventListener('resize', handleResizeAndLoad);

    let scrollEndTimer;
    carousel.addEventListener('scroll', () => {
        clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(() => {
            const width = itemWidth();
            const currentIndex = Math.round(carousel.scrollLeft / width);

            if (currentIndex >= (itemCount + itemsToClone)) {
                carousel.style.scrollBehavior = 'auto';
                carousel.scrollLeft = width * itemsToClone;
                carousel.style.scrollBehavior = 'smooth';
            }

            if (currentIndex < itemsToClone) {
                carousel.style.scrollBehavior = 'auto';
                carousel.scrollLeft = width * (itemCount + itemsToClone - 1);
                carousel.style.scrollBehavior = 'smooth';
            }
        }, 150);
    });

    nextBtn.addEventListener('click', () => carousel.scrollBy({ left: itemWidth(), behavior: 'smooth' }));
    prevBtn.addEventListener('click', () => carousel.scrollBy({ left: -itemWidth(), behavior: 'smooth' }));

    let isDown = false, startX, scrollLeft;

    const startSwipe = (e) => {
        isDown = true;
        carousel.classList.add('cursor-grabbing');
        startX = (e.pageX || e.touches[0].pageX) - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    };

    const endSwipe = () => {
        isDown = false;
        carousel.classList.remove('cursor-grabbing');
    };

    const moveSwipe = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = (e.pageX || e.touches[0].pageX) - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    };

    carousel.addEventListener('mousedown', startSwipe);
    carousel.addEventListener('mouseleave', endSwipe);
    carousel.addEventListener('mouseup', endSwipe);
    carousel.addEventListener('mousemove', moveSwipe);
    carousel.addEventListener('touchstart', startSwipe, { passive: true });
    carousel.addEventListener('touchend', endSwipe);
    carousel.addEventListener('touchmove', moveSwipe, { passive: true });
});
