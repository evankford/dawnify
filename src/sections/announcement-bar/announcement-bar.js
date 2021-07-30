class AnnouncementBar extends HTMLElement {
  constructor() {
    super();
    this.id = this.dataset.id;

    //Setup admin
    this.duringThemeEditor();
    this.height = 0;
    window.addEventListener('resize', this.handleResize.bind(this));
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

    if (this.height != newHeight) {
      this.newHeight =  newHeight;
      this.changeBodyOffset()
    }

  }
  changeBodyOffset() {
    let offset = document.body.getBoundingClientRect().top;
    if (this.heightAdded) {
      offset = offset - this.height
    }
    document.body.style.marginTop = offset + this.newHeight + 'px';
    this.height = this.newHeight
  }

  close() {
    this.classList.add('announcement-dismissed');
    localStorage.setItem(`${this.id}-dismissed`, true);
  }
}

customElements.define('announcement-bar', AnnouncementBar);