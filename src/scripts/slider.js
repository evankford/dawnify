import Swiper, { Lazy, Thumbs, A11y, Navigation, Pagination, Autoplay, EffectFade, EffectCoverflow, EffectCreative } from 'swiper';
Swiper.use([Lazy, Thumbs, A11y, Navigation, Pagination, Autoplay, EffectFade, EffectCoverflow, EffectCreative]);

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

    setTimeout(() => {

      window.dispatchEvent(new Event('resize'));
      // window.dispatchEvent(new Event('RevealSync'));
      this.swiper.update();
    }, 200);
  }

  setupParams() {
    const defaultOptions = {
      thumbs: false,
      navigation: false,
      pagination: false,
      lazy: {
        checkInView: true,
        loadOnTransitionStart: true,
      },
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
    //   if (this.options.pagination == "progressbar") {
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
        900: {
          slidesPerView: 3,
        },
        1300: {
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

    }

  }

  finishLazyLoad(swiper,slideEl,imageEl) {
    slideEl.classList.add('lazyloaded')
  }



  watchForVariantChanges() {

  }
  //We want to create a window swiper element
  createSwiper() {
    return new Swiper(this.el, this.params);
  }
}

window.Slider = Slider;
window.dispatchEvent(new Event('slidersReady'));
window.slidersReady = true;


if (!customElements.get('slider-element')) {
  customElements.define('slider-element', class Slider extends HTMLElement {
  constructor() {

    super();

  //this == the element
    const params = this.generateParams();
    this.contentBox = this.querySelector('[data-slider-content]');

    this.slider  = new window.Slider(this, params );

  if (this.contentBox != null && this.slider) {
      this.setupContentBox()
    }

  }

  generateParams() {
    let params = {}

    if (this.getAttribute('data-pagination')) {
      params.pagination = {
        type: 'bullets',
        el: this.querySelector('[data-pagination]'),
        dynamicBullets: true,
      }

      if (this.getAttribute('data-pagination') == "progressbar") {
        params.pagination.type = "progressbar"
      }
    }

    if (this.getAttribute('data-autoplay')) {

      params.autoplay = {
        delay: parseInt(this.getAttribute('data-autoplay')) * 1000,
        disableOnInteraction: true,
        // pauseOnMouseEnter: true
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
      if (this.getAttribute('data-effect') == "fade" || this.getAttribute('data-effect') == 'slide' ) {
        params.effect = this.getAttribute('data-effect');
      }
      if (this.getAttribute('data-effect') == "fade") {
        params.speed = 500;
        params.fadeEffect = {
          crossFade: true
        }
      }
      if (this.getAttribute('data-effect') == "threed") {

        params.speed = 500;
        params.effect ='creative';
        params.loop = true;
        params.creativeEffect = {
          next: {
            translate: ['90%', 0, '-50px'],
            rotate: [0, -12, 0],
            scale: 0.8,
            shadow: true,
            origin: 'middle center'
          },
          prev: {
            translate: ['-90%', 0, '-50px'],
            rotate: [0, 12, 0],
            scale: 0.8,
            shadow: true,
            origin: 'middle center'
          },
        };
      }
      if (this.getAttribute('data-multi-slider') === 'true') {
        params.slidesPerView = 1;
        params.breakpoints = false;
        params.autoplay = false;
        // params.rewind = true;
        params.initialSlide = 1;
        params.centeredSlides = true;
      }
    } else {
      if (this.getAttribute('data-multi-slider') === 'true') {
        params.slidesPerView = Math.max(this.el.querySelectorAll('.swiper-slide').length, 3);
      }
    }


    return params;
  }

  //Content box stuff

  setupContentBox() {
    this.classList.add('has-content-box');
    const sliderContent = this.querySelector('[data-slider-content]')
    const slideContents = this.querySelectorAll('[data-slide-content]')
    const timeoutLength = 200;

    if (sliderContent && slideContents.length) {

      this.slider.swiper.on('slideChange', (evt) => {

        const index = evt.activeIndex;

        sliderContent.classList.add('animating--out')
        setTimeout(() => {
          sliderContent.innerHTML = slideContents[index].innerHTML;

          // sliderContent.classList.add('animating--in')
          //Lightbox stuff
          if (window.GLight) {
            const newButton = sliderContent.querySelector('[data-glightbox]');
            const oldButton = slideContents[index].querySelector('[data-glightbox]')
            if (oldButton && newButton) {
            newButton.setAttribute('data-glightbox', 'true');
            oldButton.setAttribute('data-glightbox', 'false');
          }
            // window.GLightbox.getAllPlayers();
            window.GLight.reload();
          }
          sliderContent.classList.remove('animating--out')
          setTimeout(() => {
            // sliderContent.classList.remove('animating--in')
          }, timeoutLength);
        }, timeoutLength);

      })
    }
  }
})
}

