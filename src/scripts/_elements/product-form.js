if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.form.querySelector('[name=id]').disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cartNotification = document.querySelector('cart-notification');
      }

      checkForRequiredInputs(formData) {

        this.errors = [];
        const parent = this.form.closest('.product');
        const els = parent.querySelectorAll('input[required]');
        els.forEach(el=> {
          const property = el.getAttribute('name');
          const hasEntry = formData.has(property);
          if (hasEntry) {
            if (formData.get(property) !== 'Yes') {
              errors.push(this.cleanProperty(property));

            }
          } else if (property) {
            this.errors.push(this.cleanProperty(property));

          }
        });
      }

      cleanProperty(str) {
        return str.replace('properties[', '').replace(']', '');
      }

      onSubmitHandler(evt) {
        this.errors = [];
        evt.preventDefault();
        const submitButton = this.querySelector('[type="submit"]:not([data-single-clone])');
        if (submitButton.classList.contains('loading')) return;

        this.handleErrorMessage();
        this.cartNotification.setActiveElement(document.activeElement);

        submitButton.setAttribute('aria-disabled', true);
        submitButton.classList.add('loading');

        submitButton.querySelector('.loading-overlay__spinner').classList.remove(
          'hidden'
        );

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);
        this.checkForRequiredInputs(formData);
          // console.log(passedCheck)

        if (this.errors.length) {
          let msg = '<ul>';
          this.errors.forEach(error=> {
            msg += `<li>Please check the <b>${error}</b> checkbox to add to your cart.</li>`
          });
          msg +='</ul>'
          this.handleErrorMessage(msg);
           submitButton.classList.remove('loading');
           submitButton.removeAttribute('aria-disabled');
           submitButton.querySelector('.loading-overlay__spinner').classList.add(
             'hidden'
           );
          return;
        } else {
          this.handleErrorMessage()
        }


        formData.append(
          'sections',
          this.cartNotification
            .getSectionsToRender()
            .map((section) => section.id)
        );
        formData.append('sections_url', window.location.pathname);
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              this.handleErrorMessage(response.description);
              return;
            }

            this.cartNotification.renderContents(response);
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            submitButton.classList.remove('loading');
            submitButton.removeAttribute('aria-disabled');
            submitButton.querySelector('.loading-overlay__spinner').classList.add(
              'hidden'
            );
          });
      }

      handleErrorMessage(errorMessage = false) {
        this.errorMessageWrapper =
          this.errorMessageWrapper ||
          this.querySelector('.product-form__error-message-wrapper');
        this.errorMessage =
          this.errorMessage ||
          this.errorMessageWrapper.querySelector(
            '.product-form__error-message'
          );

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.innerHTML = errorMessage;
        }
      }
    }
  );
}
