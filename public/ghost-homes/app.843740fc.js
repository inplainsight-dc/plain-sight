(async function(){
const _B='/ghost-homes/';
let NBs=null;async function ensureSMD(){if(!NBs)NBs=await fetch(_B+'smd.geojson').then(function(r){return r.json();});}
const _d=await Promise.all([fetch(_B+'data.json').then(function(r){return r.json();}),fetch(_B+'clusters.geojson').then(function(r){return r.json();}),fetch(_B+'anc.geojson').then(function(r){return r.json();})]);
const D=_d[0],NBc=_d[1],NBa=_d[2];


const P=D.pts, CL=D.clusters, CS=D.cstat, CR=D.crent, CW=D.cward, CE=D.cest;
const AN=D.ancs, AS=D.ancstat, SM=D.smds, SS=D.smdstat, SANC=D.smd_anc;
const CITY=D.city, MFI80=D.mfi80;
const cssVar=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
// pts cols: 0 lat 1 lon 2 rt 3 cidx 4 ward 5 lic 6 acc 7 core 8 ancIdx 9 smdIdx
const isCore=p=>p[7]===1;
function bandName(rent){return !rent?"":rent<=MFI80?"affordable":rent<=CITY?"mid-range":"higher-rent";}

/* choropleth bins (share) */
const BINS=[0,.10,.25,.40,.60,1.01];
const ALPHA=[.10,.26,.44,.62,.82];
function binOf(share){for(let i=0;i<BINS.length-1;i++){if(share<BINS[i+1])return i;}return ALPHA.length-1;}
function redFill(share){return `rgba(232,27,57,${ALPHA[binOf(share)]})`;}

/* ---------- theme ---------- */
function isDark(){const t=document.documentElement.getAttribute("data-theme");
  return t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;}
function tileUrl(){return isDark()
  ?"https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
  :"https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png";}
const ATTR="&copy; OpenStreetMap, &copy; CARTO";

/* ---------- front door ---------- */
const hood=document.getElementById("hood");
CL.forEach((c,i)=>{const o=document.createElement("option");o.value=i;o.textContent=c;hood.appendChild(o);});
let doorMap=null,doorClusterLayer=null,doorPtLayer=null,doorBase=null;
function initDoorMap(){
  if(doorMap)return;
  doorMap=L.map("doorMap",{scrollWheelZoom:false}).setView([38.905,-77.02],11);
  doorBase=L.tileLayer(tileUrl(),{attribution:ATTR,maxZoom:18}).addTo(doorMap);
  doorClusterLayer=L.geoJSON(null,{style:{color:cssVar("--ps-accent-2"),weight:2,fill:true,fillColor:cssVar("--ps-accent"),fillOpacity:.05}}).addTo(doorMap);
  doorPtLayer=L.layerGroup().addTo(doorMap);
}
function ancSpan(cidx){ // ANCs a cluster overlaps (from its listings)
  const set=new Set(); P.forEach(p=>{if(p[3]===cidx&&p[8]>=0)set.add(AN[p[8]]);});
  return [...set].sort();
}
function renderResult(o){
  // o: {title, place, core, all, share, rent, extraFine, cidxForMap, focusPts}
  const box=document.getElementById("result");
  const b=bandName(o.rent);
  const market=o.rent&&o.rent<=CITY?"a neighborhood renting at or below the citywide average — the stock a middle-income household competes for."
    :o.rent?"a higher-rent neighborhood (above the $2,446 citywide average).":"an area with no published rent benchmark.";
  box.innerHTML=`
    <p class="lead">${o.title}</p>
    <p class="place">${o.place}</p>
    <div class="rcards">
      <div class="rc"><div class="n">${o.core.toLocaleString()}</div><div class="l">whole homes run as full-time STRs</div></div>
      <div class="rc"><div class="n">${o.share}%</div><div class="l">of the ${o.all.toLocaleString()} listings here</div></div>
      <div class="rc"><div class="n ink">${o.rent?("$"+o.rent.toLocaleString()+(o.est?"*":"")):"—"}</div><div class="l">avg rent${b?" · "+b+" band":""}</div></div>
      ${o.flagged===undefined?"":`<div class="rc"><div class="n">${o.flagged<0?"&lt;5":o.flagged.toLocaleString()}</div><div class="l">of those, the license shown doesn’t match a current record</div></div>`}
    </div>
    <div class="sharebar" role="img" aria-label="${o.share}% of listings are full-time whole-unit short-term rentals"><span style="width:${o.share}%"></span></div>
    <p class="note" style="margin:0">This is ${market}${o.est?" <i>*rent estimated from adjacent neighborhoods.</i>":""}</p>
    <p class="fine">Whole homes rented out entirely, most of the year — not spare rooms. Licenses are now matched against the DC business license register: the fourth figure counts homes whose displayed license has lapsed with no active license at that address, is a license of another kind, or matches no record at all. That identifies homes worth checking — it is <b>not</b> a finding that anyone has broken a rule, and there are lawful explanations for every category. Still an upper bound: one home can appear twice. No host is identified, and figures under 5 are shown as &lt;5 so a single home cannot be singled out.${o.extraFine||""}</p>`;
  box.hidden=false;
  drawDoorMap(o.cidxForMap);
}
function drawDoorMap(cidx){
  document.getElementById("doorMap").hidden=false;
  document.getElementById("doorLegend").hidden=false;
  initDoorMap();doorMap.invalidateSize();
  doorClusterLayer.clearLayers();doorPtLayer.clearLayers();
  const feat=NBc.features.find(f=>f.properties.i===cidx);
  if(feat){doorClusterLayer.addData(feat);
    const db=doorClusterLayer.getBounds();   // same empty-bounds guard as drawChoro
    if(db&&db.isValid())doorMap.fitBounds(db,{padding:[24,24]});}
  P.forEach(p=>{if(p[3]!==cidx)return;const c=isCore(p);
    L.circleMarker([p[0],p[1]],{radius:c?4:3,weight:0,interactive:false,
      fillOpacity:c?.85:.42,fillColor:c?cssVar("--ps-accent"):cssVar("--ps-ink-soft")}).addTo(doorPtLayer);});
}
function showCluster(i){
  if(i<0||i>=CL.length)return;
  const[all,whole,core]=CS[i],rent=CR[i],share=all?Math.round(100*core/all):0;
  const spans=ancSpan(i);
  renderResult({title:`In <b>${CL[i]}</b>, about <b>${core.toLocaleString()}</b> whole homes run as full-time short-term rentals — <b>${share}%</b> of local listings.`,
    place:`Neighborhood cluster · Ward ${CW[i]} · ANCs ${spans.join(", ")||"—"}`,
    core,all,share,rent,est:CE[i],cidxForMap:i,
    flagged:Array.isArray(D.cflag)?D.cflag[i]:undefined,scope:"this cluster",
    extraFine:" Pick a specific address above to see your exact ANC and single-member district."});
  hood.value=i;
}
hood.addEventListener("change",()=>{if(hood.value!=="")showCluster(+hood.value);});

/* address geocode via OpenStreetMap Nominatim, then client point-in-polygon
   against embedded cluster / ANC / SMD boundaries. Ward derives from the ANC number. */
const addr=document.getElementById("addr"),geoMsg=document.getElementById("geoMsg");
function pointInGeom(x,y,g){
  const polys=g.type==="Polygon"?[g.coordinates]:g.coordinates;
  for(const poly of polys){let inside=false;
    for(const ring of poly){for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1];
      if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside;}}
    if(inside)return true;}
  return false;}
