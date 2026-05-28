/* ═══════════════════════════════════════════════════════════
   Thinkcap Advisors CRM — app.js  v4
   Full interlinking · Activities everywhere · Competitors
   Universal search · Field validation · Reminders
   ═══════════════════════════════════════════════════════════ */

/* ── Constants ─────────────────────────────────────────── */
const STAGES=['New','Contacted','Qualified','Presentation/Demo','Proposal','Won','Lost'];
const STAGE_KEY={New:'new',Contacted:'contacted',Qualified:'qualified','Presentation/Demo':'demo',Proposal:'proposal',Won:'won',Lost:'lost'};
const ACT_DOT={Call:'dot-call',Email:'dot-email',Meeting:'dot-meeting',WhatsApp:'dot-whatsapp'};
const MODULE_LABELS={dashboard:'Dashboard',leads:'Leads',accounts:'Accounts',contacts:'Contacts',reminders:'Reminders',competitors:'Competitors',settings:'Settings'};

/* ── Validation ────────────────────────────────────────── */
const V={
  email:v=>!v||(/@/.test(v)&&/\.[a-z]{2,}$/i.test(v)),
  phone:v=>!v||/^(\+91[\-\s]?)?[6-9]\d{9}$/.test(v.replace(/[\s\-]/g,'')),
  required:v=>v&&v.trim().length>0,
  number:v=>!v||!isNaN(Number(v)),
};
function vField(id,checks){
  const el=document.getElementById(id); if(!el) return true;
  const v=el.value?.trim()||'';
  let ok=true;
  checks.forEach(([fn,msg])=>{
    if(!fn(v)){
      ok=false;
      el.classList.add('error');
      let em=el.parentNode.querySelector('.err-msg');
      if(!em){em=document.createElement('div');em.className='err-msg';el.parentNode.appendChild(em);}
      em.textContent=msg;
    } else {
      el.classList.remove('error');
      const em=el.parentNode.querySelector('.err-msg');
      if(em) em.textContent='';
    }
  });
  return ok;
}
function clearErrors(ids){ids.forEach(id=>{const el=document.getElementById(id);if(el){el.classList.remove('error');const em=el.parentNode?.querySelector('.err-msg');if(em)em.textContent='';}}); }

/* ── Date helpers ──────────────────────────────────────── */
function isoToday(){return new Date().toISOString().slice(0,10);}
function isOverdue(d){return d&&d<isoToday();}
function isDueToday(d){return d&&d===isoToday();}
function fmtDate(iso){if(!iso)return '';const d=new Date(iso);return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});}
function daysDiff(iso){const d=new Date(iso),t=new Date();t.setHours(0,0,0,0);d.setHours(0,0,0,0);return Math.round((d-t)/86400000);}
function todayLabel(){return new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});}

/* ── Misc helpers ──────────────────────────────────────── */
function ini(n){return(n||'?').trim().split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();}
function av(n,i){return `<div class="avatar av${(i||0)%5}">${ini(n)}</div>`;}
function fmt(v){return v?'₹'+Number(v).toLocaleString('en-IN'):'—';}
function sb(s){return `<span class="badge b-${STAGE_KEY[s]||'new'}">${s}</span>`;}
function pb(p){const m={High:'b-high',Medium:'b-medium',Low:'b-low'};return `<span class="badge ${m[p]||'b-low'}">${p}</span>`;}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function uid(){return Date.now()+Math.floor(Math.random()*1000);}
function accName(id){const a=S.accounts.find(x=>x.id===id);return a?a.name:'—';}
function ctName(id){const c=S.contacts.find(x=>x.id===id);return c?c.name:'—';}
function leadOverdueCount(l){return(l.tasks||[]).filter(t=>!t.done&&isOverdue(t.due)).length;}
function overdueLabel(l){const n=leadOverdueCount(l);return n>0?`<span class="overdue-badge">${n} overdue</span>`:'';} 
function toast(msg,type='success'){const t=document.getElementById('toast');t.textContent=msg;t.className=`toast show ${type}`;setTimeout(()=>t.className='toast',2500);}

/* ── State ─────────────────────────────────────────────── */
const S={
  page:'dashboard',view:'list',tab:'details',
  search:'',stageF:'All',priorityF:'All',assignedF:'All',sourceF:'All',
  panel:null,panelId:null,_editCtId:null,remFilter:'overdue',filterOpen:false,

  leads:[
    {id:1,name:'Rajiv Sharma',co:'Infosys Ltd',email:'rajiv@infosys.com',ph:'+91 9810011111',stage:'Qualified',src:'Referral',svc:'Cloud Migration',assigned:'Priya K',val:250000,pri:'High',city:'Bengaluru',title:'VP Technology',notes:'Full cloud stack interest.',accId:1,ctId:1,
     acts:[{id:11,t:'Call',d:'15/05/2026',n:'Intro call — very interested.',module:'lead'}],
     tasks:[{id:101,t:'Call',note:'Follow-up on pricing',due:'2026-05-10',done:false},{id:102,t:'Email',note:'Send revised proposal',due:isoToday(),done:false}],
     competitors:[1],created:'10/05/2026'},
    {id:2,name:'Anita Desai',co:'HDFC Bank',email:'anita@hdfc.com',ph:'+91 9920022222',stage:'Presentation/Demo',src:'Website',svc:'CRM Implementation',assigned:'Amit S',val:180000,pri:'High',city:'Mumbai',title:'Head of Digital',notes:'Demo scheduled.',accId:2,ctId:3,
     acts:[{id:21,t:'Meeting',d:'12/05/2026',n:'Discovery call done.',module:'lead'}],
     tasks:[{id:201,t:'Meeting',note:'Conduct product demo',due:'2026-05-08',done:false}],
     competitors:[],created:'08/05/2026'},
    {id:3,name:'Suresh Patel',co:'Tata Motors',email:'suresh@tata.com',ph:'+91 9730033333',stage:'New',src:'Exhibition',svc:'ERP Integration',assigned:'Priya K',val:95000,pri:'Medium',city:'Pune',title:'IT Manager',notes:'Met at Auto Expo.',accId:3,ctId:null,
     acts:[],tasks:[{id:301,t:'Call',note:'First intro call',due:'2026-05-28',done:false}],competitors:[],created:'19/05/2026'},
    {id:4,name:'Meena Iyer',co:'Wipro',email:'meena@wipro.com',ph:'+91 9640044444',stage:'Won',src:'Referral',svc:'Data Analytics',assigned:'Rahul M',val:320000,pri:'High',city:'Bengaluru',title:'CTO',notes:'Contract signed.',accId:null,ctId:null,
     acts:[{id:41,t:'Email',d:'05/05/2026',n:'Contract sent.',module:'lead'},{id:42,t:'Call',d:'09/05/2026',n:'Confirmed.',module:'lead'}],
     tasks:[],competitors:[],created:'28/04/2026'},
    {id:5,name:'Karan Mehta',co:'Reliance Jio',email:'karan@jio.com',ph:'+91 9550055555',stage:'Proposal',src:'Cold Call',svc:'Network Security',assigned:'Amit S',val:410000,pri:'High',city:'Mumbai',title:'Head of IT',notes:'Awaiting CTO approval.',accId:null,ctId:null,
     acts:[{id:51,t:'Meeting',d:'14/05/2026',n:'Presented to CTO.',module:'lead'}],
     tasks:[{id:501,t:'Call',note:'Chase for decision',due:'2026-05-12',done:false}],competitors:[1,2],created:'02/05/2026'},
  ],
  accounts:[
    {id:1,name:'Infosys Ltd',ind:'Technology',type:'Enterprise',ph:'+91 8028520261',web:'infosys.com',city:'Bengaluru',assigned:'Priya K',emp:'200000+',addr:'Electronics City, Bengaluru',notes:'Top IT company.',
     acts:[{id:111,t:'Call',d:'20/05/2026',n:'Account review call.',module:'account'}]},
    {id:2,name:'HDFC Bank',ind:'Finance',type:'Enterprise',ph:'+91 2266521000',web:'hdfcbank.com',city:'Mumbai',assigned:'Amit S',emp:'120000+',addr:'HDFC House, Mumbai',notes:'Leading private bank.',
     acts:[]},
    {id:3,name:'Tata Motors',ind:'Manufacturing',type:'Enterprise',ph:'+91 2266658282',web:'tatamotors.com',city:'Pune',assigned:'Priya K',emp:'60000+',addr:'Bombay House, Pune',notes:'Auto sector.',
     acts:[]},
  ],
  contacts:[
    {id:1,name:'Rajiv Sharma',title:'VP Technology',email:'rajiv@infosys.com',ph:'+91 9810011111',accId:1,city:'Bengaluru',notes:'Decision maker.',
     acts:[{id:211,t:'Email',d:'18/05/2026',n:'Sent product brochure.',module:'contact'}]},
    {id:2,name:'Sunita Rao',title:'IT Manager',email:'sunita@infosys.com',ph:'+91 9820022233',accId:1,city:'Bengaluru',notes:'Technical evaluator.',acts:[]},
    {id:3,name:'Anita Desai',title:'Head of Digital',email:'anita@hdfc.com',ph:'+91 9920022222',accId:2,city:'Mumbai',notes:'Budget owner.',acts:[]},
  ],
  competitors:[
    {id:1,name:'SalesForce India',website:'salesforce.com',pricing:'₹8,000/user/month',marketShare:'32%',strengths:'Strong brand, wide integrations',weaknesses:'Very expensive, complex setup',notes:'Main competitor in enterprise deals.'},
    {id:2,name:'Zoho CRM',website:'zoho.com',pricing:'₹1,200/user/month',marketShare:'18%',strengths:'Affordable, good features',weaknesses:'UI can be complex',notes:'Often comes up in SMB deals.'},
  ],
  dd:{
    sources:['Website','Referral','Cold Call','Social Media','Exhibition','Email Campaign','Walk-in','Partner'],
    industries:['Technology','Finance','Healthcare','Manufacturing','Retail','Education','Real Estate','Other'],
    services:['Cloud Migration','CRM Implementation','ERP Integration','Data Analytics','Network Security','Custom Development'],
    assignees:['Priya K','Amit S','Rahul M','Neha T'],
    priorities:['High','Medium','Low'],
    acctypes:['Enterprise','SMB','Startup'],
  },
  _filters:{stage:'All',priority:'All',assigned:'All',source:'All'},
};

/* ── Navigation ────────────────────────────────────────── */
function go(p){
  S.page=p;S.panel=null;S.panelId=null;S.tab='details';S.search='';S._filters={stage:'All',priority:'All',assigned:'All',source:'All'};S.filterOpen=false;
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));
  const n=document.getElementById('nv-'+p);if(n)n.classList.add('active');
  const lbl=document.getElementById('tg-module');if(lbl)lbl.textContent=MODULE_LABELS[p]||p;
  closePanel();render();
}
function toggleSidebar(){document.getElementById('sidebar').classList.toggle('collapsed');}

function render(){
  const m=document.getElementById('main');
  if(S.page==='dashboard')   m.innerHTML=renderDash();
  else if(S.page==='leads')      m.innerHTML=renderLeads();
  else if(S.page==='accounts')   m.innerHTML=renderAccounts();
  else if(S.page==='contacts')   m.innerHTML=renderContacts();
  else if(S.page==='reminders')  m.innerHTML=renderReminders();
  else if(S.page==='competitors')m.innerHTML=renderCompetitors();
  else if(S.page==='settings')   m.innerHTML=renderSettings();
  // badges
  document.getElementById('nb-leads').textContent=S.leads.filter(l=>l.stage!=='Won'&&l.stage!=='Lost').length;
  const od=S.leads.reduce((a,l)=>a+leadOverdueCount(l),0);
  const nb=document.getElementById('nb-reminders');
  if(nb){nb.textContent=od;nb.style.display=od>0?'':'none';}
}

function openPanel(html){
  document.getElementById('panel').innerHTML=html;
  document.getElementById('panel').classList.add('open');
  document.getElementById('panel-overlay').classList.add('open');
}
function closePanel(){
  document.getElementById('panel').classList.remove('open');
  document.getElementById('panel-overlay').classList.remove('open');
  setTimeout(()=>{document.getElementById('panel').innerHTML='';},300);
}

