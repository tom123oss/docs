/* ===== MAP ===== */
const W = 40, H = 30;

const map = L.map('map', {
  crs: L.CRS.Simple,
  zoomControl: true
});

const bounds = [[0,0],[H,W]];
map.fitBounds(bounds);
L.rectangle(bounds,{color:'#000',weight:2,fillOpacity:0}).addTo(map);
setTimeout(()=>map.invalidateSize(),200);

/* GRID */
for(let i=0;i<=W;i+=5)
  L.polyline([[0,i],[H,i]],{color:'#ddd'}).addTo(map);
for(let i=0;i<=H;i+=5)
  L.polyline([[i,0],[i,W]],{color:'#ddd'}).addTo(map);

/* ===== EXHIBITS ===== */
const exhibits = {
  A:{x:35,y:25},
  B:{x:5,y:5},
  C:{x:22,y:15}
};

Object.entries(exhibits).forEach(([k,p])=>{
  L.marker([p.y,p.x]).addTo(map).bindPopup("Hiện vật "+k);
});

/* ===== USERS ===== */
let user = {x:6,y:6};
const userMarker = L.circleMarker([6,6],{
  radius:8,color:'blue',fillColor:'blue',fillOpacity:1
}).addTo(map);

const others = [
  {x:30,y:6,c:'red'},
  {x:10,y:25,c:'green'},
  {x:35,y:18,c:'orange'}
];

const otherMarkers = others.map(o =>
  L.circleMarker([o.y,o.x],{
    radius:7,color:o.c,fillColor:o.c,fillOpacity:1
  }).addTo(map)
);

/* ===== NAVIGATION ===== */
let targetKey = null;
let routeLine = null;
let arrowDeco = null;

function toggleNav(k){
  targetKey = (targetKey === k) ? null : k;
  if(!targetKey) clearRoute();
}

function clearRoute(){
  if(routeLine) map.removeLayer(routeLine);
  if(arrowDeco) map.removeLayer(arrowDeco);
  routeLine = arrowDeco = null;
}

/* ===== MOVEMENT LOGIC ===== */

// tốc độ CHẬM hơn (ăn mắt)
const BASE_SPEED = 0.23;

// biên độ lệch ziczac
const ZIGZAG_STRENGTH = 0.3;

// phase cho sin/cos
let zigPhase = 0;

function moveWithZigzag(p, target){
  const dx = target.x - p.x;
  const dy = target.y - p.y;
  const d = Math.hypot(dx,dy);
  if(d < 0.4) return;

  // hướng chuẩn
  const ux = dx / d;
  const uy = dy / d;

  // hướng vuông góc (để ziczac)
  zigPhase += 0.4;
  const zx = -uy * Math.sin(zigPhase) * ZIGZAG_STRENGTH;
  const zy =  ux * Math.cos(zigPhase) * ZIGZAG_STRENGTH;

  // kết hợp
  p.x += ux * BASE_SPEED + zx;
  p.y += uy * BASE_SPEED + zy;

  clamp(p);
}

function randomMove(p){
  p.x += (Math.random()-.5)*0.4;
  p.y += (Math.random()-.5)*0.4;
  clamp(p);
}

function clamp(p){
  p.x = Math.max(1,Math.min(W-1,p.x));
  p.y = Math.max(1,Math.min(H-1,p.y));
}

/* ===== MAIN LOOP ===== */
setInterval(()=>{
  // USER
  if(targetKey){
    moveWithZigzag(user, exhibits[targetKey]);
    drawRoute(); // route luôn bám theo vị trí mới
  }else{
    randomMove(user);
  }
  userMarker.setLatLng([user.y,user.x]);

  // OTHERS
  others.forEach((o,i)=>{
    randomMove(o);
    otherMarkers[i].setLatLng([o.y,o.x]);
  });
},300);

/* ===== ROUTE DRAW ===== */
function drawRoute(){
  clearRoute();
  const t = exhibits[targetKey];

  routeLine = L.polyline(
    [[user.y,user.x],[t.y,t.x]],
    {color:'red',weight:4}
  ).addTo(map);

  arrowDeco = L.polylineDecorator(routeLine,{
    patterns:[{
      offset:'55%',
      repeat:0,
      symbol:L.Symbol.arrowHead({
        pixelSize:14,
        pathOptions:{color:'red',fillOpacity:1}
      })
    }]
  }).addTo(map);
}

