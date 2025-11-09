(() => {
  // public/js/api-keys.js
  if (typeof window.assertBootstrapReady === "function") {
    window.assertBootstrapReady("api-keys");
  }
  var Modal = window.bootstrap ? window.bootstrap.Modal : null;
  document.addEventListener("DOMContentLoaded", () => {
    const createKeyBtn = document.getElementById("createKeyBtn");
    const loadingSpinner = document.getElementById("loadingSpinner");
    const apiKeysTable = document.getElementById("apiKeysTable");
    const tableBody = apiKeysTable.querySelector("tbody");
    const toastContainer = document.querySelector(".toast-container");
    const keyModalEl = document.getElementById("keyModal");
    const keyModal = Modal ? Modal.getOrCreateInstance(keyModalEl) : null;
    const keyModalLabel = document.getElementById("keyModalLabel");
    const keyForm = document.getElementById("keyForm");
    const keyIdInput = document.getElementById("keyId");
    const keyLabelInput = document.getElementById("keyLabel");
    const showKeyModalEl = document.getElementById("showKeyModal");
    const showKeyModal = Modal ? Modal.getOrCreateInstance(showKeyModalEl) : null;
    const newApiKeyInput = document.getElementById("newApiKey");
    const copyKeyBtn = document.getElementById("copyKeyBtn");
    const showToast = (message, type = "success") => {
      const toastEl = document.createElement("div");
      toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
      toastEl.role = "alert";
      toastEl.ariaLive = "assertive";
      toastEl.ariaAtomic = "true";
      toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
      if (!toastContainer) {
        console.error("Toast container not found!");
        return;
      }
      toastContainer.appendChild(toastEl);
      if (window.bootstrap) {
        const toast = new window.bootstrap.Toast(toastEl, { autohide: true, delay: 5e3 });
        toast.show();
        toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
      }
    };
    const showLoadingSpinner = () => {
      loadingSpinner.classList.remove("d-none", "fade");
    };
    const hideLoadingSpinner = () => {
      loadingSpinner.classList.add("fade");
      setTimeout(() => {
        loadingSpinner.classList.add("d-none");
      }, 150);
    };
    const fetchKeys = async () => {
      showLoadingSpinner();
      try {
        const response = await fetch("/api/v3/api-keys");
        if (!response.ok) {
          throw new Error("Failed to fetch API keys");
        }
        const keys = await response.json();
        renderTable(keys);
      } catch (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan="2" class="text-center text-danger">Error loading API keys.</td></tr>`;
      } finally {
        hideLoadingSpinner();
      }
    };
    const renderTable = (keys) => {
      tableBody.innerHTML = "";
      if (keys.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="2" class="text-center text-muted">No API keys found.</td></tr>`;
        return;
      }
      keys.forEach((key) => {
        const row = document.createElement("tr");
        row.dataset.keyId = key.id;
        row.innerHTML = `
        <td>${key.label}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary edit-btn" data-id="${key.id}" data-label="${key.label}" title="Edit key">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${key.id}" title="Delete key">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
        tableBody.appendChild(row);
      });
    };
    keyModalEl.addEventListener("show.bs.modal", (event) => {
      const button = event.relatedTarget;
      const id = button ? button.getAttribute("data-id") : null;
      const label = button ? button.getAttribute("data-label") : "";
      keyForm.reset();
      keyIdInput.value = id || "";
      keyLabelInput.value = label || "";
      keyModalLabel.textContent = id ? "Edit API Key" : "Create API Key";
    });
    keyModalEl.addEventListener("shown.bs.modal", () => {
      keyLabelInput.focus();
    });
    keyForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = keyIdInput.value;
      const label = keyLabelInput.value;
      const url = id ? `/api/v3/api-keys/${id}` : "/api/v3/api-keys";
      const method = id ? "PUT" : "POST";
      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label })
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Failed to save key" }));
          throw new Error(errorData.message);
        }
        keyModal.hide();
        keyModalEl.addEventListener(
          "hidden.bs.modal",
          async () => {
            if (method === "POST") {
              const { apiKey } = await response.json();
              newApiKeyInput.value = apiKey;
              showKeyModal.show();
            } else {
              showToast("API Key updated successfully.");
              await fetchKeys();
            }
          },
          { once: true }
        );
      } catch (error) {
        console.error(error);
        showToast(error.message || "Error saving API key.", "danger");
      }
    });
    const deleteKey = async (id) => {
      if (!confirm("Are you sure you want to delete this API key?")) {
        return;
      }
      try {
        const response = await fetch(`/api/v3/api-keys/${id}`, { method: "DELETE" });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Failed to delete key" }));
          throw new Error(errorData.message);
        }
        showToast("API Key deleted successfully.");
        await fetchKeys();
      } catch (error) {
        console.error(error);
        showToast(error.message || "Error deleting API key.", "danger");
      }
    };
    createKeyBtn.addEventListener("click", () => {
      keyModal.show();
    });
    tableBody.addEventListener("click", (e) => {
      const editBtn = e.target.closest(".edit-btn");
      if (editBtn) {
        const modalTrigger = document.createElement("button");
        modalTrigger.style.display = "none";
        modalTrigger.setAttribute("data-bs-toggle", "modal");
        modalTrigger.setAttribute("data-bs-target", "#keyModal");
        modalTrigger.setAttribute("data-id", editBtn.dataset.id);
        modalTrigger.setAttribute("data-label", editBtn.dataset.label);
        document.body.appendChild(modalTrigger);
        modalTrigger.click();
        document.body.removeChild(modalTrigger);
        return;
      }
      const deleteBtn = e.target.closest(".delete-btn");
      if (deleteBtn) {
        deleteKey(deleteBtn.dataset.id);
      }
    });
    copyKeyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(newApiKeyInput.value).then(
        () => {
          const originalIcon = copyKeyBtn.innerHTML;
          copyKeyBtn.innerHTML = '<i class="bi bi-check-lg"></i>';
          showToast("Copied to clipboard!");
          setTimeout(() => {
            copyKeyBtn.innerHTML = originalIcon;
          }, 2e3);
        },
        () => {
          showToast("Failed to copy.", "danger");
        }
      );
    });
    showKeyModalEl.addEventListener("hidden.bs.modal", fetchKeys);
    fetchKeys();
  });
})();
//# sourceMappingURL=api-keys.bundle.js.map