function locateIdx(lat,lon,fc){for(const f of fc.features){if(pointInGeom(lon,lat,f.geometry))return f.properties.i;}return -1;}
// Pluggable address -> point. If window.GHOST_GEOCODER_PROXY is set (a deployed DC MAR proxy),
// use it for authoritative DC address matching; otherwise fall back to OpenStreetMap Nominatim.
// Either way, ANC/SMD/cluster come from point-in-polygon against the official 2023 boundaries.
async function geocodePoint(q){
  const proxy=(typeof window!=="undefined")&&window.GHOST_GEOCODER_PROXY;
  if(proxy){
    try{
      const r=await fetch(proxy+(proxy.includes("?")?"&":"?")+"q="+encodeURIComponent(q));
      if(r.ok){const j=await r.json();
        if(j&&j.lat!=null&&j.lon!=null)return{lat:+j.lat,lon:+j.lon,label:j.address||j.matched||q};}
    }catch(e){/* fall through to Nominatim */}
  }
  const u="https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q="+encodeURIComponent(q+", Washington, DC");
  const r=await fetch(u,{headers:{"Accept":"application/json"}});const arr=await r.json();
  if(arr.length)return{lat:+arr[0].lat,lon:+arr[0].lon,label:arr[0].display_name};
  return null;
}
async function geocode(){
  const q=addr.value.trim();if(!q){geoMsg.textContent="";return;}
  // Clear any previous answer BEFORE looking up. Otherwise a failed lookup left the last
  // address's numbers sitting under an error about a different address — a reader could take
  // those figures as the answer to what they just typed. (Wave 2 R5)
  document.getElementById("result").innerHTML="";
  geoMsg.textContent="Looking up "+q+" …";
  try{
    const hit=await geocodePoint(q);
    if(!hit){geoMsg.textContent="No match — add the quadrant (NE, NW, SE, SW), or use the neighborhood list.";return;}
    const lat=hit.lat,lon=hit.lon;
    const ci=locateIdx(lat,lon,NBc);
    // The address resolved, but it sits outside the 39 residential neighborhood clusters (the
    // federal core, the Mall and parkland are not clustered). Say that, rather than implying
    // the address was not found.
    if(ci<0){geoMsg.textContent="That address sits outside DC’s 39 residential neighborhood clusters — the federal core, the Mall and parkland aren’t covered. Try a nearby residential address, or pick a neighborhood.";return;}
    const ai=locateIdx(lat,lon,NBa);await ensureSMD();const si=locateIdx(lat,lon,NBs);
    const ancId=ai>=0?AN[ai]:null,smdId=si>=0?SM[si]:null;
    const ward=ancId?ancId.replace(/[^0-9].*$/,""):(smdId?smdId[0]:"");
    geoMsg.innerHTML="Showing <b>"+String(hit.label||q).replace(/</g,"&lt;").split(",").slice(0,3).join(",").trim()+"</b> — not your block? Add the quadrant (NE, NW, SE, SW).";
    const[all,,core]=CS[ci],rent=CR[ci],share=all?Math.round(100*core/all):0;
    // R3: don't report a single-member district count when it's a small cell (<threshold) — fall back to cluster.
    const THR=D.small_cell||0;
    // data.json is NOT fingerprinted (it turns over on the snapshot cadence, where
    // revalidating daily is right) while the code IS. So a returning reader can hold a
    // cached payload from before this field existed. Reading it blind threw a TypeError
    // that the catch below reported as "address lookup unavailable" — the whole front
    // door, broken, for a reason that had nothing to do with geocoding. Degrade to
    // "no license figure" instead; renderResult already omits the card when undefined.
    let localCore=core,localAll=all,scope="your neighborhood cluster";
    let localFlag=Array.isArray(D.cflag)?D.cflag[ci]:undefined;
    if(si>=0&&SS[si][2]>=THR){localCore=SS[si][2];localAll=SS[si][0];scope="your single-member district";
      if(Array.isArray(D.sflag))localFlag=D.sflag[si];}
    const shareLocal=localAll?Math.round(100*localCore/localAll):0;
    renderResult({title:`Around <b>${q.replace(/</g,"&lt;")}</b>, about <b>${localCore.toLocaleString()}</b> whole homes run as full-time short-term rentals — <b>${shareLocal}%</b> of listings in ${scope}.`,
      place:`${ancId?("ANC <b>"+ancId+"</b>"):""}${smdId?(" · SMD <b>"+smdId+"</b>"):""}${ward?(" · Ward "+ward):""} · ${CL[ci]}`,
      core:localCore,all:localAll,share:shareLocal,rent,est:CE[ci],cidxForMap:ci,flagged:localFlag,scope,
      extraFine:` Whole-cluster totals: ${core.toLocaleString()} of ${all.toLocaleString()} listings (${share}%).`});
    hood.value=ci;
  }catch(e){
    // Wave 2 R4: a catch-all that renames every failure "lookup unavailable" hides the
    // ones that are not. Report the same thing to the reader, but leave the real error
    // where it can be found.
    console.error("Ghost Homes front door failed:",e);
    geoMsg.textContent="Address lookup is unavailable right now — use the neighborhood list instead.";
  }
}
document.getElementById("addrGo").addEventListener("click",geocode);
addr.addEventListener("keydown",e=>{if(e.key==="Enter")geocode();});

