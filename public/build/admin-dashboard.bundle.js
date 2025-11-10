(()=>{typeof window.assertBootstrapReady=="function"&&window.assertBootstrapReady("admin-dashboard");document.addEventListener("DOMContentLoaded",()=>{let e=document.getElementById("tiles-container"),o=t=>{if(e){if(e.innerHTML="",!t||t.length===0){e.innerHTML='<p class="text-muted">No items to display.</p>';return}t.forEach(a=>{let n=document.createElement("div");n.className="col-lg-3 col-md-6 mb-4",n.innerHTML=`
        <a href="${a.url}" class="card text-decoration-none h-100">
          <div class="card-body text-center d-flex flex-column justify-content-center">
            <i class="${a.iconClasses}"></i>
            <h5 class="card-title mt-3">${a.text}</h5>
          </div>
        </a>
      `,e.appendChild(n)})}};(async()=>{try{let t=await fetch("/api/v3/state");if(!t.ok)throw new Error("Failed to fetch admin state");let{sitemap:a}=await t.json(),n=a.find(i=>i.url==="/admin");n&&n.tiles?o(n.tiles):e&&(e.innerHTML='<p class="text-warning">You do not have permission to view this page, or it is misconfigured.</p>')}catch(t){console.error("Error loading admin dashboard:",t),e&&(e.innerHTML='<p class="text-danger">Error loading admin dashboard content.</p>')}})()});})();
