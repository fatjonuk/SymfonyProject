/* Shared site behaviour: header background on scroll, mobile menu. */
(function () {
    var header = document.querySelector('[data-site-header]');
    if (header) {
        var update = function () {
            header.classList.toggle('is-solid', window.scrollY > 24);
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
    }

    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = toggle && toggle.closest('.site-nav');
    if (toggle && nav) {
        var setOpen = function (open) {
            nav.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        };
        toggle.addEventListener('click', function () {
            setOpen(!nav.classList.contains('is-open'));
        });
        nav.addEventListener('click', function (event) {
            if (event.target.closest('a')) setOpen(false);
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') setOpen(false);
        });
    }
})();
