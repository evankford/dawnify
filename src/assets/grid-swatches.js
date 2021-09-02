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
    this.linkWrap = this.getClosest(this.el, 'a');
    this.imgWrap = this.linkWrap.querySelector('.card__media');

    this.setupListener();
  }

  setupListener() {
    if (this.linkWrap) {
      this.linkWrap.addEventListener('click', this.handleClick.bind(this));
    }
  }

  handleClick(evt) {
    var button = evt.target.parentNode;
    if (this.swatches.includes(evt.target) || this.swatches.includes(button)) {
      if (button.classList.contains('selected')) {
        //Do the normal thing, go to page
      } else {

        //Remove old classes
        evt.preventDefault();
        this.imgWrap.classList.remove('variant-image-active');
        this.swatches.forEach(el => {
          el.classList.remove('selected');
        });
        setTimeout(() => {
          button.classList.add('selected');
        }, 25);

        //Set new things
        this.linkWrap.setAttribute('href', button.getAttribute('data-url'));
        //Featured image stuff
        if (
          typeof button.getAttribute('data-image') == 'string' &&
          button.getAttribute('data-image') != 'false'
        ) {
          this.imgWrap.classList.add('variant-image-active');
          this.imgWrap.style.backgroundImage =
            "url('" + button.getAttribute('data-image') + "')";
        }
      }
    }
  }
}

customElements.define('grid-swatches', GridSwatch);
