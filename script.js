/* ===== MAP ===== */
const W = 40, H = 30;

const map = L.map('map', { crs: L.CRS.Simple });
const bounds = [[0,0],[H,W]];
map.fitBounds(bounds);

setTimeout(()=> map.invalidateSize(), 200);

/* GRID */
for(let i=0;i<=W;i+=5)
  L.polyline([[0,i],[H,i]],{color:'#ddd'}).addTo(map);
for(let i=0;i<=H;i+=5)
  L.polyline([[i,0],[i,W]],{color:'#ddd'}).addTo(map);

/* ===== EXHIBITS ===== */
const exhibits = {
 A:{x:25,y:10},  
 B:{x:10,y:10},  
 C:{x:10,y:25}   
};

Object.entries(exhibits).forEach(([k,p])=>{
  L.marker([p.y,p.x])
    .addTo(map)
    .bindTooltip("Hiện vật " + k, { permanent: true });
});

/* ===== USER ===== */
let user = {x:6,y:6};
let userMarker = L.circleMarker([user.y,user.x],{
    radius:8,color:"blue",fillColor:"blue",fillOpacity:1
}).addTo(map);

/* ===== OTHER GUESTS ===== */
const others = [
    {x:30,y:6,c:"red"},
    {x:10,y:25,c:"green"},
    {x:35,y:18,c:"orange"}
];

const otherMarkers = others.map(o =>
    L.circleMarker([o.y,o.x],{
        radius:7,color:o.c,fillColor:o.c,fillOpacity:1
    }).addTo(map)
);

/* ===== ROUTES ===== */
let fullPath = [];
let animIndex = 0;
let animSpeed = 0.5;
let moving = false;

let passedLine = null;     // đường đã đi (đen)
let remainingLine = null;  // đường còn lại (đỏ)
let arrowDeco = null;      // mũi tên

/* ===== CREATE ROUTE ===== */
function buildPath(key){
    const t = exhibits[key];
    fullPath = [];

    const steps = 80;
    for(let i=0; i<=steps; i++){
        let tVal = i / steps;
        let x = user.x + (t.x - user.x) * tVal;
        let y = user.y + (t.y - user.y) * tVal;
        fullPath.push([y,x]);
    }

    animIndex = 0;
}

/* ===== UPDATE LINES ===== */
function updateLines(passed, remaining){

    // xóa line cũ
    if(passedLine) map.removeLayer(passedLine);
    if(remainingLine) map.removeLayer(remainingLine);
    if(arrowDeco) map.removeLayer(arrowDeco);

    // đường đã đi → đen
    passedLine = L.polyline(passed,{
        color:"black",
        weight:4
    }).addTo(map);

    // đường còn lại → đỏ
    remainingLine = L.polyline(remaining,{
        color:"red",
        weight:4
    }).addTo(map);

    // mũi tên
    arrowDeco = L.polylineDecorator(remainingLine,{
        patterns:[{
            offset:"50%",
            repeat:0,
            symbol:L.Symbol.arrowHead({
                pixelSize:12,
                pathOptions:{color:"red"}
            })
        }]
    }).addTo(map);
}

/* ===== ANIMATION ===== */
function animate(){
    requestAnimationFrame(animate);

    if(moving && animIndex < fullPath.length-1){
        animIndex += animSpeed;

        const idx = Math.floor(animIndex);

        if(fullPath[idx]){
            let [y,x] = fullPath[idx];
            user.x = x;
            user.y = y;

            userMarker.setLatLng([y,x]);

            // cắt đường
            const passed = fullPath.slice(0, idx);
            const remaining = fullPath.slice(idx);

            updateLines(passed, remaining);
        }
    }

    // guest move (slow)
    others.forEach((o,i)=>{
        o.x += (Math.random()-.5)*0.05;
        o.y += (Math.random()-.5)*0.05;
        otherMarkers[i].setLatLng([o.y,o.x]);
    });
}
animate();

/* ===== BUTTON ===== */
function goToTarget(key){
    moving = false;

    // reset route
    if(passedLine) map.removeLayer(passedLine);
    if(remainingLine) map.removeLayer(remainingLine);
    if(arrowDeco) map.removeLayer(arrowDeco);

    buildPath(key);
    moving = true;
}
