
// =====================================
// DREAM LIFE CAFE - SHOPPING CART
// =====================================

function readCart() {
  try {
    return JSON.parse(
      localStorage.getItem("dreamCafeCart") || "[]"
    );
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(
    "dreamCafeCart",
    JSON.stringify(cart)
  );
  renderCart();
}

function renderCart() {
  const list = document.getElementById("cart-items");
  if (!list) return;

  const cart = readCart();

  const count = cart.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  const countElement = document.getElementById("cart-count");
  const totalElement = document.getElementById("cart-total");
  const subtotalElement = document.getElementById("cart-subtotal");

  if (countElement) countElement.textContent = count;
  if (totalElement) totalElement.textContent = money(total);
  if (subtotalElement) subtotalElement.textContent = money(total);

  if (!cart.length) {
    list.innerHTML = `
      <div class="empty">
        Your order is empty. Visit the menu to add something delicious.
      </div>
    `;
    return;
  }

  list.innerHTML = cart.map(item => `
    <div class="cart-row">
      <div>
        <strong>${item.name}</strong>
        <div class="muted">${money(item.price)} each</div>
        <button
          class="remove-btn"
          type="button"
          data-remove="${item.itemId}">
          Remove
        </button>
      </div>

      <div class="qty">
        <button
          type="button"
          aria-label="Decrease quantity"
          data-change="-1"
          data-id="${item.itemId}">−</button>

        <span>${item.quantity}</span>

        <button
          type="button"
          aria-label="Increase quantity"
          data-change="1"
          data-id="${item.itemId}">+</button>
      </div>

      <strong class="row-price">
        ${money(item.price * item.quantity)}
      </strong>
    </div>
  `).join("");

  list.querySelectorAll("[data-change]").forEach(button => {
    button.addEventListener("click", () => {
      const updated = readCart();

      const item = updated.find(
        i => i.itemId === button.dataset.id
      );

      if (item) {
        item.quantity += Number(button.dataset.change);
      }

      saveCart(updated.filter(i => i.quantity > 0));
    });
  });

  list.querySelectorAll("[data-remove]").forEach(button => {
    button.addEventListener("click", () => {
      saveCart(
        readCart().filter(
          i => i.itemId !== button.dataset.remove
        )
      );
    });
  });
}

// =====================================
// CHECKOUT
// =====================================

document.addEventListener("DOMContentLoaded", () => {
  renderCart();

  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const cart = readCart();
    const message = document.getElementById("checkout-message");

    if (!cart.length) {
      showMessage(
        message,
        "Please add items before checkout.",
        true
      );
      return;
    }

    const data = Object.fromEntries(
      new FormData(form).entries()
    );

    const submit = form.querySelector('button[type="submit"]');

    if (!submit) return;

    submit.disabled = true;
    submit.textContent = "Saving order...";

    try {
      const result = await CafeAPI.saveOrder({
        customerName: data.customerName,
        phone: data.phone,
        items: cart
      });

      localStorage.removeItem("dreamCafeCart");
      form.reset();
      renderCart();

      showMessage(
        message,
        `${result.message} Your order reference is ${result.orderId}. Total: ${money(result.total)}.`
      );

    } catch (error) {
      showMessage(message, error.message, true);

    } finally {
      submit.disabled = false;
      submit.textContent = "Place Order";
    }
  });
});
