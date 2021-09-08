 class SiteHeader extends HTMLElement {
    constructor() {
      super();
      this.init();
    }

    connectedCallback() {
      this.init();
    }

    init() {
      this.header = document.getElementById('shopify-section-header');
      this.headerBounds = {};
      this.currentScrollTop = 0;
      if (this.getAttribute('data-overlay')) {
        this.checkOverlay();
      } else {
        const main = document.getElementById("MainContent");
        main.classList.remove('has-overlay');
      }
      this.onScrollHandler = this.onScroll.bind(this);
      window.addEventListener('scroll', this.onScrollHandler, false);

      window.addEventListener('resize', this.handleResize.bind(this));
      //init

      // this.handleResize();
      // this.handleResize()
      window.addEventListener('load', this.handleResize.bind(this));
      this.onScroll()
    }

    disconnectedCallback() {
      window.removeEventListener('scroll', this.onScrollHandler);
    }

    onScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
        requestAnimationFrame(this.hide.bind(this));
      } else if (scrollTop < this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
        if (!this.preventReveal) {
          requestAnimationFrame(this.reveal.bind(this));
        } else {
          window.clearTimeout(this.isScrolling);

          this.isScrolling = setTimeout(() => {
            this.preventReveal = false;
          }, 66);

          requestAnimationFrame(this.hide.bind(this));
        }
      } else if (scrollTop <= this.headerBounds.top) {
        requestAnimationFrame(this.reset.bind(this));
      }


      this.currentScrollTop = scrollTop;


      if (this.overlay) {
        const self = this;
        if (scrollTop > this.overlayLine) {
          requestAnimationFrame(function() {
            self.header.classList.remove('overlay-active');
          })
        } else if  (scrollTop < this.overlayLine) {
          requestAnimationFrame(function() {
            self.header.classList.add('overlay-active');
          });
        }
      }

    }

    hide() {
      this.header.classList.add('shopify-section-header-hidden', 'shopify-section-header-sticky');
      this.closeMenuDisclosure();
      this.closeSearchModal();
    }

    reveal() {
      this.header.classList.add('shopify-section-header-sticky', 'animate');
      this.header.classList.remove('shopify-section-header-hidden');
    }

    reset() {
      this.header.classList.remove('shopify-section-header-hidden', 'shopify-section-header-sticky', 'animate');
    }

    closeMenuDisclosure() {
      this.disclosures = this.disclosures || this.header.querySelectorAll('details-disclosure');
      this.disclosures.forEach(disclosure => disclosure.close());
    }

    closeSearchModal() {
      this.searchModal = this.searchModal || this.header.querySelector('details-modal');
      if (this.searchModal) {
        this.searchModal.close(false);
      }
    }
    checkOverlay() {
      //Checking overlay
      if (this.pageHasOverlay()) {
        this.overlay = true;
        this.header.classList.add('has-overlay');
      }
      this.checkOverlaySize();
      window.addEventListener('resize', this.checkOverlaySize.bind(this))
    }

    pageHasOverlay() {
      const main = document.getElementById('MainContent');
      const children = main.querySelectorAll('.shopify-section')
      if (children && children[0].classList.contains('image-section')) {
        this.overlaySection = children[0];
        main.classList.add('has-overlay');
        return true;
      } else {
        main.classList.remove('has-overlay');
        return false;
      }
    }

    handleResize() {
      if (this.overlay) {
        this.checkOverlaySize();
      }
      this.headerBounds = {
        top: this.header.offsetTop,
        bottom: this.header.offsetTop + this.header.offsetHeight,
      },

      document.body.style.setProperty('--header-bottom', this.header.offsetHeight + this.header.offsetTop + 'px');
    }

    checkOverlaySize() {
      if (this.overlaySection) {
        const overlayBounds = this.overlaySection.getBoundingClientRect();
        this.overlayLine = overlayBounds.bottom;
      } else {
        return 0;
      }
    }
  }

  customElements.define('site-header', SiteHeader);