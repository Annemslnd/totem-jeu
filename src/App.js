import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "./firebase";
import { ref, onValue, set } from "firebase/database";

const PLAYERS = ["Anne","Melaine","Adèle"];

const ANIMAL_CARDS = [
  { id:'a1',  emoji:'🦁', name:'Lion',         desc:"Tu inspires confiance et dégages une autorité naturelle." },
  { id:'a2',  emoji:'🦅', name:'Aigle',        desc:"Tu vois loin et perçois ce que les autres ne voient pas." },
  { id:'a3',  emoji:'🐬', name:'Dauphin',      desc:"Tu crées des liens facilement et mets les autres à l'aise." },
  { id:'a4',  emoji:'🐺', name:'Loup',         desc:"Tu es loyal·e et tu protèges ceux qui te sont chers." },
  { id:'a5',  emoji:'🦊', name:'Renard',       desc:"Tu trouves toujours une solution créative." },
  { id:'a6',  emoji:'🐘', name:'Éléphant',     desc:"Ta mémoire et ta sagesse sont des cadeaux précieux." },
  { id:'a7',  emoji:'🦋', name:'Papillon',     desc:"Tu sais te transformer et t'adapter avec grâce." },
  { id:'a8',  emoji:'🦉', name:'Hibou',        desc:"Tu es attentif·ve et tu perçois les détails importants." },
  { id:'a9',  emoji:'🐻', name:'Ours',         desc:"Tu es solide, rassurant·e et tu sais quand te battre." },
  { id:'a10', emoji:'🦒', name:'Girafe',       desc:"Tu vois les choses avec recul et perspicacité." },
  { id:'a11', emoji:'🐆', name:'Léopard',      desc:"Tu agis avec précision et efficacité quand il le faut." },
  { id:'a12', emoji:'🦚', name:'Paon',         desc:"Tu exprimes ta créativité avec fierté et originalité." },
  { id:'a13', emoji:'🦓', name:'Zèbre',        desc:"Tu t'assumes pleinement, unique et sans compromis." },
  { id:'a14', emoji:'🦦', name:'Loutre',       desc:"Tu apportes joie et légèreté partout où tu passes." },
  { id:'a15', emoji:'🐳', name:'Baleine',      desc:"Tu portes une grande sagesse intérieure et une profondeur rare." },
  { id:'a16', emoji:'🦈', name:'Requin',       desc:"Tu avances avec détermination sans jamais te décourager." },
  { id:'a17', emoji:'🦜', name:'Perroquet',    desc:"Tu sais mettre les mots justes sur les choses importantes." },
  { id:'a18', emoji:'🐝', name:'Abeille',      desc:"Tu travailles avec soin et tu contribues au collectif." },
  { id:'a19', emoji:'🐋', name:'Orque',        desc:"Tu fédères et tu emmènes les autres avec toi naturellement." },
  { id:'a20', emoji:'🦩', name:'Flamant rose', desc:"Tu marques les esprits et tu oses te démarquer." },
];

const QUALITY_CARDS = [
  { id:'q1',  emoji:'💛', name:'Attentionné·e',  desc:"Tu remarques les besoins des autres et y réponds avec soin." },
  { id:'q2',  emoji:'✨', name:'Créatif·ve',      desc:"Ton esprit trouve sans cesse de nouvelles perspectives." },
  { id:'q3',  emoji:'🌊', name:'Calme',           desc:"Tu gardes ton équilibre même dans les tempêtes." },
  { id:'q4',  emoji:'🔥', name:'Passionné·e',     desc:"Ton enthousiasme est communicatif et inspirant." },
  { id:'q5',  emoji:'🤝', name:'Généreux·se',     desc:"Tu donnes sans compter ton temps et ton énergie." },
  { id:'q6',  emoji:'💡', name:'Curieux·se',      desc:"Tu cherches toujours à comprendre et à apprendre." },
  { id:'q7',  emoji:'🌟', name:'Courageux·se',    desc:"Tu fonces même quand c'est difficile." },
  { id:'q8',  emoji:'🎯', name:'Déterminé·e',     desc:"Tu vas jusqu'au bout de ce que tu entreprends." },
  { id:'q9',  emoji:'🌺', name:'Bienveillant·e',  desc:"Tu enveloppes les autres de chaleur et de douceur." },
  { id:'q10', emoji:'🧠', name:'Intuitif·ve',     desc:"Tu sens les choses avant même qu'elles soient dites." },
  { id:'q11', emoji:'😄', name:'Joyeux·se',       desc:"Ton rire et ta bonne humeur illuminent le groupe." },
  { id:'q12', emoji:'🛡️', name:'Fiable',           desc:"On peut compter sur toi, toujours, sans exception." },
  { id:'q13', emoji:'🌈', name:'Optimiste',       desc:"Tu vois le bon côté des choses et tu redonnes espoir." },
  { id:'q14', emoji:'🌱', name:'Patient·e',       desc:"Tu prends le temps qu'il faut, sans précipitation." },
  { id:'q15', emoji:'💬', name:'Sincère',         desc:"Tu parles avec honnêteté et tes mots ont du poids." },
  { id:'q16', emoji:'🎨', name:'Sensible',        desc:"Tu ressens les émotions avec finesse et profondeur." },
  { id:'q17', emoji:'⚡', name:'Énergique',       desc:"Tu entraînes les autres avec ton dynamisme." },
  { id:'q18', emoji:'🤗', name:'Empathique',      desc:"Tu comprends et accueilles les émotions des autres." },
  { id:'q19', emoji:'🏔️', name:'Résilient·e',     desc:"Tu te relèves toujours, encore plus fort·e." },
  { id:'q20', emoji:'🎵', name:'Spontané·e',      desc:"Tu vis dans l'instant et oses exprimer ce que tu ressens." },
];

function getCard(id) {
  return ANIMAL_CARDS.find(c => c.id === id) || QUALITY_CARDS.find(c => c.id === id);
}

