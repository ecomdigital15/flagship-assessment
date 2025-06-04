class CartInstructions extends HTMLElement {
  constructor() {
    super();
    this.checkbox = this.querySelector('input[type="checkbox"]');
    this.textarea = this.querySelector('textarea');
    this.form = document.getElementById('cart');
    
    this.bindEvents();
    this.onCheckboxChange();
  }

  bindEvents() {
    this.checkbox.addEventListener('change', this.onCheckboxChange.bind(this));
    this.textarea.addEventListener('change', this.onTextareaChange.bind(this));
  }

  onCheckboxChange() {
    if (this.checkbox.checked) {
      this.textarea.style.display = 'block';
      // If there was a previously saved note, restore it
      if (this.textarea.dataset.previousNote) {
        this.textarea.value = this.textarea.dataset.previousNote;
        this.updateCartNote(this.textarea.value);
      }
    } else {
      // Save current note before hiding
      if (this.textarea.value) {
        this.textarea.dataset.previousNote = this.textarea.value;
      }
      this.textarea.style.display = 'none';
      this.textarea.value = '';
      this.updateCartNote('');
    }
  }

  onTextareaChange() {
    this.updateCartNote(this.textarea.value);
  }

  async updateCartNote(note) {
    try {
      const response = await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note: note
        })
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

customElements.define('cart-instructions', CartInstructions); 