const MENU_ITEMS = [
  { id:"espresso", name:"Classic Espresso", category:"Coffee", price:120, description:"A rich, balanced shot with a velvety crema.", image:"https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=900&q=85" },
  { id:"cappuccino", name:"Cappuccino", category:"Coffee", price:180, description:"Espresso, steamed milk and a soft cloud of foam.", image:"https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=900&q=85" },
  { id:"latte", name:"Vanilla Latte", category:"Coffee", price:210, description:"Smooth espresso and milk with a hint of vanilla.", image:"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=85" },
  { id:"americano", name:"Americano", category:"Coffee", price:150, description:"A clean, full-bodied coffee finished with hot water.", image:"https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&w=900&q=85" },
  { id:"matcha", name:"Iced Matcha Latte", category:"Non-Coffee", price:230, description:"Earthy Japanese green tea whisked with chilled milk.", image:"https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=900&q=85" },
  { id:"hot-chocolate", name:"Hot Chocolate", category:"Non-Coffee", price:200, description:"Comforting cocoa blended into warm, creamy milk.", image:"https://images.unsplash.com/photo-1542990253-0b8be9f7c5a5?auto=format&fit=crop&w=900&q=85" },
  { id:"lemonade", name:"Fresh Lemonade", category:"Drinks", price:140, description:"Freshly squeezed lemon, a touch of sweetness and ice.", image:"https://images.unsplash.com/photo-1513558161293-c6b0c6f8e9c5?auto=format&fit=crop&w=900&q=85" },
  { id:"mango", name:"Mango Smoothie", category:"Drinks", price:220, description:"A sunshine-bright blend of mango and chilled yogurt.", image:"https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=900&q=85" },
  { id:"iced-tea", name:"Peach Iced Tea", category:"Drinks", price:170, description:"Black tea chilled with peach and a citrus finish.", image:"https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=85" },
  { id:"sandwich", name:"Grilled Veggie Sandwich", category:"Food", price:260, description:"Toasted sourdough layered with seasonal vegetables and cheese.", image:"https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=85" },
  { id:"pasta", name:"Creamy Alfredo Pasta", category:"Food", price:340, description:"Penne tossed in a silky parmesan cream sauce.", image:"https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=85" },
  { id:"salad", name:"Garden Fresh Salad", category:"Food", price:240, description:"Crisp greens, cherry tomatoes and house citrus dressing.", image:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85" },
  { id:"cheesecake", name:"New York Cheesecake", category:"Desserts", price:250, description:"Creamy baked cheesecake on a buttery biscuit base.", image:"https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=85" },
  { id:"brownie", name:"Chocolate Brownie", category:"Desserts", price:190, description:"A warm, fudgy chocolate square with a delicate crust.", image:"https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85" },
  { id:"tiramisu", name:"Classic Tiramisu", category:"Desserts", price:280, description:"Coffee-soaked layers with mascarpone cream and cocoa.", image:"https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=85" }
];

function addToCart(itemId) {
  const item = MENU_ITEMS.find(entry => entry.id === itemId);
  if (!item) return;
  const cart = JSON.parse(localStorage.getItem("dreamCafeCart") || "[]");
  const existing = cart.find(entry => entry.itemId === item.id);
  if (existing) existing.quantity += 1;
  else cart.push({ itemId:item.id, name:item.name, price:item.price, quantity:1 });
  localStorage.setItem("dreamCafeCart", JSON.stringify(cart));
  const status = document.getElementById("menu-status");
  if (status) showMessage(status, `${item.name} added to your order.`);
}

function renderMenu(category = "All") {
  const grid = document.getElementById("menu-grid");
  if (!grid) return;
  const visible = MENU_ITEMS.filter(item => category === "All" || item.category === category);
  grid.innerHTML = visible.map(item => `
    <article class="menu-card">
      <img src="${item.image}" alt="${item.name}" loading="lazy">
      <div class="menu-card-body">
        <span class="eyebrow">${item.category}</span>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="card-meta"><span class="price">${money(item.price)}</span>
          <button class="add-btn" type="button" data-add="${item.id}">Add to Order</button>
        </div>
      </div>
    </article>`).join("");
  grid.querySelectorAll("[data-add]").forEach(button => button.addEventListener("click", () => addToCart(button.dataset.add)));
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("menu-grid")) return;
  renderMenu();
  document.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-category]").forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      renderMenu(button.dataset.category);
    });
  });
});