function deterministicShuffle(arr, seed) {
  let a = [...arr], h = 0;
  for (let c of seed) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  for (let i = a.length - 1; i > 0; i--) {
    h = (Math.imul(1664525, h) + 1013904223) | 0;
    const j = Math.abs(h) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getHandFor(receiverName, voterName, cardType, takenIds = []) {
  const pool = cardType === 'animal' ? ANIMAL_CARDS : QUALITY_CARDS;
  const available = pool.filter(c => !takenIds.includes(c.id));
  const shuffled = deterministicShuffle(available, receiverName + voterName + cardType);
  return shuffled.slice(0, 7);
}

function getTakenIds(gameState, cardType, excludeReceiver = null) {
  return PLAYERS
    .filter(p => p !== excludeReceiver)
    .map(p => cardType === 'animal' ? gameState[p]?.animalWinner : gameState[p]?.qualityWinner)
    .filter(Boolean);
}

function initGameState() {
  const s = {};
  PLAYERS.forEach(p => {
    s[p] = { animalVotes: {}, animalRunoffVotes: {}, animalWinner: null, qualityVotes: {}, qualityRunoffVotes: {}, qualityWinner: null };
  });
  return s;
}

function getPhaseFor(ps) {
  if (!ps) return 'animal-propose';
  const voters = PLAYERS.length - 1;
  if (ps.qualityWinner) return 'done';
  if (ps.animalWinner) return Object.keys(ps.qualityVotes || {}).length >= voters ? 'quality-runoff' : 'quality-propose';
  return Object.keys(ps.animalVotes || {}).length >= voters ? 'animal-runoff' : 'animal-propose';
}

// Ce que ME (le voteur) doit encore faire pour RECEIVER
function getMyActionFor(gs, me, receiver) {
  if (me === receiver) return null; // pas d'action sur soi-même ici
  const ps = gs[receiver];
  if (!ps) return null;
  const phase = getPhaseFor(ps);
  if (phase === 'done') return 'done';
  if (phase === 'animal-propose') {
    return (ps.animalVotes || {})[me] ? 'voted' : 'todo';
  }
  if (phase === 'animal-runoff') {
    return (ps.animalRunoffVotes || {})[me] ? 'voted' : 'todo';
  }
  if (phase === 'quality-propose') {
    return (ps.qualityVotes || {})[me] ? 'voted' : 'todo';
  }
  if (phase === 'quality-runoff') {
    return (ps.qualityRunoffVotes || {})[me] ? 'voted' : 'todo';
  }
  return null;
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Nunito:wght@300;400;600;700&display=swap');
:root{
  --ink:#1C1A14;--bark:#2E200E;--earth:#4A3220;
  --moss:#3D5C28;--fern:#5A8040;--sage:#8AB06A;
  --mist:#C2D4A8;--cream:#F5EDD6;
  --gold:#C8960A;--amber:#E0AC30;--glow:rgba(200,150,10,.18);
}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Nunito',sans-serif;background:var(--ink);color:var(--cream);min-height:100vh;}
.bg{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;}
.bg-c{position:absolute;border-radius:50%;background:radial-gradient(circle,var(--c) 0%,transparent 70%);}
.screen{position:relative;z-index:1;min-height:100vh;}

/* LOGIN */
.login-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:2rem;text-align:center;}
.brand-icon{font-size:4.5rem;margin-bottom:1rem;animation:sway 4s ease-in-out infinite;filter:drop-shadow(0 0 24px rgba(200,150,10,.5));}
@keyframes sway{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
.brand-name{font-family:'Cormorant Garamond',serif;font-size:clamp(3.5rem,10vw,5.5rem);font-weight:700;letter-spacing:.15em;color:var(--amber);text-shadow:0 0 40px var(--glow),0 2px 0 var(--earth);line-height:1;}
.brand-tag{font-size:.78rem;letter-spacing:.35em;text-transform:uppercase;color:var(--sage);margin:.5rem 0 2.5rem;font-weight:300;}
.players-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.8rem;max-width:480px;width:100%;margin-bottom:1.5rem;}
.player-tile{background:rgba(62,92,40,.2);border:1.5px solid rgba(90,128,64,.25);border-radius:14px;padding:1rem .5rem;cursor:pointer;transition:all .22s;font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-weight:600;color:var(--cream);position:relative;overflow:hidden;}
.player-tile::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(200,150,10,.12),transparent);opacity:0;transition:opacity .22s;}
.player-tile:hover::after{opacity:1;}
.player-tile:hover{border-color:var(--amber);transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.4);}
.player-tile.done{border-color:rgba(200,150,10,.4);}
.tile-status{display:block;font-family:'Nunito',sans-serif;font-size:.62rem;color:var(--sage);margin-top:.25rem;font-weight:400;}
.player-tile.done .tile-status{color:var(--amber);}
.link-btn{background:transparent;border:1px solid rgba(90,128,64,.4);color:var(--sage);padding:.5rem 1.4rem;border-radius:24px;cursor:pointer;font-size:.82rem;font-family:'Nunito',sans-serif;transition:all .2s;letter-spacing:.05em;}
.link-btn:hover{border-color:var(--amber);color:var(--amber);}

