(function () {
  "use strict";
  // Bayrak (flag) tanımla
  let isSubmitPending = false;

  const formBehaviors = {
    loginForm: {
      endpoint: "/login",
      successCallback: (data) => {
        toastCreate("Login successful", data.message);
        setInterval(() => {
          window.location.href = "/dashboard";
        }, 1500);
      },
      errorCallback: (data) => {
        // Hata mesajını göster
        toastCreate("Login failed", data.message);

        // Sunucudan dönen ek hata bilgisini konsola yazdır
        console.error("Server error:", data.message);
      },
    },
    registerForm: {
      endpoint: "/register",
      successCallback: (data) => {
        toastCreate("Registration successful", data.message);
        setInterval(() => {
          window.location.href = "/login";
        }, 1500);
      },
      errorCallback: (data) => {
        // Hata mesajlarını göster
        data.errors.forEach((error) => {
          toastCreate("Registration failed", error);
        });
      },
    },
    // Diğer formlar için benzer davranışları ekleyebilirsiniz
  };

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        } else {
          // Form doğrulama işlemi yapılmışsa submit bayrağını true yap
          isSubmitPending = true;

          // Form submit işlemini başlat
          submitForm(event, form);
        }
        form.classList.add("was-validated");
      },
      false
    );
  });
  const submitForm = (event, form) => {
    event.preventDefault();
    const formData = new FormData(form);
    const formBehavior = formBehaviors[form.id];

    // Fetch API kullanarak verileri Express.js server'ına gönderme
    fetch(formBehavior.endpoint, {
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
        if (data.success) {
          formBehavior.successCallback(data);
        } else {
          formBehavior.errorCallback(data);
        }

        // İşlem tamamlandıktan sonra bayrağı sıfırla
        isSubmitPending = false;
      })
      .catch((error) => {
        console.error("Error sending data to server:", error);
        formBehavior.errorCallback(data);
        // İşlem tamamlandıktan sonra bayrağı sıfırla
        isSubmitPending = false;
      });
  };

  // Toast oluşturma fonksiyonu
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
        <div class="me-auto">${success}</div>
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
})();
