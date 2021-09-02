import Swiper, { Lazy, Thumbs, A11y, Navigation, Pagination } from 'swiper';

Swiper.use([Lazy, Thumbs, A11y, Navigation, Pagination]);
//Returns the element
class Slider {
  constructor(el, options = {}, thumbEl = false, ) {
    this.el = el;
    this.options = options;
    this.thumbEl = thumbEl;
    this.params = this.setupParams(options);
    this.swiper = this.createSwiper();
    this.swiper.update();
    this.setupWatchers();
  }

  setupParams() {
    const defaultOptions = {
      thumbs: false,
      navigation: false,
      pagination: false,
      lazy: true,
      a11y: true,
      preloadImages: false,
      slidesPerView: 1,
      autoHeight: false,
    }
    let toReturn = Object.assign( defaultOptions, this.options);

    if (this.thumbEl) {
      this.thumbSwiper = new Swiper(thumbEl, {
        centeredSlides: true,
        slidesPerView: auto,
        centerInsufficientSlides: true,
      })
      toReturn.thumbs = {
        swiper: this.thumbSwiper,
      }
    }

    // if (this.options.pagination) {
    //   let pagObj = {
    //     type: 'bullets',
    //     el: this.el.querySelector('[data-pagination]'),
    //     dynamicBullets: true,
    //   }
    //   if (this.options.pagination == "progress") {
    //     pagObj.type = "progressbar"
    //   }
    //   toReturn.pagination = pagObj
    // }

    // if (this.options.navigation) {
    //   toReturn.navigation = {
    //     prevEl: this.el.querySelector('[data-prev]'),
    //     nextEl: this.el.querySelector('[data-next]'),
    //   }
    // }

    if (this.options.height) {
      toReturn.breakPoints = {
        600: {
          autoHeight: false
        }
      };
    }

    if (this.options.productPreview) {
      toReturn.slidesPerView = 1,
      toReturn.spaceBetween =  8,
      toReturn.breakPoints = {
        320: {
          slidesPerView: 2,
          spaceBetween: 12,
        },
        700: {
          slidesPerView: 3,
        },
        1000: {
          slidesPerView: 4,
        },
      }
    }

    return toReturn;
  }

  // TODO:
  setupWatchers() {
    var self = this;
    if (this.params.lazy) {
      this.swiper.on('lazyImageLoad', self.lazyLoadVideo);
    }
  }

  lazyLoadVideo(swiper,slideEl,imageEl) {
    if (imageEl.tagName == "video") {
      imageEl.src = imageEl.getAttribute('data-src');
    }
    return true;
  }

  watchForVariantChanges() {

  }
  //We want to create a window swiper element
  createSwiper() {
    return new Swiper(this.el, this.params);
  }
}

window.Slider = Slider;


if (!customElements.get('slider-element')) {
  customElements.define('slider-element', class Slider extends HTMLElement {
  constructor() {
    super();

  //this == the element
    const params = this.generateParams();
    this.slider  = new window.Slider(this, params );
    console.log(this.slider);
  }

  generateParams() {
    let params = {}

    if (this.getAttribute('data-pagination')) {
      params.pagination = {
        type: 'bullets',
        el: this.querySelector('[data-pagination]'),
        dynamicBullets: true,
      }

      if (this.getAttribute('data-pagination') == "progress") {
        params.pagination.type = "progressbar"
      }
    }

    if (this.getAttribute('data-autoplay')) {
console.log("Should have autoplay");
      params.autoplay = {
        delay: this.getAttribute('data-autoplay'),
        disableOnInteraction: true,
        pauseOnMouseEnter: true
      }
    }

    if (this.getAttribute('data-auto-height')) {
      params.autoHeight = true;
    }

    if (this.getAttribute('data-navigation')) {
      params.navigation = {
        prevEl: this.querySelector('[data-prev]'),
        nextEl: this.querySelector('[data-next]'),
      };
    }

    if (this.getAttribute('data-effect')) {
      if (this.getAttribute('data-effect') == "fade" || this.getAttribute('data-effect') == 'slide') {
        params.effect = this.getAttribute('data-effect');
      }
    }
    return params;
  }
})
}