/* ---------- tiles ---------- */
const H=D.head;
document.getElementById("tiles").innerHTML=[
 [H.listings,"<b>Airbnb</b> listings in DC (all types)"],
 [H.whole,"whole units listed"],
 [H.core,"whole units run as full-time STRs",1],
 [H.mid,`in mid-range or below neighborhoods (&le; $2,446) — of the ${H.core_na.toLocaleString()} that are not basement / accessory units`,1],
 [H.aff,`in the affordable band (&le; $2,150, ~80% MFI 1-bed) — of the same ${H.core_na.toLocaleString()} non-accessory units`,1],
 [H.hosted,`display a <i>hosted</i> license; only ${H.unhosted} the unhosted license a whole-unit let requires — self-reported license text, an audit population, not a count of violations`],
].map(t=>`<div class="tile${t[2]?" hi":""}"><div class="n">${t[0].toLocaleString()}</div><div class="l">${t[1]}</div></div>`).join("");

/* ---------- city choropleth ---------- */
const fGeo=document.getElementById("fGeo"),fMetric=document.getElementById("fMetric");
let cityMap=null,choroLayer=null,cityInit=false;
function initCityMap(){
  if(cityInit)return;cityInit=true;
  cityMap=L.map("cityMap",{scrollWheelZoom:false,attributionControl:true}).setView([38.9,-77.02],11.2);
  choroLayer=L.geoJSON(null).addTo(cityMap);
  drawChoro();
}
/* Wave 5 R2 — selected area, shared by the map and the breakdown table.
   The <select> stays the accessible path (a Leaflet path is not keyboard-reachable),
   so selecting on the map drives the same state the selector does, and the change is
   announced rather than left silent. */
