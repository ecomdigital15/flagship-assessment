class AjaxCart extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.submitButton = this.querySelector('[type="submit"]');
    this.bindEvents();
  }

  bindEvents() {
    this.form.addEventListener('submit', this.onSubmit.bind(this));
  }

  async onSubmit(event) {
    event.preventDefault();
    
    if (!this.submitButton.classList.contains('disabled')) {
      this.submitButton.setAttribute('disabled', true);
      this.submitButton.classList.add('loading');

      const formData = new FormData(this.form);
      
      // Get current cart count to determine index
      const cartResponse = await fetch('/cart.js');
      const cart = await cartResponse.json();
      const cartIndex = cart.items.length;

      // Add cart_index to form data
      formData.append('properties[cart_index]', cartIndex.toString());

      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (data.status) {
          this.handleErrorMessage(data.description);
          return;
        }

        this.handleSuccess();
        
        // Trigger cart update event
        document.dispatchEvent(new CustomEvent('cart:refresh'));

      } catch (error) {
        this.handleErrorMessage(error.message);
      } finally {
        this.submitButton.classList.remove('loading');
        this.submitButton.removeAttribute('disabled');
      }
    }
  }

  handleErrorMessage(errorMessage = false) {
    this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
    this.errorMessage = this.errorMessage || this.errorMessageWrapper?.querySelector('.product-form__error-message');

    if (!this.errorMessageWrapper) return;
    this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

    if (errorMessage) {
      this.errorMessage.textContent = errorMessage;
    }
  }

  handleSuccess() {
    this.handleErrorMessage();
    document.querySelector('cart-notification')?.open();
  }
}

customElements.define('ajax-cart', AjaxCart); 