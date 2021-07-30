class AnnouncementBar extends HTMLElement {
  constructor() {
    super();
    this.id = this.dataset.id;

    //Setup admin
    this.duringThemeEditor();
    this.height = 0;
    if (localStorage.getItem(`${this.id}-dismissed`) ==  true) {
      this.close();
    } else {
      window.addEventListener('DOMContentLoaded', () => {
        this.checkForButton();
        this.handleResize();
        window.addEventListener('resize', this.handleResize.bind(this));
      })
    }



  }

  duringThemeEditor()  {
    if (window.Shopify.designMode) {
      this.parent = this.closest('.shopify-section');
      this.parent.addEventListener("shopify:section:load", () => {
        localStorage.removeItem(`${this.id}-dismissed`, true);
      })
    }
  }

  checkForButton() {
     this.button = this.querySelector('[data-close]');
    if (this.button) {
      this.button.addEventListener("click", this.close.bind(this))
    }
  }

  handleResize() {
    const newHeight = this.getBoundingClientRect().height;
    console.log(newHeight);
    if (this.height != newHeight) {
      this.newHeight =  newHeight;
      this.changeBodyOffset()
    }

  }
  changeBodyOffset() {
    let offset = document.body.getBoundingClientRect().top;

    //Fixes combined offsets
    if (this.heightAdded) {
      offset = offset - this.height
    }
    const newOffset = offset + this.newHeight + 'px';
    document.body.style.marginTop = newOffset;
    this.heightAdded = true;
    this.height = this.newHeight;
  }

  close() {
    this.newHeight = 0;
    this.changeBodyOffset();
    this.classList.add('announcement-dismissed');
    localStorage.setItem(`${this.id}-dismissed`, true);
  }
}

customElements.define('announcement-bar', AnnouncementBar);