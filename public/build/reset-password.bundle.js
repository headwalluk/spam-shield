(() => {
  // public/js/reset-password.js
  function setStatus(el, type, message) {
    if (!el) {
      return;
    }
    el.innerHTML = "";
    const div = document.createElement("div");
    div.className = `alert alert-${type} py-2 mb-0`;
    div.textContent = message;
    el.appendChild(div);
  }
  function validateForm(form) {
    if (!form) {
      return false;
    }
    form.classList.add("was-validated");
    return form.checkValidity();
  }
  async function submitRequest(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const resultEl = document.getElementById("reset-request-result");
    if (!validateForm(form)) {
      setStatus(resultEl, "danger", "Please fix the highlighted fields.");
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch("/api/v3/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: data.email })
      });
      if (res.ok) {
        const payload = await res.json().catch(() => ({}));
        let msg = "If the email exists, a reset link has been sent.";
        if (payload && payload.resetToken) {
          msg += ` Dev token: ${payload.resetToken}`;
        }
        setStatus(resultEl, "success", msg);
        form.reset();
        form.classList.remove("was-validated");
        return;
      }
      setStatus(resultEl, "danger", "Reset request failed.");
    } catch (err) {
      setStatus(resultEl, "danger", "Network error. Please try again.");
    }
  }
  async function submitConsume(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const resultEl = document.getElementById("reset-consume-result");
    if (!validateForm(form)) {
      setStatus(resultEl, "danger", "Please fix the highlighted fields.");
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch("/api/v3/auth/reset-password/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ token: data.token, password: data.password })
      });
      if (res.status === 204) {
        setStatus(resultEl, "success", "Password updated. You can now log in.");
        form.reset();
        form.classList.remove("was-validated");
        return;
      }
      const payload = await res.json().catch(() => ({}));
      if (res.status === 400 && payload.error === "RESET_INVALID") {
        setStatus(resultEl, "warning", "Invalid or expired token.");
        return;
      }
      setStatus(resultEl, "danger", "Reset failed. Please try again.");
    } catch (err) {
      setStatus(resultEl, "danger", "Network error. Please try again.");
    }
  }
  function initFromUrl() {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    if (token) {
      const tokenInput = document.getElementById("reset-token");
      if (tokenInput) {
        tokenInput.value = token;
      }
      const consumeForm = document.getElementById("reset-consume-form");
      if (consumeForm) {
        consumeForm.scrollIntoView({ behavior: "smooth" });
      }
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    const reqForm = document.getElementById("reset-request-form");
    const consumeForm = document.getElementById("reset-consume-form");
    if (reqForm) {
      reqForm.addEventListener("submit", submitRequest);
    }
    if (consumeForm) {
      consumeForm.addEventListener("submit", submitConsume);
    }
    initFromUrl();
  });
})();
//# sourceMappingURL=reset-password.bundle.js.map
