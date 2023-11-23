window.onload = function () {
  const theme = localStorage.getItem("theme");
  if (theme) {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }
};

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

const toggleButton = document.querySelector("#toggleTheme");
toggleButton.addEventListener("click", function () {
  // Mevcut tema alınıyor
  var currentTheme = document.documentElement.getAttribute("data-bs-theme");

  // Temayı değiştirme
  if (currentTheme === "dark") {
    document.documentElement.setAttribute("data-bs-theme", "light");
    localStorage.setItem("theme", "light");
    toggleButton.classList.remove("btn-outline-warning");
    toggleButton.classList.add("btn-outline-secondary");
    toggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-moon-fill" viewbox="0 0 16 16">
    <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
    </svg>`;
  } else {
    document.documentElement.setAttribute("data-bs-theme", "dark");
    localStorage.setItem("theme", "dark");
    toggleButton.classList.remove("btn-outline-secondary");
    toggleButton.classList.add("btn-outline-warning");
    toggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-brightness-high-fill" viewBox="0 0 16 16">
    <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
  </svg>`;
  }
});
