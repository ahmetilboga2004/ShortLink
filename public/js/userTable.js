let allUsersData;

const getAllUsers = (searchValue = "") => {
  try {
    fetch("/get-all-users")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        const userCountDiv = document.querySelector("#userCount");
        let countUser = data.length > 0 ? data.length : 0;
        userCountDiv.innerHTML = `Total ${countUser} Rows`;

        const notUser = document.querySelector("#notUsers");
        allUsersData = data;
        const userTableBody = document.querySelector("#userTable tbody");
        // Tabloyu temizle
        userTableBody.innerHTML = "";
        if (data.length > 0) {
          notUser.innerText = "";
          // Eğer bir searchValue varsa, filtreleme yap
          if (searchValue.length > 0) {
            data = data.filter(
              (user) =>
                user.fullname
                  .toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
                user.role.toLowerCase().includes(searchValue.toLowerCase())
            );
          }
          data.forEach((user) => {
            const row = userTableBody.insertRow();
            row.innerHTML = `
                <td data-key="Fullname">${user.fullname}</td>
                <td data-key="Email">${user.email}</td>
                <td data-key="Role">${user.role}</td>
                <td data-key="LastLogin">${user.lastLogin}</td>
                <td>
                  <button type="button" class="btn btn-outline-secondary edit-user-btn" data-userid="${user._id}">✏️</button>
                </td>
                <td>
                  <button type="button" class="btn btn-outline-danger delete-user-btn" data-userid="${user._id}">🗑️</button>
                </td>
              `;
          });
        } else {
          notUser.innerText = "Kullanıcı Bulunamadı";
        }
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
};

getAllUsers();

// Yenile butonuna tıklandığında tabloyu yeniden doldur
const refreshUserButton = document.getElementById("refreshUserButton");
refreshUserButton.addEventListener("click", () => {
  getAllUsers();
});

// Arama inputu değiştiğinde tabloyu güncellemek için
const searchUserInput = document.getElementById("searchUserInput");
searchUserInput.addEventListener("input", function () {
  const searchValue = this.value.trim().toLowerCase();
  getAllUsers(searchValue);
});

// Her bir edit butonuna tıklanınca fillEditModal fonksiyonunu çağır
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("edit-user-btn")) {
    console.log("Edit butonuna tıklandı...", event);
    const userId = event.target.getAttribute("data-userid");
    console.log("User id yi aldık", userId);
    fillEditUserModal(userId);
  }
});

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("delete-user-btn")) {
    const userId = event.target.getAttribute("data-userid");
    deleteUserModal(userId);
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
function fillEditUserModal(userId) {
  const user = allUsersData.find((item) => item._id === userId);
  console.log(user);

  if (user) {
    // Modal içindeki alanlara verileri yerleştir
    const userFullname = document.getElementById("modalUserFullname");
    const userEmail = document.getElementById("modalUserEmail");
    const userRole = document.getElementById("modalUserRole");
    const userVerify = document.getElementById("modalUserVerify");
    const userLastLogin = document.getElementById("modalUserLastLogin");
    const userCreatedAt = document.getElementById("modalUserCreatedAt");

    userFullname.innerHTML = user.fullname;
    userEmail.innerHTML = user.email;
    userRole.innerHTML = user.role;

    userVerify.innerHTML = user.isVerified ? "Doğrulandı" : "Doğrulanmadı";
    if (!user.lastLogin) {
      userLastLogin.innerHTML = "Bilinmiyor";
    } else {
      userLastLogin.innerHTML = formatAndDisplayDate(user.lastLogin);
    }

    userCreatedAt.innerHTML = formatAndDisplayDate(user.createdAt);

    // Diğer alanlara da verileri yerleştirin

    // Modal'ı aç
    var editUserModal = new bootstrap.Modal(
      document.getElementById("editUserModal")
    );
    editUserModal.show();

    // Delete butonuna tıklanınca deleteLinkModal fonksiyonunu çağır
    const deleteButton = document.querySelector("#editModalDeleteUser");
    deleteButton.addEventListener("click", () => {
      deleteUserModal(user._id);
    });
  }
}

function deleteUserModal(userId) {
  function deleteUser(userId) {
    fetch(`/${userId}`, { method: "DELETE" })
      .then((response) => response.json())
      .then((data) => {
        getAllUsers();
        toastCreate("Deleted", "success", data.message);
      })
      .catch((error) => console.log(error));
  }
  var deleteUserModal = new bootstrap.Modal(
    document.getElementById("deleteUserModal")
  );
  deleteUserModal.show();
  const confirmButton = document.querySelector("#confirmDeleteUser");
  confirmButton.addEventListener("click", () => {
    deleteUser(userId);
  });
}

const userTable = document.getElementById("userTable");
const headersUser = userTable.querySelectorAll("th.sortable");
let sortUserDirection = {};
const iconUserSortUp = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sort-up" viewBox="0 0 16 16">
<path d="M3.5 12.5a.5.5 0 0 1-1 0V3.707L1.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L3.5 3.707zm3.5-9a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1z"/>
</svg>`;
const iconUserSortDown = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sort-down" viewBox="0 0 16 16">
<path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 11.293zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1z"/>
</svg>`;

for (const header of headersUser) {
  const headerUserName = header.innerHTML;
  header.innerHTML = headerUserName + " " + iconUserSortDown;
  header.addEventListener("click", () => {
    const headerUserSvg = header.querySelector("svg");
    if (headerUserSvg.classList.contains("bi-sort-down")) {
      header.innerHTML = headerUserName + " " + iconUserSortUp;
    } else {
      header.innerHTML = headerUserName + " " + iconUserSortDown;
    }
    const userSortKey = header.getAttribute("data-key");
    const userRows = Array.from(userTable.querySelectorAll("tbody tr"));

    if (
      !sortUserDirection[userSortKey] ||
      sortUserDirection[userSortKey] === "desc"
    ) {
      sortUserDirection[userSortKey] = "asc";
    } else {
      sortUserDirection[userSortKey] = "desc";
    }

    userRows.sort((a, b) => {
      const userValueA = a.querySelector(
        `td[data-key="${userSortKey}"]`
      ).innerText;
      const userValueB = b.querySelector(
        `td[data-key="${userSortKey}"]`
      ).innerText;

      if (userValueA < userValueB) {
        return sortUserDirection[userSortKey] === "asc" ? -1 : 1;
      } else if (userValueA > userValueB) {
        return sortUserDirection[userSortKey] === "asc" ? 1 : -1;
      } else {
        return 0;
      }
    });

    userTable.querySelector("tbody").innerHTML = userRows.reduce(
      (innerHTML, row) => innerHTML + row.outerHTML,
      ""
    );
  });
}