/* DASHBOARD */
.dashboard{padding:1.4rem;max-width:600px;margin:0 auto;}
.welcome-banner{background:linear-gradient(135deg,rgba(62,92,40,.5),rgba(46,32,14,.6));border:1px solid rgba(200,150,10,.3);border-radius:18px;padding:1.2rem 1.6rem;margin-bottom:1.8rem;text-align:center;}
.welcome-banner h2{font-family:'Cormorant Garamond',serif;font-size:1.6rem;font-weight:700;color:var(--amber);}
.welcome-banner p{color:var(--mist);font-size:.85rem;margin-top:.3rem;}
.vote-list{display:flex;flex-direction:column;gap:.7rem;margin-bottom:1.5rem;}
.vote-row{background:rgba(62,92,40,.2);border:1.5px solid rgba(90,128,64,.2);border-radius:14px;padding:.9rem 1.1rem;display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:all .2s;}
.vote-row:hover{border-color:rgba(200,150,10,.4);transform:translateX(4px);}
.vote-row.todo{border-color:rgba(200,150,10,.3);}
.vote-row.voted{opacity:.6;cursor:default;}
.vote-row.done-r{opacity:.4;cursor:default;}
.vote-row-name{font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:600;color:var(--cream);}
.vote-row-status{font-size:.72rem;padding:.25rem .7rem;border-radius:20px;}
.status-todo{background:rgba(200,150,10,.15);border:1px solid rgba(200,150,10,.4);color:var(--amber);}
.status-voted{background:rgba(62,92,40,.3);border:1px solid rgba(90,128,64,.4);color:var(--sage);}
.status-done{background:rgba(62,92,40,.15);border:1px solid rgba(90,128,64,.2);color:var(--mist);}
.my-totem-btn{background:linear-gradient(135deg,rgba(200,150,10,.15),rgba(62,92,40,.3));border:1.5px solid rgba(200,150,10,.4);border-radius:14px;padding:1rem 1.4rem;width:100%;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:1rem;}
.my-totem-btn:hover{border-color:var(--amber);transform:translateY(-2px);}
.my-totem-btn-label{font-size:.7rem;color:var(--sage);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.2rem;}
.my-totem-btn-name{font-family:'Cormorant Garamond',serif;font-size:1.2rem;color:var(--amber);font-weight:700;}

/* HEADER */
.game-header{position:sticky;top:0;z-index:50;background:rgba(28,26,20,.92);backdrop-filter:blur(12px);border-bottom:1px solid rgba(90,128,64,.2);display:flex;align-items:center;justify-content:space-between;padding:.9rem 1.4rem;gap:.8rem;}
.header-back{background:none;border:1px solid rgba(90,128,64,.35);color:var(--sage);padding:.35rem .9rem;border-radius:20px;cursor:pointer;font-size:.8rem;transition:all .2s;white-space:nowrap;}
.header-back:hover{border-color:var(--amber);color:var(--amber);}
.header-title{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:700;color:var(--amber);flex:1;text-align:center;}
.header-phase{font-size:.68rem;color:var(--sage);letter-spacing:.07em;text-transform:uppercase;white-space:nowrap;}
.sync-dot{width:8px;height:8px;border-radius:50%;background:var(--sage);animation:pulse 2s ease-in-out infinite;flex-shrink:0;}
.sync-dot.busy{background:var(--amber);}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}

