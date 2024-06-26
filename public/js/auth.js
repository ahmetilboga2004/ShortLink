(function () {
  "use strict";
  // Bayrak (flag) tanımla
  let isSubmitPending = false;
  // auth.js dosyanızın başına ekleyin
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const email = urlParams.get("email");
  const key = urlParams.get("key");

  const url = `/reset-forgot-password?email=${encodeURIComponent(
    email
  )}&key=${encodeURIComponent(key)}`;
  const formBehaviors = {
    loginForm: {
      endpoint: "/login",
      successCallback: (data) => {
        toastCreate("Login successful", "success", data.message);
        setInterval(() => {
          window.location.href = "/dashboard";
        }, 2000);
      },
      errorCallback: (data) => {
        // Hata mesajını göster
        toastCreate("Login failed", "warning", data.message);

        // Sunucudan dönen ek hata bilgisini konsola yazdır
        console.error("Server error:", data.message);
      },
    },
    registerForm: {
      endpoint: "/register",
      successCallback: (data) => {
        toastCreate("Registration successful", "success", data.message);
        setInterval(() => {
          window.location.href = "/login";
        }, 1500);
      },
      errorCallback: (data) => {
        // Hata mesajlarını göster
        if (data.errors) {
          Object.keys(data.errors).forEach((errorKey) => {
            const errorMessage = data.errors[errorKey];
            toastCreate("Registration Failed", "warning", errorMessage);
          });
        }
      },
    },
    contactForm: {
      endpoint: "/contact-form",
      successCallback: (data) => {
        console.log("Mesaj başarıyla gönderildi");
        toastCreate("Message Successful", "success", data.message);
        var button = document.querySelector("#submitContactButton");
        button.disabled = true;
        setInterval(() => {
          button.disabled = false;
        }, 10000);
      },
      errorCallback: (data) => {
        console.log(data);
        console.log(data.errors);
        // Hata mesajlarını göster
        if (data.errors) {
          Object.keys(data.errors).forEach((errorKey) => {
            const errorMessage = data.errors[errorKey];
            toastCreate("Message Failed", "warning", errorMessage);
          });
        }
      },
    },
    shortLinkForm: {
      endpoint: "/short-link",
      successCallback: (data) => {
        getAllLinks();
        toastCreate("Link Shortened", "success", data.message);
      },
      errorCallback: (data) => {
        // Hata mesajını göster
        toastCreate("Short Link Failed", "warning", data.message);
      },
    },
    resetForm: {
      endpoint: "/reset",
      successCallback: (data) => {
        toastCreate("Password reset", "success", data.message);
        setInterval(() => {
          window.location.href = "/";
        }, 1500);
      },
      errorCallback: (data) => {
        console.log(data);
        // Hata mesajını göster
        toastCreate("Password not reset", "warning", data.message);
      },
    },
    forgotForm: {
      endpoint: "/forgot",
      successCallback: (data) => {
        toastCreate("Reset link sent", "success", data.message);
        setInterval(() => {
          window.location.href = "/login";
        }, 2000);
      },
      errorCallback: (data) => {
        console.log(data);
        // Hata mesajını göster
        toastCreate("Failed to send reset link", "warning", data.message);
      },
    },
    resetForgotPasswordForm: {
      endpoint: url,
      successCallback: (data) => {
        toastCreate("Reset link sent", "success", data.message);
        setInterval(() => {
          window.location.href = "/login";
        }, 2000);
      },
      errorCallback: (data) => {
        console.log(data);
        // Hata mesajını göster
        toastCreate("Failed to send reset link", "warning", data.message);
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
        formBehavior.errorCallback(error.message);
        // İşlem tamamlandıktan sonra bayrağı sıfırla
        isSubmitPending = false;
      });
  };
})();

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

const changeInput = document.querySelector("#fileInput");
const profileImage = document.querySelector("#profile-photo");
if (changeInput) {
  changeInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch("/upload-profile", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (data.success) {
          console.log(data);
          console.log(data.message);
          toastCreate("Upload successful", "success", data.message);
          toastCreate(
            "Upload successful",
            "success",
            "Değişiklikleri görmek için sayfayı yenileyin lütfen."
          );
          console.log(data.upload);
          profileImage.src = data.upload;
        } else {
          console.log(data);
          console.log(data.message);
          toastCreate("Upload failed", "warning", data.message);
        }
      } catch (error) {
        toastCreate("Upload failed", "warning", error.message);
      }
    }
  });
}
