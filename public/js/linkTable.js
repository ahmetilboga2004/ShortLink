// Toast oluşturma fonksiyonu
const toastCreate = (header, success, message) => {
  // Toast oluştur
  var toastContainer = document.querySelector("#myToast");
  var toast = document.createElement("div");
  toast.className = "toast";
  toast.classList.add(`bg-${success}`, "text-dark");
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");
  toast.innerHTML = `
      <div class="toast-header">
        <div class="me-auto">${header}</div>
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

const getAllLinks = async () => {
  try {
    let response = await fetch("/get-user-links");
    let data = await response.json();
    allLinksData = data;
    const linkTableBody = document.querySelector("#linkTable tbody");
    // Tabloyu temizle
    linkTableBody.innerHTML = "";
    if (data.length > 0) {
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
    }
    $(document).ready(function () {
      $("#linkTable").DataTable({
        responsive: false,
        scrollX: true,
        //disable sorting on last column
        columnDefs: [{ orderable: false, targets: [4, 5, 6] }],
        language: {
          //customize pagination prev and next buttons: use arrows instead of words
          paginate: {
            previous: '<span class="fa fa-chevron-left"></span>',
            next: '<span class="fa fa-chevron-right"></span>',
          },
          //customize number of elements to be displayed
          lengthMenu:
            'Display <select class="form-control input-sm">' +
            '<option value="5">5</option>' +
            '<option value="10">10</option>' +
            '<option value="20">20</option>' +
            '<option value="30">30</option>' +
            '<option value="30">30</option>' +
            '<option value="-1">All</option>' +
            "</select> results",
        },
      });
    });
  } catch (error) {
    console.log(error);
  }
};

// Sayfa yüklendiğinde verileri çekip tabloya göstermek için
getAllLinks();

// Her bir edit butonuna tıklanınca fillEditModal fonksiyonunu çağır
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("edit-link-btn")) {
    const linkId = event.target.getAttribute("data-linkid");
    fillEditLinkModal(linkId);
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
function fillEditLinkModal(linkId) {
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
    const deleteLinkButton = document.querySelector("#editModalDeleteLink");
    deleteLinkButton.addEventListener("click", () => {
      deleteLinkModal(link._id);
    });
  }
}

function deleteLinkModal(linkId) {
  function deleteLink(linkId) {
    fetch(`/delete-link/${linkId}`, { method: "DELETE" })
      .then((response) => response.json())
      .then((data) => {
        getAllLinks();
        toastCreate("Deleted", "success", data.message);
      })
      .catch((error) => console.log(error));
  }
  var deleteLinkModal = new bootstrap.Modal(
    document.getElementById("deleteLinkModal")
  );
  deleteLinkModal.show();
  const confirmLinkButton = document.querySelector("#confirmDeleteLink");
  confirmLinkButton.addEventListener("click", () => {
    deleteLink(linkId);
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  toastCreate("Copying successful", "success", text);
}

const copyEditLinkBtn = document.querySelector("#copyEditLinkBtn");
copyEditLinkBtn.addEventListener("click", () => {
  const shortLinkText = document.querySelector("#modalShortLink");
  copyToClipboard(shortLinkText.innerText);
});
