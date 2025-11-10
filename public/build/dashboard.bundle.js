(()=>{typeof window.assertBootstrapReady=="function"&&window.assertBootstrapReady("dashboard");document.addEventListener("DOMContentLoaded",()=>{let o=document.getElementById("tiles-container"),n=t=>{if(o){if(o.innerHTML="",!t||t.length===0){o.innerHTML='<p class="text-muted">No items to display.</p>';return}t.forEach(a=>{let e=document.createElement("div");e.className="col-lg-3 col-md-6 mb-4",e.innerHTML=`
        <a href="${a.url}" class="card text-decoration-none h-100">
          <div class="card-body text-center d-flex flex-column justify-content-center">
            <i class="${a.iconClasses}"></i>
            <h5 class="card-title mt-3">${a.text}</h5>
          </div>
        </a>
      `,o.appendChild(e)})}};(async()=>{try{let t=await fetch("/api/v3/state");if(!t.ok)throw new Error("Failed to fetch dashboard state");let{sitemap:a}=await t.json(),e=a.find(r=>r.url==="/dash");if(e&&e.tiles)n(e.tiles);else throw new Error("Dashboard configuration not found")}catch(t){console.error("Error loading dashboard:",t),o&&(o.innerHTML='<p class="text-danger">Error loading dashboard content.</p>')}})()});})();