let selArea=null; // {dim, label}
function isSelected(dim,label){return !!selArea&&selArea.dim===dim&&selArea.label===label;}
function selectArea(dim,label){
  selArea={dim,label};
  if(fBreak.value!==dim){fBreak.value=dim;}
  refreshTable();
  drawChoro();
  const row=document.querySelector("#tbl tbody tr.sel");
  if(row&&row.scrollIntoView)row.scrollIntoView({block:"center"});
  const live=document.getElementById("selLive");
  if(live)live.textContent=`Showing ${label} in the breakdown below.`;
  writeHash();
}

function statFor(geo){ // returns {feats, stat, labels}
  if(geo==="anc")return{feats:NBa,stat:AS,labels:AN,name:"ANC"};
  return{feats:NBc,stat:CS,labels:CL,name:"cluster"};
}
function drawChoro(){
  if(!cityInit)return;
  const geo=fGeo.value,metric=fMetric.value,{feats,stat,labels,name}=statFor(geo);
  const counts=stat.map(s=>s[2]),maxCount=Math.max(...counts,1);
  choroLayer.clearLayers();
  choroLayer.addData({type:"FeatureCollection",features:feats.features});
  choroLayer.eachLayer(l=>{
    const i=l.feature.properties.i,s=stat[i]||[0,0,0],all=s[0],core=s[2],share=all?core/all:0;
    const fillShare=metric==="count"?(core/maxCount):share;
    l.setStyle({color:cssVar("--ps-line"),weight:1,fillColor:"#E81B39",fillOpacity:ALPHA[binOf(fillShare>1?1:fillShare)]});
    l.bindTooltip(`<div class="choro-tooltip"><b>${labels[i]}</b><br>${core.toLocaleString()} full-time STRs · ${all?Math.round(100*share):0}% of ${all.toLocaleString()} listings</div>`,{sticky:true});
    l.on("mouseover",()=>{if(!isSelected(geo,labels[i]))l.setStyle({weight:2,color:cssVar("--ps-ink")});});
    l.on("mouseout",()=>{if(!isSelected(geo,labels[i]))l.setStyle({weight:1,color:cssVar("--ps-line")});});
    // Wave 5 R2: the layout promises that choosing an area changes what follows, and
    // the click used to do nothing at all — tooltip on hover, and hover is not even
    // discoverable on touch. A click now selects the area: the breakdown switches to
    // that geography, its row is highlighted and scrolled to, and the shape is outlined
    // so the link between map and table is visible rather than implied.
    l.on("click",()=>selectArea(geo,labels[i]));
    if(isSelected(geo,labels[i]))l.setStyle({weight:3,color:cssVar("--ps-ink")});
  });
  // Guard on validity rather than try/catch: fitBounds() on an EMPTY layer throws only
  // after Leaflet has written a NaN center, so swallowing the throw left the map broken and
  // the NEXT invalidateSize() (any window resize / phone rotation) threw uncaught. Since the
  // bundle build fetches geojson asynchronously, drawChoro can legitimately run before the
  // features have landed — so an empty layer here is a normal state, not an error. (Wave 2 R4)
  const cb=choroLayer.getBounds();
  if(cb&&cb.isValid())cityMap.fitBounds(cb,{padding:[10,10]});
  const legTitle=metric==="count"?"full-time STRs (relative)":"full-time STR share";
  const labs=metric==="count"
    ?["lowest","","","","highest"]
    :["&lt;10%","10–25%","25–40%","40–60%","60%+"];
  document.getElementById("cityLegend").innerHTML=`<span>${legTitle}:</span>`+
    ALPHA.map((a,i)=>`<span><i style="background:rgba(232,27,57,${a})"></i>${labs[i]}</span>`).join("");
}
[fGeo,fMetric].forEach(el=>el.addEventListener("change",drawChoro));

