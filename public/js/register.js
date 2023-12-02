const form = document.getElementById("registration-form");

form.addEventListener("submit", function (event) {
  event.preventDefault(); // Sayfanın yeniden yüklenmesini engelle

  // Kayıt işlemi için fetch kullanımı
  fetch("/user/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: document.getElementById("name").value,
      username: document.getElementById("username").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(
          "Registration failed. Please check your login credentials."
        );
      }
    })
    .then((data) => {
      // Başarılı kayıt durumunda mesajı göster
      showMessage("success", data.message);

      // Belirli bir süre sonra başka bir sayfaya yönlendir
      setTimeout(function () {
        window.location.href = "/login"; // Yönlendirilecek sayfa
      }, 3000); // 3000 milisaniye (3 saniye)
    })
    .catch((error) => {
      errorText =
        "Registration failed. Please check your login credentials. Error: " +
        error.message;
      // Hata durumunda mesajı göster
      showMessage("danger", errorText);
    });

  function showMessage(type, text) {
    var alertType = type === "success" ? "Success" : "Error";
    var modal = document.querySelector(".modal-content");
    if (type === "success") {
      modal.classList.add(`bg-success`);
    } else {
      modal.classList.add(`bg-danger`);
    }
    var title = document.querySelector(".modal-title");
    var modalText = document.querySelector("#modal-text");

    title.innerText = alertType;
    modalText.innerText = text;

    // Modal içeriğini oluştur
    var myModal = new bootstrap.Modal(document.getElementById("messageModal"));
    myModal.show();
  }
});
