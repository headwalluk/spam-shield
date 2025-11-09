(() => {
  // public/js/admin-dashboard.js
  if (typeof window.assertBootstrapReady === "function") {
    window.assertBootstrapReady("admin-dashboard");
  }
  document.addEventListener("DOMContentLoaded", () => {
    const tilesContainer = document.getElementById("tiles-container");
    const renderTiles = (tiles) => {
      if (!tilesContainer) {
        return;
      }
      tilesContainer.innerHTML = "";
      if (!tiles || tiles.length === 0) {
        tilesContainer.innerHTML = '<p class="text-muted">No items to display.</p>';
        return;
      }
      tiles.forEach((tile) => {
        const tileEl = document.createElement("div");
        tileEl.className = "col-lg-3 col-md-6 mb-4";
        tileEl.innerHTML = `
        <a href="${tile.url}" class="card text-decoration-none h-100">
          <div class="card-body text-center d-flex flex-column justify-content-center">
            <i class="${tile.iconClasses}"></i>
            <h5 class="card-title mt-3">${tile.text}</h5>
          </div>
        </a>
      `;
        tilesContainer.appendChild(tileEl);
      });
    };
    const loadAdminDashboard = async () => {
      try {
        const response = await fetch("/api/v3/state");
        if (!response.ok) {
          throw new Error("Failed to fetch admin state");
        }
        const { sitemap } = await response.json();
        const adminConfig = sitemap.find((item) => item.url === "/admin");
        if (adminConfig && adminConfig.tiles) {
          renderTiles(adminConfig.tiles);
        } else {
          if (tilesContainer) {
            tilesContainer.innerHTML = '<p class="text-warning">You do not have permission to view this page, or it is misconfigured.</p>';
          }
        }
      } catch (error) {
        console.error("Error loading admin dashboard:", error);
        if (tilesContainer) {
          tilesContainer.innerHTML = '<p class="text-danger">Error loading admin dashboard content.</p>';
        }
      }
    };
    loadAdminDashboard();
  });
})();
//# sourceMappingURL=admin-dashboard.bundle.js.map
