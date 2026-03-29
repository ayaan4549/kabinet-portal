import { useState, useEffect } from "react";

// ─── SUPABASE ──────────────────────────────────────────────────
const SUPABASE_URL = "https://znkcnuogjinwwkbdghiq.supabase.co";
const SUPABASE_KEY = "sb_publishable_P5EQvqqC4PI3EamR8a-jgg_68ZjxnuP";

const fetchTable = async (table) => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&order=id`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
    });
    return res.ok ? res.json() : [];
  } catch { return []; }
};

const insertRow = async (table, body) => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" },
      body: JSON.stringify(body)
    });
    return res.ok ? res.json() : null;
  } catch { return null; }
};

const updateRow = async (table, id, body) => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return res.ok;
  } catch { return false; }
};

// Normalize DB rows to app shape
const normProduct = (p) => ({ id: p.id, name: p.name, cat: p.category, cost: p.cost_price, rrp: p.rrp, stock: p.stock, sku: p.sku, image: p.image_url });
const normReseller = (r) => ({ id: r.id, name: r.name, store: r.store_name, email: r.email, slug: r.slug, status: r.status, rate: r.commission_rate, location: r.location, orders: r.orders_count, revenue: r.revenue, products: r.products_count, joined: r.joined_date });
const normOrder = (o) => ({ id: o.id, reseller: o.store_name, product: o.product_name, customer: o.customer_name, qty: o.quantity, sale: o.sale_price, cost: o.cost_price, status: o.status, date: o.order_date });

// ─── THEME ─────────────────────────────────────────────────────
const T = {
  bg:"#0D0C0B", surface:"#161412", card:"#1D1B19", cardHover:"#242220",
  accent:"#C8A96E", accentGlow:"rgba(200,169,110,0.1)", accentDark:"#9A7D45",
  text:"#EDE8DF", textSub:"#9B9080", textMuted:"#5C5650",
  border:"#2B2825", borderLight:"#373330",
  success:"#5CB87A", warning:"#E0A035", danger:"#D45C5C", info:"#5B8DD9",
};

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

const Loader = () => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:200,flexDirection:"column",gap:12}}>
    <div style={{width:32,height:32,border:`3px solid ${T.border}`,borderTop:`3px solid ${T.accent}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
    <div style={{fontSize:13,color:T.textMuted}}>Loading from database...</div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const NavItem = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:8,cursor:"pointer",background:active?T.accentGlow:"transparent",color:active?T.accent:T.textSub,fontWeight:active?600:400,fontSize:14,transition:"all 0.15s",border:`1px solid ${active?T.accent+"30":"transparent"}`}}>
    <span style={{fontSize:16}}>{icon}</span>{label}
  </div>
);

const Sidebar = ({ role, page, setPage, setRole }) => {
  const adminNav = [["📊","Dashboard","dashboard"],["📦","Products","products"],["🛒","Orders","orders"],["👥","Resellers","resellers"]];
  const resellerNav = [["📊","Dashboard","dashboard"],["🗂️","Catalogue","catalogue"],["🏪","My Store","store"],["📋","My Orders","orders"]];
  const nav = role==="admin" ? adminNav : resellerNav;
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
          <div key={r} onClick={()=>{setRole(r);setPage("dashboard");}} style={{padding:"7px 14px",borderRadius:7,cursor:"pointer",fontSize:13,color:role===r?T.accent:T.textSub,background:role===r?T.accentGlow:"transparent",fontWeight:role===r?600:400,marginBottom:2}}>{label}</div>
        ))}
      </div>
    </div>
  );
};

