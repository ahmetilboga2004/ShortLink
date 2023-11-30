const table = document.getElementById("linkTable");
const headers = table.querySelectorAll("th.sortable");
let sortDirection = {};
const iconSortUp = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sort-up" viewBox="0 0 16 16">
<path d="M3.5 12.5a.5.5 0 0 1-1 0V3.707L1.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L3.5 3.707zm3.5-9a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1z"/>
</svg>`;
const iconSortDown = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sort-down" viewBox="0 0 16 16">
<path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 11.293zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1z"/>
</svg>`;

for (const header of headers) {
  const headerName = header.innerHTML;
  header.innerHTML = headerName + " " + iconSortDown;
  header.addEventListener("click", () => {
    const headerSvg = header.querySelector("svg");
    if (headerSvg.classList.contains("bi-sort-down")) {
      header.innerHTML = headerName + " " + iconSortUp;
    } else {
      header.innerHTML = headerName + " " + iconSortDown;
    }
    const sortKey = header.getAttribute("data-key");
    const rows = Array.from(table.querySelectorAll("tbody tr"));

    if (!sortDirection[sortKey] || sortDirection[sortKey] === "desc") {
      sortDirection[sortKey] = "asc";
    } else {
      sortDirection[sortKey] = "desc";
    }

    rows.sort((a, b) => {
      const aValue = a.querySelector(`td[data-key="${sortKey}"]`).innerText;
      const bValue = b.querySelector(`td[data-key="${sortKey}"]`).innerText;

      if (aValue < bValue) {
        return sortDirection[sortKey] === "asc" ? -1 : 1;
      } else if (aValue > bValue) {
        return sortDirection[sortKey] === "asc" ? 1 : -1;
      } else {
        return 0;
      }
    });

    table.querySelector("tbody").innerHTML = rows.reduce(
      (innerHTML, row) => innerHTML + row.outerHTML,
      ""
    );
  });
}
document.querySelectorAll(".action-link").forEach(function (td) {
  td.innerHTML = ` <button type="button" class="btn border-0 p-1 copy-btn">📋</button>
  <button type="button" class="btn border-0 p-1" data-bs-toggle="modal" data-bs-target="#editLinkModal">✏️
  </button>
  <button type="button" class="btn border-0 p-1" data-bs-toggle="modal" data-bs-target="#deleteLinkModal">🗑️</button>`;
});
document.querySelectorAll(".action-user").forEach(function (td) {
  td.innerHTML = `<button type="button" class="btn border-0 p-1" data-bs-toggle="modal" data-bs-target="#editUserModal">✏️</button>`;
});

document.querySelectorAll(".copy-btn").forEach(function (button) {
  button.addEventListener("click", function () {
    copyToClipboard(this.closest("tr").cells[1].innerText);
  });
});

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  // Toast oluştur
  var toastContainer = document.createElement("div");
  toastContainer.classList.add(
    "toast-container",
    "position-fixed",
    "bottom-0",
    "end-0",
    "p-3"
  );
  document.body.appendChild(toastContainer);
  var toast = document.createElement("div");
  toast.className = "toast";
  toast.classList.add("bg-body-tertiary");
  toast.innerHTML = `
  <div class="toast-header">
    <strong class="me-auto">Copying successful</strong>
    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
  </div>
  <div class="toast-body">
    ${text}
  </div>`;
  toastContainer.appendChild(toast);

  // Bootstrap Toast gösterimi
  var bootstrapToast = new bootstrap.Toast(toast);
  bootstrapToast.show();
}
