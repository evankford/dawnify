class GridSwatch extends HTMLElement {
  getClosest(elem, selector) {
    for (; elem && elem !== document; elem = elem.parentNode) {
      if (elem.matches(selector)) return elem;
    }
    return null;
  }

  constructor() {
    super();
    this.el = this;
    this.swatches =  [].slice.call(this.el.querySelectorAll('.grid-swatch'));
    this.cardWrap = this.getClosest(this.el, '.card-wrapper');
    this.linkWrap = this.cardWrap.querySelector('a');
    this.imgWrap = this.cardWrap.querySelector('.card__media');

    if (this.linkWrap) {
      this.originalHref = this.linkWrap.href;
    }

    this.setupListener();
    window.addEventListener('load', this.handlePreload.bind(this))
  }

  setupListener() {
    if (this.linkWrap) {
      this.linkWrap.addEventListener('click', this.handleClick.bind(this));
    }
    if (this.cardWrap) {
      this.cardWrap.addEventListener('click', this.handleClick.bind(this));
    }
    this.swatches.forEach(swatch=> {
      swatch.addEventListener('mouseover', this.handleHover.bind(this))
      swatch.addEventListener('mouseout', this.resetImages.bind(this))
    })
  }

  handleHover(evt) {
    let button  =this.getButton(evt.target);
    if (button && button.getAttribute('data-image')) {
      this.changeActiveImage(button);
    }
  }

  getButton(evtTarget) {
    let button = evtTarget;
     if (!button.classList.contains('grid-swatch')) {
       button = this.getClosest(evtTarget, '.grid-swatch');
     }
     return button;
  }

  resetImages(removeSelected = true) {
    this.imgWrap.classList.remove('variant-image-active');
    if (this.linkWrap && this.originalHref) {
      this.linkWrap.href = this.originalHref
    }
  }

  changeActiveImage(button, removeSelected = true) {
    this.resetImages()


    this.linkWrap.setAttribute('href', button.getAttribute('data-url'));

     if (
       typeof button.getAttribute('data-image') == 'string' &&
       button.getAttribute('data-image') != 'false'
     ) {
       this.imgWrap.classList.add('variant-image-active');
       this.imgWrap.style.backgroundImage =
         "url('" + button.getAttribute('data-image') + "')";
     }
  }

  handleClick(evt) {
    var button = this.getButton(evt.target);

    if ( this.swatches.includes(button)) {
      if (button.classList.contains('selected')) {
        //Do the normal thing, go to page
        window.location.href = this.linkWrap.href
      } else {
        this.imgWrap.classList.add('variant-image-active--clicked');
        evt.preventDefault();
        this.changeActiveImage(button);
         this.swatches.forEach((el) => {
           el.classList.remove('selected');
         });

         setTimeout(() => {
           button.classList.add('selected');
         }, 25);
      }
    }
  }

  handlePreload() {
    this.swatches.forEach(swatch => {
      const preloader = new Image().src = swatch.getAttribute('data-image');
    })
  }
}

customElements.define('grid-swatches', GridSwatch);