// ─── ADMIN PAGES ───────────────────────────────────────────────
const AdminDashboard = ({ products, resellers, orders }) => {
  const totalRevenue = orders.reduce((a,o)=>a+Number(o.sale),0);
  const activeResellers = resellers.filter(r=>r.status==="active").length;
  const pendingResellers = resellers.filter(r=>r.status==="pending").length;
  const avgOrder = orders.length ? Math.round(totalRevenue/orders.length) : 0;
  return (
    <div>
      <h1 style={{fontSize:26,fontWeight:700,color:T.text,fontFamily:"Georgia,serif",margin:"0 0 6px",letterSpacing:"-0.02em"}}>Good morning, Kabinet ☀️</h1>
      <p style={{color:T.textSub,fontSize:14,marginBottom:26}}>Here's how your dropshipping network is performing.</p>
      <div style={{display:"flex",gap:14,marginBottom:26,flexWrap:"wrap"}}>
        <Stat label="Total Revenue" value={`£${totalRevenue.toLocaleString()}`} sub="All resellers · live data" accent/>
        <Stat label="Active Resellers" value={activeResellers} sub={`${pendingResellers} pending approval`}/>
        <Stat label="Total Orders" value={orders.length} sub="From all resellers"/>
        <Stat label="Avg Order Value" value={`£${avgOrder}`} sub="Across all stores"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:22}}>
          <div style={{fontWeight:600,color:T.text,marginBottom:14,fontSize:14}}>Recent Orders</div>
          {orders.slice(0,4).map(o=>(
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
          {orders.length===0 && <div style={{color:T.textMuted,fontSize:13,padding:"10px 0"}}>No orders yet</div>}
        </div>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:22}}>
          <div style={{fontWeight:600,color:T.text,marginBottom:14,fontSize:14}}>Top Resellers</div>
          {resellers.filter(r=>r.status==="active").sort((a,b)=>b.revenue-a.revenue).map((r,i)=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:`${T.accent}20`,border:`1px solid ${T.accent}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:T.accent,fontWeight:700}}>{i+1}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:T.text,fontWeight:500}}>{r.store}</div>
                <div style={{fontSize:11,color:T.textMuted}}>{r.orders} orders · {r.location}</div>
              </div>
              <div style={{fontSize:14,color:T.accent,fontWeight:600}}>£{Number(r.revenue).toLocaleString()}</div>
            </div>
          ))}
          {pendingResellers > 0 && (
            <div style={{marginTop:14,padding:"11px 14px",background:T.accentGlow,borderRadius:8,border:`1px solid ${T.accent}30`}}>
              <div style={{fontSize:12,color:T.accent,fontWeight:600}}>⏳ {pendingResellers} reseller(s) pending approval</div>
              {resellers.filter(r=>r.status==="pending").map(r=>(
                <div key={r.id} style={{fontSize:11,color:T.textSub,marginTop:2}}>{r.name} — {r.store}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminProducts = ({ products, reload }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", category:"", cost_price:"", rrp:"", stock:"", sku:"", image_url:"" });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!form.name || !form.cost_price || !form.rrp) return;
    setSaving(true);
    await insertRow("products", { ...form, cost_price: Number(form.cost_price), rrp: Number(form.rrp), stock: Number(form.stock)||0 });
    setSaving(false);
    setShowAdd(false);
    setForm({ name:"", category:"", cost_price:"", rrp:"", stock:"", sku:"", image_url:"" });
    reload();
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:22}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:700,color:T.text,fontFamily:"Georgia,serif",margin:0}}>Products</h1>
          <p style={{color:T.textSub,fontSize:14,marginTop:4}}>{products.length} products · live from database</p>
        </div>
        <button onClick={()=>setShowAdd(!showAdd)} style={{background:T.accent,color:"#0D0C0B",border:"none",borderRadius:8,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Add Product</button>
      </div>

      {showAdd && (
        <div style={{background:T.card,border:`1px solid ${T.accent}40`,borderRadius:12,padding:20,marginBottom:18}}>
          <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:14}}>New Product</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
            {[["name","Name*"],["category","Category"],["sku","SKU"],["cost_price","Cost Price*"],["rrp","RRP*"],["stock","Stock"]].map(([key,label])=>(
              <div key={key}>
                <div style={{fontSize:11,color:T.textMuted,marginBottom:4}}>{label}</div>
                <input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:7,padding:"8px 10px",color:T.text,fontSize:13,outline:"none"}}/>
              </div>
            ))}
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:4}}>Image URL</div>
            <input value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})} placeholder="https://images.unsplash.com/..." style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:7,padding:"8px 10px",color:T.text,fontSize:13,outline:"none"}}/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={handleAdd} disabled={saving} style={{background:T.accent,color:"#0D0C0B",border:"none",borderRadius:7,padding:"8px 18px",fontSize:13,fontWeight:700,cursor:"pointer"}}>{saving?"Saving...":"Save Product"}</button>
            <button onClick={()=>setShowAdd(false)} style={{background:"transparent",color:T.textSub,border:`1px solid ${T.border}`,borderRadius:7,padding:"8px 14px",fontSize:13,cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {products.map(p=>(
          <div key={p.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",display:"flex"}}>
            {p.image && <img src={p.image} alt={p.name} style={{width:100,height:100,objectFit:"cover",flexShrink:0}} onError={e=>e.target.style.display="none"}/>}
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
      {products.length===0 && <div style={{color:T.textMuted,fontSize:13,padding:"20px 0"}}>No products yet — add one above</div>}
    </div>
  );
};

const AdminOrders = ({ orders }) => (
  <div>
    <h1 style={{fontSize:24,fontWeight:700,color:T.text,fontFamily:"Georgia,serif",margin:"0 0 6px"}}>All Orders</h1>
    <p style={{color:T.textSub,fontSize:14,marginBottom:18}}>{orders.length} orders · live from database</p>
    <div style={{display:"flex",gap:14,marginBottom:18,flexWrap:"wrap"}}>
      <Stat label="Total Revenue" value={`£${orders.reduce((a,o)=>a+Number(o.sale),0).toLocaleString()}`} accent/>
      <Stat label="Total Profit" value={`£${orders.reduce((a,o)=>a+(Number(o.sale)-Number(o.cost)),0).toLocaleString()}`}/>
      <Stat label="Avg Order" value={`£${orders.length?Math.round(orders.reduce((a,o)=>a+Number(o.sale),0)/orders.length):0}`}/>
      <Stat label="Fulfilled" value={`${orders.filter(o=>o.status==="fulfilled").length}/${orders.length}`}/>
    </div>
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"110px 1.2fr 1fr 1.3fr 55px 75px 75px 90px",padding:"11px 18px",borderBottom:`1px solid ${T.border}`,fontSize:10,color:T.textMuted,letterSpacing:"0.07em",textTransform:"uppercase"}}>
        <span>Order</span><span>Customer</span><span>Reseller</span><span>Product</span><span>Qty</span><span>Sale</span><span>Profit</span><span>Status</span>
      </div>
      {orders.map((o,i)=>(
        <div key={o.id} style={{display:"grid",gridTemplateColumns:"110px 1.2fr 1fr 1.3fr 55px 75px 75px 90px",padding:"13px 18px",borderBottom:i<orders.length-1?`1px solid ${T.border}`:"none",alignItems:"center",transition:"background 0.1s"}} onMouseEnter={e=>e.currentTarget.style.background=T.cardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <span style={{fontSize:11,color:T.accent,fontFamily:"monospace",fontWeight:600}}>{o.id}</span>
          <span style={{fontSize:13,color:T.text}}>{o.customer}</span>
          <span style={{fontSize:12,color:T.textSub}}>{o.reseller?.split(" ")[0]}</span>
          <span style={{fontSize:12,color:T.text}}>{o.product}</span>
          <span style={{fontSize:13,color:T.textSub}}>{o.qty}</span>
          <span style={{fontSize:13,color:T.text,fontWeight:500}}>£{o.sale}</span>
          <span style={{fontSize:13,color:T.success,fontWeight:600}}>£{Number(o.sale)-Number(o.cost)}</span>
          <Badge status={o.status}/>
        </div>
      ))}
      {orders.length===0 && <div style={{color:T.textMuted,fontSize:13,padding:"20px 18px"}}>No orders yet</div>}
    </div>
  </div>
);

const AdminResellers = ({ resellers, reload }) => {
  const [sel, setSel] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", store_name:"", email:"", slug:"", location:"" });
  const [saving, setSaving] = useState(false);

  const handleApprove = async (r) => {
    await updateRow("resellers", r.id, { status: "active" });
    reload();
  };

  const handleAdd = async () => {
    if (!form.name || !form.email) return;
    setSaving(true);
    await insertRow("resellers", { ...form, status:"pending", commission_rate:0.10, orders_count:0, revenue:0, products_count:0, joined_date: new Date().toLocaleDateString("en-GB",{month:"short",year:"numeric"}) });
    setSaving(false);
    setShowAdd(false);
    setForm({ name:"", store_name:"", email:"", slug:"", location:"" });
    reload();
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:22}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:700,color:T.text,fontFamily:"Georgia,serif",margin:0}}>Reseller Network</h1>
          <p style={{color:T.textSub,fontSize:14,marginTop:4}}>{resellers.length} resellers · {resellers.filter(r=>r.status==="active").length} active</p>
        </div>
        <button onClick={()=>setShowAdd(!showAdd)} style={{background:T.accent,color:"#0D0C0B",border:"none",borderRadius:8,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Add Reseller</button>
      </div>

      {showAdd && (
        <div style={{background:T.card,border:`1px solid ${T.accent}40`,borderRadius:12,padding:20,marginBottom:18}}>
          <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:14}}>New Reseller</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            {[["name","Full Name*"],["store_name","Store Name"],["email","Email*"],["slug","URL Slug (e.g. thuan-glasgow)"],["location","Location"]].map(([key,label])=>(
              <div key={key}>
                <div style={{fontSize:11,color:T.textMuted,marginBottom:4}}>{label}</div>
                <input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:7,padding:"8px 10px",color:T.text,fontSize:13,outline:"none"}}/>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={handleAdd} disabled={saving} style={{background:T.accent,color:"#0D0C0B",border:"none",borderRadius:7,padding:"8px 18px",fontSize:13,fontWeight:700,cursor:"pointer"}}>{saving?"Saving...":"Add Reseller"}</button>
            <button onClick={()=>setShowAdd(false)} style={{background:"transparent",color:T.textSub,border:`1px solid ${T.border}`,borderRadius:7,padding:"8px 14px",fontSize:13,cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {resellers.map(r=>(
          <div key={r.id} onClick={()=>setSel(sel===r.id?null:r.id)} style={{background:T.card,border:`1px solid ${sel===r.id?T.accent+"70":T.border}`,borderRadius:12,padding:18,cursor:"pointer",transition:"all 0.15s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <div style={{fontWeight:600,color:T.text,fontSize:15}}>{r.store}</div>
                <div style={{fontSize:12,color:T.textMuted,marginTop:2}}>{r.name} · {r.location}</div>
              </div>
              <Badge status={r.status}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[["Revenue",`£${Number(r.revenue).toLocaleString()}`],["Orders",r.orders],["Products",r.products]].map(([l,v])=>(
                <div key={l} style={{background:T.surface,borderRadius:8,padding:"8px 10px"}}>
                  <div style={{fontSize:10,color:T.textMuted,letterSpacing:"0.05em",textTransform:"uppercase"}}>{l}</div>
                  <div style={{fontSize:15,color:T.accent,fontWeight:700,fontFamily:"Georgia,serif",marginTop:2}}>{v}</div>
                </div>
              ))}
            </div>
            {sel===r.id && (
              <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${T.border}`,display:"flex",gap:8,alignItems:"center"}}>
                <div style={{fontSize:12,color:T.textSub,flex:1}}>{r.email}</div>
                {r.status==="pending" && <button onClick={e=>{e.stopPropagation();handleApprove(r);}} style={{background:`${T.success}20`,color:T.success,border:`1px solid ${T.success}40`,borderRadius:6,padding:"5px 11px",fontSize:12,fontWeight:600,cursor:"pointer"}}>✓ Approve</button>}
                <button style={{background:`${T.info}20`,color:T.info,border:`1px solid ${T.info}40`,borderRadius:6,padding:"5px 11px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Message</button>
              </div>
            )}
          </div>
        ))}
        {resellers.length===0 && <div style={{color:T.textMuted,fontSize:13,padding:"10px 0"}}>No resellers yet</div>}
      </div>
    </div>
  );
};