/* ---------- ward chart ---------- */
const WS=D.wardstat,wmax=Math.max(...WS.map(x=>x[0]));
document.getElementById("wards").innerHTML=WS.map(([t,mid],idx)=>{const w=idx+1;
  return `<div class="wardrow"><div class="lab">Ward ${w}</div>
    <div class="stack" role="img" aria-label="Ward ${w}: ${t} full-time whole-unit STRs, ${mid} in mid-range or below neighborhoods" style="width:${wmax?100*t/wmax:0}%">
      <span style="background:var(--ps-accent);width:${t?100*mid/t:0}%"></span><span style="background:var(--ps-ink-soft);flex:1"></span></div>
    <div style="text-align:right"><b class="mono">${t}</b> <span class="tag red">${mid} mid</span></div></div>`;
}).join("")+`<div class="legend"><span><i style="background:var(--ps-accent)"></i>mid-range or below</span><span><i style="background:var(--ps-ink-soft)"></i>higher-rent</span></div>`;

/* ---------- breakdown table ---------- */
const fBreak=document.getElementById("fBreak");
let tblRows=[],sortK=0,sortDir=1,showRent=true;
function buildRows(dim){
  showRent=(dim==="cluster");
  if(dim==="ward")return D.wardstat_full.map((s,i)=>["Ward "+(i+1),s[0],s[1],s[2],s[0]?s[2]/s[0]:0,null,false]);
  if(dim==="anc")return AN.map((a,i)=>["ANC "+a,AS[i][0],AS[i][1],AS[i][2],AS[i][0]?AS[i][2]/AS[i][0]:0,null,false]);
  // SS[i][2] is SUPPRESSED (-1) for small cells on the public build — the real count is not
  // in the payload at all. Share is meaningless then, so send 0 and let renderTable mask it.
  if(dim==="smd")return SM.map((s,i)=>{const c=SS[i][2];
    return ["SMD "+s,SS[i][0],SS[i][1],c,(c>=0&&SS[i][0])?c/SS[i][0]:0,null,false];});
  return CL.map((c,i)=>[c,CS[i][0],CS[i][1],CS[i][2],CS[i][0]?CS[i][2]/CS[i][0]:0,CR[i],CE[i]]);
}
function renderTable(){
  const head=document.getElementById("tblHead");
  const cols=showRent?["Area","Avg rent","All listings","Whole units","Full-time STRs","Share"]
                     :["Area","All listings","Whole units","Full-time STRs","Share"];
  head.innerHTML=cols.map((c,i)=>`<th><button data-k="${i}">${c}</button></th>`).join("");
  head.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{
    const k=+b.dataset.k;sortDir=(k===sortK)?-sortDir:(k===0?1:-1);sortK=k;renderTable();}));
  // map display column index -> data index
  const dataIdx=showRent?[0,5,1,2,3,4]:[0,1,2,3,4];
  const di=dataIdx[sortK];
  tblRows.sort((a,b)=>{const av=a[di],bv=b[di];
    return (typeof av==="string"?String(av).localeCompare(bv):(av||0)-(bv||0))*sortDir;});
  const mx=Math.max(...tblRows.map(r=>r[3]),1);
  const THR=D.small_cell||0;
  const tb=document.querySelector("#tbl tbody");
  let anySuppressed=false;
  tb.innerHTML=tblRows.map(r=>{
    // Suppressed cells arrive as the SUPPRESSED sentinel (<0) from the builder — the count
    // itself is not in the payload. The THR test also covers a full internal payload.
    const suppressed=THR>0&&(r[3]<0||r[3]<THR);
    if(suppressed)anySuppressed=true;
    const share=suppressed?"—":(100*r[4]).toFixed(0)+"%";
    const ftCell=suppressed?`&lt;${THR}`:`<span class="bar" style="width:${44*r[3]/mx}px"></span> ${r[3]}`;
    const rentCell=showRent?`<td class="mono"${r[6]?' style="font-style:italic"':''}>${r[5]?"$"+r[5].toLocaleString():"—"}</td>`:"";
    const sel=selArea&&selArea.dim===fBreak.value&&r[0]===selArea.label;
    return `<tr${sel?' class="sel" aria-current="true"':''}><td>${r[0]}</td>${rentCell}<td class="mono">${r[1]}</td><td class="mono">${r[2]}</td>
      <td class="mono">${ftCell}</td><td class="mono">${share}</td></tr>`;
  }).join("");
  document.getElementById("tblCap").textContent=
    `${tblRows.length} ${fBreak.value==="ward"?"wards":fBreak.value==="anc"?"ANCs":fBreak.value==="smd"?"single-member districts":"clusters"}. Click a heading to sort.`+
    (showRent?" Italic rent = estimated from adjacent neighborhoods.":"")+
    (anySuppressed?` Cells with fewer than ${THR} full-time STRs are shown as “<${THR}” so an individual home can’t be singled out.`:"");
}
function refreshTable(){tblRows=buildRows(fBreak.value);sortK=showRent?4:3;sortDir=-1;renderTable();}
fBreak.addEventListener("change",()=>{
  if(selArea&&selArea.dim!==fBreak.value)selArea=null;  // a stale highlight is worse than none
  refreshTable();drawChoro();writeHash();});
