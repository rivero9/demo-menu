// drag categories
const slider = document.getElementById('draggable-menu');

const isMobile = () => {
    return /Mobi|Android/i.test(navigator.userAgent) || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
};

if (!isMobile()) {
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;

        setTimeout(() => {
            if (isDown) slider.classList.add('slider-active');
        }, 100);
        
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('slider-active');
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('slider-active');
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX); 
        slider.scrollLeft = scrollLeft - walk;
    });
}

// get badge
function isWeekdayBetweenHours () {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentHour = now.getHours();

  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 4;    
  const isWithinHours = currentHour >= 11 && (isWeekday ? currentHour < 22: currentHour < 24);

  return isWithinHours;
}

let badgeName = isWeekdayBetweenHours() ? 'ABIERTO AHORA' : 'CERRADO';
let badgeColor = isWeekdayBetweenHours() ? 'bg-green-500/90' : 'bg-red-500/90';

const badge = document.getElementById('badge-is-open');
badge.innerHTML = '<span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>' + badgeName;
badge.classList.add(badgeColor);

// dropdown categories
const dropdownCategories = document.querySelector('.dropdown-categories_content');
const btnDropdownCategories = document.getElementById('dropdown-categories_btn');

document.body.addEventListener('click', e => {
    if (e.target == btnDropdownCategories) {
        dropdownCategories.classList.toggle('open');
    }
    else if (dropdownCategories.className.includes('open')) {
        dropdownCategories.classList.remove('open');
    }
})