fetch ("components/navbar.html")
.then(response => response.text())
.then(data =>{
    document.getElementById("navbar").innerHTML =data;})
.catch(err => console.error("navbar load error",err));      
const form = document.getElementById("orderForm");
    const customerList = document.getElementById("customerList");
    const entryCount = document.getElementById("entryCount");

    let data = JSON.parse(localStorage.getItem("orders")) || {};

    function saveData() {
      localStorage.setItem("orders", JSON.stringify(data));
    }

    function totalEntries() {
      let count = 0;
      Object.values(data).forEach(arr => count += arr.length);
      entryCount.textContent = `${count} entr${count === 1 ? 'y' : 'ies'}`;
    }

    function renderTables() {
      customerList.innerHTML = "";
      Object.keys(data).forEach(customer => {
        const card = document.createElement("div");
        card.classList.add("customer-card");

        const header = document.createElement("div");
        header.classList.add("customer-header");
        header.innerHTML = `<h3>${customer}</h3>`;

        const addBtn = document.createElement("button");
        addBtn.textContent = " ✚ New Entry";
        addBtn.onclick = () => toggleInlineForm(customer, card);
        header.appendChild(addBtn);

        const table = document.createElement("table");
        table.classList.add("customer-table");
        table.innerHTML = `
          <thead>
            <tr>
              <th>Product</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Date</th>
              <th>Time</th><th>Delivered</th><th>Total</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${data[customer].map((entry, i) => `
              <tr>
                <td>${entry.product}</td>
                <td>${entry.qty}</td>
                <td>${entry.unit}</td>
                <td>${entry.rate}</td>
                <td>${entry.date}</td>
                <td>${entry.time}</td>
                <td>${entry.delivered}</td>
                <td>₹${(entry.qty * entry.rate).toFixed(2)}</td>
                <td class="actions">
                  <button onclick="editEntry('${customer}', ${i})">Edit</button> | 
                  <button onclick="deleteEntry('${customer}', ${i})">Delete</button>
                </td>
              </tr>`).join("")}
          </tbody>`;

        const inlineForm = document.createElement("div");
        inlineForm.classList.add("inline-form");
        inlineForm.innerHTML = `
          <input type="text" id="product_${customer}" placeholder="Product" required />
          <input type="number" id="qty_${customer}" placeholder="Qty" step="any" required />
          <select id="unit_${customer}">
            <option value="KG">KG</option>
            <option value="Quintal">Quintal</option>
            <option value="Gram">Gram</option>
          </select>
          <input type="number" id="rate_${customer}" placeholder="Rate" step="0.01" required />
          <select id="delivered_${customer}">
            <option value="Yes">Delivered - Yes</option>
            <option value="No">Delivered - No</option>
          </select>
          <button onclick="addInlineEntry('${customer}')">Save</button>
        `;

        card.appendChild(header);
        card.appendChild(table);
        card.appendChild(inlineForm);
        customerList.appendChild(card);
      });
      totalEntries();
    }

    function toggleInlineForm(customer, card) {
      const form = card.querySelector(".inline-form");
      form.style.display = form.style.display === "grid" ? "none" : "grid";
    }

    function addInlineEntry(customer) {
      const product = document.getElementById(`product_${customer}`).value;
      const qty = parseFloat(document.getElementById(`qty_${customer}`).value);
      const unit = document.getElementById(`unit_${customer}`).value;
      const rate = parseFloat(document.getElementById(`rate_${customer}`).value);
      const delivered = document.getElementById(`delivered_${customer}`).value;

      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      if (!product || !qty || !rate) return alert("Please fill all fields!");

      data[customer].push({ product, qty, unit, rate, delivered, date, time });
      saveData();
      renderTables();
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const entry = {
        product: product.value,
        qty: parseFloat(qty.value),
        unit: unit.value,
        rate: parseFloat(rate.value),
        date: date,
        time: time,
        delivered: delivered.value
      };

      const name = customerName.value.trim();
      if (!data[name]) data[name] = [];
      data[name].push(entry);
      saveData();
      form.reset();
      renderTables();
    });

    function deleteEntry(customer, index) {
      data[customer].splice(index, 1);
      if (data[customer].length === 0) delete data[customer];
      saveData();
      renderTables();
    }

    function editEntry(customer, index) {
      const entry = data[customer][index];
      customerName.value = customer;
      product.value = entry.product;
      qty.value = entry.qty;
      unit.value = entry.unit;
      rate.value = entry.rate;
      delivered.value = entry.delivered;
      deleteEntry(customer, index);
    }

    renderTables();