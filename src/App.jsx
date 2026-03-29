import { useState } from "react";

// ─── SUPABASE CONFIG ───────────────────────────────────────────
// Replace these with your real Supabase credentials
// Get them from: https://supabase.com → Project Settings → API
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";

const supabase = async (table, method = "GET", body = null, filters = "") => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${filters}`, {
    method,
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      "Prefer": method === "POST" ? "return=representation" : "",
    },
    body: body ? JSON.stringify(body) : null,
  });
  return res.ok ? res.json() : null;
};

// ─── THEME ─────────────────────────────────────────────────────
const T = {
  bg: "#0D0C0B", surface: "#161412", card: "#1D1B19", cardHover: "#242220",
  accent: "#C8A96E", accentGlow: "rgba(200,169,110,0.1)", accentDark: "#9A7D45",
  text: "#EDE8DF", textSub: "#9B9080", textMuted: "#5C5650",
  border: "#2B2825", borderLight: "#373330",
  success: "#5CB87A", warning: "#E0A035", danger: "#D45C5C", info: "#5B8DD9",
};

// ─── STATIC DATA (swap out for Supabase calls once connected) ──
const PRODUCTS = [
  { id:1, name:"Luxe Velvet Armchair", cat:"Armchairs", cost:149, rrp:299, stock:24, sku:"KAB-ARM-001",
    image:"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80" },
  { id:2, name:"Oslo Oak Dining Table", cat:"Dining Tables", cost:289, rrp:549, stock:12, sku:"KAB-DIN-001",
    image:"https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80" },
  { id:3, name:"Haven 3-Seat Sofa", cat:"Sofas", cost:549, rrp:999, stock:8, sku:"KAB-SOF-001",
    image:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80" },
  { id:4, name:"Arc Brass Floor Lamp", cat:"Lighting", cost:69, rrp:149, stock:35, sku:"KAB-LMP-001",
    image:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80" },
  { id:5, name:"Marble Coffee Table", cat:"Coffee Tables", cost:199, rrp:399, stock:15, sku:"KAB-COF-001",
    image:"https://images.unsplash.com/photo-1567538096621-38d2284b23ff?w=600&q=80" },
  { id:6, name:"Rattan Garden Set", cat:"Garden", cost:179, rrp:349, stock:20, sku:"KAB-GRD-001",
    image:"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80" },
  { id:7, name:"Walnut Media Unit", cat:"TV Stands", cost:129, rrp:249, stock:18, sku:"KAB-TVS-001",
    image:"https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80" },
  { id:8, name:"Boucle Rocking Chair", cat:"Rocking Chairs", cost:99, rrp:199, stock:22, sku:"KAB-ROC-001",
    image:"https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80" },
];

const RESELLERS = [
  { id:1, name:"Thuan Nguyen", store:"Glasgow Home Furnishings", email:"thuan@glasgowhome.co.uk", status:"active", products:12, orders:23, revenue:4820, commission:482, joined:"Jan 2026", location:"Glasgow, Scotland", slug:"thuan-glasgow" },
  { id:2, name:"Sarah Mitchell", store:"Modern Living UK", email:"sarah@modernliving.co.uk", status:"active", products:18, orders:41, revenue:8930, commission:893, joined:"Dec 2025", location:"London, England", slug:"sarah-london" },
  { id:3, name:"James Okafor", store:"Casa Elegante", email:"james@casaelegante.com", status:"pending", products:0, orders:0, revenue:0, commission:0, joined:"Mar 2026", location:"Birmingham, England", slug:"james-birmingham" },
  { id:4, name:"Priya Sharma", store:"Home Luxe", email:"priya@homeluxe.uk", status:"active", products:9, orders:15, revenue:2740, commission:274, joined:"Feb 2026", location:"Leeds, England", slug:"priya-leeds" },
];

const ORDERS = [
  { id:"KAB-2601", customer:"Alex Thompson", reseller:"Glasgow Home Furnishings", product:"Luxe Velvet Armchair", qty:1, sale:199, cost:149, status:"fulfilled", date:"29 Mar 2026" },
  { id:"KAB-2602", customer:"Emma Watson", reseller:"Modern Living UK", product:"Oslo Oak Dining Table", qty:1, sale:449, cost:289, status:"processing", date:"29 Mar 2026" },
  { id:"KAB-2603", customer:"Michael Brown", reseller:"Glasgow Home Furnishings", product:"Arc Brass Floor Lamp", qty:2, sale:258, cost:138, status:"shipped", date:"28 Mar 2026" },
  { id:"KAB-2604", customer:"Lisa Chen", reseller:"Home Luxe", product:"Marble Coffee Table", qty:1, sale:329, cost:199, status:"fulfilled", date:"27 Mar 2026" },
  { id:"KAB-2605", customer:"David Kim", reseller:"Modern Living UK", product:"Haven 3-Seat Sofa", qty:1, sale:849, cost:549, status:"processing", date:"29 Mar 2026" },
];

// ─── SHARED COMPONENTS ─────────────────────────────────────────
const Badge = ({ status }) => {
  const colors = { active:T.success, pending:T.warning, fulfilled:T.success, shipped:T.info, processing:T.warning, suspended:T.danger };
  const c = colors[status] || T.textSub;
  return <span style={{display:"inline-flex",alignItems:"center",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:`${c}20`,color:c,border:`1px solid ${c}40`}}>{status}</span>;
};

const Stat = ({ label, value, sub, accent }) => (
  <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"20px 22px",flex:1,minWidth:130}}>
    <div style={{fontSize:11,color:T.textMuted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>{label}</div>
    <div style={{fontSize:26,fontWeight:700,color:accent?T.accent:T.text,fontFamily:"Georgia,serif",lineHeight:1}}>{value}</div>
    {sub && <div style={{fontSize:12,color:T.textSub,marginTop:6}}>{sub}</div>}
  </div>
);

const NavItem = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:8,cursor:"pointer",background:active?T.accentGlow:"transparent",color:active?T.accent:T.textSub,fontWeight:active?600:400,fontSize:14,transition:"all 0.15s",border:`1px solid ${active?T.accent+"30":"transparent"}`}}>
    <span style={{fontSize:16}}>{icon}</span>{label}
  </div>
);

const Sidebar = ({ role, page, setPage, setRole }) => {
  const adminNav = [["📊","Dashboard","dashboard"],["📦","Products","products"],["🛒","Orders","orders"],["👥","Resellers","resellers"],["🗄️","Supabase Setup","supabase"]];
  const resellerNav = [["📊","Dashboard","dashboard"],["🗂️","Catalogue","catalogue"],["🏪","My Store","store"],["📋","My Orders","orders"]];
  const nav = role === "admin" ? adminNav : resellerNav;
  return (
    <div style={{width:218,minHeight:"100vh",background:T.surface,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",padding:"0 12px 24px",flexShrink:0}}>
      <div style={{padding:"22px 10px 18px",borderBottom:`1px solid ${T.border}`,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:8,background:`linear-gradient(135deg,${T.accent},${T.accentDark})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>🛋️</div>
          <div>
            <div style={{fontWeight:700,fontSize:15,color:T.text,fontFamily:"Georgia,serif"}}>Kabinet</div>
            <div style={{fontSize:10,color:T.textMuted,letterSpacing:"0.05em",textTransform:"uppercase"}}>{role==="admin"?"Admin Portal":"Reseller Portal"}</div>
          </div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:3,flex:1}}>
        {nav.map(([icon,label,key])=><NavItem key={key} icon={icon} label={label} active={page===key} onClick={()=>setPage(key)}/>)}
      </div>
      <div style={{borderTop:`1px solid ${T.border}`,paddingTop:14}}>
        <div style={{fontSize:10,color:T.textMuted,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:8,paddingLeft:4}}>Switch View</div>
        {[["admin","🔑 Admin"],["reseller","🏪 Reseller"],["customer","🛍️ Customer"]].map(([r,label])=>(
          <div key={r} onClick={()=>{setRole(r);setPage("dashboard");}} style={{padding:"7px 14px",borderRadius:7,cursor:"pointer",fontSize:13,color:role===r?T.accent:T.textSub,background:role===r?T.accentGlow:"transparent",fontWeight:role===r?600:400,marginBottom:2}}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── SUPABASE SETUP ────────────────────────────────────────────
const SupabaseSetup = () => {
  const [copied, setCopied] = useState(false);
  const schema = `-- Run this in Supabase → SQL Editor

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  cost_price numeric not null,
  rrp numeric not null,
  stock integer default 0,
  sku text unique,
  image_url text,
  created_at timestamptz default now()
);

create table resellers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  store_name text not null,
  email text unique not null,
  slug text unique not null,
  status text default 'pending',
  commission_rate numeric default 0.10,
  location text,
  created_at timestamptz default now()
);

create table reseller_products (
  id uuid primary key default gen_random_uuid(),
  reseller_id uuid references resellers(id),
  product_id uuid references products(id),
  sell_price numeric not null,
  unique(reseller_id, product_id)
);

create table orders (
  id text primary key,
  reseller_id uuid references resellers(id),
  product_id uuid references products(id),
  customer_name text,
  customer_email text,
  customer_address text,
  quantity integer default 1,
  sale_price numeric not null,
  cost_price numeric not null,
  status text default 'processing',
  created_at timestamptz default now()
);

-- Allow public read on products
alter table products enable row level security;
create policy "Public read" on products for select using (true);`;

  return (
    <div>
      <h1 style={{fontSize:24,fontWeight:700,color:T.text,fontFamily:"Georgia,serif",margin:"0 0 6px"}}>Supabase Setup</h1>
      <p style={{color:T.textSub,fontSize:14,marginBottom:24}}>3 steps to connect real data to your portal</p>
      {[
        {n:"1",title:"Create a free Supabase project",sub:"Go to supabase.com → New Project → name it kabinet-dropship",color:T.info,link:"https://supabase.com"},
        {n:"2",title:"Run the SQL schema below",sub:"Supabase → SQL Editor → paste the code → click Run",color:T.accent},
        {n:"3",title:"Paste your API keys into the code",sub:"Project Settings → API → copy URL + anon key → replace at top of this file",color:T.success},
      ].map(s=>(
        <div key={s.n} style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:12,background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:18}}>
          <div style={{width:30,height:30,borderRadius:"50%",background:`${s.color}20`,border:`1px solid ${s.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:s.color,fontWeight:700,flexShrink:0}}>{s.n}</div>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:T.text}}>{s.title}</div>
            <div style={{fontSize:12,color:T.textSub,marginTop:3}}>{s.sub}</div>
          </div>
        </div>
      ))}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",borderBottom:`1px solid ${T.border}`}}>
          <div style={{fontSize:13,fontWeight:600,color:T.text}}>SQL Schema</div>
          <button onClick={()=>{navigator.clipboard.writeText(schema);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{background:copied?T.success:T.accent,color:"#0D0C0B",border:"none",borderRadius:7,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
            {copied?"✓ Copied!":"Copy SQL"}
          </button>
        </div>
        <pre style={{margin:0,padding:20,fontSize:11,color:T.textSub,overflowX:"auto",lineHeight:1.7,fontFamily:"monospace",background:T.surface}}>{schema}</pre>
      </div>
      <div style={{marginTop:14,background:T.accentGlow,border:`1px solid ${T.accent}30`,borderRadius:12,padding:18}}>
        <div style={{fontSize:13,fontWeight:600,color:T.accent,marginBottom:4}}>💬 Next step</div>
        <div style={{fontSize:12,color:T.textSub,lineHeight:1.6}}>Once you have your Supabase URL + anon key, share them with Claude and I'll wire up the live data connection — products, orders, and resellers will all pull from your database automatically.</div>
      </div>
    </div>
  );
};

// ─── ADMIN PAGES ───────────────────────────────────────────────
const AdminDashboard = () => (
  <div>
    <h1 style={{fontSize:26,fontWeight:700,color:T.text,fontFamily:"Georgia,serif",margin:"0 0 6px",letterSpacing:"-0.02em"}}>Good morning, Kabinet ☀️</h1>
    <p style={{color:T.textSub,fontSize:14,marginBottom:26}}>Here's how your dropshipping network is performing.</p>
    <div style={{display:"flex",gap:14,marginBottom:26,flexWrap:"wrap"}}>
      <Stat label="Total Revenue" value="£16,490" sub="All resellers · Mar 2026" accent/>
      <Stat label="Active Resellers" value="3" sub="1 pending approval"/>
      <Stat label="Orders This Month" value="79" sub="↑ 18% vs last month"/>
      <Stat label="Avg Order Value" value="£208" sub="Across all stores"/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:22}}>
        <div style={{fontWeight:600,color:T.text,marginBottom:14,fontSize:14}}>Recent Orders</div>
        {ORDERS.slice(0,4).map(o=>(
          <div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
            <div>
              <div style={{fontSize:13,color:T.text,fontWeight:500}}>{o.product}</div>
              <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>{o.customer} · {o.reseller}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:13,color:T.accent,fontWeight:600}}>£{o.sale}</span>
              <Badge status={o.status}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:22}}>
        <div style={{fontWeight:600,color:T.text,marginBottom:14,fontSize:14}}>Top Resellers</div>
        {RESELLERS.filter(r=>r.status==="active").sort((a,b)=>b.revenue-a.revenue).map((r,i)=>(
          <div key={r.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:`${T.accent}20`,border:`1px solid ${T.accent}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:T.accent,fontWeight:700}}>{i+1}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,color:T.text,fontWeight:500}}>{r.store}</div>
              <div style={{fontSize:11,color:T.textMuted}}>{r.orders} orders · {r.location}</div>
            </div>
            <div style={{fontSize:14,color:T.accent,fontWeight:600}}>£{r.revenue.toLocaleString()}</div>
          </div>
        ))}
        <div style={{marginTop:14,padding:"11px 14px",background:T.accentGlow,borderRadius:8,border:`1px solid ${T.accent}30`}}>
          <div style={{fontSize:12,color:T.accent,fontWeight:600}}>⏳ James Okafor pending approval</div>
          <div style={{fontSize:11,color:T.textSub,marginTop:2}}>Casa Elegante · Birmingham</div>
        </div>
      </div>
    </div>
  </div>
);

