
document.addEventListener("DOMContentLoaded", () => {
  // Mobile navigation
  const toggle = document.querySelector(".menu-toggle");
  const links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");

      toggle.setAttribute(
        "aria-expanded",
        links.classList.contains("open")
      );
    });

    links.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Highlight current page
  const current = location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-links a").forEach(link => {
    if (link.getAttribute("href") === current) {
      link.classList.add("active");
    }
  });

  // Automatically update footer year
  document.querySelectorAll("[data-current-year]").forEach(element => {
    element.textContent = new Date().getFullYear();
  });

  console.log("Dream Life Cafe loaded successfully!");
});

// Format prices in Indian Rupees
function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

// Display success/error messages
function showMessage(element, message, isError = false) {
  if (!element) return;

  element.textContent = message;
  element.className = isError ? "notice error" : "notice";
  element.hidden = false;
}

// Backend API configuration
// Keep empty for local development.
// Replace with your Render backend URL after deployment.
const API_BASE_URL = window.CAFE_API_URL || "";

// Shared API functionality
window.CafeAPI = {
  async request(endpoint, options = {}) {
    const response = await fetch(
      `${API_BASE_URL}/api${endpoint}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {})
        }
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }

    return data;
  },

  checkHealth() {
    return this.request("/health");
  },

  saveOrder(orderData) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData)
    });
  },

  saveReservation(reservationData) {
    return this.request("/reservations", {
      method: "POST",
      body: JSON.stringify(reservationData)
    });
  }
};