/* ── Global search ─────────────────────────────────────── */
function globalSearch(q){
  const gsd=document.getElementById('gsd');
  if(!q||q.length<2){gsd.innerHTML='';gsd.style.display='none';return;}
  const ql=q.toLowerCase();
  const lr=S.leads.filter(l=>l.name.toLowerCase().includes(ql)||l.co.toLowerCase().includes(ql)||l.email.toLowerCase().includes(ql)).slice(0,4);
  const ar=S.accounts.filter(a=>a.name.toLowerCase().includes(ql)||a.city.toLowerCase().includes(ql)).slice(0,3);
  const cr=S.contacts.filter(c=>c.name.toLowerCase().includes(ql)||c.email.toLowerCase().includes(ql)).slice(0,3);
  let html='';
  if(lr.length){html+=`<div class="gsd-section">Leads</div>${lr.map(l=>`<div class="gsd-item" onclick="gsdGo('lead',${l.id})"><div class="avatar av${l.id%5}" style="width:26px;height:26px;font-size:10px">${ini(l.name)}</div><div><div class="gsd-item-name">${esc(l.name)}</div><div class="gsd-item-sub">${esc(l.co)} · ${l.stage}</div></div>${sb(l.stage)}</div>`).join('')}`;}
  if(ar.length){html+=`<div class="gsd-section">Accounts</div>${ar.map(a=>`<div class="gsd-item" onclick="gsdGo('account',${a.id})"><div class="avatar av${a.id%5}" style="width:26px;height:26px;font-size:10px">${ini(a.name)}</div><div><div class="gsd-item-name">${esc(a.name)}</div><div class="gsd-item-sub">${esc(a.ind)} · ${esc(a.city)}</div></div></div>`).join('')}`;}
  if(cr.length){html+=`<div class="gsd-section">Contacts</div>${cr.map(c=>`<div class="gsd-item" onclick="gsdGo('contact',${c.id})"><div class="avatar av${c.id%5}" style="width:26px;height:26px;font-size:10px">${ini(c.name)}</div><div><div class="gsd-item-name">${esc(c.name)}</div><div class="gsd-item-sub">${esc(c.title||'')} · ${esc(accName(c.accId))}</div></div></div>`).join('')}`;}
  if(!html) html='<div class="gsd-empty">No results found</div>';
  gsd.innerHTML=html;gsd.style.display='block';
}
function gsdGo(type,id){
  document.getElementById('gsd').style.display='none';
  document.getElementById('gsearch').value='';
  if(type==='lead'){go('leads');setTimeout(()=>showLeadDetail(id),50);}
  else if(type==='account'){go('accounts');setTimeout(()=>showAccDetail(id),50);}
  else if(type==='contact'){go('contacts');setTimeout(()=>showContactDetail(id),50);}
}
function showGSD(){if(document.getElementById('gsearch').value.length>=2)document.getElementById('gsd').style.display='block';}
function hideGSD(){document.getElementById('gsd').style.display='none';}

