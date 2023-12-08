// Diğer dosyadan fonksiyonu içe aktar
const toastCreate = (success, message) => {
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
      ${message}
    </div>`;
  toastContainer.appendChild(toast);

  // Bootstrap Toast gösterimi
  var bootstrapToast = new bootstrap.Toast(toast);
  bootstrapToast.show();
};

let allLinksData;

const getAllLinks = (searchValue = "") => {
  try {
    fetch("/get-user-links")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        const linkCountDiv = document.querySelector("#linkCount");
        let countLink = data.length > 0 ? data.length : 0;
        linkCountDiv.innerHTML = `Total ${countLink} Rows`;
        allLinksData = data;
        const linkTableBody = document.querySelector("#linkTable tbody");
        // Tabloyu temizle
        linkTableBody.innerHTML = "";
        if (data.length > 0) {
          // Eğer bir searchValue varsa, filtreleme yap
          if (searchValue.length > 0) {
            data = data.filter(
              (link) =>
                link.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                link.originalUrl
                  .toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                link.shortLink.toLowerCase().includes(searchValue.toLowerCase())
            );
          }
          data.forEach((link) => {
            const row = linkTableBody.insertRow();
            row.innerHTML = `
              <td data-key="Name">${link.name}</td>
              <td data-key="Url">${link.originalUrl}</td>
              <td data-key="ShortLink">http://localhost:3000/${link.shortLink}</td>
              <td data-key="View">${link.click}</td>
              <td>
                <button type="button" class="btn btn-outline-secondary edit-link-btn" data-linkid="${link._id}">✏️</button>
              </td>
              <td>
                <button type="button" class="btn btn-outline-success copy-link-btn" onclick="copyToClipboard(this.closest('tr').cells[2].innerText)" data-link="${link.shortLink}">📋</button>
              </td>
              <td>
                <button type="button" class="btn btn-outline-danger delete-link-btn" data-linkid="${link._id}">🗑️</button>
              </td>
            `;
          });
        } else {
          const notLink = document.querySelector("#notLinks");
          notLink.innerText = "Link Bulunamadı";
        }
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
};

// Sayfa yüklendiğinde verileri çekip tabloya göstermek için
getAllLinks();

// Yenile butonuna tıklandığında tabloyu yeniden doldur
const refreshLinkButton = document.getElementById("refreshLinkButton");
refreshLinkButton.addEventListener("click", () => {
  getAllLinks();
});

// Arama inputu değiştiğinde tabloyu güncellemek için
const searchLinkInput = document.getElementById("searchLinkInput");
searchLinkInput.addEventListener("input", function () {
  const searchValue = this.value.trim().toLowerCase();
  getAllLinks(searchValue);
});

// Her bir edit butonuna tıklanınca fillEditModal fonksiyonunu çağır
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("edit-link-btn")) {
    const linkId = event.target.getAttribute("data-linkid");
    fillEditModal(linkId);
  }
});

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("delete-link-btn")) {
    const linkId = event.target.getAttribute("data-linkid");
    deleteLinkModal(linkId);
  }
});

function formatAndDisplayDate(isoDateString) {
  const date = new Date(isoDateString);

  // Tarih ve saat bilgilerini belirli bir formatta alabilirsiniz
  const formattedDate = new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC", // Opsiyonel: Zaman dilimini belirleyebilirsiniz
  }).format(date);
  return formattedDate;
}

// Edit butonlarına tıklanınca modalı dolduran fonksiyon
function fillEditModal(linkId) {
  const link = allLinksData.find((item) => item._id === linkId);

  if (link) {
    // Modal içindeki alanlara verileri yerleştir
    const linkName = document.getElementById("modalLinkName");
    const linkUrl = document.getElementById("modalLink");
    const shortLink = document.getElementById("modalShortLink");
    const viewLink = document.getElementById("modalViewLink");
    const createdAtLink = document.getElementById("modalCreatedAtLink");
    const leftTimeLink = document.getElementById("modalLeftTime");

    linkName.innerHTML = link.name;
    linkUrl.innerHTML = link.originalUrl;
    shortLink.innerHTML = `http://localhost:3000/${link.shortLink}`;
    viewLink.innerHTML = link.click;
    createdAtLink.innerHTML = formatAndDisplayDate(link.createdAt);
    if (link.leftTime === null) {
      leftTimeLink.innerHTML = "Never";
    } else {
      leftTimeLink.innerHTML = formatAndDisplayDate(link.leftTime);
    }

    // Diğer alanlara da verileri yerleştirin

    // Modal'ı aç
    var editLinkModal = new bootstrap.Modal(
      document.getElementById("editLinkModal")
    );
    editLinkModal.show();

    // Delete butonuna tıklanınca deleteLinkModal fonksiyonunu çağır
    const deleteButton = document.querySelector("#editModalDeleteLink");
    deleteButton.addEventListener("click", () => {
      deleteLinkModal(link._id);
    });
  }
}

function deleteLinkModal(linkId) {
  function deleteLink(linkId) {
    fetch(`/${linkId}`, { method: "DELETE" })
      .then((response) => response.json())
      .then((data) => {
        getAllLinks();
        toastCreate("Deleted", data.message);
      })
      .catch((error) => console.log(error));
  }
  var deleteLinkModal = new bootstrap.Modal(
    document.getElementById("deleteLinkModal")
  );
  deleteLinkModal.show();
  const confirmButton = document.querySelector("#confirmDeleteLink");
  confirmButton.addEventListener("click", () => {
    deleteLink(linkId);
  });
}

const linkTable = document.getElementById("linkTable");
const headers = linkTable.querySelectorAll("th.sortable");
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
    const rows = Array.from(linkTable.querySelectorAll("tbody tr"));

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

    linkTable.querySelector("tbody").innerHTML = rows.reduce(
      (innerHTML, row) => innerHTML + row.outerHTML,
      ""
    );
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  toastCreate("Copying successful", text);
}

const shortLinkForm = document.querySelector("#shortLinkForm");

shortLinkForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(shortLinkForm);

  // Fetch API kullanarak verileri Express.js server'ına gönderme
  fetch("/short-link", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Object.fromEntries(formData)),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Server returned an error: ${response.status} ${response.statusText}`
        );
      }
      return response.json();
    })
    .then((data) => {
      // Başarılı bir şekilde işlendikten sonra yapılacak işlemleri buraya ekleyin
      getAllLinks();
    })
    .catch((error) => {
      console.error("Error sending data to server:", error);
    });
});

const copyEditLinkBtn = document.querySelector("#copyEditLinkBtn");
copyEditLinkBtn.addEventListener("click", () => {
  const shortLinkText = document.querySelector("#modalShortLink");
  copyToClipboard(shortLinkText.innerText);
});
