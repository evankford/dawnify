class AutoModal extends HTMLElement {
  constructor() {
    super();

    this.delay = parseInt(this.getAttribute('data-delay'));
    this.debug = this.getAttribute('data-debug');
    this.show = this.getAttribute('data-show');
    this.id = this.getAttribute('id');

    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this)
    );
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    this.addEventListener('click', (event) => {
      if (event.target.nodeName === 'AUTO-MODAL') this.hide();
    });

    const self = this;
    console.log(this.show)
    window.setTimeout(self.tryToOpen.bind(self), this.delay * 1000);
  }

  open() {
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    trapFocus(this, this.querySelector('.modal-content'));
    window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    this.removeAttribute('open');
    window.pauseAllMedia();
  }

  tryToOpen() {
    console.log("Trying to open theme popop")
    if (this.debug) {
      this.open();
      return;
    }

    if (this.show > 0) {
      const now = new Date();
      if (localStorage.getItem(this.id)) {
        if (localStorage.getItem(this.id) <= now.getTime()) {
          this.open();
          localStorage.setItem(
            this.id,
            now.getTime() + this.show * 60 * 60 * 1000
          );
        }
      } else {
        this.open();
        localStorage.setItem(
          this.id,
          now.getTime() + this.show * 60 * 60 * 1000
        );
      }
    } else {
      if (!window.sessionStorage.getItem(this.id) != 'shown') {
        this.open();
        window.sessionStorage.setItem(this.id, 'shown');
      }
    }
  }
}
customElements.define('auto-modal', AutoModal);
