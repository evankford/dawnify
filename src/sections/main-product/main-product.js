if (!customElements.get('product-modal')) {
    customElements.define('product-modal', class ProductModal extends ModalDialog {
  constructor() {
    super();
  }

  hide() {
    super.hide();
    window.pauseAllMedia();
  }

  show(opener) {
    super.show(opener);
    this.showActiveMedia();
  }

  showActiveMedia() {
    this.querySelectorAll(
      `[data-media-id]:not([data-media-id="${this.openedBy.getAttribute(
        'data-media-id'
      )}"])`
    ).forEach((element) => {
      element.classList.remove('active');
    });
    const activeMedia = this.querySelector(
      `[data-media-id="${this.openedBy.getAttribute('data-media-id')}"]`
    );
    activeMedia.classList.add('active');
    activeMedia.scrollIntoView();

    if (
      activeMedia.nodeName == 'DEFERRED-MEDIA' &&
      activeMedia
        .querySelector('template')
        ?.content?.querySelector('.js-youtube')
    )
      activeMedia.loadContent();
  }
})};