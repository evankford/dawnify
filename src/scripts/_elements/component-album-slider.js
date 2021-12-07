class AlbumSlider extends HTMLElement {
  constructor() {
    super();
    this.el = this;

    this.paginationEl = null;
    this.prevEl = null;
    this.nextEl = null;

    this.slidesCount = this.el.querySelectorAll('.album-slide').length;
    this.pagination = this.getAttribute('data-pagination');
    if (this.pagination == "progressbar" || this.pagination == "bullets") {
      this.paginationEl = this.el.querySelector('[data-pagination]')
    }

    this.navigation = this.getAttribute('data-navigation') == 'true';
    if (this.navigation) {
      this.prevEl = this.el.querySelector('[data-prev]');
      this.nextEl = this.el.querySelector('[data-next]');
    }

    this.autoplay = this.getAttribute('data-autoplay');

    this.fullWidth = this.getAttribute('data-full-width') == 'true';
    if (typeof window.Slider == 'function' && window.slidersReady == true) {
      this.init();
    } else {
      window.addEventListener('slidersReady', this.init.bind(this));
      // this.init();
    }
  }
  getParams() {
    let params = {
      slidesPerView: 2,
      spaceBetween: 12,
      autoplay: false,
      effect: "slide",
      watchVisibility: true,
      lazy: true,
      preloadImages: false,
      centerInsufficientSlides: true,
      breakpoints: {
        420: {
          // slidesPerView: 2,
          spaceBetween: 20
        },
        1000: {
          // slidesPerView: 3,
          spaceBetween: 25,
        },
        1300: {
          spaceBetween: 32,
        },
      },
    };

    if (this.autoplay && this.autoplay != 0)  {
       params.autoplay = {
        delay: this.autoplay,
        disableOnInteraction: true,
        pauseOnMouseEnter: true
      }
    }
    if (this.navigation && this.prevEl && this.nextEl) {
       params.navigation = {
        prevEl: this.prevEl,
        nextEl: this.nextEl,
      };
    }
    if (this.pagination && this.pagination != 'disabled') {
      params.pagination = {
        type: this.pagination,
        el: this.paginationEl,
        dynamicBullets: true,
      }
    }
    if (this.fullWidth) {
      params.slidesPerView = 1;
      params.breakpoints = {};
    } else {
      params.breakpoints = {};
      params.slidesPerView = 1;
      if(this.slidesCount >=2) {
        params.breakpoints[350] = {
          slidesPerView:2,
        }
      }
      if (this.slidesCount >=3) {
         params.breakpoints[800] = {
          slidesPerView:3,
          spaceBetween:12,
        }
      }
      if (this.slidesCount >= 4) {
        params.breakpoints[1100] = {
          slidesPerView: 4,
          spaceBetween: 15
        }
      }
    }
    return params;
  }
  init () {
    this.params = this.getParams();
    this.slider = new window.Slider(this, this.params)
    console.log(this.slider)
  }
}
if (!customElements.get('album-slider')) {
customElements.define('album-slider',  AlbumSlider);
}