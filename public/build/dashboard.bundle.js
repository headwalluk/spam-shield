(() => {
  // public/js/dashboardPage.js
  function getJSON(url) {
    return fetch(url, {
      credentials: "same-origin",
      headers: { Accept: "application/json" }
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text();
        throw new Error(t || `HTTP ${r.status}`);
      }
      return r.json();
    });
  }
  function postJSON(url, data = {}) {
    return fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text();
        throw new Error(t || `HTTP ${r.status}`);
      }
      return r.json().catch(() => ({}));
    });
  }
  async function loadUser() {
    const userInfoEl = document.getElementById("userInfo");
    try {
      const me = await getJSON("/api/v3/auth/me");
      userInfoEl.textContent = JSON.stringify(me, null, 2);
      await loadApiKeys();
    } catch (e) {
      userInfoEl.textContent = "Not authenticated";
    }
  }
  async function loadApiKeys() {
    const listEl = document.getElementById("apiKeys");
    listEl.innerHTML = "";
    const item = document.createElement("li");
    item.className = "list-group-item";
    item.textContent = "API keys listing TBD";
    listEl.appendChild(item);
  }
  var issueBtn = document.getElementById("issueKeyBtn");
  if (issueBtn) {
    issueBtn.addEventListener("click", async () => {
      try {
        await postJSON("/api/v3/auth/issue-key");
        await loadUser();
      } catch (e) {
        alert(`Failed to issue key: ${e.message}`);
      }
    });
  }
  var logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await postJSON("/api/v3/auth/logout");
        window.location.href = "/html/login.html";
      } catch (e) {
        alert("Logout failed");
      }
    });
  }
  loadUser();
})();
//# sourceMappingURL=dashboard.bundle.js.map