// ─── RESELLER PAGES ────────────────────────────────────────────
const ResellerDashboard = ({ resellers, orders }) => {
  const me = resellers.find(r=>r.slug==="thuan-glasgow") || resellers[0];
  const myOrders = orders.filter(o=>o.reseller===me?.store);
  const myRevenue = myOrders.reduce((a,o)=>a+Number(o.sale),0);
  const myCommission = Math.round(myRevenue*(me?.rate||0.1));

  return (
    <div>
      <h1 style={{fontSize:26,fontWeight:700,color:T.text,fontFamily:"Georgia,serif",margin:"0 0 6px"}}>Welcome back, Thuan 👋</h1>
      <p style={{color:T.textSub,fontSize:14,marginBottom:24}}>Glasgow Home Furnishings · your store is live</p>
      <div style={{display:"flex",gap:14,marginBottom:22,flexWrap:"wrap"}}>
        <Stat label="My Revenue" value={`£${myRevenue.toLocaleString()}`} sub="All time earnings" accent/>
        <Stat label="Commission (10%)" value={`£${myCommission}`} sub="Paid monthly"/>
        <Stat label="Orders" value={myOrders.length} sub="From your store"/>
        <Stat label="Listed Products" value={me?.products||0} sub="From Kabinet catalogue"/>
      </div>
      <div style={{background:`linear-gradient(135deg,${T.card},${T.accentGlow})`,border:`1px solid ${T.accent}40`,borderRadius:12,padding:20,marginBottom:16}}>
        <div style={{fontWeight:600,color:T.text,marginBottom:10,fontSize:14}}>🔗 Your store link — share with customers</div>
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:1,background:T.surface,borderRadius:7,padding:"9px 14px",fontSize:13,color:T.accent,fontFamily:"monospace",border:`1px solid ${T.border}`}}>kabinet-portal.netlify.app</div>
          <button onClick={()=>navigator.clipboard.writeText("https://kabinet-portal.netlify.app")} style={{background:T.accent,color:"#0D0C0B",border:"none",borderRadius:7,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}}>Copy</button>
        </div>
      </div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:22}}>
        <div style={{fontWeight:600,color:T.text,marginBottom:14,fontSize:14}}>Recent Orders</div>
        {myOrders.slice(0,5).map(o=>(
          <div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:`1px solid ${T.border}`}}>
            <div>
              <div style={{fontSize:13,color:T.text,fontWeight:500}}>{o.product}</div>
              <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>{o.customer} · {o.date}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:13,color:T.accent,fontWeight:600}}>£{o.sale}</div>
                <div style={{fontSize:11,color:T.success}}>+£{Math.round(Number(o.sale)*0.1)} commission</div>
              </div>
              <Badge status={o.status}/>
            </div>
          </div>
        ))}
        {myOrders.length===0 && <div style={{color:T.textMuted,fontSize:13,padding:"10px 0"}}>No orders yet — share your store link to get started!</div>}
      </div>
    </div>
  );
};