/* ══════════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════════ */
function renderDash(){
  const total=S.leads.reduce((a,l)=>a+(+l.val||0),0);
  const won=S.leads.filter(l=>l.stage==='Won');
  const active=S.leads.filter(l=>l.stage!=='Won'&&l.stage!=='Lost');
  const conv=S.leads.length?Math.round(won.length/S.leads.length*100):0;
  const od=S.leads.reduce((a,l)=>a+leadOverdueCount(l),0);
  const dueTdy=S.leads.reduce((a,l)=>a+(l.tasks||[]).filter(t=>!t.done&&isDueToday(t.due)).length,0);
  const barW=34,barGap=8,cH=80;
  const sv=STAGES.map(s=>S.leads.filter(l=>l.stage===s).length);
  const maxV=Math.max(...sv,1);
  const bc=['#93c5fd','#fcd34d','#6ee7b7','#c4b5fd','#fbbf24','#86efac','#fca5a5'];
  const bars=STAGES.map((s,i)=>{const h=Math.round((sv[i]/maxV)*cH),x=i*(barW+barGap);return `<rect x="${x}" y="${cH-h}" width="${barW}" height="${h}" rx="4" fill="${bc[i]}"/><text x="${x+barW/2}" y="${cH+13}" text-anchor="middle" font-size="9" fill="#9aa0ae">${s.length>7?s.slice(0,7)+'…':s}</text><text x="${x+barW/2}" y="${cH-h-4}" text-anchor="middle" font-size="10" fill="#5a6478">${sv[i]}</text>`;}).join('');
  const top=S.leads.filter(l=>l.stage!=='Lost').sort((a,b)=>b.val-a.val).slice(0,5);
  return `
  <div class="page-header"><span class="page-title">Dashboard</span><span style="font-size:12px;color:var(--text2)">${new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span></div>
  <div class="content">
    <div class="stats">
      <div class="stat"><div class="stat-val">${S.leads.length}</div><div class="stat-lbl">Total Leads</div></div>
      <div class="stat s-green"><div class="stat-val">${active.length}</div><div class="stat-lbl">Active Pipeline</div></div>
      <div class="stat"><div class="stat-val">₹${(total/100000).toFixed(1)}L</div><div class="stat-lbl">Pipeline Value</div></div>
      <div class="stat s-amber"><div class="stat-val">${conv}%</div><div class="stat-lbl">Win Rate</div><div class="stat-sub">${won.length} won</div></div>
    </div>
    ${od>0||dueTdy>0?`<div style="display:flex;gap:10px;margin-bottom:18px">
      ${od>0?`<div class="alert-card alert-red" onclick="go('reminders')"><div style="font-size:22px;font-weight:700">${od}</div><div style="font-size:12px;font-weight:500">Overdue tasks — view reminders</div></div>`:''}
      ${dueTdy>0?`<div class="alert-card alert-amber" onclick="go('reminders')"><div style="font-size:22px;font-weight:700">${dueTdy}</div><div style="font-size:12px;font-weight:500">Due today</div></div>`:''}
    </div>`:''}
    <div class="chart-grid">
      <div class="chart-card"><div class="chart-title">Leads by stage</div><svg width="100%" viewBox="0 0 ${STAGES.length*(barW+barGap)-barGap} ${cH+18}" style="overflow:visible">${bars}</svg></div>
      <div class="chart-card"><div class="chart-title">Quick summary</div>
        ${STAGES.map(s=>{const cnt=S.leads.filter(l=>l.stage===s).length;const val=S.leads.filter(l=>l.stage===s).reduce((a,l)=>a+(+l.val||0),0);return `<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px"><span>${sb(s)}</span><span style="color:var(--text2)">${cnt} leads</span><span style="font-weight:600">${fmt(val)}</span></div>`;}).join('')}
      </div>
    </div>
    <div class="table-card">
      <div class="table-card-head"><span class="table-card-title">Top deals</span><button class="btn btn-sm" onclick="go('leads')">View all</button></div>
      <table><thead><tr><th>Lead</th><th>Company</th><th>Stage</th><th>Value</th><th>Assigned</th></tr></thead>
      <tbody>${top.map(l=>`<tr onclick="go('leads');setTimeout(()=>showLeadDetail(${l.id}),50)">
        <td><div style="display:flex;align-items:center;gap:8px">${av(l.name,l.id)}<span style="font-weight:500">${esc(l.name)}</span></div></td>
        <td style="color:var(--text2)">${esc(l.co)}</td><td>${sb(l.stage)}</td>
        <td style="font-weight:600">₹${Number(l.val||0).toLocaleString('en-IN')}</td>
        <td style="color:var(--text2)">${esc(l.assigned)}</td>
      </tr>`).join('')}</tbody></table>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════════════
   LEADS
══════════════════════════════════════════════════════════ */
function renderLeads(){
  const f=S._filters;
  const fl=S.leads.filter(l=>{
    const q=S.search.toLowerCase();
    return(!q||l.name.toLowerCase().includes(q)||l.co.toLowerCase().includes(q)||l.email.toLowerCase().includes(q))
      &&(f.stage==='All'||l.stage===f.stage)&&(f.priority==='All'||l.pri===f.priority)
      &&(f.assigned==='All'||l.assigned===f.assigned)&&(f.source==='All'||l.src===f.source);
  });
  const listView=`<div class="table-card"><table>
    <thead><tr><th>Name</th><th>Company</th><th>Stage</th><th>Priority</th><th>Value</th><th>Assigned</th><th>Account</th><th>Tasks</th></tr></thead>
    <tbody>${fl.length===0?`<tr><td colspan="8"><div class="empty"><div class="empty-icon">👤</div>No leads match your filters</div></td></tr>`:
    fl.map(l=>`<tr onclick="showLeadDetail(${l.id})">
      <td><div style="display:flex;align-items:center;gap:8px">${av(l.name,l.id)}<span style="font-weight:500">${esc(l.name)}</span></div></td>
      <td style="color:var(--text2)">${esc(l.co)}</td><td>${sb(l.stage)}</td><td>${pb(l.pri)}</td>
      <td style="font-weight:600;font-size:12px">₹${Number(l.val||0).toLocaleString('en-IN')}</td>
      <td style="color:var(--text2)">${esc(l.assigned)}</td>
      <td>${l.accId?`<span class="td-link" onclick="event.stopPropagation();go('accounts');setTimeout(()=>showAccDetail(${l.accId}),50)">${esc(accName(l.accId))}</span>`:'<span style="color:var(--text3)">—</span>'}</td>
      <td>${overdueLabel(l)}${(l.tasks||[]).filter(t=>!t.done&&isDueToday(t.due)).length>0?'<span class="today-badge">today</span>':''}</td>
    </tr>`).join('')}
    </tbody></table></div>`;

  const kanban=`<div class="kanban">${STAGES.map(s=>{
    const cards=fl.filter(l=>l.stage===s);
    return `<div class="kcol"><div class="kcol-head"><span>${s.length>12?s.slice(0,11)+'…':s}</span><span class="badge b-${STAGE_KEY[s]}">${cards.length}</span></div>
    <div class="kcol-body">${cards.map(l=>`<div class="kcard" onclick="showLeadDetail(${l.id})">
      <div class="kcard-name">${esc(l.name)}</div><div class="kcard-co">${esc(l.co)}</div>
      <div class="kcard-val">₹${Number(l.val||0).toLocaleString('en-IN')}</div>
      <div style="margin-top:5px;display:flex;gap:4px;flex-wrap:wrap">${pb(l.pri)}${overdueLabel(l)}</div>
    </div>`).join('')}</div></div>`;
  }).join('')}</div>`;

  return `
  <div class="page-header">
    <span class="page-title">Leads <span style="font-size:14px;color:var(--text2);font-weight:400">(${fl.length})</span></span>
    <div class="toolbar">
      <div class="search-wrap"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input class="search-inp" placeholder="Search leads…" value="${esc(S.search)}" oninput="S.search=this.value;render()"></div>
      <button class="btn btn-sm ${S.filterOpen?'btn-primary':''}" onclick="S.filterOpen=!S.filterOpen;render()">⊟ Filters</button>
      <div class="view-toggle"><button class="vbtn ${S.view==='list'?'active':''}" onclick="S.view='list';render()">≡ List</button><button class="vbtn ${S.view==='kanban'?'active':''}" onclick="S.view='kanban';render()">⊞ Board</button></div>
      <button class="btn btn-primary btn-sm" onclick="showLeadForm(null)">+ New Lead</button>
    </div>
  </div>
  <div class="content">
    <div class="filter-panel ${S.filterOpen?'open':''}">
      <div class="filter-panel-grid">
        <div><label class="lbl">Stage</label><select class="sel" onchange="S._filters.stage=this.value;render()"><option ${f.stage==='All'?'selected':''}>All</option>${STAGES.map(s=>`<option ${f.stage===s?'selected':''}>${s}</option>`).join('')}</select></div>
        <div><label class="lbl">Priority</label><select class="sel" onchange="S._filters.priority=this.value;render()"><option ${f.priority==='All'?'selected':''}>All</option>${['High','Medium','Low'].map(p=>`<option ${f.priority===p?'selected':''}>${p}</option>`).join('')}</select></div>
        <div><label class="lbl">Assigned to</label><select class="sel" onchange="S._filters.assigned=this.value;render()"><option ${f.assigned==='All'?'selected':''}>All</option>${S.dd.assignees.map(a=>`<option ${f.assigned===a?'selected':''}>${a}</option>`).join('')}</select></div>
        <div><label class="lbl">Lead source</label><select class="sel" onchange="S._filters.source=this.value;render()"><option ${f.source==='All'?'selected':''}>All</option>${S.dd.sources.map(s=>`<option ${f.source===s?'selected':''}>${s}</option>`).join('')}</select></div>
      </div>
      <div class="filter-actions"><button class="btn btn-sm" onclick="S._filters={stage:'All',priority:'All',assigned:'All',source:'All'};render()">Clear filters</button></div>
    </div>
    <div class="stats" style="grid-template-columns:repeat(4,1fr)">
      <div class="stat"><div class="stat-val">${S.leads.length}</div><div class="stat-lbl">Total</div></div>
      <div class="stat s-green"><div class="stat-val">${S.leads.filter(l=>l.stage==='Won').length}</div><div class="stat-lbl">Won</div></div>
      <div class="stat"><div class="stat-val">₹${(S.leads.reduce((a,l)=>a+(+l.val||0),0)/100000).toFixed(1)}L</div><div class="stat-lbl">Pipeline</div></div>
      <div class="stat s-red"><div class="stat-val">${S.leads.reduce((a,l)=>a+leadOverdueCount(l),0)}</div><div class="stat-lbl">Overdue tasks</div></div>
    </div>
    ${S.view==='list'?listView:kanban}
  </div>`;
}

function showLeadDetail(id){
  const l=S.leads.find(x=>x.id===id);if(!l)return;
  const od=leadOverdueCount(l);
  const acc=l.accId?S.accounts.find(a=>a.id===l.accId):null;
  const ct=l.ctId?S.contacts.find(c=>c.id===l.ctId):null;
  const leadComps=S.competitors.filter(c=>(l.competitors||[]).includes(c.id));
  const allActs=[...(l.acts||[])].sort((a,b)=>b.id-a.id);

  const detailTab=`
    ${l.stage==='Won'?`<div class="won-banner">🏆 Lead won and converted!</div>`:''}
    <div class="drow"><span class="dlbl">Stage</span><span class="dval">${sb(l.stage)}</span></div>
    <div class="drow"><span class="dlbl">Priority</span><span class="dval">${pb(l.pri)}</span></div>
    <div class="drow"><span class="dlbl">Email</span><span class="dval"><a href="mailto:${esc(l.email)}" style="color:var(--accent)">${esc(l.email)}</a></span></div>
    <div class="drow"><span class="dlbl">Phone</span><span class="dval">${esc(l.ph||'—')}</span></div>
    <div class="drow"><span class="dlbl">Designation</span><span class="dval">${esc(l.title||'—')}</span></div>
    <div class="drow"><span class="dlbl">Service</span><span class="dval">${esc(l.svc||'—')}</span></div>
    <div class="drow"><span class="dlbl">Deal value</span><span class="dval" style="font-weight:700">₹${Number(l.val||0).toLocaleString('en-IN')}</span></div>
    <div class="drow"><span class="dlbl">Source</span><span class="dval">${esc(l.src||'—')}</span></div>
    <div class="drow"><span class="dlbl">Assigned to</span><span class="dval">${esc(l.assigned||'—')}</span></div>
    <div class="drow"><span class="dlbl">City</span><span class="dval">${esc(l.city||'—')}</span></div>
    <div class="drow"><span class="dlbl">Created</span><span class="dval">${esc(l.created||'—')}</span></div>
    <div class="drow"><span class="dlbl">Notes</span><span class="dval">${esc(l.notes||'—')}</span></div>
    <div class="sdiv">Linked records</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
      <div style="flex:1;min-width:140px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:10px">
        <div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;margin-bottom:6px">Account</div>
        ${acc?`<div class="td-link" onclick="go('accounts');setTimeout(()=>showAccDetail(${acc.id}),50)">${esc(acc.name)}</div><div style="font-size:11px;color:var(--text2)">${esc(acc.ind)}</div>`:'<div style="font-size:12px;color:var(--text3)">Not linked</div>'}
      </div>
      <div style="flex:1;min-width:140px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:10px">
        <div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;margin-bottom:6px">Contact</div>
        ${ct?`<div class="td-link" onclick="go('contacts');setTimeout(()=>showContactDetail(${ct.id}),50)">${esc(ct.name)}</div><div style="font-size:11px;color:var(--text2)">${esc(ct.title||'')}</div>`:'<div style="font-size:12px;color:var(--text3)">Not linked</div>'}
      </div>
    </div>
    <div class="sdiv">Move stage</div>
    <div class="stages">${STAGES.map(s=>`<button class="btn btn-xs ${l.stage===s?'btn-primary':''}" onclick="setStage(${l.id},'${s}')">${s}</button>`).join('')}</div>`;

  const actTab=`
    <div class="sdiv">Log activity</div>
    <div class="frow" style="margin-bottom:8px">
      <select class="sel" id="at"><option>Call</option><option>Email</option><option>Meeting</option><option>WhatsApp</option></select>
    </div>
    <textarea class="inp" id="an" rows="2" placeholder="What happened?…" style="margin-bottom:8px"></textarea>
    <button class="btn btn-primary btn-sm" onclick="addAct('lead',${l.id})" style="margin-bottom:16px">+ Log activity</button>
    <div class="sdiv">Activity history</div>
    ${allActs.length===0?'<div class="empty">No activities logged yet.</div>':
    allActs.map(a=>`<div class="act-item"><div class="act-dot ${ACT_DOT[a.t]||''}"></div>
      <div><div style="font-size:12px;font-weight:600">${esc(a.t)} <span style="color:var(--text3);font-weight:400">· ${esc(a.d)}</span></div>
      <div style="font-size:12px;color:var(--text2);margin-top:2px">${esc(a.n)}</div></div>
    </div>`).join('')}`;

  const tasksTab=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <span style="font-size:13px;color:var(--text2)">${(l.tasks||[]).filter(t=>!t.done).length} open · ${(l.tasks||[]).filter(t=>t.done).length} done</span>
      <button class="btn btn-primary btn-sm" onclick="showAddTaskPanel(${l.id})">+ Schedule task</button>
    </div>
    ${(l.tasks||[]).length===0?'<div class="empty">No tasks scheduled.</div>':
    (l.tasks||[]).map(t=>{
      const diff=daysDiff(t.due),done=t.done;
      let dlbl='',dcls='';
      if(done){dlbl='Done';dcls='color:var(--text3)';}
      else if(isOverdue(t.due)){dlbl=`${Math.abs(diff)}d overdue`;dcls='color:var(--red);font-weight:600';}
      else if(isDueToday(t.due)){dlbl='Due today';dcls='color:var(--amber);font-weight:600';}
      else{dlbl=`In ${diff}d`;dcls='color:var(--text2)';}
      return `<div class="rem-row ${done?'rem-done':''}">
        <input type="checkbox" ${done?'checked':''} onchange="toggleTask(${l.id},${t.id},this.checked)">
        <div class="act-dot ${ACT_DOT[t.t]||''}" style="margin-top:3px;flex-shrink:0"></div>
        <div style="flex:1"><div style="font-size:13px;font-weight:500">${esc(t.note)}</div><span class="badge b-${(t.t||'').toLowerCase()}" style="font-size:10px;margin-top:3px">${esc(t.t)}</span></div>
        <div style="text-align:right;font-size:12px;${dcls}">${dlbl}<div style="font-size:11px;color:var(--text3)">${fmtDate(t.due)}</div></div>
        <button class="btn btn-xs btn-danger" onclick="deleteTask(${l.id},${t.id});showLeadDetail(${l.id})" title="Delete">✕</button>
      </div>`;
    }).join('')}`;

  const competitorTab=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <span style="font-size:13px;color:var(--text2)">${leadComps.length} competitor${leadComps.length!==1?'s':''} linked</span>
      <button class="btn btn-primary btn-sm" onclick="showLinkCompetitor(${l.id})">+ Link competitor</button>
    </div>
    ${leadComps.length===0?'<div class="empty">No competitors linked to this lead.</div>':
    leadComps.map(c=>`<div class="comp-card">
      <div class="comp-card-head"><span class="comp-name">${esc(c.name)}</span>
        <button class="btn btn-xs btn-danger" onclick="unlinkComp(${l.id},${c.id})">Unlink</button>
      </div>
      <div class="comp-grid">
        <div class="comp-field"><div class="comp-field-lbl">Website</div><div class="comp-field-val">${esc(c.website||'—')}</div></div>
        <div class="comp-field"><div class="comp-field-lbl">Pricing</div><div class="comp-field-val">${esc(c.pricing||'—')}</div></div>
        <div class="comp-field"><div class="comp-field-lbl">Market share</div><div class="comp-field-val">${esc(c.marketShare||'—')}</div></div>
      </div>
      <div style="margin-top:8px;font-size:12px;color:var(--green)"><strong>Strengths:</strong> ${esc(c.strengths||'—')}</div>
      <div style="margin-top:4px;font-size:12px;color:var(--red)"><strong>Weaknesses:</strong> ${esc(c.weaknesses||'—')}</div>
    </div>`).join('')}`;

  const tabs=['details','activity','tasks','competitors'];
  const html=`
  <div class="panel-head">
    <div class="panel-head-info">${av(l.name,l.id)}
      <div><div style="font-weight:700;font-size:14px">${esc(l.name)} ${od>0?`<span class="overdue-badge">${od} overdue</span>`:''}</div>
      <div style="font-size:12px;color:var(--text2)">${esc(l.co)}</div></div>
    </div>
    <div style="display:flex;gap:5px;flex-wrap:wrap">
      ${l.stage!=='Won'?`<button class="btn btn-success btn-sm" onclick="convertLead(${l.id})">✓ Convert</button>`:''}
      <button class="btn btn-sm" onclick="showLeadForm(${l.id})">Edit</button>
      <button class="btn btn-danger btn-sm" onclick="deleteLead(${l.id})">Delete</button>
      <button class="btn btn-sm" onclick="closePanel()">✕</button>
    </div>
  </div>
  <div class="panel-body">
    <div class="tabs">${tabs.map(t=>`<div class="tab ${S.tab===t?'active':''}" onclick="S.tab='${t}';showLeadDetail(${l.id})">${t==='competitors'?`Competitors (${leadComps.length})`:t==='tasks'?`Tasks${od>0?` <span class="overdue-badge">${od}</span>`:''}`:t.charAt(0).toUpperCase()+t.slice(1)}</div>`).join('')}</div>
    ${S.tab==='details'?detailTab:S.tab==='activity'?actTab:S.tab==='tasks'?tasksTab:competitorTab}
  </div>`;
  openPanel(html);
}

function showLeadForm(id,prefill){
  const l=id?S.leads.find(x=>x.id===id):null;
  const v={...l,...(prefill||{})};
  const html=`
  <div class="panel-head"><span style="font-weight:700">${l?'Edit Lead':'New Lead'}</span><button class="btn btn-sm" onclick="closePanel()">✕</button></div>
  <div class="panel-body">
    <div class="frow">
      <div class="fgrp"><label class="lbl">Full name <span class="req">*</span></label><input class="inp" id="fn" value="${esc(v.name||'')}"></div>
      <div class="fgrp"><label class="lbl">Company <span class="req">*</span></label><input class="inp" id="fc" value="${esc(v.co||'')}"></div>
    </div>
    <div class="frow">
      <div class="fgrp"><label class="lbl">Email</label><input class="inp" id="fe" type="email" value="${esc(v.email||'')}" placeholder="name@company.com"></div>
      <div class="fgrp"><label class="lbl">Phone</label><input class="inp" id="fp" value="${esc(v.ph||'')}" placeholder="+91 XXXXX XXXXX"></div>
    </div>
    <div class="frow">
      <div class="fgrp"><label class="lbl">Stage</label><select class="sel" id="fs">${STAGES.map(s=>`<option ${(v.stage||'New')===s?'selected':''}>${s}</option>`).join('')}</select></div>
      <div class="fgrp"><label class="lbl">Priority</label><select class="sel" id="fpr">${S.dd.priorities.map(p=>`<option ${(v.pri||'Medium')===p?'selected':''}>${p}</option>`).join('')}</select></div>
    </div>
    <div class="frow">
      <div class="fgrp"><label class="lbl">Lead source</label><select class="sel" id="fso">${S.dd.sources.map(s=>`<option ${v.src===s?'selected':''}>${s}</option>`).join('')}</select></div>
      <div class="fgrp"><label class="lbl">Service</label><select class="sel" id="fsv">${S.dd.services.map(s=>`<option ${v.svc===s?'selected':''}>${s}</option>`).join('')}</select></div>
    </div>
    <div class="frow">
      <div class="fgrp"><label class="lbl">Deal value (₹)</label><input class="inp" id="fv" type="number" min="0" value="${esc(v.val||'')}" placeholder="e.g. 150000"></div>
      <div class="fgrp"><label class="lbl">Assigned to</label><select class="sel" id="fa">${S.dd.assignees.map(a=>`<option ${v.assigned===a?'selected':''}>${a}</option>`).join('')}</select></div>
    </div>
    <div class="frow">
      <div class="fgrp"><label class="lbl">City</label><input class="inp" id="fci" value="${esc(v.city||'')}"></div>
      <div class="fgrp"><label class="lbl">Designation</label><input class="inp" id="fti" value="${esc(v.title||'')}"></div>
    </div>
    <div class="frow">
      <div class="fgrp"><label class="lbl">Link to Account</label><select class="sel" id="faccid"><option value="">— None —</option>${S.accounts.map(a=>`<option value="${a.id}" ${v.accId===a.id?'selected':''}>${esc(a.name)}</option>`).join('')}</select></div>
      <div class="fgrp"><label class="lbl">Link to Contact</label><select class="sel" id="fctid"><option value="">— None —</option>${S.contacts.map(c=>`<option value="${c.id}" ${v.ctId===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div>
    </div>
    <div class="fgrp"><label class="lbl">Notes</label><textarea class="inp" id="fno">${esc(v.notes||'')}</textarea></div>
  </div>
  <div class="panel-foot">
    <button class="btn" onclick="closePanel()">Cancel</button>
    <button class="btn btn-primary" onclick="saveLead(${id||'null'})">${l?'Save changes':'Create Lead'}</button>
  </div>`;
  openPanel(html);
}

function saveLead(id){
  clearErrors(['fn','fc','fe','fp','fv']);
  let ok=true;
  ok=vField('fn',[[V.required,'Name is required']])&&ok;
  ok=vField('fc',[[V.required,'Company is required']])&&ok;
  ok=vField('fe',[[V.email,'Enter a valid email (name@domain.com)']])&&ok;
  ok=vField('fp',[[V.phone,'Enter a valid Indian mobile number']])&&ok;
  ok=vField('fv',[[V.number,'Deal value must be a number']])&&ok;
  if(!ok)return;
  const obj={
    name:document.getElementById('fn').value.trim(),co:document.getElementById('fc').value.trim(),
    email:document.getElementById('fe').value,ph:document.getElementById('fp').value,
    stage:document.getElementById('fs').value,pri:document.getElementById('fpr').value,
    src:document.getElementById('fso').value,svc:document.getElementById('fsv').value,
    val:document.getElementById('fv').value,assigned:document.getElementById('fa').value,
    city:document.getElementById('fci').value,title:document.getElementById('fti').value,
    accId:parseInt(document.getElementById('faccid').value)||null,
    ctId:parseInt(document.getElementById('fctid').value)||null,
    notes:document.getElementById('fno').value,
  };
  if(id){const i=S.leads.findIndex(l=>l.id===id);S.leads[i]={...S.leads[i],...obj};}
  else{obj.id=uid();obj.acts=[];obj.tasks=[];obj.competitors=[];obj.created=todayLabel();S.leads.unshift(obj);}
  closePanel();render();toast(id?'Lead updated':'Lead created');
}
function deleteLead(id){if(!confirm('Delete this lead?'))return;S.leads=S.leads.filter(l=>l.id!==id);closePanel();render();toast('Lead deleted','error');}
function setStage(id,stage){const l=S.leads.find(x=>x.id===id);if(l){l.stage=stage;showLeadDetail(id);render();}}
function addAct(module,id){
  const t=document.getElementById('at')?.value;
  const n=document.getElementById('an')?.value?.trim();
  if(!n){toast('Please enter an activity note','error');return;}
  const act={id:uid(),t,n,d:todayLabel(),module};
  if(module==='lead'){const l=S.leads.find(x=>x.id===id);if(l){if(!l.acts)l.acts=[];l.acts.unshift(act);}}
  else if(module==='account'){const a=S.accounts.find(x=>x.id===id);if(a){if(!a.acts)a.acts=[];a.acts.unshift(act);}}
  else if(module==='contact'){const c=S.contacts.find(x=>x.id===id);if(c){if(!c.acts)c.acts=[];c.acts.unshift(act);}}
  toast('Activity logged');
  if(module==='lead')showLeadDetail(id);
  else if(module==='account')showAccDetail(id);
  else if(module==='contact')showContactDetail(id);
  render();
}
function convertLead(id){
  const l=S.leads.find(x=>x.id===id);if(!l)return;
  l.stage='Won';
  let accId=l.accId;
  if(!accId){
    const ex=S.accounts.find(a=>a.name.toLowerCase()===l.co.toLowerCase());
    if(ex){accId=ex.id;}
    else{accId=uid();S.accounts.unshift({id:accId,name:l.co,ind:'Other',type:'Enterprise',ph:l.ph||'',web:'',city:l.city||'',assigned:l.assigned,emp:'',addr:'',notes:`Converted from lead on ${todayLabel()}.`,acts:[]});}
    l.accId=accId;
  }
  if(!l.ctId&&l.email&&!S.contacts.find(c=>c.email===l.email)){
    const ctId=uid();
    S.contacts.push({id:ctId,name:l.name,title:l.title||'',email:l.email,ph:l.ph,accId,city:l.city||'',notes:`Auto-created on conversion (${todayLabel()}).`,acts:[]});
    l.ctId=ctId;
  }
  closePanel();render();toast('Lead converted — Account and Contact created!');
}
function toggleTask(leadId,taskId,done){
  const l=S.leads.find(x=>x.id===leadId);
  const t=(l?.tasks||[]).find(x=>x.id===taskId);
  if(t){t.done=done;showLeadDetail(leadId);render();}
}
function deleteTask(leadId,taskId){
  const l=S.leads.find(x=>x.id===leadId);
  if(l)l.tasks=(l.tasks||[]).filter(t=>t.id!==taskId);
  render();
}
function showAddTaskPanel(leadId){
  const html=`
  <div class="panel-head"><span style="font-weight:700">Schedule Task</span><button class="btn btn-sm" onclick="closePanel()">✕</button></div>
  <div class="panel-body">
    <div class="fgrp"><label class="lbl">Lead <span class="req">*</span></label>
      <select class="sel" id="tk-lead"><option value="">— Select lead —</option>
      ${S.leads.filter(l=>l.stage!=='Won'&&l.stage!=='Lost').map(l=>`<option value="${l.id}" ${l.id===leadId?'selected':''}>${esc(l.name)} — ${esc(l.co)}</option>`).join('')}
      </select>
    </div>
    <div class="frow">
      <div class="fgrp"><label class="lbl">Type</label><select class="sel" id="tk-type"><option>Call</option><option>Email</option><option>Meeting</option><option>WhatsApp</option></select></div>
      <div class="fgrp"><label class="lbl">Due date <span class="req">*</span></label><input class="inp" type="date" id="tk-due" value="${isoToday()}"></div>
    </div>
    <div class="fgrp"><label class="lbl">Note <span class="req">*</span></label><textarea class="inp" id="tk-note" rows="3" placeholder="What needs to happen?…"></textarea></div>
  </div>
  <div class="panel-foot">
    <button class="btn" onclick="closePanel()">Cancel</button>
    <button class="btn btn-primary" onclick="saveTask()">Schedule</button>
  </div>`;
  openPanel(html);
}
function saveTask(){
  const leadId=parseInt(document.getElementById('tk-lead').value);
  const due=document.getElementById('tk-due').value;
  const note=document.getElementById('tk-note').value.trim();
  const type=document.getElementById('tk-type').value;
  if(!leadId){toast('Select a lead','error');return;}
  if(!due){toast('Select a due date','error');return;}
  if(!note){toast('Enter a note','error');return;}
  const l=S.leads.find(x=>x.id===leadId);
  if(!l.tasks)l.tasks=[];
  l.tasks.unshift({id:uid(),t:type,note,due,done:false});
  closePanel();render();toast('Task scheduled');
}
function showLinkCompetitor(leadId){
  const l=S.leads.find(x=>x.id===leadId);
  const linked=l.competitors||[];
  const avail=S.competitors.filter(c=>!linked.includes(c.id));
  const html=`
  <div class="panel-head"><span style="font-weight:700">Link Competitor</span><button class="btn btn-sm" onclick="closePanel()">✕</button></div>
  <div class="panel-body">
    ${avail.length===0?'<div class="empty">All competitors are already linked, or no competitors exist. Add competitors from the Competitors page first.</div>':
    avail.map(c=>`<div class="related-card" onclick="linkComp(${leadId},${c.id})">
      <div class="related-card-name">${esc(c.name)}</div>
      <div class="related-card-sub">${esc(c.website||'')} · Market share: ${esc(c.marketShare||'—')}</div>
    </div>`).join('')}
    <div style="margin-top:14px"><button class="btn btn-primary btn-sm" onclick="closePanel();go('competitors')">+ Add new competitor</button></div>
  </div>`;
  openPanel(html);
}
function linkComp(leadId,compId){const l=S.leads.find(x=>x.id===leadId);if(l){if(!l.competitors)l.competitors=[];if(!l.competitors.includes(compId))l.competitors.push(compId);}closePanel();showLeadDetail(leadId);toast('Competitor linked');}
function unlinkComp(leadId,compId){const l=S.leads.find(x=>x.id===leadId);if(l)l.competitors=(l.competitors||[]).filter(x=>x!==compId);showLeadDetail(leadId);toast('Competitor unlinked');}

/* ══════════════════════════════════════════════════════════
   ACCOUNTS
══════════════════════════════════════════════════════════ */
function renderAccounts(){
  const f=S._filters;
  const fl=S.accounts.filter(a=>{
    const q=S.search.toLowerCase();
    return(!q||a.name.toLowerCase().includes(q)||a.ind.toLowerCase().includes(q)||a.city.toLowerCase().includes(q))
      &&(f.assigned==='All'||a.assigned===f.assigned);
  });
  return `
  <div class="page-header">
    <span class="page-title">Accounts <span style="font-size:14px;color:var(--text2);font-weight:400">(${fl.length})</span></span>
    <div class="toolbar">
      <div class="search-wrap"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input class="search-inp" placeholder="Search accounts…" value="${esc(S.search)}" oninput="S.search=this.value;render()"></div>
      <button class="btn btn-sm ${S.filterOpen?'btn-primary':''}" onclick="S.filterOpen=!S.filterOpen;render()">⊟ Filters</button>
      <button class="btn btn-primary btn-sm" onclick="showAccForm(null)">+ New Account</button>
    </div>
  </div>
  <div class="content">
    <div class="filter-panel ${S.filterOpen?'open':''}">
      <div class="filter-panel-grid">
        <div><label class="lbl">Industry</label><select class="sel" onchange="S._filters.industry=this.value;render()"><option>All</option>${S.dd.industries.map(i=>`<option>${i}</option>`).join('')}</select></div>
        <div><label class="lbl">Type</label><select class="sel" onchange="S._filters.type=this.value;render()"><option>All</option>${S.dd.acctypes.map(t=>`<option>${t}</option>`).join('')}</select></div>
        <div><label class="lbl">Assigned to</label><select class="sel" onchange="S._filters.assigned=this.value;render()"><option>All</option>${S.dd.assignees.map(a=>`<option>${a}</option>`).join('')}</select></div>
      </div>
      <div class="filter-actions"><button class="btn btn-sm" onclick="S._filters={stage:'All',priority:'All',assigned:'All',source:'All'};render()">Clear filters</button></div>
    </div>
    <div class="stats">
      <div class="stat"><div class="stat-val">${S.accounts.length}</div><div class="stat-lbl">Accounts</div></div>
      <div class="stat s-green"><div class="stat-val">${S.contacts.length}</div><div class="stat-lbl">Contacts</div></div>
      <div class="stat"><div class="stat-val">${[...new Set(S.accounts.map(a=>a.ind))].length}</div><div class="stat-lbl">Industries</div></div>
      <div class="stat"><div class="stat-val">${S.leads.filter(l=>l.accId).length}</div><div class="stat-lbl">Linked leads</div></div>
    </div>
    <div class="table-card"><table>
      <thead><tr><th>Account</th><th>Industry</th><th>Type</th><th>City</th><th>Contacts</th><th>Leads</th><th>Assigned</th></tr></thead>
      <tbody>${fl.length===0?`<tr><td colspan="7"><div class="empty"><div class="empty-icon">🏢</div>No accounts found</div></td></tr>`:
      fl.map(a=>`<tr onclick="showAccDetail(${a.id})">
        <td><div style="display:flex;align-items:center;gap:8px">${av(a.name,a.id)}<span style="font-weight:600">${esc(a.name)}</span></div></td>
        <td style="color:var(--text2)">${esc(a.ind)}</td>
        <td><span class="badge b-${(a.type||'').toLowerCase()}">${esc(a.type)}</span></td>
        <td style="color:var(--text2)">${esc(a.city)}</td>
        <td><span class="badge b-new">${S.contacts.filter(c=>c.accId===a.id).length}</span></td>
        <td><span class="badge b-qualified">${S.leads.filter(l=>l.accId===a.id).length}</span></td>
        <td style="color:var(--text2)">${esc(a.assigned)}</td>
      </tr>`).join('')}
      </tbody>
    </table></div>
  </div>`;
}

function showAccDetail(id){
  const a=S.accounts.find(x=>x.id===id);if(!a)return;
  const cts=S.contacts.filter(c=>c.accId===id);
  const leads=S.leads.filter(l=>l.accId===id);
  // combined timeline: account acts + contact acts for this account's contacts + lead acts for this account's leads
  const allActs=[
    ...(a.acts||[]).map(x=>({...x,src:'Account'})),
    ...cts.flatMap(c=>(c.acts||[]).map(x=>({...x,src:c.name}))),
    ...leads.flatMap(l=>(l.acts||[]).map(x=>({...x,src:l.name}))),
  ].sort((a,b)=>b.id-a.id);

  const detailTab=`
    <div class="drow"><span class="dlbl">Type</span><span class="dval"><span class="badge b-${(a.type||'').toLowerCase()}">${esc(a.type)}</span></span></div>
    <div class="drow"><span class="dlbl">Industry</span><span class="dval">${esc(a.ind)}</span></div>
    <div class="drow"><span class="dlbl">Phone</span><span class="dval">${esc(a.ph||'—')}</span></div>
    <div class="drow"><span class="dlbl">Website</span><span class="dval">${a.web?`<a href="https://${esc(a.web)}" target="_blank" style="color:var(--accent)">${esc(a.web)}</a>`:'—'}</span></div>
    <div class="drow"><span class="dlbl">City</span><span class="dval">${esc(a.city||'—')}</span></div>
    <div class="drow"><span class="dlbl">Employees</span><span class="dval">${esc(a.emp||'—')}</span></div>
    <div class="drow"><span class="dlbl">Billing address</span><span class="dval">${esc(a.addr||'—')}</span></div>
    <div class="drow"><span class="dlbl">Assigned to</span><span class="dval">${esc(a.assigned)}</span></div>
    <div class="drow"><span class="dlbl">Notes</span><span class="dval">${esc(a.notes||'—')}</span></div>`;

  const contactsTab=`
    <div style="display:flex;justify-content:flex-end;margin-bottom:12px">
      <button class="btn btn-primary btn-sm" onclick="showContactForm(${a.id},null)">+ Add Contact</button>
    </div>
    ${cts.length===0?'<div class="empty">No contacts yet.</div>':
    cts.map(c=>`<div class="contact-row">
      ${av(c.name,c.id)}
      <div style="flex:1;cursor:pointer" onclick="closePanel();go('contacts');setTimeout(()=>showContactDetail(${c.id}),50)">
        <div style="font-weight:500">${esc(c.name)}</div>
        <div style="font-size:12px;color:var(--text2)">${esc(c.title||'')}${c.title&&c.email?' · ':''}${esc(c.email)}</div>
      </div>
      <button class="btn btn-xs" onclick="showContactForm(${a.id},${c.id})">Edit</button>
    </div>`).join('')}`;

  const leadsTab=`
    <div style="display:flex;justify-content:flex-end;margin-bottom:12px">
      <button class="btn btn-primary btn-sm" onclick="closePanel();showLeadForm(null,{co:'${esc(a.name)}',accId:${a.id}})">+ New Lead</button>
    </div>
    ${leads.length===0?'<div class="empty">No leads linked to this account.</div>':
    leads.map(l=>`<div class="related-card" onclick="closePanel();go('leads');setTimeout(()=>showLeadDetail(${l.id}),50)">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div class="related-card-name">${esc(l.name)}</div>${sb(l.stage)}
      </div>
      <div class="related-card-sub">${pb(l.pri)} · ₹${Number(l.val||0).toLocaleString('en-IN')} · ${esc(l.assigned)}</div>
    </div>`).join('')}`;

  const actTab=`
    <div class="sdiv">Log activity on this account</div>
    <div class="frow" style="margin-bottom:8px"><select class="sel" id="at"><option>Call</option><option>Email</option><option>Meeting</option><option>WhatsApp</option></select></div>
    <textarea class="inp" id="an" rows="2" placeholder="Activity note…" style="margin-bottom:8px"></textarea>
    <button class="btn btn-primary btn-sm" onclick="addAct('account',${a.id})" style="margin-bottom:16px">+ Log activity</button>
    <div class="sdiv">Combined timeline (Account + Contacts + Leads)</div>
    ${allActs.length===0?'<div class="empty">No activities yet.</div>':
    allActs.map(act=>`<div class="act-item">
      <div class="act-dot ${ACT_DOT[act.t]||''}"></div>
      <div><div style="font-size:12px;font-weight:600">${esc(act.t)} <span style="color:var(--text3);font-weight:400">· ${esc(act.d)}</span> <span style="color:var(--text3);font-size:10px">via ${esc(act.src)}</span></div>
      <div style="font-size:12px;color:var(--text2);margin-top:2px">${esc(act.n)}</div></div>
    </div>`).join('')}`;

  const tabs=['details','contacts','leads','timeline'];
  const html=`
  <div class="panel-head">
    <div class="panel-head-info">${av(a.name,a.id)}
      <div><div style="font-weight:700;font-size:14px">${esc(a.name)}</div><div style="font-size:12px;color:var(--text2)">${esc(a.ind)}</div></div>
    </div>
    <div style="display:flex;gap:5px">
      <button class="btn btn-sm" onclick="showAccForm(${a.id})">Edit</button>
      <button class="btn btn-sm" onclick="closePanel()">✕</button>
    </div>
  </div>
  <div class="panel-body">
    <div class="tabs">${tabs.map(t=>`<div class="tab ${S.tab===t?'active':''}" onclick="S.tab='${t}';showAccDetail(${a.id})">${t==='contacts'?`Contacts (${cts.length})`:t==='leads'?`Leads (${leads.length})`:t==='timeline'?`Timeline (${allActs.length})`:t.charAt(0).toUpperCase()+t.slice(1)}</div>`).join('')}</div>
    ${S.tab==='details'?detailTab:S.tab==='contacts'?contactsTab:S.tab==='leads'?leadsTab:actTab}
  </div>`;
  openPanel(html);
}

function showAccForm(id){
  const a=id?S.accounts.find(x=>x.id===id):null;const v=a||{};
  const html=`
  <div class="panel-head"><span style="font-weight:700">${a?'Edit Account':'New Account'}</span><button class="btn btn-sm" onclick="closePanel()">✕</button></div>
  <div class="panel-body">
    <div class="frow">
      <div class="fgrp"><label class="lbl">Account name <span class="req">*</span></label><input class="inp" id="an" value="${esc(v.name||'')}"></div>
      <div class="fgrp"><label class="lbl">Industry</label><select class="sel" id="ai">${S.dd.industries.map(i=>`<option ${v.ind===i?'selected':''}>${i}</option>`).join('')}</select></div>
    </div>
    <div class="frow">
      <div class="fgrp"><label class="lbl">Type</label><select class="sel" id="at">${S.dd.acctypes.map(t=>`<option ${v.type===t?'selected':''}>${t}</option>`).join('')}</select></div>
      <div class="fgrp"><label class="lbl">Employees</label><input class="inp" id="ae" value="${esc(v.emp||'')}" placeholder="e.g. 500+"></div>
    </div>
    <div class="frow">
      <div class="fgrp"><label class="lbl">Phone</label><input class="inp" id="ap" value="${esc(v.ph||'')}" placeholder="+91 XXXXXXXXXX"></div>
      <div class="fgrp"><label class="lbl">Website</label><input class="inp" id="aw" value="${esc(v.web||'')}" placeholder="company.com"></div>
    </div>
    <div class="frow">
      <div class="fgrp"><label class="lbl">City</label><input class="inp" id="ac" value="${esc(v.city||'')}"></div>
      <div class="fgrp"><label class="lbl">Assigned to</label><select class="sel" id="aas">${S.dd.assignees.map(a=>`<option ${v.assigned===a?'selected':''}>${a}</option>`).join('')}</select></div>
    </div>
    <div class="fgrp"><label class="lbl">Billing address</label><input class="inp" id="aad" value="${esc(v.addr||'')}"></div>
    <div class="fgrp"><label class="lbl">Notes</label><textarea class="inp" id="ano">${esc(v.notes||'')}</textarea></div>
  </div>
  <div class="panel-foot">
    <button class="btn" onclick="closePanel()">Cancel</button>
    <button class="btn btn-primary" onclick="saveAcc(${id||'null'})">${a?'Save changes':'Create Account'}</button>
  </div>`;
  openPanel(html);
}
function saveAcc(id){
  const name=document.getElementById('an')?.value?.trim();
  if(!name){toast('Account name is required','error');return;}
  const ap=document.getElementById('ap')?.value||'';
  if(ap&&!V.phone(ap)){toast('Invalid phone number','error');return;}
  const obj={name,ind:document.getElementById('ai').value,type:document.getElementById('at').value,
    emp:document.getElementById('ae').value,ph:ap,web:document.getElementById('aw').value,
    city:document.getElementById('ac').value,assigned:document.getElementById('aas').value,
    addr:document.getElementById('aad').value,notes:document.getElementById('ano').value};
  if(id){const i=S.accounts.findIndex(a=>a.id===id);S.accounts[i]={...S.accounts[i],...obj};}
  else{obj.id=uid();obj.acts=[];S.accounts.unshift(obj);}
  closePanel();render();toast(id?'Account updated':'Account created');
}

/* ══════════════════════════════════════════════════════════
   CONTACTS
══════════════════════════════════════════════════════════ */
function renderContacts(){
  const fl=S.contacts.filter(c=>{
    const q=S.search.toLowerCase();
    return!q||c.name.toLowerCase().includes(q)||c.email.toLowerCase().includes(q)||(c.title||'').toLowerCase().includes(q);
  });
  return `
  <div class="page-header">
    <span class="page-title">Contacts <span style="font-size:14px;color:var(--text2);font-weight:400">(${fl.length})</span></span>
    <div class="toolbar">
      <div class="search-wrap"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input class="search-inp" placeholder="Search contacts…" value="${esc(S.search)}" oninput="S.search=this.value;render()"></div>
      <button class="btn btn-primary btn-sm" onclick="showContactForm(null,null)">+ New Contact</button>
    </div>
  </div>
  <div class="content">
    <div class="stats">
      <div class="stat"><div class="stat-val">${S.contacts.length}</div><div class="stat-lbl">Total contacts</div></div>
      <div class="stat s-green"><div class="stat-val">${S.accounts.length}</div><div class="stat-lbl">Accounts</div></div>
      <div class="stat"><div class="stat-val">${[...new Set(S.contacts.map(c=>c.title).filter(Boolean))].length}</div><div class="stat-lbl">Unique roles</div></div>
      <div class="stat"><div class="stat-val">${S.contacts.filter(c=>!c.accId).length}</div><div class="stat-lbl">Unlinked</div></div>
    </div>
    <div class="table-card"><table>
      <thead><tr><th>Name</th><th>Title</th><th>Email</th><th>Phone</th><th>Account</th><th>Leads</th><th>City</th></tr></thead>
      <tbody>${fl.length===0?`<tr><td colspan="7"><div class="empty"><div class="empty-icon">👥</div>No contacts found</div></td></tr>`:
      fl.map(c=>{
        const linkedLeads=S.leads.filter(l=>l.ctId===c.id||l.email===c.email);
        return `<tr onclick="showContactDetail(${c.id})">
        <td><div style="display:flex;align-items:center;gap:8px">${av(c.name,c.id)}<span style="font-weight:500">${esc(c.name)}</span></div></td>
        <td style="color:var(--text2)">${esc(c.title||'—')}</td>
        <td><a href="mailto:${esc(c.email)}" style="color:var(--accent)" onclick="event.stopPropagation()">${esc(c.email)}</a></td>
        <td style="color:var(--text2)">${esc(c.ph||'—')}</td>
        <td>${c.accId?`<span class="td-link" onclick="event.stopPropagation();go('accounts');setTimeout(()=>showAccDetail(${c.accId}),50)">${esc(accName(c.accId))}</span>`:'—'}</td>
        <td><span class="badge b-new">${linkedLeads.length}</span></td>
        <td style="color:var(--text2)">${esc(c.city||'—')}</td>
      </tr>`;}).join('')}
      </tbody>
    </table></div>
  </div>`;
}

function showContactDetail(id){
  const c=S.contacts.find(x=>x.id===id);if(!c)return;
  const acc=c.accId?S.accounts.find(a=>a.id===c.accId):null;
  const linkedLeads=S.leads.filter(l=>l.ctId===c.id||l.email===c.email);
  const allActs=[...(c.acts||[])].sort((a,b)=>b.id-a.id);

  const detailTab=`
    <div class="drow"><span class="dlbl">Email</span><span class="dval"><a href="mailto:${esc(c.email)}" style="color:var(--accent)">${esc(c.email)}</a></span></div>
    <div class="drow"><span class="dlbl">Phone</span><span class="dval">${esc(c.ph||'—')}</span></div>
    <div class="drow"><span class="dlbl">Designation</span><span class="dval">${esc(c.title||'—')}</span></div>
    <div class="drow"><span class="dlbl">City</span><span class="dval">${esc(c.city||'—')}</span></div>
    <div class="drow"><span class="dlbl">Notes</span><span class="dval">${esc(c.notes||'—')}</span></div>
    <div class="sdiv">Linked Account</div>
    ${acc?`<div class="related-card" onclick="closePanel();go('accounts');setTimeout(()=>showAccDetail(${acc.id}),50)">
      <div class="related-card-name">${esc(acc.name)}</div>
      <div class="related-card-sub">${esc(acc.ind)} · ${esc(acc.city)}</div>
    </div>`:'<div class="related-empty">No account linked</div>'}`;

  const leadsTab=`
    <div style="display:flex;justify-content:flex-end;margin-bottom:12px">
      <button class="btn btn-primary btn-sm" onclick="closePanel();showLeadForm(null,{name:'${esc(c.name)}',email:'${esc(c.email)}',ph:'${esc(c.ph)}',co:'${acc?esc(acc.name):''}',accId:${c.accId||'null'},ctId:${c.id}})">+ New Lead</button>
    </div>
    ${linkedLeads.length===0?'<div class="empty">No leads linked to this contact.</div>':
    linkedLeads.map(l=>`<div class="related-card" onclick="closePanel();go('leads');setTimeout(()=>showLeadDetail(${l.id}),50)">
      <div style="display:flex;align-items:center;justify-content:space-between"><div class="related-card-name">${esc(l.name)}</div>${sb(l.stage)}</div>
      <div class="related-card-sub">₹${Number(l.val||0).toLocaleString('en-IN')} · ${esc(l.assigned)}</div>
    </div>`).join('')}`;

  const actTab=`
    <div class="sdiv">Log activity</div>
    <div class="frow" style="margin-bottom:8px"><select class="sel" id="at"><option>Call</option><option>Email</option><option>Meeting</option><option>WhatsApp</option></select></div>
    <textarea class="inp" id="an" rows="2" placeholder="Activity note…" style="margin-bottom:8px"></textarea>
    <button class="btn btn-primary btn-sm" onclick="addAct('contact',${c.id})" style="margin-bottom:16px">+ Log activity</button>
    <div class="sdiv">Activity history</div>
    ${allActs.length===0?'<div class="empty">No activities logged yet.</div>':
    allActs.map(a=>`<div class="act-item"><div class="act-dot ${ACT_DOT[a.t]||''}"></div>
      <div><div style="font-size:12px;font-weight:600">${esc(a.t)} <span style="color:var(--text3);font-weight:400">· ${esc(a.d)}</span></div>
      <div style="font-size:12px;color:var(--text2);margin-top:2px">${esc(a.n)}</div></div>
    </div>`).join('')}`;

  const tabs=['details','leads','activity'];
  const html=`
  <div class="panel-head">
    <div class="panel-head-info">${av(c.name,c.id)}
      <div><div style="font-weight:700;font-size:14px">${esc(c.name)}</div>
      <div style="font-size:12px;color:var(--text2)">${esc(c.title||'')}${c.title&&acc?' · ':''}${acc?`<span class="td-link" onclick="closePanel();go('accounts');setTimeout(()=>showAccDetail(${acc.id}),50)">${esc(acc.name)}</span>`:''}</div></div>
    </div>
    <div style="display:flex;gap:5px">
      <button class="btn btn-sm" onclick="showContactForm(${c.accId||'null'},${c.id})">Edit</button>
      <button class="btn btn-sm" onclick="closePanel()">✕</button>
    </div>
  </div>
  <div class="panel-body">
    <div class="tabs">${tabs.map(t=>`<div class="tab ${S.tab===t?'active':''}" onclick="S.tab='${t}';showContactDetail(${c.id})">${t==='leads'?`Leads (${linkedLeads.length})`:t.charAt(0).toUpperCase()+t.slice(1)}</div>`).join('')}</div>
    ${S.tab==='details'?detailTab:S.tab==='leads'?leadsTab:actTab}
  </div>`;
  openPanel(html);
}

function showContactForm(accId,ctId){
  const ct=ctId?S.contacts.find(c=>c.id===ctId):null;const v=ct||{};
  const html=`
  <div class="panel-head"><span style="font-weight:700">${ct?'Edit Contact':'New Contact'}${accId?` — ${esc(accName(accId))}`:''}</span><button class="btn btn-sm" onclick="${accId?`S.tab='contacts';showAccDetail(${accId})`:'closePanel()'}">✕</button></div>
  <div class="panel-body">
    <div class="frow">
      <div class="fgrp"><label class="lbl">Full name <span class="req">*</span></label><input class="inp" id="cfn" value="${esc(v.name||'')}"></div>
      <div class="fgrp"><label class="lbl">Title / Designation</label><input class="inp" id="cft" value="${esc(v.title||'')}"></div>
    </div>
    <div class="frow">
      <div class="fgrp"><label class="lbl">Email <span class="req">*</span></label><input class="inp" id="cfe" type="email" value="${esc(v.email||'')}"></div>
      <div class="fgrp"><label class="lbl">Phone</label><input class="inp" id="cfp" value="${esc(v.ph||'')}" placeholder="+91 XXXXX XXXXX"></div>
    </div>
    <div class="frow">
      <div class="fgrp"><label class="lbl">Account</label><select class="sel" id="cfa"><option value="">— No account —</option>${S.accounts.map(a=>`<option value="${a.id}" ${(v.accId||accId)==a.id?'selected':''}>${esc(a.name)}</option>`).join('')}</select></div>
      <div class="fgrp"><label class="lbl">City</label><input class="inp" id="cfc" value="${esc(v.city||'')}"></div>
    </div>
    <div class="fgrp"><label class="lbl">Notes</label><textarea class="inp" id="cfno">${esc(v.notes||'')}</textarea></div>
  </div>
  <div class="panel-foot">
    <button class="btn" onclick="${accId?`S.tab='contacts';showAccDetail(${accId})`:'closePanel()'}">Cancel</button>
    <button class="btn btn-primary" onclick="saveContact(${ctId||'null'},${accId||'null'})">${ct?'Save changes':'Add Contact'}</button>
  </div>`;
  openPanel(html);
}
function saveContact(id,defaultAccId){
  clearErrors(['cfn','cfe','cfp']);
  let ok=true;
  ok=vField('cfn',[[V.required,'Name is required']])&&ok;
  ok=vField('cfe',[[V.required,'Email is required'],[V.email,'Enter valid email']])&&ok;
  ok=vField('cfp',[[V.phone,'Enter valid Indian mobile']])&&ok;
  if(!ok)return;
  const accId=parseInt(document.getElementById('cfa').value)||defaultAccId||null;
  const obj={name:document.getElementById('cfn').value.trim(),title:document.getElementById('cft').value,
    email:document.getElementById('cfe').value,ph:document.getElementById('cfp').value,
    accId,city:document.getElementById('cfc').value,notes:document.getElementById('cfno').value};
  if(id){const i=S.contacts.findIndex(c=>c.id===id);S.contacts[i]={...S.contacts[i],...obj};}
  else{obj.id=uid();obj.acts=[];S.contacts.push(obj);}
  if(defaultAccId){S.tab='contacts';showAccDetail(defaultAccId);}else{closePanel();}
  render();toast(id?'Contact updated':'Contact created');
}

/* ══════════════════════════════════════════════════════════
   REMINDERS
══════════════════════════════════════════════════════════ */
function renderReminders(){
  const now=isoToday();
  let all=[];
  S.leads.forEach(l=>(l.tasks||[]).forEach(t=>all.push({...t,leadId:l.id,leadName:l.name,leadCo:l.co})));
  const overdue=all.filter(t=>!t.done&&t.due&&t.due<now);
  const dueToday=all.filter(t=>!t.done&&isDueToday(t.due));
  const upcoming=all.filter(t=>!t.done&&t.due&&t.due>now&&!isDueToday(t.due));
  const done=all.filter(t=>t.done);
  const filters=[{k:'overdue',label:`Overdue (${overdue.length})`},{k:'today',label:`Due today (${dueToday.length})`},{k:'upcoming',label:`Upcoming (${upcoming.length})`},{k:'done',label:`Done (${done.length})`}];
  let list=S.remFilter==='overdue'?overdue:S.remFilter==='today'?dueToday:S.remFilter==='upcoming'?upcoming:done;
  function row(t){
    const diff=daysDiff(t.due);
    let dlbl='',dcls='';
    if(t.done){dlbl='Done';dcls='color:var(--text3)';}
    else if(isOverdue(t.due)){dlbl=`${Math.abs(diff)}d overdue`;dcls='color:var(--red);font-weight:600';}
    else if(isDueToday(t.due)){dlbl='Due today';dcls='color:var(--amber);font-weight:600';}
    else{dlbl=`In ${diff}d`;dcls='color:var(--text2)';}
    return `<div class="rem-row ${t.done?'rem-done':''}">
      <div class="rem-check"><input type="checkbox" ${t.done?'checked':''} onchange="toggleTask(${t.leadId},${t.id},this.checked)"></div>
      <div class="act-dot ${ACT_DOT[t.t]||''}" style="margin-top:4px"></div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:500">${esc(t.note)}</div>
        <div style="font-size:12px;color:var(--text2);margin-top:2px">
          <span class="td-link" onclick="go('leads');setTimeout(()=>showLeadDetail(${t.leadId}),50)">${esc(t.leadName)}</span>
          <span style="color:var(--text3)"> · ${esc(t.leadCo)}</span>
          <span class="badge b-${(t.t||'').toLowerCase()}" style="font-size:10px;margin-left:4px">${esc(t.t)}</span>
        </div>
      </div>
      <div style="text-align:right;font-size:12px;${dcls}">${dlbl}<div style="font-size:11px;color:var(--text3)">${fmtDate(t.due)}</div></div>
      ${!t.done?`<button class="btn btn-xs btn-danger" onclick="deleteTask(${t.leadId},${t.id})">✕</button>`:''}
    </div>`;
  }
  return `
  <div class="page-header"><span class="page-title">Reminders & Tasks</span><button class="btn btn-primary btn-sm" onclick="showAddTaskPanel(null)">+ Schedule task</button></div>
  <div class="content">
    <div class="stats">
      <div class="stat s-red"><div class="stat-val">${overdue.length}</div><div class="stat-lbl">Overdue</div></div>
      <div class="stat s-amber"><div class="stat-val">${dueToday.length}</div><div class="stat-lbl">Due today</div></div>
      <div class="stat"><div class="stat-val">${upcoming.length}</div><div class="stat-lbl">Upcoming</div></div>
      <div class="stat s-green"><div class="stat-val">${done.length}</div><div class="stat-lbl">Completed</div></div>
    </div>
    <div class="table-card">
      <div style="display:flex;border-bottom:1px solid var(--border);padding:0 4px">
        ${filters.map(f=>`<div class="tab ${S.remFilter===f.k?'active':''}" onclick="S.remFilter='${f.k}';render()">${f.label}</div>`).join('')}
      </div>
      <div style="padding:4px 0">
        ${list.length===0?`<div class="empty"><div class="empty-icon">✅</div>${S.remFilter==='overdue'?'No overdue tasks!':S.remFilter==='today'?'Nothing due today.':S.remFilter==='upcoming'?'No upcoming tasks.':'No completed tasks.'}</div>`:list.map(row).join('')}
      </div>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════════════
   COMPETITORS
══════════════════════════════════════════════════════════ */
function renderCompetitors(){
  return `
  <div class="page-header"><span class="page-title">Competitors</span><button class="btn btn-primary btn-sm" onclick="showCompForm(null)">+ Add Competitor</button></div>
  <div class="content">
    <div class="stats">
      <div class="stat"><div class="stat-val">${S.competitors.length}</div><div class="stat-lbl">Total competitors</div></div>
      <div class="stat s-red"><div class="stat-val">${S.leads.reduce((a,l)=>a+(l.competitors||[]).length,0)}</div><div class="stat-lbl">Lead links</div></div>
    </div>
    ${S.competitors.length===0?`<div class="empty"><div class="empty-icon">⭐</div>No competitors added yet</div>`:
    S.competitors.map(c=>`<div class="comp-card">
      <div class="comp-card-head">
        <div><div class="comp-name">${esc(c.name)}</div><div style="font-size:12px;color:var(--accent)">${c.website?`<a href="https://${esc(c.website)}" target="_blank" style="color:var(--accent)">${esc(c.website)}</a>`:''}</div></div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm" onclick="showCompForm(${c.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteComp(${c.id})">Delete</button>
        </div>
      </div>
      <div class="comp-grid">
        <div class="comp-field"><div class="comp-field-lbl">Pricing</div><div class="comp-field-val">${esc(c.pricing||'—')}</div></div>
        <div class="comp-field"><div class="comp-field-lbl">Market share</div><div class="comp-field-val">${esc(c.marketShare||'—')}</div></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
        <div style="background:var(--green-bg);border-radius:var(--radius);padding:8px">
          <div style="font-size:10px;font-weight:600;color:var(--green);text-transform:uppercase;margin-bottom:4px">Strengths</div>
          <div style="font-size:12px">${esc(c.strengths||'—')}</div>
        </div>
        <div style="background:var(--red-bg);border-radius:var(--radius);padding:8px">
          <div style="font-size:10px;font-weight:600;color:var(--red);text-transform:uppercase;margin-bottom:4px">Weaknesses</div>
          <div style="font-size:12px">${esc(c.weaknesses||'—')}</div>
        </div>
      </div>
      ${c.notes?`<div style="margin-top:10px;font-size:12px;color:var(--text2);background:var(--bg);padding:8px;border-radius:var(--radius)"><strong>Notes:</strong> ${esc(c.notes)}</div>`:''}
      <div style="margin-top:8px;font-size:11px;color:var(--text3)">Linked to ${S.leads.filter(l=>(l.competitors||[]).includes(c.id)).length} lead(s)</div>
    </div>`).join('')}
  </div>`;
}
function showCompForm(id){
  const c=id?S.competitors.find(x=>x.id===id):null;const v=c||{};
  const html=`
  <div class="panel-head"><span style="font-weight:700">${c?'Edit Competitor':'New Competitor'}</span><button class="btn btn-sm" onclick="closePanel()">✕</button></div>
  <div class="panel-body">
    <div class="frow">
      <div class="fgrp"><label class="lbl">Competitor name <span class="req">*</span></label><input class="inp" id="cname" value="${esc(v.name||'')}"></div>
      <div class="fgrp"><label class="lbl">Website</label><input class="inp" id="cweb" value="${esc(v.website||'')}" placeholder="competitor.com"></div>
    </div>
    <div class="frow">
      <div class="fgrp"><label class="lbl">Pricing</label><input class="inp" id="cprice" value="${esc(v.pricing||'')}" placeholder="e.g. ₹2,000/user/month"></div>
      <div class="fgrp"><label class="lbl">Market share</label><input class="inp" id="cmkt" value="${esc(v.marketShare||'')}" placeholder="e.g. 25%"></div>
    </div>
    <div class="fgrp"><label class="lbl">Strengths</label><textarea class="inp" id="cstr" rows="2">${esc(v.strengths||'')}</textarea></div>
    <div class="fgrp"><label class="lbl">Weaknesses</label><textarea class="inp" id="cweak" rows="2">${esc(v.weaknesses||'')}</textarea></div>
    <div class="fgrp"><label class="lbl">Notes</label><textarea class="inp" id="cnotes" rows="2">${esc(v.notes||'')}</textarea></div>
  </div>
  <div class="panel-foot">
    <button class="btn" onclick="closePanel()">Cancel</button>
    <button class="btn btn-primary" onclick="saveComp(${id||'null'})">${c?'Save changes':'Add Competitor'}</button>
  </div>`;
  openPanel(html);
}
function saveComp(id){
  const name=document.getElementById('cname')?.value?.trim();
  if(!name){toast('Name is required','error');return;}
  const obj={name,website:document.getElementById('cweb').value,pricing:document.getElementById('cprice').value,
    marketShare:document.getElementById('cmkt').value,strengths:document.getElementById('cstr').value,
    weaknesses:document.getElementById('cweak').value,notes:document.getElementById('cnotes').value};
  if(id){const i=S.competitors.findIndex(c=>c.id===id);S.competitors[i]={...S.competitors[i],...obj};}
  else{obj.id=uid();S.competitors.push(obj);}
  closePanel();render();toast(id?'Competitor updated':'Competitor added');
}
function deleteComp(id){
  if(!confirm('Delete this competitor?'))return;
  S.competitors=S.competitors.filter(c=>c.id!==id);
  S.leads.forEach(l=>{l.competitors=(l.competitors||[]).filter(x=>x!==id);});
  render();toast('Competitor deleted','error');
}

/* ══════════════════════════════════════════════════════════
   SETTINGS
══════════════════════════════════════════════════════════ */
function renderSettings(){
  const keys={sources:'Lead sources',industries:'Industries',services:'Services',assignees:'Team members',acctypes:'Account types'};
  return `
  <div class="page-header"><span class="page-title">Settings</span></div>
  <div class="content">
    <div style="max-width:600px">
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px 20px;margin-bottom:18px">
        <div class="sdiv" style="margin-top:0">Company logo</div>
        <p style="font-size:13px;color:var(--text2);margin-bottom:10px">To add the Thinkcap Advisors logo, place your logo file (e.g. <code>thinkcap-logo.png</code>) in the same folder as <code>index.html</code>, then update the logo area in <code>index.html</code>:</p>
        <code style="background:var(--bg);padding:8px 12px;border-radius:var(--radius);display:block;font-size:12px">Replace the .logo-placeholder div with:<br>&lt;img src="thinkcap-logo.png" class="logo-img" alt="Thinkcap Advisors"&gt;</code>
      </div>
      ${Object.entries(keys).map(([k,label])=>`
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px 20px;margin-bottom:12px">
          <div class="sdiv" style="margin-top:0">${label}</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
            ${S.dd[k].map(v=>`<span class="tag">${esc(v)}<span class="tag-remove" onclick="rmDD('${k}','${esc(v)}')">×</span></span>`).join('')}
          </div>
          <div style="display:flex;gap:8px">
            <input class="inp" id="dd-${k}" placeholder="Add new ${label.toLowerCase().replace(/s$/,'')}…" style="flex:1">
            <button class="btn btn-primary btn-sm" onclick="addDD('${k}')">+ Add</button>
          </div>
        </div>`).join('')}
    </div>
  </div>`;
}
function addDD(k){const inp=document.getElementById('dd-'+k);const v=inp?.value?.trim();if(!v)return;if(!S.dd[k].includes(v))S.dd[k].push(v);inp.value='';render();toast('Value added');}
function rmDD(k,v){S.dd[k]=S.dd[k].filter(x=>x!==v);render();}

/* ── Boot ──────────────────────────────────────────────── */
go('dashboard');

/* ═══════════════════════════════════════════════════════════
   REMINDER POP-UP SYSTEM  v5
   - Fires on load + every 5 min
   - Snooze 15 min / 1 hour
   - Complete → note + optional follow-up
   - Activity saved to Lead + linked Contact + linked Account
   ═══════════════════════════════════════════════════════════ */

/* snoozed tasks: { taskId_leadId -> snoozeUntil (Date) } */
const SNOOZED = {};

function isDuNow(t) {
  if (t.done) return false;
  if (!t.due) return false;
  const snoozeKey = `${t.id}_${t._leadId}`;
  if (SNOOZED[snoozeKey] && new Date() < SNOOZED[snoozeKey]) return false;
  // due today or overdue
  return t.due <= isoToday();
}

function getDueNowTasks() {
  const tasks = [];
  S.leads.forEach(l => {
    (l.tasks || []).forEach(t => {
      if (isDuNow({ ...t, _leadId: l.id })) {
        tasks.push({ ...t, _leadId: l.id, _leadName: l.name, _leadCo: l.co, _accId: l.accId, _ctId: l.ctId });
      }
    });
  });
  return tasks;
}

function checkAndShowReminder() {
  const tasks = getDueNowTasks();
  if (tasks.length === 0) return;
  showReminderPopup(tasks);
}

function showReminderPopup(tasks) {
  // remove existing popup if any
  const existing = document.getElementById('reminder-popup-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'reminder-popup-overlay';
  overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:300;display:flex;align-items:flex-start;justify-content:center;padding-top:60px;backdrop-filter:blur(3px)`;

  overlay.innerHTML = `
    <div id="reminder-popup" style="background:var(--surface);border-radius:var(--radius-xl);box-shadow:0 20px 60px rgba(0,0,0,.2);width:520px;max-width:95vw;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;animation:slideDown .22s cubic-bezier(.4,0,.2,1)">
      <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:var(--red-bg)">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:20px">🔔</span>
          <div>
            <div style="font-weight:700;font-size:15px;color:var(--red)">Activity Reminders</div>
            <div style="font-size:12px;color:var(--red);opacity:.8">${tasks.length} task${tasks.length > 1 ? 's' : ''} due now</div>
          </div>
        </div>
        <button onclick="closeReminderPopup()" style="background:none;border:none;cursor:pointer;font-size:20px;color:var(--text2);line-height:1;padding:4px">×</button>
      </div>
      <div id="reminder-list" style="overflow-y:auto;flex:1;padding:8px 0">
        ${tasks.map(t => reminderTaskRow(t)).join('')}
      </div>
      <div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:12px;color:var(--text2)">Snoozed tasks will reappear after the selected time</span>
        <button class="btn btn-sm" onclick="snoozeAll(15)">Snooze all 15 min</button>
      </div>
    </div>
  `;

  // add slide animation
  const style = document.createElement('style');
  style.textContent = `@keyframes slideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}`;
  document.head.appendChild(style);

  document.body.appendChild(overlay);
}

function reminderTaskRow(t) {
  const snoozeKey = `${t.id}_${t._leadId}`;
  const diff = daysDiff(t.due);
  const overdueText = isOverdue(t.due) ? `<span style="color:var(--red);font-weight:600">${Math.abs(diff)}d overdue</span>` : `<span style="color:var(--amber);font-weight:600">Due today</span>`;
  return `
    <div id="rrow-${t.id}-${t._leadId}" style="padding:12px 20px;border-bottom:1px solid var(--border);display:flex;gap:12px;align-items:flex-start">
      <div class="act-dot ${ACT_DOT[t.t] || ''}" style="margin-top:5px;width:10px;height:10px;flex-shrink:0"></div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:13px;margin-bottom:2px">${esc(t.note)}</div>
        <div style="font-size:12px;color:var(--text2);margin-bottom:6px">
          <span class="badge b-${(t.t || '').toLowerCase()}" style="font-size:10px">${esc(t.t)}</span>
          &nbsp;·&nbsp;<strong>${esc(t._leadName)}</strong> — ${esc(t._leadCo)}
          &nbsp;·&nbsp;${overdueText}
          &nbsp;·&nbsp;${fmtDate(t.due)}
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-xs" style="background:var(--amber-bg);color:var(--amber);border-color:var(--amber-bg)" onclick="snoozeTask(${t.id},${t._leadId},15)">⏱ Snooze 15 min</button>
          <button class="btn btn-xs" style="background:var(--amber-bg);color:var(--amber);border-color:var(--amber-bg)" onclick="snoozeTask(${t.id},${t._leadId},60)">⏱ Snooze 1 hour</button>
          <button class="btn btn-xs btn-success" onclick="showCompleteModal(${t.id},${t._leadId})">✓ Complete</button>
        </div>
      </div>
    </div>`;
}

function closeReminderPopup() {
  const el = document.getElementById('reminder-popup-overlay');
  if (el) el.remove();
}

function snoozeTask(taskId, leadId, minutes) {
  const key = `${taskId}_${leadId}`;
  const until = new Date(Date.now() + minutes * 60 * 1000);
  SNOOZED[key] = until;
  // remove row from popup
  const row = document.getElementById(`rrow-${taskId}-${leadId}`);
  if (row) {
    row.style.opacity = '0.4';
    row.style.pointerEvents = 'none';
    row.querySelector('div[style*="flex:1"]').innerHTML += `<div style="font-size:11px;color:var(--amber);margin-top:4px">⏱ Snoozed until ${until.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>`;
  }
  // if all tasks snoozed or done, close
  const remaining = getDueNowTasks();
  if (remaining.length === 0) setTimeout(closeReminderPopup, 800);
  toast(`Snoozed for ${minutes === 15 ? '15 minutes' : '1 hour'}`);
}

function snoozeAll(minutes) {
  getDueNowTasks().forEach(t => snoozeTask(t.id, t._leadId, minutes));
}

/* ── Complete activity modal ───────────────────────────── */
function showCompleteModal(taskId, leadId) {
  const lead = S.leads.find(l => l.id === leadId);
  const task = (lead?.tasks || []).find(t => t.id === taskId);
  if (!lead || !task) return;

  const existing = document.getElementById('complete-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'complete-modal-overlay';
  overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:400;display:flex;align-items:center;justify-content:center;padding:20px`;

  overlay.innerHTML = `
    <div style="background:var(--surface);border-radius:var(--radius-xl);box-shadow:0 20px 60px rgba(0,0,0,.25);width:480px;max-width:95vw;max-height:90vh;overflow-y:auto;animation:slideDown .2s ease">
      <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-weight:700;font-size:15px">Complete Activity</div>
          <div style="font-size:12px;color:var(--text2);margin-top:2px">${esc(task.t)} — ${esc(task.note)} · <strong>${esc(lead.name)}</strong></div>
        </div>
        <button onclick="document.getElementById('complete-modal-overlay').remove()" style="background:none;border:none;cursor:pointer;font-size:20px;color:var(--text2)">×</button>
      </div>
      <div style="padding:20px">
        <div class="fgrp">
          <label class="lbl">Activity note <span class="req">*</span></label>
          <textarea class="inp" id="cm-note" rows="3" placeholder="What was discussed? What happened on this call/meeting/email?…"></textarea>
        </div>
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-lg);padding:14px;margin-top:4px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;cursor:pointer" onclick="toggleFollowUp()">
            <input type="checkbox" id="cm-followup-chk" style="width:15px;height:15px;accent-color:var(--accent);cursor:pointer">
            <label for="cm-followup-chk" style="font-weight:600;font-size:13px;cursor:pointer">📅 Create a follow-up activity</label>
          </div>
          <div id="cm-followup-fields" style="display:none">
            <div class="frow">
              <div class="fgrp">
                <label class="lbl">Follow-up type</label>
                <select class="sel" id="cm-fu-type"><option>Call</option><option>Email</option><option>Meeting</option><option>WhatsApp</option></select>
              </div>
              <div class="fgrp">
                <label class="lbl">Due date <span class="req">*</span></label>
                <input class="inp" type="date" id="cm-fu-date" value="${getNextWorkingDay()}">
              </div>
            </div>
            <div class="fgrp">
              <label class="lbl">Follow-up note</label>
              <input class="inp" id="cm-fu-note" placeholder="What should happen next?…">
            </div>
          </div>
        </div>
      </div>
      <div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end">
        <button class="btn" onclick="document.getElementById('complete-modal-overlay').remove()">Cancel</button>
        <button class="btn btn-success" onclick="completeActivity(${taskId},${leadId})">✓ Mark complete & save</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
}

function toggleFollowUp() {
  const chk = document.getElementById('cm-followup-chk');
  const fields = document.getElementById('cm-followup-fields');
  if (!chk || !fields) return;
  chk.checked = !chk.checked;
  fields.style.display = chk.checked ? 'block' : 'none';
}

function getNextWorkingDay() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1); // skip Sunday
  if (d.getDay() === 6) d.setDate(d.getDate() + 2); // skip Saturday
  return d.toISOString().slice(0, 10);
}

function completeActivity(taskId, leadId) {
  const note = document.getElementById('cm-note')?.value?.trim();
  if (!note) { toast('Please enter an activity note', 'error'); return; }

  const lead = S.leads.find(l => l.id === leadId);
  const task = (lead?.tasks || []).find(t => t.id === taskId);
  if (!lead || !task) return;

  // 1. Mark task done
  task.done = true;

  // 2. Build activity record
  const actRecord = {
    id: uid(),
    t: task.t,
    d: todayLabel(),
    n: note,
    module: 'lead',
    completedFrom: 'reminder'
  };

  // 3. Save to Lead
  if (!lead.acts) lead.acts = [];
  lead.acts.unshift(actRecord);

  // 4. Save to linked Account
  if (lead.accId) {
    const acc = S.accounts.find(a => a.id === lead.accId);
    if (acc) {
      if (!acc.acts) acc.acts = [];
      acc.acts.unshift({ ...actRecord, id: uid(), module: 'account', linkedLead: lead.name });
    }
  }

  // 5. Save to linked Contact
  if (lead.ctId) {
    const ct = S.contacts.find(c => c.id === lead.ctId);
    if (ct) {
      if (!ct.acts) ct.acts = [];
      ct.acts.unshift({ ...actRecord, id: uid(), module: 'contact', linkedLead: lead.name });
    }
  }

  // 6. Create follow-up task if checked
  const followupChk = document.getElementById('cm-followup-chk');
  if (followupChk?.checked) {
    const fuDate = document.getElementById('cm-fu-date')?.value;
    const fuNote = document.getElementById('cm-fu-note')?.value?.trim() || 'Follow-up';
    const fuType = document.getElementById('cm-fu-type')?.value || 'Call';
    if (fuDate) {
      if (!lead.tasks) lead.tasks = [];
      lead.tasks.unshift({ id: uid(), t: fuType, note: fuNote, due: fuDate, done: false });
      toast('Activity completed + follow-up scheduled!', 'success');
    }
  } else {
    toast('Activity marked complete', 'success');
  }

  // 7. Close modals and refresh
  document.getElementById('complete-modal-overlay')?.remove();

  // remove from reminder popup row
  const row = document.getElementById(`rrow-${taskId}-${leadId}`);
  if (row) row.remove();

  // if no more due tasks, close popup
  const remaining = getDueNowTasks();
  if (remaining.length === 0) closeReminderPopup();

  render();
}

/* ── Auto-check timer ──────────────────────────────────── */
function startReminderTimer() {
  // check on load after 1s (let page render first)
  setTimeout(checkAndShowReminder, 1000);
  // then every 5 minutes
  setInterval(checkAndShowReminder, 5 * 60 * 1000);
}

/* ═══════════════════════════════════════════════════════════
   LIVE ACCOUNT SEARCH on Contact form
   Replaces the static <select> with a type-ahead input
   ═══════════════════════════════════════════════════════════ */

function renderAccSearch(selectedId) {
  const selAcc = selectedId ? S.accounts.find(a => a.id === selectedId) : null;
  return `
    <div style="position:relative" id="acc-search-wrap">
      <input class="inp" id="acc-search-inp"
        placeholder="Type to search accounts…"
        value="${selAcc ? esc(selAcc.name) : ''}"
        autocomplete="off"
        oninput="accSearchType(this.value)"
        onfocus="accSearchType(this.value)"
        onblur="setTimeout(hideAccDD,200)">
      <input type="hidden" id="acc-search-val" value="${selectedId || ''}">
      <div id="acc-search-dd" style="display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow-md);z-index:50;max-height:200px;overflow-y:auto"></div>
    </div>`;
}

function accSearchType(q) {
  const dd = document.getElementById('acc-search-dd');
  if (!dd) return;
  const matches = q.length === 0
    ? S.accounts.slice(0, 8)
    : S.accounts.filter(a => a.name.toLowerCase().includes(q.toLowerCase()) || a.city.toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  if (matches.length === 0) {
    dd.innerHTML = `<div style="padding:10px 12px;font-size:12px;color:var(--text3)">No accounts found. <span style="color:var(--accent);cursor:pointer" onclick="closePanel();showAccForm(null)">+ Create new</span></div>`;
    dd.style.display = 'block'; return;
  }
  dd.innerHTML = matches.map(a => `
    <div onclick="selectAcc(${a.id},'${esc(a.name)}')"
      style="padding:9px 12px;cursor:pointer;display:flex;align-items:center;gap:8px;transition:background .1s"
      onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''">
      <div class="avatar av${a.id % 5}" style="width:26px;height:26px;font-size:10px">${ini(a.name)}</div>
      <div>
        <div style="font-size:13px;font-weight:500">${esc(a.name)}</div>
        <div style="font-size:11px;color:var(--text2)">${esc(a.ind)} · ${esc(a.city)}</div>
      </div>
    </div>`).join('');
  dd.style.display = 'block';
}

function selectAcc(id, name) {
  const inp = document.getElementById('acc-search-inp');
  const val = document.getElementById('acc-search-val');
  if (inp) inp.value = name;
  if (val) val.value = id;
  hideAccDD();
}

function hideAccDD() {
  const dd = document.getElementById('acc-search-dd');
  if (dd) dd.style.display = 'none';
}

/* ── Patch showContactForm to use live search ──────────── */
// Override the original showContactForm with account type-ahead
const _origShowContactForm = showContactForm;
showContactForm = function(accId, ctId) {
  const ct = ctId ? S.contacts.find(c => c.id === ctId) : null;
  const v = ct || {};
  const effectiveAccId = v.accId || accId;

  const html = `
  <div class="panel-head">
    <span style="font-weight:700">${ct ? 'Edit Contact' : 'New Contact'}${accId ? ` — ${esc(accName(accId))}` : ''}</span>
    <button class="btn btn-sm" onclick="${accId ? `S.tab='contacts';showAccDetail(${accId})` : 'closePanel()'}">✕</button>
  </div>
  <div class="panel-body">
    <div class="frow">
      <div class="fgrp"><label class="lbl">Full name <span class="req">*</span></label><input class="inp" id="cfn" value="${esc(v.name || '')}"></div>
      <div class="fgrp"><label class="lbl">Title / Designation</label><input class="inp" id="cft" value="${esc(v.title || '')}"></div>
    </div>
    <div class="frow">
      <div class="fgrp"><label class="lbl">Email <span class="req">*</span></label><input class="inp" id="cfe" type="email" value="${esc(v.email || '')}"></div>
      <div class="fgrp"><label class="lbl">Phone</label><input class="inp" id="cfp" value="${esc(v.ph || '')}" placeholder="+91 XXXXX XXXXX"></div>
    </div>
    <div class="fgrp">
      <label class="lbl">Account — <span style="color:var(--accent);font-weight:400">search by name</span></label>
      ${renderAccSearch(effectiveAccId)}
    </div>
    <div class="fgrp"><label class="lbl">City</label><input class="inp" id="cfc" value="${esc(v.city || '')}"></div>
    <div class="fgrp"><label class="lbl">Notes</label><textarea class="inp" id="cfno">${esc(v.notes || '')}</textarea></div>
  </div>
  <div class="panel-foot">
    <button class="btn" onclick="${accId ? `S.tab='contacts';showAccDetail(${accId})` : 'closePanel()'}">Cancel</button>
    <button class="btn btn-primary" onclick="saveContactV2(${ctId || 'null'}, ${accId || 'null'})">${ct ? 'Save changes' : 'Add Contact'}</button>
  </div>`;
  openPanel(html);
};

function saveContactV2(id, defaultAccId) {
  clearErrors(['cfn', 'cfe', 'cfp']);
  let ok = true;
  ok = vField('cfn', [[V.required, 'Name is required']]) && ok;
  ok = vField('cfe', [[V.required, 'Email is required'], [V.email, 'Enter valid email (name@domain.com)']]) && ok;
  ok = vField('cfp', [[V.phone, 'Enter valid Indian mobile (+91 XXXXX XXXXX)']]) && ok;
  if (!ok) return;
  const accId = parseInt(document.getElementById('acc-search-val')?.value) || defaultAccId || null;
  const obj = {
    name: document.getElementById('cfn').value.trim(),
    title: document.getElementById('cft').value,
    email: document.getElementById('cfe').value,
    ph: document.getElementById('cfp').value,
    accId,
    city: document.getElementById('cfc').value,
    notes: document.getElementById('cfno').value,
  };
  if (id) {
    const i = S.contacts.findIndex(c => c.id === id);
    S.contacts[i] = { ...S.contacts[i], ...obj };
  } else {
    obj.id = uid(); obj.acts = [];
    S.contacts.push(obj);
  }
  if (defaultAccId) { S.tab = 'contacts'; showAccDetail(defaultAccId); }
  else { closePanel(); }
  render();
  toast(id ? 'Contact updated' : 'Contact created');
}

/* ── Start reminder timer on boot ──────────────────────── */
startReminderTimer();

/* ── Bell badge update ─────────────────────────────────── */
function updateBellBadge() {
  const tasks = getDueNowTasks();
  const badge = document.getElementById('bell-badge');
  if (!badge) return;
  if (tasks.length > 0) {
    badge.textContent = tasks.length > 9 ? '9+' : tasks.length;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

/* patch render() to also update bell badge */
const _origRender = render;
render = function() {
  _origRender();
  updateBellBadge();
};

/* ── Keep reminder list fresh after snooze/complete ────── */
function refreshReminderList() {
  const listEl = document.getElementById('reminder-list');
  if (!listEl) return;
  const tasks = getDueNowTasks();
  if (tasks.length === 0) {
    listEl.innerHTML = `<div style="padding:30px;text-align:center;color:var(--text3)"><div style="font-size:28px;margin-bottom:8px">✅</div><div style="font-size:14px;font-weight:500">All caught up!</div><div style="font-size:12px;margin-top:4px">No more reminders right now</div></div>`;
    setTimeout(closeReminderPopup, 2000);
  } else {
    listEl.innerHTML = tasks.map(t => reminderTaskRow(t)).join('');
  }
  updateBellBadge();
}

