class Slider extends HTMLElement {
  constructor() {
    super();

  //this == the element
    const params = this.generateParams();
    this.slider  = new window.Slider(this, params );
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
    return params;
  }
}

customElements.define('slider-element', Slider);