const AdminProducts = () => (
  <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:22}}>
      <div>
        <h1 style={{fontSize:24,fontWeight:700,color:T.text,fontFamily:"Georgia,serif",margin:0}}>Products</h1>
        <p style={{color:T.textSub,fontSize:14,marginTop:4}}>{PRODUCTS.length} products available to resellers</p>
      </div>
      <button style={{background:T.accent,color:"#0D0C0B",border:"none",borderRadius:8,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Add Product</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      {PRODUCTS.map(p=>(
        <div key={p.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",display:"flex"}}>
          <img src={p.image} alt={p.name} style={{width:100,height:100,objectFit:"cover",flexShrink:0}} onError={e=>e.target.style.display="none"}/>
          <div style={{padding:"12px 16px",flex:1}}>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:2}}>{p.name}</div>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:10}}>{p.cat} · {p.sku}</div>
            <div style={{display:"flex",gap:16}}>
              {[["Cost",`£${p.cost}`,T.textSub],["RRP",`£${p.rrp}`,T.text],["Margin",`${Math.round((p.rrp-p.cost)/p.rrp*100)}%`,T.accent],["Stock",p.stock,p.stock<10?T.warning:T.success]].map(([l,v,c])=>(
                <div key={l}><div style={{fontSize:10,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.04em"}}>{l}</div><div style={{fontSize:13,color:c,fontWeight:600,marginTop:1}}>{v}</div></div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AdminOrders = () => (
  <div>
    <h1 style={{fontSize:24,fontWeight:700,color:T.text,fontFamily:"Georgia,serif",margin:"0 0 6px"}}>All Orders</h1>
    <p style={{color:T.textSub,fontSize:14,marginBottom:18}}>{ORDERS.length} orders across all resellers</p>
    <div style={{display:"flex",gap:14,marginBottom:18,flexWrap:"wrap"}}>
      <Stat label="Total Revenue" value={`£${ORDERS.reduce((a,o)=>a+o.sale,0).toLocaleString()}`} accent/>
      <Stat label="Total Profit" value={`£${ORDERS.reduce((a,o)=>a+(o.sale-o.cost),0).toLocaleString()}`}/>
      <Stat label="Avg Order" value={`£${Math.round(ORDERS.reduce((a,o)=>a+o.sale,0)/ORDERS.length)}`}/>
      <Stat label="Fulfilled" value={`${ORDERS.filter(o=>o.status==="fulfilled").length}/${ORDERS.length}`}/>
    </div>
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"110px 1.2fr 1fr 1.3fr 55px 75px 75px 90px",padding:"11px 18px",borderBottom:`1px solid ${T.border}`,fontSize:10,color:T.textMuted,letterSpacing:"0.07em",textTransform:"uppercase"}}>
        <span>Order</span><span>Customer</span><span>Reseller</span><span>Product</span><span>Qty</span><span>Sale</span><span>Profit</span><span>Status</span>
      </div>
      {ORDERS.map((o,i)=>(
        <div key={o.id} style={{display:"grid",gridTemplateColumns:"110px 1.2fr 1fr 1.3fr 55px 75px 75px 90px",padding:"13px 18px",borderBottom:i<ORDERS.length-1?`1px solid ${T.border}`:"none",alignItems:"center",transition:"background 0.1s"}} onMouseEnter={e=>e.currentTarget.style.background=T.cardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <span style={{fontSize:11,color:T.accent,fontFamily:"monospace",fontWeight:600}}>{o.id}</span>
          <span style={{fontSize:13,color:T.text}}>{o.customer}</span>
          <span style={{fontSize:12,color:T.textSub}}>{o.reseller.split(" ")[0]}</span>
          <span style={{fontSize:12,color:T.text}}>{o.product}</span>
          <span style={{fontSize:13,color:T.textSub}}>{o.qty}</span>
          <span style={{fontSize:13,color:T.text,fontWeight:500}}>£{o.sale}</span>
          <span style={{fontSize:13,color:T.success,fontWeight:600}}>£{o.sale-o.cost}</span>
          <Badge status={o.status}/>
        </div>
      ))}
    </div>
  </div>
);

const AdminResellers = () => {
  const [sel, setSel] = useState(null);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:22}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:700,color:T.text,fontFamily:"Georgia,serif",margin:0}}>Reseller Network</h1>
          <p style={{color:T.textSub,fontSize:14,marginTop:4}}>{RESELLERS.length} resellers · {RESELLERS.filter(r=>r.status==="active").length} active</p>
        </div>
        <button style={{background:T.accent,color:"#0D0C0B",border:"none",borderRadius:8,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Invite Reseller</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {RESELLERS.map(r=>(
          <div key={r.id} onClick={()=>setSel(sel===r.id?null:r.id)} style={{background:T.card,border:`1px solid ${sel===r.id?T.accent+"70":T.border}`,borderRadius:12,padding:18,cursor:"pointer",transition:"all 0.15s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <div style={{fontWeight:600,color:T.text,fontSize:15}}>{r.store}</div>
                <div style={{fontSize:12,color:T.textMuted,marginTop:2}}>{r.name} · {r.location}</div>
              </div>
              <Badge status={r.status}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[["Revenue",`£${r.revenue.toLocaleString()}`],["Orders",r.orders],["Products",r.products]].map(([l,v])=>(
                <div key={l} style={{background:T.surface,borderRadius:8,padding:"8px 10px"}}>
                  <div style={{fontSize:10,color:T.textMuted,letterSpacing:"0.05em",textTransform:"uppercase"}}>{l}</div>
                  <div style={{fontSize:15,color:T.accent,fontWeight:700,fontFamily:"Georgia,serif",marginTop:2}}>{v}</div>
                </div>
              ))}
            </div>
            {sel===r.id && (
              <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${T.border}`,display:"flex",gap:8,alignItems:"center"}}>
                <div style={{fontSize:12,color:T.textSub,flex:1}}>{r.email}</div>
                {r.status==="pending"&&<button style={{background:`${T.success}20`,color:T.success,border:`1px solid ${T.success}40`,borderRadius:6,padding:"5px 11px",fontSize:12,fontWeight:600,cursor:"pointer"}}>✓ Approve</button>}
                {r.status==="active"&&<button style={{background:`${T.danger}20`,color:T.danger,border:`1px solid ${T.danger}40`,borderRadius:6,padding:"5px 11px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Suspend</button>}
                <button style={{background:`${T.info}20`,color:T.info,border:`1px solid ${T.info}40`,borderRadius:6,padding:"5px 11px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Message</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── RESELLER PAGES ────────────────────────────────────────────
const ResellerDashboard = () => (
  <div>
    <h1 style={{fontSize:26,fontWeight:700,color:T.text,fontFamily:"Georgia,serif",margin:"0 0 6px"}}>Welcome back, Thuan 👋</h1>
    <p style={{color:T.textSub,fontSize:14,marginBottom:24}}>Glasgow Home Furnishings · your store is live</p>
    <div style={{display:"flex",gap:14,marginBottom:22,flexWrap:"wrap"}}>
      <Stat label="My Revenue" value="£4,820" sub="All time earnings" accent/>
      <Stat label="Commission (10%)" value="£482" sub="Paid monthly"/>
      <Stat label="Orders" value="23" sub="2 need attention"/>
      <Stat label="Listed Products" value="12" sub="From Kabinet catalogue"/>
    </div>
    <div style={{background:`linear-gradient(135deg,${T.card},${T.accentGlow})`,border:`1px solid ${T.accent}40`,borderRadius:12,padding:20,marginBottom:16}}>
      <div style={{fontWeight:600,color:T.text,marginBottom:10,fontSize:14}}>🔗 Your store link — share with customers</div>
      <div style={{display:"flex",gap:10}}>
        <div style={{flex:1,background:T.surface,borderRadius:7,padding:"9px 14px",fontSize:13,color:T.accent,fontFamily:"monospace",border:`1px solid ${T.border}`}}>kabinet.shop/thuan-glasgow</div>
        <button style={{background:T.accent,color:"#0D0C0B",border:"none",borderRadius:7,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}}>Copy</button>
      </div>
    </div>
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:22}}>
      <div style={{fontWeight:600,color:T.text,marginBottom:14,fontSize:14}}>Recent Orders</div>
      {ORDERS.filter(o=>o.reseller==="Glasgow Home Furnishings").map(o=>(
        <div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:`1px solid ${T.border}`}}>
          <div>
            <div style={{fontSize:13,color:T.text,fontWeight:500}}>{o.product}</div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>{o.customer} · {o.date}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:13,color:T.accent,fontWeight:600}}>£{o.sale}</div>
              <div style={{fontSize:11,color:T.success}}>+£{Math.round(o.sale*0.1)} commission</div>
            </div>
            <Badge status={o.status}/>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ResellerCatalogue = () => {
  const [prices, setPrices] = useState(Object.fromEntries(PRODUCTS.map(p=>[p.id,Math.round(p.cost*1.35)])));
  const [added, setAdded] = useState([1,4,5,7]);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:22}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:700,color:T.text,fontFamily:"Georgia,serif",margin:0}}>Kabinet Catalogue</h1>
          <p style={{color:T.textSub,fontSize:14,marginTop:4}}>Set your price — Kabinet ships directly to your customer</p>
        </div>
        <div style={{fontSize:13,color:T.textSub,background:T.card,border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 14px"}}>{added.length}/{PRODUCTS.length} in your store</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {PRODUCTS.map(p=>{
          const isAdded=added.includes(p.id), myPrice=prices[p.id], profit=myPrice-p.cost, margin=Math.round(profit/myPrice*100);
          return (
            <div key={p.id} style={{background:T.card,border:`1px solid ${isAdded?T.accent+"50":T.border}`,borderRadius:12,overflow:"hidden"}}>
              <div style={{position:"relative"}}>
                <img src={p.image} alt={p.name} style={{width:"100%",height:130,objectFit:"cover",display:"block"}} onError={e=>e.target.style.display="none"}/>
                {isAdded&&<span style={{position:"absolute",top:8,right:8,fontSize:10,background:T.success,color:"white",borderRadius:10,padding:"2px 8px",fontWeight:700}}>IN STORE</span>}
              </div>
              <div style={{padding:14}}>
                <div style={{fontWeight:600,color:T.text,fontSize:14,marginBottom:1}}>{p.name}</div>
                <div style={{fontSize:11,color:T.textMuted,marginBottom:11}}>{p.cat} · {p.stock} in stock</div>
                <div style={{background:T.surface,borderRadius:8,padding:"11px 13px",marginBottom:11}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                    <span style={{fontSize:11,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.04em"}}>Kabinet Cost</span>
                    <span style={{fontSize:13,color:T.textSub,fontWeight:500}}>£{p.cost}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                    <span style={{fontSize:11,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.04em"}}>Your Price</span>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{fontSize:12,color:T.textSub}}>£</span>
                      <input type="number" value={myPrice} onChange={e=>setPrices({...prices,[p.id]:+e.target.value})} style={{width:60,background:T.card,border:`1px solid ${T.accent}60`,borderRadius:6,padding:"3px 7px",color:T.accent,fontSize:14,fontWeight:700,textAlign:"right",outline:"none"}}/>
                    </div>
                  </div>
                  <input type="range" min={p.cost} max={Math.round(p.cost*2)} value={myPrice} onChange={e=>setPrices({...prices,[p.id]:+e.target.value})} style={{width:"100%",accentColor:T.accent,margin:"5px 0 0"}}/>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:7}}>
                    <span style={{fontSize:12,color:profit>0?T.success:T.danger}}>Profit: £{profit}</span>
                    <span style={{fontSize:12,color:T.accent,fontWeight:600}}>Margin: {margin}%</span>
                  </div>
                </div>
                <button onClick={()=>setAdded(isAdded?added.filter(i=>i!==p.id):[...added,p.id])} style={{width:"100%",padding:"8px",borderRadius:8,border:isAdded?`1px solid ${T.border}`:`1px solid ${T.accent}`,background:isAdded?T.surface:T.accent,color:isAdded?T.textSub:"#0D0C0B",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}>
                  {isAdded?"Remove from Store":"Add to My Store"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ResellerStore = () => (
  <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:22}}>
      <div>
        <h1 style={{fontSize:24,fontWeight:700,color:T.text,fontFamily:"Georgia,serif",margin:0}}>My Store</h1>
        <p style={{color:T.textSub,fontSize:14,marginTop:4}}>Glasgow Home Furnishings · kabinet.shop/thuan-glasgow</p>
      </div>
      <button style={{background:T.accent,color:"#0D0C0B",border:"none",borderRadius:8,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}}>🔗 Share Store</button>
    </div>
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",marginBottom:14}}>
      <div style={{background:"linear-gradient(135deg,#1A1000,#2A1F00)",padding:"28px 26px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{fontSize:11,color:T.accent,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>Welcome to</div>
        <div style={{fontSize:26,color:T.text,fontFamily:"Georgia,serif",fontWeight:700}}>Glasgow Home Furnishings</div>
        <div style={{fontSize:13,color:T.textSub,marginTop:6}}>Quality furniture for Scottish homes · Free UK delivery on all orders</div>
      </div>
      <div style={{padding:20}}>
        <div style={{fontSize:11,color:T.textMuted,marginBottom:12,letterSpacing:"0.05em",textTransform:"uppercase"}}>Your 4 listed products</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {PRODUCTS.filter(p=>[1,4,5,7].includes(p.id)).map(p=>(
            <div key={p.id} style={{background:T.surface,borderRadius:10,overflow:"hidden",border:`1px solid ${T.border}`}}>
              <img src={p.image} alt={p.name} style={{width:"100%",height:90,objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>
              <div style={{padding:"10px 11px"}}>
                <div style={{fontSize:12,color:T.text,fontWeight:600,marginBottom:2}}>{p.name}</div>
                <div style={{fontSize:13,color:T.accent,fontWeight:700}}>£{Math.round(p.cost*1.35)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:18}}>
        <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:12}}>How dropshipping works</div>
        {[["1","Customer visits your store link"],["2","They order & pay your price"],["3","Order forwarded to Kabinet"],["4","Kabinet ships direct to customer"],["5","You keep the profit margin"]].map(([n,t])=>(
          <div key={n} style={{display:"flex",gap:10,alignItems:"center",marginBottom:9}}>
            <div style={{width:20,height:20,borderRadius:"50%",background:`${T.accent}20`,border:`1px solid ${T.accent}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:T.accent,fontWeight:700,flexShrink:0}}>{n}</div>
            <div style={{fontSize:13,color:T.textSub}}>{t}</div>
          </div>
        ))}
      </div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:18}}>
        <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:12}}>Embed on your website</div>
        <div style={{background:T.surface,borderRadius:8,padding:12,fontFamily:"monospace",fontSize:11,color:T.accent,lineHeight:1.8,border:`1px solid ${T.border}`,marginBottom:10}}>
          {"<iframe"}<br/>{"  src=\"kabinet.shop/thuan-glasgow\""}<br/>{"  width=\"100%\" height=\"600\""}<br/>{"  frameborder=\"0\">"}<br/>{"</iframe>"}
        </div>
        <button style={{width:"100%",padding:"8px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.textSub,fontSize:13,fontWeight:600,cursor:"pointer"}}>Copy Embed Code</button>
      </div>
    </div>
  </div>
);

const ResellerOrders = () => {
  const myOrders=ORDERS.filter(o=>o.reseller==="Glasgow Home Furnishings");
  return (
    <div>
      <h1 style={{fontSize:24,fontWeight:700,color:T.text,fontFamily:"Georgia,serif",margin:"0 0 6px"}}>My Orders</h1>
      <p style={{color:T.textSub,fontSize:14,marginBottom:18}}>{myOrders.length} orders from Glasgow Home Furnishings</p>
      <div style={{display:"flex",gap:14,marginBottom:18}}>
        <Stat label="Total Sales" value={`£${myOrders.reduce((a,o)=>a+o.sale,0)}`} accent/>
        <Stat label="Commission (10%)" value={`£${Math.round(myOrders.reduce((a,o)=>a+o.sale,0)*0.1)}`}/>
        <Stat label="Orders" value={myOrders.length}/>
      </div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"110px 1.3fr 1.5fr 55px 75px 75px 90px",padding:"11px 18px",borderBottom:`1px solid ${T.border}`,fontSize:10,color:T.textMuted,letterSpacing:"0.07em",textTransform:"uppercase"}}>
          <span>Order</span><span>Customer</span><span>Product</span><span>Qty</span><span>Sale</span><span>Earned</span><span>Status</span>
        </div>
        {myOrders.map((o,i)=>(
          <div key={o.id} style={{display:"grid",gridTemplateColumns:"110px 1.3fr 1.5fr 55px 75px 75px 90px",padding:"13px 18px",borderBottom:i<myOrders.length-1?`1px solid ${T.border}`:"none",alignItems:"center",transition:"background 0.1s"}} onMouseEnter={e=>e.currentTarget.style.background=T.cardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <span style={{fontSize:11,color:T.accent,fontFamily:"monospace",fontWeight:600}}>{o.id}</span>
            <span style={{fontSize:13,color:T.text}}>{o.customer}</span>
            <span style={{fontSize:12,color:T.textSub}}>{o.product}</span>
            <span style={{fontSize:13,color:T.textSub}}>{o.qty}</span>
            <span style={{fontSize:13,color:T.text,fontWeight:500}}>£{o.sale}</span>
            <span style={{fontSize:13,color:T.success,fontWeight:600}}>£{Math.round(o.sale*0.1)}</span>
            <Badge status={o.status}/>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── CUSTOMER STOREFRONT ───────────────────────────────────────
const CustomerStorefront = ({ setRole }) => {
  const listed=PRODUCTS.filter(p=>[1,4,5,7].includes(p.id));
  const [cart,setCart]=useState([]);
  return (
    <div style={{minHeight:"100vh",background:"#F7F4EF",fontFamily:"system-ui,sans-serif"}}>
      <div style={{background:"white",borderBottom:"1px solid #E5E0D8",padding:"0 40px",position:"sticky",top:0,zIndex:10,boxShadow:"0 1px 8px rgba(0,0,0,0.05)"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",height:62}}>
          <div>
            <span style={{fontSize:19,fontWeight:700,color:"#1A1714",fontFamily:"Georgia,serif"}}>Glasgow Home Furnishings</span>
            <span style={{fontSize:11,color:"#ccc",marginLeft:10}}>Powered by Kabinet</span>
          </div>
          <div style={{display:"flex",gap:16,alignItems:"center"}}>
            <span style={{fontSize:13,color:"#666"}}>🛒 {cart.length} item{cart.length!==1?"s":""}</span>
            <span onClick={()=>setRole("reseller")} style={{fontSize:11,color:T.accent,cursor:"pointer",border:`1px solid ${T.accent}`,borderRadius:6,padding:"4px 10px"}}>← Reseller View</span>
          </div>
        </div>
      </div>
      <div style={{background:"#1A1714",color:"white",textAlign:"center",padding:"52px 20px"}}>
        <div style={{fontSize:11,letterSpacing:"0.18em",color:T.accent,marginBottom:12,textTransform:"uppercase"}}>Glasgow · Scotland · Free UK Delivery</div>
        <h1 style={{fontSize:38,fontWeight:700,margin:0,fontFamily:"Georgia,serif",lineHeight:1.2}}>Quality Furniture<br/>for Scottish Homes</h1>
        <p style={{fontSize:14,color:"#999",marginTop:14,maxWidth:480,margin:"14px auto 0"}}>Handpicked from Kabinet's Manchester showroom. Delivered direct to your door.</p>
      </div>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"38px 40px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20}}>
          {listed.map(p=>{
            const price=Math.round(p.cost*1.35), inCart=cart.includes(p.id);
            return (
              <div key={p.id} style={{background:"white",borderRadius:12,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.07)",border:"1px solid #EDE8E0"}}>
                <img src={p.image} alt={p.name} style={{width:"100%",height:175,objectFit:"cover",display:"block"}} onError={e=>e.target.style.display="none"}/>
                <div style={{padding:"14px 16px 16px"}}>
                  <div style={{fontSize:11,color:"#999",letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:3}}>{p.cat}</div>
                  <div style={{fontSize:15,fontWeight:700,color:"#1A1714",marginBottom:8,fontFamily:"Georgia,serif"}}>{p.name}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                    <span style={{fontSize:19,color:"#1A1714",fontWeight:700}}>£{price}</span>
                    <span style={{fontSize:12,color:"#bbb",textDecoration:"line-through"}}>RRP £{p.rrp}</span>
                  </div>
                  <button onClick={()=>setCart(inCart?cart.filter(i=>i!==p.id):[...cart,p.id])} style={{width:"100%",padding:"10px",borderRadius:8,border:"2px solid #1A1714",background:inCart?"#1A1714":"transparent",color:inCart?"white":"#1A1714",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}>
                    {inCart?"✓ In Cart":"Add to Cart"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {cart.length>0 && (
          <div style={{marginTop:30,background:"white",borderRadius:12,padding:26,border:"2px solid #1A1714",textAlign:"center",boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}>
            <div style={{fontSize:19,fontWeight:700,color:"#1A1714",marginBottom:4,fontFamily:"Georgia,serif"}}>{cart.length} item{cart.length>1?"s":""} ready to order</div>
            <div style={{fontSize:13,color:"#888",marginBottom:16}}>Fulfilled by Kabinet · Manchester · Free UK delivery</div>
            <button style={{background:"#1A1714",color:"white",border:"none",borderRadius:8,padding:"13px 38px",fontSize:15,fontWeight:700,cursor:"pointer"}}>Checkout →</button>
          </div>
        )}
      </div>
      <div style={{background:"#1A1714",padding:"28px",textAlign:"center",marginTop:20}}>
        <div style={{fontSize:13,color:"#666"}}>© 2026 Glasgow Home Furnishings · <span style={{color:T.accent}}>Powered by Kabinet</span> · British Furniture Dropshipping</div>
      </div>
    </div>
  );
};

// ─── ROOT ──────────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState(null);
  const [page, setPage] = useState("dashboard");

  const go = (r) => { setRole(r); setPage("dashboard"); };

  if (!role) return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",padding:40,fontFamily:"system-ui"}}>
      <div style={{textAlign:"center",marginBottom:48}}>
        <div style={{fontSize:42,marginBottom:14}}>🛋️</div>
        <h1 style={{fontSize:32,color:T.text,fontFamily:"Georgia,serif",fontWeight:700,margin:0,letterSpacing:"-0.02em"}}>Kabinet Dropship Portal</h1>
        <p style={{color:T.textSub,marginTop:10,fontSize:14,maxWidth:400,margin:"10px auto 0"}}>White-label reseller network for Kabinet UK · Branded for Glasgow Home Furnishings</p>
      </div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",justifyContent:"center"}}>
        {[{role:"admin",emoji:"🔑",title:"Admin Portal",sub:"Kabinet staff · manage resellers, products & orders",color:T.warning},{role:"reseller",emoji:"🏪",title:"Reseller Portal",sub:"Thuan's portal · set prices, track earnings",color:T.accent},{role:"customer",emoji:"🛍️",title:"Customer Store",sub:"What your Glasgow customers see",color:T.success}].map(c=>(
          <div key={c.role} onClick={()=>go(c.role)} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"26px 28px",width:220,cursor:"pointer",transition:"all 0.2s",textAlign:"center"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=`${c.color}60`;e.currentTarget.style.transform="translateY(-4px)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform="translateY(0)";}}>
            <div style={{fontSize:36,marginBottom:12}}>{c.emoji}</div>
            <div style={{fontSize:16,fontWeight:700,color:T.text,fontFamily:"Georgia,serif",marginBottom:7}}>{c.title}</div>
            <div style={{fontSize:12,color:T.textSub,lineHeight:1.5,marginBottom:14}}>{c.sub}</div>
            <div style={{display:"inline-block",padding:"5px 16px",borderRadius:20,background:`${c.color}15`,color:c.color,fontSize:12,fontWeight:600,border:`1px solid ${c.color}30`}}>Enter →</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (role==="customer") return <CustomerStorefront setRole={go}/>;

  const adminPages={dashboard:<AdminDashboard/>,products:<AdminProducts/>,orders:<AdminOrders/>,resellers:<AdminResellers/>,supabase:<SupabaseSetup/>};
  const resellerPages={dashboard:<ResellerDashboard/>,catalogue:<ResellerCatalogue/>,store:<ResellerStore/>,orders:<ResellerOrders/>};
  const pages=role==="admin"?adminPages:resellerPages;

  return (
    <div style={{display:"flex",minHeight:"100vh",background:T.bg,fontFamily:"system-ui,-apple-system,sans-serif",color:T.text}}>
      <Sidebar role={role} page={page} setPage={setPage} setRole={go}/>
      <div style={{flex:1,padding:"30px 34px",overflowY:"auto",maxHeight:"100vh"}}>
        {pages[page]||pages["dashboard"]}
      </div>
    </div>
  );
}
