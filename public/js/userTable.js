let allUsersData;

const getCurrentUser = async () => {
  try {
    const response = await fetch("/get-current-user");
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Oturum bilgisi alınamadı:", error);
    throw error; // hatayı yeniden fırlat, bu sayede çağıran kod hatayı ele alabilir
  }
};

const getAllUsers = async () => {
  try {
    let currentUser = await getCurrentUser();
    let response = await fetch("/get-all-users");
    let data = await response.json();

    allUsersData = data;
    const userTableBody = document.querySelector("#userTable tbody");
    // Tabloyu temizle
    userTableBody.innerHTML = "";
    if (data.length > 0) {
      data.forEach((user) => {
        if (user._id !== currentUser._id) {
          const row = userTableBody.insertRow();
          if (!user.lastLogin) {
            lastLoginUser = "Bilinmiyor";
          } else {
            lastLoginUser = formatAndDisplayDate(user.lastLogin);
          }
          row.innerHTML = `
            <td data-key="Fullname">${user.fullname}</td>
            <td data-key="Email">${user.email}</td>
            <td data-key="Role">${user.role}</td>
            <td data-key="LastLogin">${lastLoginUser}</td>
            <td>
              <button type="button" class="btn btn-outline-secondary edit-user-btn" data-userid="${user._id}">✏️</button>
            </td>
            <td>
              <button type="button" class="btn btn-outline-danger delete-user-btn" data-userid="${user._id}">🗑️</button>
            </td>
          `;
        }
      });
    }
    $(document).ready(function () {
      $("#userTable").DataTable({
        responsive: false,
        scrollX: true,
        //disable sorting on last column
        columnDefs: [{ orderable: false, targets: [4, 5] }],
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

getAllUsers();

// Her bir edit butonuna tıklanınca fillEditModal fonksiyonunu çağır
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("edit-user-btn")) {
    const userId = event.target.getAttribute("data-userid");
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
const fillEditUserModal = async (userId) => {
  let currentUser = await getCurrentUser();
  const user = allUsersData.find((item) => item._id === userId);

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

    if (user.role === "admin") {
      userRole.innerHTML = user.role;
    } else if (currentUser.role === "admin" && user.role !== "admin") {
      userRole.innerHTML = `<select class="form-select" id="roleSelect" data-user-id="${userId}" aria-label="Select User Role">
      <option value="${user.role}" selected disabled>${user.role}</option>
      <option value="admin">Admin</option>
      <option value="mod">Mod</option>
      <option value="user">User</option>
    </select>`;
    } else if (currentUser.role === "mod" && user.role !== "admin") {
      userRole.innerHTML = `<select class="form-select" id="roleSelect" data-user-id="${userId}" aria-label="Select User Role">
      <option value="${user.role}" selected disabled>${user.role}</option>
      <option value="mod">Mod</option>
      <option value="user">User</option>
    </select>`;
    }
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
    // roleSelect elementini seç
    const roleSelect = document.getElementById("roleSelect");

    if (roleSelect) {
      // roleSelect elementinin değişiklik olayına olay dinleyici ekle
      roleSelect.addEventListener("change", async (event) => {
        // Seçilen değeri al
        const selectedRole = event.target.value;
        const selectedUserId = event.target.getAttribute("data-user-id");

        // Seçilen değeri işle, örneğin bir API'ye gönder veya başka bir işlem yap
        const response = await fetch(`/change-role/${selectedUserId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newRole: selectedRole }),
        });
        const data = await response.json();
        if (data.success) {
          toastCreate("Role Changed", "success", data.message);
          getAllUsers();
        } else {
          toastCreate("Role Changed", "danger", data.message);
        }
      });
    }

    // Delete butonuna tıklanınca deleteLinkModal fonksiyonunu çağır
    const deleteUserButton = document.querySelector("#editModalDeleteUser");
    deleteUserButton.addEventListener("click", () => {
      deleteUserModal(user._id);
    });
  }
};

function deleteUserModal(userId) {
  function deleteUser(userId) {
    fetch(`/delete-user/${userId}`, { method: "DELETE" })
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
  const confirmUserButton = document.querySelector("#confirmDeleteUser");
  confirmUserButton.addEventListener("click", () => {
    deleteUser(userId);
  });
}