/* GAME BODY */
.game-body{padding:1.4rem;max-width:860px;margin:0 auto;}
.receiver-banner{background:linear-gradient(135deg,rgba(62,92,40,.5),rgba(46,32,14,.6));border:1px solid rgba(200,150,10,.3);border-radius:18px;padding:1.4rem 1.6rem;margin-bottom:1.8rem;text-align:center;}
.receiver-banner h2{font-family:'Cormorant Garamond',serif;font-size:1.8rem;font-weight:700;color:var(--amber);}
.receiver-banner p{color:var(--mist);font-size:.85rem;margin-top:.3rem;}
.stitle{font-family:'Cormorant Garamond',serif;font-size:1.05rem;font-weight:600;color:var(--sage);display:flex;align-items:center;gap:.7rem;margin-bottom:1rem;}
.stitle::after{content:'';flex:1;height:1px;background:linear-gradient(to right,rgba(90,128,64,.4),transparent);}
.pbar{background:rgba(90,128,64,.15);border-radius:20px;height:5px;margin:.6rem 0;overflow:hidden;}
.pfill{height:100%;background:linear-gradient(to right,var(--moss),var(--amber));border-radius:20px;transition:width .6s ease;}
.spanel{background:rgba(28,26,20,.5);border:1px solid rgba(90,128,64,.2);border-radius:12px;padding:.9rem 1.1rem;margin-bottom:1.4rem;font-size:.8rem;color:var(--mist);line-height:1.8;}
.spanel strong{color:var(--sage);}
.spanel .gold{color:var(--amber);}
.cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(138px,1fr));gap:.7rem;margin-bottom:1.5rem;}
.card{background:rgba(62,92,40,.22);border:1.5px solid rgba(90,128,64,.22);border-radius:12px;padding:.9rem .7rem;cursor:pointer;transition:all .2s;text-align:center;position:relative;}
.card:hover{border-color:rgba(200,150,10,.45);background:rgba(62,92,40,.4);transform:translateY(-2px);}
.card.sel{border-color:var(--amber);background:rgba(200,150,10,.12);box-shadow:0 0 14px rgba(200,150,10,.2);}
.card.sel::after{content:'✓';position:absolute;top:5px;right:8px;color:var(--amber);font-size:.75rem;font-weight:700;}
.card.taken{opacity:.3;pointer-events:none;}
.card-em{font-size:1.9rem;margin-bottom:.4rem;display:block;}
.card-name{font-family:'Cormorant Garamond',serif;font-size:.9rem;font-weight:600;color:var(--cream);margin-bottom:.2rem;}
.card-desc{font-size:.65rem;color:var(--mist);line-height:1.4;}
.candidates{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:.8rem;margin-bottom:1.5rem;}
.cand{background:rgba(62,92,40,.25);border:1.5px solid rgba(90,128,64,.25);border-radius:14px;padding:1rem .8rem;cursor:pointer;transition:all .2s;text-align:center;position:relative;}
.cand:hover{border-color:rgba(200,150,10,.5);transform:translateY(-2px);}
.cand.sel{border-color:var(--amber);background:rgba(200,150,10,.13);box-shadow:0 0 16px rgba(200,150,10,.2);}
.cand.sel::after{content:'✓';position:absolute;top:6px;right:9px;color:var(--amber);font-size:.8rem;font-weight:700;}
.cand.taken{opacity:.3;pointer-events:none;}
.cand-em{font-size:2.2rem;margin-bottom:.45rem;display:block;}
.cand-name{font-family:'Cormorant Garamond',serif;font-size:1rem;font-weight:700;color:var(--cream);margin-bottom:.2rem;}
.cand-desc{font-size:.65rem;color:var(--mist);line-height:1.4;}
.cand-badge{display:inline-block;background:rgba(90,128,64,.25);border:1px solid rgba(90,128,64,.4);border-radius:20px;padding:.05rem .5rem;font-size:.65rem;color:var(--sage);margin-top:.35rem;margin-right:.2rem;}
.cand-badge.top{background:rgba(200,150,10,.2);border-color:rgba(200,150,10,.4);color:var(--amber);}
.cand-badge.red{border-color:rgba(200,50,50,.4);color:rgba(220,100,100,.8);}
.btn{padding:.7rem 1.8rem;border-radius:28px;border:none;cursor:pointer;font-family:'Nunito',sans-serif;font-weight:700;font-size:.85rem;letter-spacing:.05em;text-transform:uppercase;transition:all .2s;}
.btn-p{background:linear-gradient(135deg,var(--gold),var(--amber));color:var(--ink);}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(200,150,10,.35);}
.btn-p:disabled{opacity:.35;cursor:not-allowed;transform:none;box-shadow:none;}
.btn-g{background:transparent;border:1.5px solid rgba(90,128,64,.4);color:var(--sage);}
.btn-g:hover{border-color:var(--amber);color:var(--amber);}
.bgroup{display:flex;gap:.8rem;flex-wrap:wrap;margin-top:1.2rem;}
.final-wrap{background:linear-gradient(155deg,rgba(62,92,40,.45),rgba(28,26,20,.8));border:2px solid var(--amber);border-radius:22px;padding:2rem;margin-bottom:1.5rem;text-align:center;}
.final-wrap h2{font-family:'Cormorant Garamond',serif;font-size:2rem;font-weight:700;color:var(--amber);margin-bottom:1.5rem;}
.tparts{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
.tpart{background:rgba(28,26,20,.6);border:1px solid rgba(200,150,10,.35);border-radius:16px;padding:1.3rem 1.6rem;min-width:175px;text-align:center;}
.tpart .pe{font-size:2.4rem;}
.tpart .pl{font-size:.65rem;color:var(--sage);text-transform:uppercase;letter-spacing:.12em;margin:.4rem 0 .2rem;}
.tpart .pn{font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-weight:700;color:var(--cream);}
.tpart .pd{font-size:.68rem;color:var(--mist);margin-top:.25rem;font-style:italic;}
.ov-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(245px,1fr));gap:1rem;}
.mini{background:rgba(62,92,40,.2);border:1px solid rgba(90,128,64,.2);border-radius:12px;padding:1rem 1.2rem;}
.mini.done{border-color:rgba(200,150,10,.35);}
.mini-name{font-family:'Cormorant Garamond',serif;font-size:1.05rem;font-weight:700;color:var(--amber);margin-bottom:.7rem;}
.mini:not(.done) .mini-name{color:var(--mist);}
.mini-row{display:flex;align-items:center;gap:.6rem;margin-bottom:.4rem;}
.mini-em{font-size:1.6rem;}
.mini-cn{font-size:.82rem;color:var(--cream);}
.mini-cd{font-size:.65rem;color:var(--mist);}
.mini-prog{font-size:.72rem;color:var(--sage);}
.wait{text-align:center;padding:3rem 1rem;}
.wait .wi{font-size:3rem;margin-bottom:1rem;}
.wait h3{font-family:'Cormorant Garamond',serif;font-size:1.4rem;color:var(--sage);margin-bottom:.5rem;}
.wait p{color:var(--mist);font-size:.85rem;line-height:1.7;}
.toast{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%) translateY(80px);background:rgba(28,26,20,.96);border:1px solid var(--amber);color:var(--cream);padding:.7rem 1.4rem;border-radius:28px;font-size:.85rem;z-index:9999;transition:transform .3s ease;backdrop-filter:blur(12px);pointer-events:none;white-space:nowrap;}
.toast.on{transform:translateX(-50%) translateY(0);}
.admin-btn{margin-top:1rem;background:transparent;border:1px solid rgba(200,20,20,.3);color:rgba(200,100,100,.6);padding:.3rem .8rem;border-radius:20px;cursor:pointer;font-size:.7rem;transition:all .2s;}
.admin-btn:hover{border-color:rgba(200,20,20,.7);color:rgba(220,100,100,.9);}
.stepper{display:flex;align-items:center;justify-content:center;gap:.4rem;margin-bottom:1.5rem;flex-wrap:wrap;}
.step{font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;padding:.28rem .7rem;border-radius:20px;color:var(--mist);border:1px solid rgba(90,128,64,.2);}
.step.active{background:rgba(200,150,10,.15);border-color:var(--amber);color:var(--amber);}
.step.done-s{background:rgba(62,92,40,.3);border-color:rgba(90,128,64,.4);color:var(--sage);}
.step-arrow{color:rgba(90,128,64,.35);font-size:.8rem;}
@media(max-width:500px){
  .players-grid{grid-template-columns:repeat(2,1fr);}
  .cards-grid,.candidates{grid-template-columns:repeat(2,1fr);}
  .tparts{flex-direction:column;align-items:center;}
}
`;

export default function App() {
  const [gs, setGs] = useState(null);
  const [me, setMe] = useState(null);
  // view: 'login' | 'dashboard' | 'vote' | 'mytotem' | 'overview'
  const [view, setView] = useState('login');
  const [receiver, setReceiver] = useState(null); // pour qui on vote
  const [selCard, setSelCard] = useState(null);
  const [selRunoff, setSelRunoff] = useState(null);
  const [toast, setToast] = useState({ msg: '', on: false });
  const [busy, setBusy] = useState(false);
  const toastRef = useRef(null);

  useEffect(() => {
    const gameRef = ref(db, 'gameState');
    const unsub = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setGs(data);
      else { const i = initGameState(); set(gameRef, i); setGs(i); }
    });
    return () => unsub();
  }, []);

  useEffect(() => { setSelCard(null); setSelRunoff(null); }, [receiver, view]);

  const showToast = useCallback((msg) => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ msg, on: true });
    toastRef.current = setTimeout(() => setToast(t => ({ ...t, on: false })), 2800);
  }, []);

  const saveState = useCallback(async (next) => {
    setBusy(true);
    try { await set(ref(db, 'gameState'), next); }
    catch { showToast('Erreur réseau ⚠️'); }
    finally { setBusy(false); }
  }, [showToast]);

  const resolveRunoffIfReady = (state, rec, cardType) => {
    const ps = state[rec];
    const voters = PLAYERS.length - 1;
    const rv = cardType === 'animal' ? ps.animalRunoffVotes : ps.qualityRunoffVotes;
    if (!rv || Object.keys(rv).length < voters) return state;
    const counts = {};
    Object.values(rv).forEach(cid => { counts[cid] = (counts[cid] || 0) + 1; });
    const takenIds = getTakenIds(state, cardType, rec);
    const eligible = Object.entries(counts).filter(([cid]) => !takenIds.includes(cid));
    const pool = eligible.length > 0 ? eligible : Object.entries(counts);
    pool.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const winnerId = pool[0][0];
    const next = { ...state, [rec]: { ...ps } };
    if (cardType === 'animal') next[rec].animalWinner = winnerId;
    else next[rec].qualityWinner = winnerId;
    return next;
  };

  const submitProposal = async (cardType) => {
    if (!selCard || !gs) return;
    const next = JSON.parse(JSON.stringify(gs));
    if (cardType === 'animal') next[receiver].animalVotes = { ...next[receiver].animalVotes, [me]: selCard };
    else next[receiver].qualityVotes = { ...next[receiver].qualityVotes, [me]: selCard };
    await saveState(next);
    showToast('Proposition enregistrée ! 🌿');
  };

  const submitRunoff = async (cardType) => {
    if (!selRunoff || !gs) return;
    let next = JSON.parse(JSON.stringify(gs));
    if (cardType === 'animal') next[receiver].animalRunoffVotes = { ...next[receiver].animalRunoffVotes, [me]: selRunoff };
    else next[receiver].qualityRunoffVotes = { ...next[receiver].qualityRunoffVotes, [me]: selRunoff };
    next = resolveRunoffIfReady(next, receiver, cardType);
    await saveState(next);
    showToast('Vote enregistré ! 🗳️');
  };

  const resetGame = async () => {
    if (!window.confirm('Remettre la partie à zéro ?')) return;
    await saveState(initGameState());
    showToast('Partie réinitialisée 🌱');
  };

  const phaseLabel = (name) => {
    if (!gs || !gs[name]) return '';
    const ps = gs[name];
    const voters = PLAYERS.length - 1;
    if (ps.qualityWinner) return '🌿 Totem complet';
    if (ps.animalWinner) {
      const qv = Object.keys(ps.qualityVotes || {}).length;
      const qrv = Object.keys(ps.qualityRunoffVotes || {}).length;
      if (qv >= voters) return `Vote final qualité ${qrv}/${voters}`;
      return `Propositions qualité ${qv}/${voters}`;
    }
    const av = Object.keys(ps.animalVotes || {}).length;
    const arv = Object.keys(ps.animalRunoffVotes || {}).length;
    if (av >= voters) return `Vote final animal ${arv}/${voters}`;
    return `Propositions animal ${av}/${voters}`;
  };

  if (!gs) return (
    <>
      <style>{css}</style>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',flexDirection:'column',gap:'1rem' }}>
        <div style={{ fontSize:'3rem',animation:'sway 2s ease-in-out infinite' }}>🌿</div>
        <p style={{ color:'var(--sage)',fontFamily:'Cormorant Garamond,serif',fontSize:'1.2rem' }}>Connexion…</p>
        <style>{`@keyframes sway{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}`}</style>
      </div>
    </>
  );

  // ── LOGIN ─────────────────────────────────────────────────
  if (view === 'login') return (
    <>
      <style>{css}</style>
      <Bg />
      <div className="screen">
        <div className="login-wrap">
          <div className="brand-icon">🌿</div>
          <div className="brand-name">TOTEM</div>
          <div className="brand-tag">Le jeu qui fait du bien</div>
          <p style={{ color:'var(--mist)',fontSize:'.85rem',maxWidth:340,lineHeight:1.8,marginBottom:'2rem' }}>
            Qui êtes-vous ? Cliquez sur votre prénom pour commencer.
          </p>
          <div className="players-grid">
            {PLAYERS.map(p => (
              <button key={p} className={`player-tile${gs[p]?.qualityWinner ? ' done' : ''}`}
                onClick={() => { setMe(p); setView('dashboard'); }}>
                {p}
                <span className="tile-status">{gs[p]?.qualityWinner ? '🌿 Totem complet' : ''}</span>
              </button>
            ))}
          </div>
          <button className="link-btn" style={{ marginBottom:'.8rem' }} onClick={() => setView('overview')}>🏆 Voir tous les totems</button>
          <button className="admin-btn" onClick={resetGame}>⚙ Réinitialiser la partie</button>
          <div style={{ marginTop:'1.5rem',display:'flex',alignItems:'center',gap:'.5rem' }}>
            <div className={`sync-dot${busy?' busy':''}`} />
            <span style={{ fontSize:'.7rem',color:'var(--sage)' }}>Synchronisé en temps réel</span>
          </div>
        </div>
      </div>
      <Toast t={toast} />
    </>
  );

  // ── DASHBOARD ─────────────────────────────────────────────
  // Après login : je vois mon totem + la liste des amies pour qui voter
  if (view === 'dashboard' && me) {
    const others = PLAYERS.filter(p => p !== me);
    return (
      <>
        <style>{css}</style>
        <Bg />
        <div className="screen">
          <div className="game-header">
            <button className="header-back" onClick={() => { setMe(null); setView('login'); }}>← Accueil</button>
            <div className="header-title">🌿 {me}</div>
            <div className={`sync-dot${busy?' busy':''}`} />
          </div>
          <div className="dashboard">

            {/* Mon totem */}
            <div className="my-totem-btn" onClick={() => setView('mytotem')}>
              <div className="my-totem-btn-label">Mon Totem</div>
              {gs[me]?.qualityWinner
                ? <div className="my-totem-btn-name">{getCard(gs[me].animalWinner)?.emoji} {getCard(gs[me].animalWinner)?.name} · {getCard(gs[me].qualityWinner)?.emoji} {getCard(gs[me].qualityWinner)?.name}</div>
                : <div className="my-totem-btn-name" style={{ color:'var(--mist)',fontSize:'1rem' }}>En cours de construction… 👀</div>
              }
            </div>

            <div className="stitle">Voter pour mes amies</div>
            <div className="vote-list">
              {others.map(p => {
                const action = getMyActionFor(gs, me, p);
                const phase = getPhaseFor(gs[p]);
                const isDone = phase === 'done';
                const hasVoted = action === 'voted';
                const isTodo = action === 'todo';
                return (
                  <div key={p}
                    className={`vote-row${isTodo?' todo':''}${hasVoted?' voted':''}${isDone?' done-r':''}`}
                    onClick={() => { if (!isDone) { setReceiver(p); setView('vote'); } }}>
                    <div>
                      <div className="vote-row-name">{p}</div>
                      <div style={{ fontSize:'.7rem',color:'var(--mist)',marginTop:'.15rem' }}>{phaseLabel(p)}</div>
                    </div>
                    <span className={`vote-row-status${isTodo?' status-todo':hasVoted?' status-voted':' status-done'}`}>
                      {isDone ? '🌿 Complet' : isTodo ? '→ Voter' : '✓ Voté'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="bgroup" style={{ justifyContent:'center' }}>
              <button className="link-btn" onClick={() => setView('overview')}>🏆 Voir tous les totems</button>
            </div>
          </div>
        </div>
        <Toast t={toast} />
      </>
    );
  }

  // ── MON TOTEM ─────────────────────────────────────────────
  if (view === 'mytotem' && me) {
    const phase = getPhaseFor(gs[me]);
    return (
      <>
        <style>{css}</style>
        <Bg />
        <div className="screen">
          <div className="game-header">
            <button className="header-back" onClick={() => setView('dashboard')}>← Retour</button>
            <div className="header-title">Mon Totem</div>
            <div className={`sync-dot${busy?' busy':''}`} />
          </div>
          <div className="game-body">
            {phase === 'done'
              ? <FinalTotem gs={gs} name={me} goBack={() => setView('dashboard')} />
              : <ReceiverWaitView gs={gs} name={me} phase={phase} />
            }
          </div>
        </div>
        <Toast t={toast} />
      </>
    );
  }

  // ── VOTE (pour une amie) ──────────────────────────────────
  if (view === 'vote' && me && receiver) {
    const phase = getPhaseFor(gs[receiver]);
    const phaseHeaderLabel = {
      'animal-propose': `Voter pour ${receiver} · Animal`,
      'animal-runoff': `Vote final · Animal de ${receiver}`,
      'quality-propose': `Voter pour ${receiver} · Qualité`,
      'quality-runoff': `Vote final · Qualité de ${receiver}`,
    }[phase] || '';

    return (
      <>
        <style>{css}</style>
        <Bg />
        <div className="screen">
          <div className="game-header">
            <button className="header-back" onClick={() => setView('dashboard')}>← Retour</button>
            <div className="header-title" style={{ fontSize:'1rem' }}>{phaseHeaderLabel}</div>
            <div className={`sync-dot${busy?' busy':''}`} />
          </div>
          <div className="game-body">
            {phase === 'animal-propose' && <ProposeView gs={gs} receiver={receiver} me={me} cardType="animal" selCard={selCard} setSelCard={setSelCard} submitProposal={submitProposal} />}
            {phase === 'animal-runoff' && <RunoffView gs={gs} receiver={receiver} me={me} cardType="animal" selRunoff={selRunoff} setSelRunoff={setSelRunoff} submitRunoff={submitRunoff} />}
            {phase === 'quality-propose' && <ProposeView gs={gs} receiver={receiver} me={me} cardType="quality" selCard={selCard} setSelCard={setSelCard} submitProposal={submitProposal} />}
            {phase === 'quality-runoff' && <RunoffView gs={gs} receiver={receiver} me={me} cardType="quality" selRunoff={selRunoff} setSelRunoff={setSelRunoff} submitRunoff={submitRunoff} />}
            {phase === 'done' && (
              <div className="wait">
                <div className="wi">🌿</div>
                <h3>Totem de {receiver} complet !</h3>
                <p>Le totem de {receiver} a déjà été établi.</p>
                <div className="bgroup" style={{ justifyContent:'center',marginTop:'1.5rem' }}>
                  <button className="btn btn-g" onClick={() => setView('dashboard')}>← Retour</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <Toast t={toast} />
      </>
    );
  }

  // ── OVERVIEW ──────────────────────────────────────────────
  if (view === 'overview') {
    const done = PLAYERS.filter(p => gs[p]?.qualityWinner);
    const inProg = PLAYERS.filter(p => !gs[p]?.qualityWinner);
    return (
      <>
        <style>{css}</style>
        <Bg />
        <div className="screen">
          <div className="game-header">
            <button className="header-back" onClick={() => setView(me ? 'dashboard' : 'login')}>← Retour</button>
            <div className="header-title">🏆 Tous les Totems</div>
            <div className={`sync-dot${busy?' busy':''}`} />
          </div>
          <div className="game-body">
            {done.length > 0 && <>
              <div className="stitle">Totems complets ({done.length})</div>
              <div className="ov-grid" style={{ marginBottom:'2rem' }}>
                {done.map(p => {
                  const a = getCard(gs[p].animalWinner), q = getCard(gs[p].qualityWinner);
                  return <div key={p} className="mini done">
                    <div className="mini-name">🌿 {p}</div>
                    <div className="mini-row"><span className="mini-em">{a.emoji}</span><div><div className="mini-cn">{a.name}</div><div className="mini-cd">{a.desc}</div></div></div>
                    <div className="mini-row"><span className="mini-em">{q.emoji}</span><div><div className="mini-cn">{q.name}</div><div className="mini-cd">{q.desc}</div></div></div>
                  </div>;
                })}
              </div>
            </>}
            {inProg.length > 0 && <>
              <div className="stitle">En cours ({inProg.length})</div>
              <div className="ov-grid">
                {inProg.map(p => <div key={p} className="mini"><div className="mini-name">{p}</div><div className="mini-prog">{phaseLabel(p)}</div></div>)}
              </div>
            </>}
            {done.length === 0 && <div className="wait"><div className="wi">🌱</div><h3>La partie commence !</h3><p>Aucun totem n'est encore complet.</p></div>}
          </div>
        </div>
        <Toast t={toast} />
      </>
    );
  }

  return null;
}

// ── ReceiverWaitView ──────────────────────────────────────
function ReceiverWaitView({ gs, name, phase }) {
  const voters = PLAYERS.length - 1;
  const ps = gs[name];
  const isAnimalPhase = phase === 'animal-propose' || phase === 'animal-runoff';
  const votes = isAnimalPhase
    ? (phase === 'animal-runoff' ? ps.animalRunoffVotes : ps.animalVotes)
    : (phase === 'quality-runoff' ? ps.qualityRunoffVotes : ps.qualityVotes);
  const safeVotes = votes || {};
  const voted = Object.keys(safeVotes).length;
  const phaseLabel = {
    'animal-propose': 'Vos amies choisissent votre animal totem en secret…',
    'animal-runoff': 'Vos amies votent pour votre animal totem définitif…',
    'quality-propose': 'Vos amies choisissent votre qualité totem en secret…',
    'quality-runoff': 'Vos amies votent pour votre qualité totem définitif…',
  }[phase] || '';

  return (
    <>
      <div className="receiver-banner">
        <h2>✨ {name} ✨</h2>
        <p>{phaseLabel}</p>
      </div>
      <div className="spanel">
        <strong>{voted}/{voters}</strong> joueuses ont participé
        <div className="pbar"><div className="pfill" style={{ width:`${voted/voters*100}%` }} /></div>
        {voted < voters
          ? <span>Patience… vos amies votent pour vous 🌿</span>
          : <span className="gold">✨ Toutes les joueuses ont voté ! Résultat en cours…</span>
        }
      </div>
      <div className="wait">
        <div className="wi">🌸</div>
        <h3>Installez-vous !</h3>
        <p>Votre totem se construit doucement.<br/>Revenez ici pour le découvrir quand il sera prêt.</p>
      </div>
    </>
  );
}

// ── Stepper ───────────────────────────────────────────────
function Stepper({ phase }) {
  const steps = [
    { key:'animal-propose', label:'Propositions Animal' },
    { key:'animal-runoff',  label:'Vote Final Animal' },
    { key:'quality-propose',label:'Propositions Qualité' },
    { key:'quality-runoff', label:'Vote Final Qualité' },
  ];
  const order = ['animal-propose','animal-runoff','quality-propose','quality-runoff'];
  const cur = order.indexOf(phase);
  return (
    <div className="stepper">
      {steps.map((s, i) => (
        <span key={s.key} style={{ display:'flex',alignItems:'center',gap:'.4rem' }}>
          <span className={`step${i===cur?' active':i<cur?' done-s':''}`}>{i<cur?'✓ ':''}{s.label}</span>
          {i < steps.length-1 && <span className="step-arrow">›</span>}
        </span>
      ))}
    </div>
  );
}

// ── ProposeView ───────────────────────────────────────────
function ProposeView({ gs, receiver, me, cardType, selCard, setSelCard, submitProposal }) {
  const isAnimal = cardType === 'animal';
  const votes = (isAnimal ? gs[receiver].animalVotes : gs[receiver].qualityVotes) || {};
  const others = PLAYERS.filter(p => p !== receiver);
  const voted = Object.keys(votes);
  const remaining = others.filter(p => !voted.includes(p));
  const takenIds = getTakenIds(gs, cardType, receiver);
  const myVote = votes[me];

  if (myVote) {
    const c = getCard(myVote);
    return (
      <>
        <Stepper phase={`${cardType}-propose`} />
        <div className="receiver-banner"><h2>Proposition pour {receiver}</h2><p>Étape 1 · {isAnimal?'Animal 🐾':'Qualité ✨'}</p></div>
        <div className="spanel" style={{ borderColor:'rgba(200,150,10,.4)' }}>✅ Vous avez proposé : <strong>{c.emoji} {c.name}</strong><br/><small>{c.desc}</small></div>
        <div className="spanel">
          <strong>{voted.length}/{others.length}</strong> joueuses ont proposé
          <div className="pbar"><div className="pfill" style={{ width:`${voted.length/others.length*100}%` }} /></div>
          {remaining.length > 0 ? <span>En attente : {remaining.join(', ')}</span> : <span className="gold">Toutes ont proposé ! Le vote final commence.</span>}
        </div>
        <div className="wait"><div className="wi">⏳</div><h3>Proposition enregistrée !</h3><p>Revenez quand le vote final commence.</p></div>
      </>
    );
  }

  const hand = getHandFor(receiver, me, cardType, takenIds);
  return (
    <>
      <Stepper phase={`${cardType}-propose`} />
      <div className="receiver-banner">
        <h2>Proposer pour {receiver}</h2>
        <p>{isAnimal ? 'Quel animal représente le mieux une force de cette personne ?' : 'Quelle qualité correspond le mieux à cette personne ?'}</p>
      </div>
      <div className="spanel"><strong>{voted.length}/{others.length}</strong> joueuses ont déjà proposé<div className="pbar"><div className="pfill" style={{ width:`${voted.length/others.length*100}%` }} /></div></div>
      <div className="stitle">Vos 7 cartes {isAnimal?'animal':'qualité'}</div>
      <div className="cards-grid">
        {hand.map(c => (
          <div key={c.id} className={`card${selCard===c.id?' sel':''}${takenIds.includes(c.id)?' taken':''}`} onClick={() => setSelCard(c.id)}>
            <span className="card-em">{c.emoji}</span>
            <div className="card-name">{c.name}</div>
            <div className="card-desc">{c.desc}</div>
          </div>
        ))}
      </div>
      <div className="bgroup">
        <button className="btn btn-p" disabled={!selCard} onClick={() => submitProposal(cardType)}>Proposer cette carte</button>
      </div>
    </>
  );
}

// ── RunoffView ────────────────────────────────────────────
function RunoffView({ gs, receiver, me, cardType, selRunoff, setSelRunoff, submitRunoff }) {
  const isAnimal = cardType === 'animal';
  const proposals = (isAnimal ? gs[receiver].animalVotes : gs[receiver].qualityVotes) || {};
  const runoffVotes = (isAnimal ? gs[receiver].animalRunoffVotes : gs[receiver].qualityRunoffVotes) || {};
  const others = PLAYERS.filter(p => p !== receiver);
  const voted = Object.keys(runoffVotes);
  const remaining = others.filter(p => !voted.includes(p));
  const takenIds = getTakenIds(gs, cardType, receiver);
  const candidateIds = [...new Set(Object.values(proposals))];
  const candidates = candidateIds.map(id => ({
    card: getCard(id),
    proposedBy: Object.entries(proposals).filter(([,v])=>v===id).map(([k])=>k),
    runoffCount: Object.values(runoffVotes).filter(v=>v===id).length,
    taken: takenIds.includes(id),
  })).sort((a,b) => b.runoffCount-a.runoffCount);

  const myRunoffVote = runoffVotes[me];
  if (myRunoffVote) {
    const c = getCard(myRunoffVote);
    return (
      <>
        <Stepper phase={`${cardType}-runoff`} />
        <div className="receiver-banner"><h2>Vote final pour {receiver}</h2><p>Étape 2 · {isAnimal?'Animal 🐾':'Qualité ✨'}</p></div>
        <div className="spanel" style={{ borderColor:'rgba(200,150,10,.4)' }}>✅ Voté pour : <strong>{c.emoji} {c.name}</strong></div>
        <div className="spanel"><strong>{voted.length}/{others.length}</strong> votes<div className="pbar"><div className="pfill" style={{ width:`${voted.length/others.length*100}%` }} /></div>{remaining.length > 0 ? <span>En attente : {remaining.join(', ')}</span> : <span className="gold">Résultat en cours… 🌿</span>}</div>
        <div className="wait"><div className="wi">⏳</div><h3>Vote enregistré !</h3><p>En attente des autres joueuses…</p></div>
      </>
    );
  }

  return (
    <>
      <Stepper phase={`${cardType}-runoff`} />
      <div className="receiver-banner">
        <h2>Vote final pour {receiver}</h2>
        <p>Quelle est LA {isAnimal?'force animale dominante':'qualité dominante'} de {receiver} ?</p>
      </div>
      <div className="spanel"><strong>{voted.length}/{others.length}</strong> votes<div className="pbar"><div className="pfill" style={{ width:`${voted.length/others.length*100}%` }} /></div></div>
      <div className="stitle">Les cartes proposées</div>
      <div className="candidates">
        {candidates.map(({card:c, proposedBy, runoffCount, taken}) => (
          <div key={c.id} className={`cand${selRunoff===c.id?' sel':''}${taken?' taken':''}`} onClick={() => !taken && setSelRunoff(c.id)}>
            <span className="cand-em">{c.emoji}</span>
            <div className="cand-name">{c.name}</div>
            <div className="cand-desc">{c.desc}</div>
            <div><span className="cand-badge">par {proposedBy.join(', ')}</span></div>
            {runoffCount > 0 && <div><span className={`cand-badge${runoffCount>=2?' top':''}`}>{runoffCount} vote{runoffCount>1?'s':''}</span></div>}
            {taken && <div><span className="cand-badge red">déjà attribué</span></div>}
          </div>
        ))}
      </div>
      <div className="bgroup">
        <button className="btn btn-p" disabled={!selRunoff} onClick={() => submitRunoff(cardType)}>Voter pour cette carte</button>
      </div>
    </>
  );
}

// ── FinalTotem ────────────────────────────────────────────
function FinalTotem({ gs, name, goBack }) {
  const a = getCard(gs[name].animalWinner), q = getCard(gs[name].qualityWinner);
  return (
    <>
      <div className="final-wrap">
        <h2>🌿 Totem de {name} 🌿</h2>
        <div className="tparts">
          <div className="tpart"><div className="pe">{a.emoji}</div><div className="pl">Force · Animal</div><div className="pn">{a.name}</div><div className="pd">{a.desc}</div></div>
          <div className="tpart"><div className="pe">{q.emoji}</div><div className="pl">Qualité</div><div className="pn">{q.name}</div><div className="pd">{q.desc}</div></div>
        </div>
      </div>
      <p style={{ textAlign:'center',color:'var(--mist)',fontStyle:'italic',marginBottom:'2rem',fontSize:'.9rem' }}>
        « {a.name} {q.name.toLowerCase()} » — voilà qui vous êtes aux yeux de vos amies 💛
      </p>
      <div className="bgroup" style={{ justifyContent:'center' }}>
        <button className="btn btn-g" onClick={goBack}>← Retour</button>
      </div>
    </>
  );
}

function Bg() {
  return (
    <div className="bg">
      <div className="bg-c" style={{ width:600,height:600,top:'-200px',left:'-150px','--c':'rgba(62,92,40,.15)' }} />
      <div className="bg-c" style={{ width:400,height:400,bottom:'-100px',right:'-100px','--c':'rgba(46,32,14,.25)' }} />
      <div className="bg-c" style={{ width:300,height:300,top:'40%',right:'10%','--c':'rgba(200,150,10,.05)' }} />
    </div>
  );
}

function Toast({ t }) {
  return <div className={`toast${t.on?' on':''}`}>{t.msg}</div>;
}
