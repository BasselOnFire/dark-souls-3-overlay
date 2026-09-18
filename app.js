const KEY="ds3-overlay-state-v1";
const DEFAULT={players:[{id:1,name:"Bassel",deaths:0},{id:2,name:"Kevin",deaths:0}],elapsed:0,running:false,startedAt:null};
let state=load();
function load(){try{return {...DEFAULT,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return structuredClone(DEFAULT)}}
function save(){localStorage.setItem(KEY,JSON.stringify(state));render();try{new BroadcastChannel("ds3-overlay").postMessage("update")}catch{}}
function totalSeconds(){return state.elapsed+(state.running&&state.startedAt?Math.floor((Date.now()-state.startedAt)/1000):0)}
function fmt(sec){sec=Math.max(0,sec|0);const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return String(h).padStart(3,"0")+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0")}
function render(){
 const t=document.getElementById("timer");if(t)t.textContent=fmt(totalSeconds());
 const ct=document.getElementById("controlTimer");if(ct)ct.textContent=fmt(totalSeconds());
 const p=document.getElementById("players");if(p)p.innerHTML=state.players.map(x=>'<div class="player-card"><span class="player-name">'+esc(x.name)+'</span><span class="death"><span class="skull">☠</span>'+x.deaths+'</span></div>').join("");
 const pc=document.getElementById("playerControls");if(pc)pc.innerHTML=state.players.map(x=>'<div class="player-control"><input data-name="'+x.id+'" value="'+attr(x.name)+'" aria-label="Spielername"><button data-minus="'+x.id+'">−1</button><span class="count">'+x.deaths+'</span><button data-plus="'+x.id+'">+1</button><button class="remove" data-remove="'+x.id+'">Löschen</button></div>').join("");
}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}function attr(s){return esc(s)}
document.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
 if(b.id==="startTimer"&&!state.running){state.running=true;state.startedAt=Date.now();save()}
 if(b.id==="pauseTimer"&&state.running){state.elapsed=totalSeconds();state.running=false;state.startedAt=null;save()}
 if(b.id==="resetTimer"&&confirm("Spielzeit wirklich auf 0 setzen?")){state.elapsed=0;state.running=false;state.startedAt=null;save()}
 if(b.id==="addPlayer"){state.players.push({id:Date.now(),name:"Spieler "+(state.players.length+1),deaths:0});save()}
 const plus=b.dataset.plus,minus=b.dataset.minus,remove=b.dataset.remove;
 if(plus){const x=state.players.find(p=>p.id==plus);if(x)x.deaths++;save()}
 if(minus){const x=state.players.find(p=>p.id==minus);if(x)x.deaths=Math.max(0,x.deaths-1);save()}
 if(remove&&state.players.length>1){state.players=state.players.filter(p=>p.id!=remove);save()}
});
document.addEventListener("change",e=>{if(e.target.dataset.name){const x=state.players.find(p=>p.id==e.target.dataset.name);if(x)x.name=e.target.value.trim()||"Spieler";save()}});
window.addEventListener("storage",e=>{if(e.key===KEY){state=load();render()}});
try{const bc=new BroadcastChannel("ds3-overlay");bc.onmessage=()=>{state=load();render()}}catch{}
setInterval(render,250);render();