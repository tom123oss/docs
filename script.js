/* ===== MAP SETUP ===== */
const W = 40, H = 30;
const STEP = 5;

const map = L.map('map', {
  crs: L.CRS.Simple,
  zoomControl: true
});

const bounds = [[0,0],[H,W]];
map.fitBounds(bounds);
L.rectangle(bounds,{color:'#000',weight:2,fillOpacity:0}).addTo(map);
setTimeout(()=>map.invalidateSize(),200);

/* ===== GRID (HÀNH LANG) ===== */
for(let i=0;i<=W;i+=STEP){
  L.polyline([[0,i],[H,i]],{color:'#ccc'}).addTo(map);
}
for(let i=0;i<=H;i+=STEP){
  L.polyline([[i,0],[i,W]],{color:'#ccc'}).addTo(map);
}

/* ===== EXHIBITS ===== */
const exhibits = {
  A:{x:35,y:25},
  B:{x:5,y:5},
  C:{x:25,y:10}
};

Object.entries(exhibits).forEach(([k,p])=>{
  L.marker([p.y,p.x]).addTo(map).bindPopup("Hiện vật "+k);
});

/* ===== USER ===== */
let user = {x:5,y:5};
const userMarker = L.circleMarker([user.y,user.x],{
  radius:8,
  color:'blue',
  fillColor:'blue',
  fillOpacity:1
}).addTo(map);

/* ===== PATH STATE ===== */
let fullPath = [];
let currentIndex = 0;
let visitedLine = null;
let remainingLine = null;

/* ===== BUILD GRID PATH ===== */
function buildPath(from, to){
  const path = [];
  let x = Math.round(from.x/STEP)*STEP;
  let y = Math.round(from.y/STEP)*STEP;
  const tx = Math.round(to.x/STEP)*STEP;
  const ty = Math.round(to.y/STEP)*STEP;

  while(x !== tx){
    x += x < tx ? STEP : -STEP;
    path.push({x,y});
  }
  while(y !== ty){
    y += y < ty ? STEP : -STEP;
    path.push({x,y});
  }
  return path;
}

/* ===== NAVIGATION ===== */
function goTo(key){
  fullPath = buildPath(user, exhibits[key]);
  currentIndex = 0;
  drawRoute();
}

/* ===== DRAW ROUTE ===== */
function drawRoute(){
  if(visitedLine) map.removeLayer(visitedLine);
  if(remainingLine) map.removeLayer(remainingLine);

  const visited = fullPath
    .slice(0,currentIndex)
    .map(p=>[p.y,p.x]);

  const remaining = [
    [user.y,user.x],
    ...fullPath.slice(currentIndex).map(p=>[p.y,p.x])
  ];

  if(visited.length > 1){
    visitedLine = L.polyline(visited,{
      color:'black',
      weight:5
    }).addTo(map);
  }

  if(remaining.length > 1){
    remainingLine = L.polyline(remaining,{
      color:'red',
      weight:5,
      dashArray:'8,6'
    }).addTo(map);
  }
}

/* ===== MOVE USER STEP BY STEP ===== */
setInterval(()=>{
  if(currentIndex < fullPath.length){
    const p = fullPath[currentIndex];
    user.x = p.x;
    user.y = p.y;
    currentIndex++;
    drawRoute();
  }
  userMarker.setLatLng([user.y,user.x]);
}, 700); // chậm – nhìn rõ từng khúc rẽ