refreshTable();

/* download aggregate tables (P4) — de-identified, small SMD cells suppressed */
function downloadCSV(){
  const THR=D.small_cell||0;
  const rows=[["geography","area","all_listings","whole_units","fulltime_str","share_pct","avg_rent"]];
  CL.forEach((c,i)=>rows.push(["cluster",c,CS[i][0],CS[i][1],CS[i][2],(100*CS[i][2]/CS[i][0]).toFixed(1),CR[i]||""]));
  AN.forEach((a,i)=>rows.push(["anc","ANC "+a,AS[i][0],AS[i][1],AS[i][2],(100*AS[i][2]/AS[i][0]).toFixed(1),""]));
  SM.forEach((s,i)=>{const sup=THR>0&&(SS[i][2]<0||SS[i][2]<THR);
    rows.push(["smd","SMD "+s,SS[i][0],SS[i][1],sup?("<"+THR):SS[i][2],sup?"":(100*SS[i][2]/SS[i][0]).toFixed(1),""]);});
  D.wardstat_full.forEach((w,i)=>rows.push(["ward","Ward "+(i+1),w[0],w[1],w[2],(100*w[2]/w[0]).toFixed(1),""]));
  const hdr="# In Plain Sight — DC short-term rentals, aggregate counts. Snapshot: Inside Airbnb "+D.snap+".\n"+
    "# License shown is self-reported and identifies an audit population, not violations. No host is identified.\n"+
    "# Availability is calendar availability, not occupancy. SMD full-time counts under "+THR+" are shown as \"<"+THR+"\".\n";
  const csv=hdr+rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
  a.download="dc-str-aggregates_2026-06-24.csv";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
document.getElementById("dl").addEventListener("click",downloadCSV);

/* ---------- operators ---------- */
const OPS=D.ops,omax=OPS.top[0];
document.getElementById("opsNote").innerHTML=
  `<b>${OPS.multi.toLocaleString()}</b> operators run more than one full-time whole-unit STR; the 10 largest run about <b>${OPS.top_sum.toLocaleString()} units</b> between them, out of ${OPS.total_core.toLocaleString()} citywide.`;
document.getElementById("ops").innerHTML=OPS.top.map((n,i)=>
  `<div class="opsbar"><div class="lab">Operator ${i+1}</div>
    <div class="track" role="img" aria-label="Operator ${i+1} runs ${n} units"><span style="width:${100*n/omax}%"></span></div>
    <div class="v">${n}</div></div>`).join("");

/* ---------- tabs ---------- */
const tabs=[["tab-door","p-door"],["tab-city","p-city"],["tab-rules","p-rules"]];
tabs.forEach(([t,p])=>{document.getElementById(t).addEventListener("click",()=>{
  tabs.forEach(([tt,pp])=>{const sel=tt===t;document.getElementById(tt).setAttribute("aria-selected",sel);document.getElementById(pp).hidden=!sel;});
  if(p==="p-city"){initCityMap();setTimeout(()=>cityMap&&cityMap.invalidateSize(),40);}
  if(p==="p-door"&&doorMap){setTimeout(()=>doorMap.invalidateSize(),40);}
  document.getElementById(p).focus();writeHash();
});});

/* ---------- deep-link state (P3): a shareable link that reopens the same view/area ---------- */
function writeHash(){
  const cur=tabs.find(([t])=>document.getElementById(t).getAttribute("aria-selected")==="true");
  const parts=["v="+(cur?cur[0].replace("tab-",""):"door")];
  if(hood.value!=="")parts.push("n="+hood.value);
  parts.push("b="+fBreak.value,"g="+fGeo.value);
  try{history.replaceState(null,"","#"+parts.join("&"));}catch(e){}
}
function readHash(){
  const h=location.hash.replace(/^#/,"");if(!h)return;
  const p={};h.split("&").forEach(s=>{const i=s.indexOf("=");if(i>0)p[s.slice(0,i)]=decodeURIComponent(s.slice(i+1));});
  if(p.b){fBreak.value=p.b;refreshTable();}
  if(p.g){fGeo.value=p.g;}
  if(p.n!==undefined&&p.n!==""){const i=+p.n;if(i>=0&&i<CL.length)showCluster(i);}
  if(p.v){const tb=document.getElementById("tab-"+p.v);if(tb)tb.click();}
}
fGeo.addEventListener("change",writeHash);
hood.addEventListener("change",writeHash);

/* NOTE: everything below the theme-toggle marker is DISCARDED when the Astro bundle
   is extracted (see _js.split near the end of this file). Code that must ship to the
   site therefore has to sit ABOVE it — this resize handler was written below it first
   and silently never reached /ghost-homes. Same class as Wave 2 R2. */
/* Wave 5 R3 — Leaflet caches container size, so a map sized in a narrow window keeps
   that size when the window widens: gray gutters, tiles short of the edge, view not
   re-fitted. invalidateSize() only ever ran on tab switch. Wave 2's R4 fixed a resize
   THROWING and never added resize handling, so the crash went and the gap stayed.
   Debounced because invalidateSize on every resize event is expensive, and because
   this is exactly the code path where an uncaught error hid last time. */
let rzT=null;
addEventListener("resize",()=>{
  clearTimeout(rzT);
  rzT=setTimeout(()=>{
    if(cityMap&&document.getElementById("p-city")&&!document.getElementById("p-city").hidden)
      cityMap.invalidateSize();
    if(doorMap&&document.getElementById("p-door")&&!document.getElementById("p-door").hidden)
      doorMap.invalidateSize();
  },160);
});


/* theme owned by the site (data-theme). Re-render map on change. */
function applyTheme(){if(doorBase)doorBase.setUrl(tileUrl());if(cityInit)drawChoro();if(doorMap&&hood.value!=='')drawDoorMap(+hood.value);}
new MutationObserver(function(){applyTheme();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
readHash();

})();