const ResellerCatalogue = ({ products }) => {
  const [prices, setPrices] = useState({});
  const [added, setAdded] = useState([]);

  useEffect(()=>{
    if(products.length){
      const init = Object.fromEntries(products.map(p=>[p.id, Math.round(p.cost*1.35)]));
      setPrices(init);
      setAdded(products.slice(0,4).map(p=>p.id));
    }
  },[products]);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:22}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:700,color:T.text,fontFamily:"Georgia,serif",margin:0}}>Kabinet Catalogue</h1>
          <p style={{color:T.textSub,fontSize:14,marginTop:4}}>Set your price — Kabinet ships directly to your customer</p>
        </div>
        <div style={{fontSize:13,color:T.textSub,background:T.card,border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 14px"}}>{added.length}/{products.length} in your store</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {products.map(p=>{
          const isAdded=added.includes(p.id), myPrice=prices[p.id]||Math.round(p.cost*1.35), profit=myPrice-p.cost, margin=Math.round(profit/myPrice*100);
          return (
            <div key={p.id} style={{background:T.card,border:`1px solid ${isAdded?T.accent+"50":T.border}`,borderRadius:12,overflow:"hidden"}}>
              <div style={{position:"relative"}}>
                {p.image && <img src={p.image} alt={p.name} style={{width:"100%",height:130,objectFit:"cover",display:"block"}} onError={e=>e.target.style.display="none"}/>}
                {isAdded && <span style={{position:"absolute",top:8,right:8,fontSize:10,background:T.success,color:"white",borderRadius:10,padding:"2px 8px",fontWeight:700}}>IN STORE</span>}
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

const ResellerOrders = ({ orders }) => {
  const myOrders = orders.filter(o=>o.reseller==="Glasgow Home Furnishings");
  return (
    <div>
      <h1 style={{fontSize:24,fontWeight:700,color:T.text,fontFamily:"Georgia,serif",margin:"0 0 6px"}}>My Orders</h1>
      <p style={{color:T.textSub,fontSize:14,marginBottom:18}}>{myOrders.length} orders · live from database</p>
      <div style={{display:"flex",gap:14,marginBottom:18}}>
        <Stat label="Total Sales" value={`£${myOrders.reduce((a,o)=>a+Number(o.sale),0)}`} accent/>
        <Stat label="Commission (10%)" value={`£${Math.round(myOrders.reduce((a,o)=>a+Number(o.sale),0)*0.1)}`}/>
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
            <span style={{fontSize:13,color:T.success,fontWeight:600}}>£{Math.round(Number(o.sale)*0.1)}</span>
            <Badge status={o.status}/>
          </div>
        ))}
        {myOrders.length===0 && <div style={{color:T.textMuted,fontSize:13,padding:"20px 18px"}}>No orders yet</div>}
      </div>
    </div>
  );
};

