(()=>{async function v(e,n={}){let t=await fetch(e,{credentials:"same-origin",...n});if(!t.ok){let a=await t.text().catch(()=>"");throw new Error(`${t.status} ${t.statusText} ${a}`.trim())}return t.json()}function d(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function y(e,...n){return e.reduce((t,a,i)=>t+a+(i<n.length?String(n[i]):""),"")}var r={page:1,pageSize:10,q:""};function $(e){if(!e)return"";let n=e.trim().toUpperCase();return/^[A-Z]{2}$/.test(n)?n.split("").map(t=>String.fromCodePoint(127397+t.charCodeAt(0))).join(""):""}function x(e,n){let t=n==null?"":String(n);return t?`<span class="badge text-bg-secondary me-1">${d(e)}: ${d(t)}</span>`:""}function S(e){let n=e.sender_ip||"",t=e.sender_country||"",a=Number(e.time_to_result)||0,i="";try{let c=typeof e.message_fields=="string"?JSON.parse(e.message_fields):e.message_fields;if(c&&typeof c=="object")for(let[u,h]of Object.entries(c))i+=x(u,h)}catch{}let s=[];n&&s.push(`<span title="Sender IP">${d(n)}</span>`),t&&s.push(`<span title="Country">${$(t)} ${d(t)}</span>`);let p=s.join(" \xB7 "),l=d(e.message_body||""),g=e.event_time?new Date(e.event_time).toLocaleString():"",o=e.is_spam?'<span class="badge text-bg-danger">Spam</span>':e.is_ham?'<span class="badge text-bg-success">Ham</span>':"";return y` <div class="col-12">
    <div class="card h-100">
      <div class="card-header d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-2">
          ${o}
          <span>${p||'<span class="text-muted">Unknown sender</span>'}</span>
        </div>
        <div>${i}</div>
      </div>
      <div class="card-body">
        <pre class="mb-0" style="white-space: pre-wrap;">${l}</pre>
      </div>
      <div class="card-footer d-flex justify-content-between align-items-center small text-muted">
        <span>${g}</span>
        <span title="Classification time">${a} ms</span>
      </div>
    </div>
  </div>`}function f(e){let n=document.getElementById("messagesPagination");n.innerHTML="";let{currentPage:t,totalPages:a}=e;function i(s,p,l=!1,g=!1){let o=document.createElement("li");o.className=`page-item${l?" disabled":""}${g?" active":""}`;let c=document.createElement("a");c.className="page-link",c.href="#",c.textContent=p,c.addEventListener("click",u=>{u.preventDefault(),!(l||g)&&(r.page=s,m())}),o.appendChild(c),n.appendChild(o)}i(Math.max(1,t-1),"Prev",t<=1);for(let s=1;s<=a;s++)i(s,String(s),!1,s===t);i(Math.min(a,t+1),"Next",t>=a)}async function m(){let e=document.getElementById("messagesStatus"),n=document.getElementById("messagesList");e.textContent="Loading\u2026",n.innerHTML="";let t=new URLSearchParams;t.set("page",String(r.page)),t.set("pageSize",String(r.pageSize)),r.q&&t.set("q",r.q);try{let a=await v(`/api/dash/messages?${t.toString()}`),{items:i,pagination:s}=a;if(!i||i.length===0){e.textContent="No messages found",f(s);return}e.textContent=`${s.total} total, page ${s.currentPage} of ${s.totalPages}`,n.innerHTML=i.map(S).join(""),f(s)}catch(a){e.textContent="Failed to load messages",console.error(a)}}function b(){let e=document.getElementById("searchForm"),n=document.getElementById("searchQuery"),t=document.getElementById("clearSearch");e.addEventListener("submit",a=>{a.preventDefault(),r.q=n.value.trim(),r.page=1,m()}),t.addEventListener("click",()=>{n.value="",r.q="",r.page=1,m()})}document.addEventListener("DOMContentLoaded",()=>{b(),m()});})();
