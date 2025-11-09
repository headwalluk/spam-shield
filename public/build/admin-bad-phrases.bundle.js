(() => {
  // public/js/lib/toast.js
  function showToast(message, { variant = "primary", delay = 4e3 } = {}) {
    const container = document.querySelector(".toast-container");
    if (!container) {
      console.warn("[toast] Missing .toast-container");
      return;
    }
    const el = document.createElement("div");
    el.className = `toast align-items-center text-bg-${variant} border-0`;
    el.role = "alert";
    el.ariaLive = "assertive";
    el.ariaAtomic = "true";
    el.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
    container.appendChild(el);
    if (window.bootstrap && window.bootstrap.Toast) {
      const toast = new window.bootstrap.Toast(el, { autohide: true, delay });
      toast.show();
      el.addEventListener("hidden.bs.toast", () => el.remove());
    }
  }

  // public/js/admin-bad-phrases.js
  (function() {
    const PAGE_SIZE = 10;
    let currentPage = 1;
    let currentSearch = "";
    const tbody = document.getElementById("phrasesTableBody");
    const paginationUl = document.getElementById("pagination");
    const loadingSpinner = document.getElementById("loadingSpinner");
    const phraseModalEl = document.getElementById("phraseModal");
    let phraseModal = null;
    if (phraseModalEl && window.bootstrap) {
      phraseModal = window.bootstrap.Modal.getOrCreateInstance(phraseModalEl);
    }
    const phraseForm = document.getElementById("phraseForm");
    const phraseInput = document.getElementById("phraseInput");
    const scoreInput = document.getElementById("scoreInput");
    const phraseIdInput = document.getElementById("phraseIdInput");
    const modalTitle = phraseModalEl.querySelector(".modal-title");
    function showLoadingSpinner() {
      loadingSpinner.classList.remove("d-none", "fade");
    }
    function hideLoadingSpinner() {
      loadingSpinner.classList.add("fade");
      setTimeout(() => loadingSpinner.classList.add("d-none"), 150);
    }
    function renderPagination(pagination) {
      const totalPages = pagination.totalPages || 1;
      paginationUl.innerHTML = "";
      if (totalPages <= 1) {
        return;
      }
      const windowSize = 5;
      const start = Math.max(1, currentPage - Math.floor(windowSize / 2));
      const end = Math.min(totalPages, start + windowSize - 1);
      const addPage = (i, label = null, disabled = false) => {
        const li = document.createElement("li");
        li.className = `page-item ${i === currentPage ? "active" : ""} ${disabled ? "disabled" : ""}`;
        const a = document.createElement("a");
        a.className = "page-link";
        a.href = "#";
        a.textContent = label || i;
        a.addEventListener("click", (e) => {
          e.preventDefault();
          if (disabled) {
            return;
          }
          currentPage = i;
          fetchPage();
        });
        li.appendChild(a);
        paginationUl.appendChild(li);
      };
      addPage(1, "\xAB", currentPage === 1);
      addPage(Math.max(1, currentPage - 1), "\u2039", currentPage === 1);
      for (let i = start; i <= end; i++) {
        addPage(i);
      }
      addPage(Math.min(totalPages, currentPage + 1), "\u203A", currentPage === totalPages);
      addPage(totalPages, "\xBB", currentPage === totalPages);
    }
    function renderTable() {
      tbody.innerHTML = "";
      if (!window.__phrasesPage || !Array.isArray(window.__phrasesPage.items) || window.__phrasesPage.items.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = '<td colspan="3" class="text-muted">No phrases found.</td>';
        tbody.appendChild(tr);
      } else {
        window.__phrasesPage.items.forEach((p) => tbody.appendChild(rowFor(p)));
      }
      renderPagination(window.__phrasesPage.pagination);
    }
    function rowFor(p) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
      <td>${p.phrase}</td>
      <td>${Number(p.score)}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary" data-edit-phrase data-id="${p.id}" title="Edit" data-bs-toggle="modal" data-bs-target="#phraseModal">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" data-delete-phrase data-id="${p.id}" title="Delete">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
      return tr;
    }
    async function fetchPage() {
      showLoadingSpinner();
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(PAGE_SIZE),
          search: currentSearch
        });
        const res = await fetch(`/api/v3/bad-phrases?${params.toString()}`, {
          credentials: "same-origin"
        });
        if (!res.ok) {
          throw new Error(`${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        window.__phrasesPage = data;
        renderTable();
      } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="3" class="text-danger">Error loading phrases.</td></tr>';
      } finally {
        hideLoadingSpinner();
      }
    }
    document.getElementById("searchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      currentSearch = document.getElementById("phraseSearchInput").value || "";
      currentPage = 1;
      currentPage = 1;
      fetchPage();
    });
    phraseModalEl.addEventListener("show.bs.modal", (event) => {
      const button = event.relatedTarget;
      const id = button ? button.getAttribute("data-id") : null;
      phraseForm.reset();
      phraseIdInput.value = "";
      if (id) {
        const existing = window.__phrasesPage.items.find((x) => String(x.id) === String(id));
        if (existing) {
          modalTitle.textContent = "Edit Phrase";
          phraseIdInput.value = existing.id;
          phraseInput.value = existing.phrase;
          scoreInput.value = existing.score;
        }
      } else {
        modalTitle.textContent = "Create Phrase";
      }
    });
    phraseModalEl.addEventListener("shown.bs.modal", () => {
      if (phraseInput) {
        phraseInput.focus();
        const val = phraseInput.value;
        phraseInput.value = "";
        phraseInput.value = val;
      }
    });
    phraseForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = phraseIdInput.value;
      const method = id ? "PUT" : "POST";
      const url = id ? `/api/v3/bad-phrases/${id}` : "/api/v3/bad-phrases";
      const payload = { phrase: phraseInput.value.trim(), score: Number(scoreInput.value || 0.5) };
      try {
        showLoadingSpinner();
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Save failed");
        }
        phraseModalEl.addEventListener(
          "hidden.bs.modal",
          () => {
            const backdrop = document.querySelector(".modal-backdrop");
            if (backdrop) {
              backdrop.remove();
            }
            showToast("Saved", { variant: "success" });
            fetchPage();
          },
          { once: true }
        );
        if (phraseModal) {
          phraseModal.hide();
        }
      } catch (err) {
        console.error(err);
        showToast(err.message || "Error saving", { variant: "danger" });
      } finally {
        hideLoadingSpinner();
      }
    });
    document.body.addEventListener("click", async (e) => {
      const delBtn = e.target.closest("[data-delete-phrase]");
      const editBtn = e.target.closest("[data-edit-phrase]");
      if (delBtn) {
        const id = delBtn.getAttribute("data-id");
        if (!confirm("Delete this phrase?")) {
          return;
        }
        try {
          showLoadingSpinner();
          const res = await fetch(`/api/v3/bad-phrases/${id}`, {
            method: "DELETE",
            credentials: "same-origin"
          });
          if (!res.ok) {
            throw new Error("Delete failed");
          }
          showToast("Deleted", { variant: "success" });
          fetchPage();
        } catch (err) {
          console.error(err);
          showToast("Delete failed", { variant: "danger" });
        } finally {
          hideLoadingSpinner();
        }
      }
      if (editBtn) {
      }
    });
    document.addEventListener("DOMContentLoaded", fetchPage);
  })();
})();
//# sourceMappingURL=admin-bad-phrases.bundle.js.map