const ResellerStore = ({ products }) => {
  const listed = products.slice(0,4);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:22}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:700,color:T.text,fontFamily:"Georgia,serif",margin:0}}>My Store</h1>
          <p style={{color:T.textSub,fontSize:14,marginTop:4}}>Glasgow Home Furnishings · kabinet-portal.netlify.app</p>
        </div>
        <button onClick={()=>navigator.clipboard.writeText("https://kabinet-portal.netlify.app")} style={{background:T.accent,color:"#0D0C0B",border:"none",borderRadius:8,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}}>🔗 Copy Store Link</button>
      </div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",marginBottom:14}}>
        <div style={{background:"linear-gradient(135deg,#1A1000,#2A1F00)",padding:"28px 26px",borderBottom:`1px solid ${T.border}`}}>
          <div style={{fontSize:11,color:T.accent,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>Welcome to</div>
          <div style={{fontSize:26,color:T.text,fontFamily:"Georgia,serif",fontWeight:700}}>Glasgow Home Furnishings</div>
          <div style={{fontSize:13,color:T.textSub,marginTop:6}}>Quality furniture for Scottish homes · Free UK delivery on all orders</div>
        </div>
        <div style={{padding:20}}>
          <div style={{fontSize:11,color:T.textMuted,marginBottom:12,letterSpacing:"0.05em",textTransform:"uppercase"}}>Your first {listed.length} products</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {listed.map(p=>(
              <div key={p.id} style={{background:T.surface,borderRadius:10,overflow:"hidden",border:`1px solid ${T.border}`}}>
                {p.image && <img src={p.image} alt={p.name} style={{width:"100%",height:90,objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>}
                <div style={{padding:"10px 11px"}}>
                  <div style={{fontSize:12,color:T.text,fontWeight:600,marginBottom:2}}>{p.name}</div>
                  <div style={{fontSize:13,color:T.accent,fontWeight:700}}>£{Math.round(p.cost*1.35)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── CUSTOMER STOREFRONT ───────────────────────────────────────
const CustomerStorefront = ({ products, setRole }) => {
  const listed = products.slice(0,4);
  const [cart, setCart] = useState([]);
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
                {p.image && <img src={p.image} alt={p.name} style={{width:"100%",height:175,objectFit:"cover",display:"block"}} onError={e=>e.target.style.display="none"}/>}
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
            <button style={{background:"#1A1714",color:"white",border:"none",borderRadius:8,padding:"13px 38px",fontSize:15,fontWeight:700,cursor:"pointer"}}>Checkout → (Step 3: Stripe)</button>
          </div>
        )}
        {listed.length===0 && <div style={{textAlign:"center",color:"#999",padding:"40px 0",fontSize:15}}>No products available yet</div>}
      </div>
      <div style={{background:"#1A1714",padding:"28px",textAlign:"center",marginTop:20}}>
        <div style={{fontSize:13,color:"#666"}}>© 2026 Glasgow Home Furnishings · <span style={{color:T.accent}}>Powered by Kabinet</span></div>
      </div>
    </div>
  );
};

// ─── ROOT APP ──────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [resellers, setResellers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [p, r, o] = await Promise.all([
      fetchTable("products"),
      fetchTable("resellers"),
      fetchTable("orders"),
    ]);
    setProducts((p||[]).map(normProduct));
    setResellers((r||[]).map(normReseller));
    setOrders((o||[]).map(normOrder));
    setLoading(false);
  };

  useEffect(()=>{ loadData(); }, []);

  const go = (r) => { setRole(r); setPage("dashboard"); };

  if (!role) return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",padding:40,fontFamily:"system-ui"}}>
      <div style={{textAlign:"center",marginBottom:48}}>
        <div style={{fontSize:42,marginBottom:14}}>🛋️</div>
        <h1 style={{fontSize:32,color:T.text,fontFamily:"Georgia,serif",fontWeight:700,margin:0,letterSpacing:"-0.02em"}}>Kabinet Dropship Portal</h1>
        <p style={{color:T.textSub,marginTop:10,fontSize:14,maxWidth:400,margin:"10px auto 0"}}>
          {loading ? "Connecting to database..." : `${products.length} products · ${resellers.length} resellers · ${orders.length} orders`}
        </p>
        {loading && <div style={{marginTop:16,width:24,height:24,border:`2px solid ${T.border}`,borderTop:`2px solid ${T.accent}`,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"16px auto 0"}}/>}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
      {!loading && (
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
      )}
    </div>
  );

  if (role==="customer") return <CustomerStorefront products={products} setRole={go}/>;

  const adminPages = {
    dashboard: loading ? <Loader/> : <AdminDashboard products={products} resellers={resellers} orders={orders}/>,
    products:  loading ? <Loader/> : <AdminProducts products={products} reload={loadData}/>,
    orders:    loading ? <Loader/> : <AdminOrders orders={orders}/>,
    resellers: loading ? <Loader/> : <AdminResellers resellers={resellers} reload={loadData}/>,
  };

  const resellerPages = {
    dashboard: loading ? <Loader/> : <ResellerDashboard resellers={resellers} orders={orders}/>,
    catalogue: loading ? <Loader/> : <ResellerCatalogue products={products}/>,
    store:     loading ? <Loader/> : <ResellerStore products={products}/>,
    orders:    loading ? <Loader/> : <ResellerOrders orders={orders}/>,
  };

  const pages = role==="admin" ? adminPages : resellerPages;

  return (
    <div style={{display:"flex",minHeight:"100vh",background:T.bg,fontFamily:"system-ui,-apple-system,sans-serif",color:T.text}}>
      <Sidebar role={role} page={page} setPage={setPage} setRole={go}/>
      <div style={{flex:1,padding:"30px 34px",overflowY:"auto",maxHeight:"100vh"}}>
        {pages[page]||pages["dashboard"]}
      </div>
    </div>
  );
}
