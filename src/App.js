import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "./firebase";
import { ref, onValue, set } from "firebase/database";

// ── Joueurs ───────────────────────────────────────────────
const PLAYERS = ['Anne','Melaine','Adèle'];

// ── 64 Animaux ────────────────────────────────────────────
const ANIMAL_CARDS = [
  { id:'a1',  emoji:'🦁', name:'Lion',          desc:"Tu inspires confiance et dégages une autorité naturelle." },
  { id:'a2',  emoji:'🦅', name:'Aigle',         desc:"Tu vois loin et perçois ce que les autres ne voient pas." },
  { id:'a3',  emoji:'🐬', name:'Dauphin',       desc:"Tu crées des liens facilement et mets les autres à l'aise." },
  { id:'a4',  emoji:'🐺', name:'Loup',          desc:"Tu es loyal·e et tu protèges ceux qui te sont chers." },
  { id:'a5',  emoji:'🦊', name:'Renard',        desc:"Tu trouves toujours une solution créative." },
  { id:'a6',  emoji:'🐘', name:'Éléphant',      desc:"Ta mémoire et ta sagesse sont des cadeaux précieux." },
  { id:'a7',  emoji:'🦋', name:'Papillon',      desc:"Tu sais te transformer et t'adapter avec grâce." },
  { id:'a8',  emoji:'🦉', name:'Hibou',         desc:"Tu es attentif·ve et tu perçois les détails importants." },
  { id:'a9',  emoji:'🐻', name:'Ours',          desc:"Tu es solide, rassurant·e et tu sais quand te battre." },
  { id:'a10', emoji:'🦒', name:'Girafe',        desc:"Tu vois les choses avec recul et perspicacité." },
  { id:'a11', emoji:'🐆', name:'Léopard',       desc:"Tu agis avec précision et efficacité quand il le faut." },
  { id:'a12', emoji:'🦚', name:'Paon',          desc:"Tu exprimes ta créativité avec fierté et originalité." },
  { id:'a13', emoji:'🦓', name:'Zèbre',         desc:"Tu t'assumes pleinement, unique et sans compromis." },
  { id:'a14', emoji:'🦦', name:'Loutre',        desc:"Tu apportes joie et légèreté partout où tu passes." },
  { id:'a15', emoji:'🐳', name:'Baleine',       desc:"Tu portes une grande sagesse intérieure et une profondeur rare." },
  { id:'a16', emoji:'🦈', name:'Requin',        desc:"Tu avances avec détermination sans jamais te décourager." },
  { id:'a17', emoji:'🦜', name:'Perroquet',     desc:"Tu sais mettre les mots justes sur les choses importantes." },
  { id:'a18', emoji:'🐝', name:'Abeille',       desc:"Tu travailles avec soin et tu contribues au collectif." },
  { id:'a19', emoji:'🐋', name:'Orque',         desc:"Tu fédères et tu emmènes les autres avec toi naturellement." },
  { id:'a20', emoji:'🦩', name:'Flamant rose',  desc:"Tu marques les esprits et tu oses te démarquer." },
  { id:'a21', emoji:'🦌', name:'Cerf',          desc:"Tu portes une élégance naturelle qui inspire le respect." },
  { id:'a22', emoji:'🐅', name:'Tigre',         desc:"Tu combines force et grâce avec une intensité rare." },
  { id:'a23', emoji:'🦁', name:'Lionne',        desc:"Tu protèges les tiens avec une énergie farouche et douce." },
  { id:'a24', emoji:'🦜', name:'Ara',           desc:"Ta présence colorée et vivante illumine chaque pièce." },
  { id:'a25', emoji:'🐊', name:'Crocodile',     desc:"Tu sais quand agir et quand observer, avec une patience redoutable." },
  { id:'a26', emoji:'🦏', name:'Rhinocéros',    desc:"Tu vas droit au but, avec une force tranquille et assurée." },
  { id:'a27', emoji:'🦛', name:'Hippopotame',   desc:"Sous une apparence calme, tu caches une force impressionnante." },
  { id:'a28', emoji:'🐧', name:'Manchot',       desc:"Tu t'adaptes aux conditions les plus difficiles avec sérénité." },
  { id:'a29', emoji:'🦢', name:'Cygne',         desc:"Tu mènes chaque chose avec grâce et une beauté naturelle." },
  { id:'a30', emoji:'🦅', name:'Faucon',        desc:"Tu te concentres sur l'essentiel et fonces avec précision." },
  { id:'a31', emoji:'🐺', name:'Renarde',       desc:"Tu combines intuition et intelligence dans chaque situation." },
  { id:'a32', emoji:'🦎', name:'Caméléon',      desc:"Tu t'adaptes à tout et trouves toujours ta place." },
  { id:'a33', emoji:'🐢', name:'Tortue',        desc:"Tu avances à ton rythme, mais tu arrives toujours à destination." },
  { id:'a34', emoji:'🦋', name:'Monarque',      desc:"Ta transformation personnelle est une source d'inspiration." },
  { id:'a35', emoji:'🐦', name:'Mésange',       desc:"Ta joie de vivre légère et chantante réchauffe les cœurs." },
  { id:'a36', emoji:'🦅', name:'Vautour',       desc:"Tu sais transformer les difficultés en ressources précieuses." },
  { id:'a37', emoji:'🐘', name:'Éléphante',     desc:"Tu n'oublies jamais ceux qui comptent pour toi." },
  { id:'a38', emoji:'🦒', name:'Okapi',         desc:"Tu es rare, unique, et précieux·se à qui sait te voir." },
  { id:'a39', emoji:'🐬', name:'Orque',         desc:"Tu combines intelligence, force et profonde loyauté." },
  { id:'a40', emoji:'🦁', name:'Panthère',      desc:"Tu agis dans l'ombre avec efficacité et élégance." },
  { id:'a41', emoji:'🐦', name:'Colibri',       desc:"Tu apportes une énergie intense dans des petits gestes qui comptent." },
  { id:'a42', emoji:'🦭', name:'Phoque',        desc:"Tu sais jouer et être sérieux·se selon ce que le moment demande." },
  { id:'a43', emoji:'🐻', name:'Panda',         desc:"Ta douceur paisible inspire la sécurité chez les autres." },
  { id:'a44', emoji:'🦊', name:'Fennec',        desc:"Tes grandes oreilles captent ce que les autres manquent." },
  { id:'a45', emoji:'🐆', name:'Guépard',       desc:"Quand tu décides, rien ne peut t'arrêter." },
  { id:'a46', emoji:'🦩', name:'Cigogne',       desc:"Tu portes les autres vers de nouveaux départs." },
  { id:'a47', emoji:'🦟', name:'Libellule',     desc:"Tu incarnes le changement et la légèreté de l'instant présent." },
  { id:'a48', emoji:'🐘', name:'Mammouth',      desc:"Ton impact durable est une force que le temps ne peut effacer." },
  { id:'a49', emoji:'🦈', name:'Dauphin bleu',  desc:"Ta vivacité d'esprit ouvre des chemins que personne n'avait vus." },
  { id:'a50', emoji:'🐺', name:'Husky',         desc:"Tu guides avec endurance et une loyauté sans faille." },
  { id:'a51', emoji:'🦅', name:'Condor',        desc:"Tu embrasses les grands espaces avec une vision panoramique." },
  { id:'a52', emoji:'🐸', name:'Grenouille',    desc:"Tu t'épanouis partout, entre deux mondes, avec aisance." },
  { id:'a53', emoji:'🦋', name:'Sphinx',        desc:"Ta beauté nocturne et discrète cache une grande force." },
  { id:'a54', emoji:'🐻', name:'Grizzly',       desc:"Tu défends ce qui te tient à cœur avec une intensité totale." },
  { id:'a55', emoji:'🦒', name:'Bison',         desc:"Tu portes une résistance tranquille face aux tempêtes." },
  { id:'a56', emoji:'🐬', name:'Narval',        desc:"Tu es singulier·ière et magique, avec une pointe d'incroyable." },
  { id:'a57', emoji:'🦩', name:'Héron',         desc:"Tu sais attendre le bon moment avec une patience admirable." },
  { id:'a58', emoji:'🐺', name:'Dingo',         desc:"Tu trouves toujours ton chemin, même en terrain inconnu." },
  { id:'a59', emoji:'🦭', name:'Morse',         desc:"Tu imposes ta présence avec calme et une sagesse profonde." },
  { id:'a60', emoji:'🐦', name:'Perruche',      desc:"Ta communication joyeuse crée des liens sincères." },
  { id:'a61', emoji:'🦊', name:'Coyote',        desc:"Ton esprit vif et malicieux trouve toujours une issue." },
  { id:'a62', emoji:'🐅', name:'Jaguar',        desc:"Tu combines mystère et puissance dans tout ce que tu fais." },
  { id:'a63', emoji:'🦢', name:'Albatros',      desc:"Tu portes de longues traversées avec grâce et endurance." },
  { id:'a64', emoji:'🐝', name:'Frelon',        desc:"Quand tu t'engages, tu le fais avec toute ton intensité." },
];

// ── 64 Qualités ───────────────────────────────────────────
const QUALITY_CARDS = [
  { id:'q1',  emoji:'💛', name:'Attentionné·e',    desc:"Tu remarques les besoins des autres et y réponds avec soin." },
  { id:'q2',  emoji:'✨', name:'Créatif·ve',        desc:"Ton esprit trouve sans cesse de nouvelles perspectives." },
  { id:'q3',  emoji:'🌊', name:'Calme',             desc:"Tu gardes ton équilibre même dans les tempêtes." },
  { id:'q4',  emoji:'🔥', name:'Passionné·e',       desc:"Ton enthousiasme est communicatif et inspirant." },
  { id:'q5',  emoji:'🤝', name:'Généreux·se',       desc:"Tu donnes sans compter ton temps et ton énergie." },
  { id:'q6',  emoji:'💡', name:'Curieux·se',        desc:"Tu cherches toujours à comprendre et à apprendre." },
  { id:'q7',  emoji:'🌟', name:'Courageux·se',      desc:"Tu fonces même quand c'est difficile." },
  { id:'q8',  emoji:'🎯', name:'Déterminé·e',       desc:"Tu vas jusqu'au bout de ce que tu entreprends." },
  { id:'q9',  emoji:'🌺', name:'Bienveillant·e',    desc:"Tu enveloppes les autres de chaleur et de douceur." },
  { id:'q10', emoji:'🧠', name:'Intuitif·ve',       desc:"Tu sens les choses avant même qu'elles soient dites." },
  { id:'q11', emoji:'😄', name:'Joyeux·se',         desc:"Ton rire et ta bonne humeur illuminent le groupe." },
  { id:'q12', emoji:'🛡️', name:'Fiable',             desc:"On peut compter sur toi, toujours, sans exception." },
  { id:'q13', emoji:'🌈', name:'Optimiste',         desc:"Tu vois le bon côté des choses et tu redonnes espoir." },
  { id:'q14', emoji:'🌱', name:'Patient·e',         desc:"Tu prends le temps qu'il faut, sans précipitation." },
  { id:'q15', emoji:'💬', name:'Sincère',           desc:"Tu parles avec honnêteté et tes mots ont du poids." },
  { id:'q16', emoji:'🎨', name:'Sensible',          desc:"Tu ressens les émotions avec finesse et profondeur." },
  { id:'q17', emoji:'⚡', name:'Énergique',         desc:"Tu entraînes les autres avec ton dynamisme." },
  { id:'q18', emoji:'🤗', name:'Empathique',        desc:"Tu comprends et accueilles les émotions des autres." },
  { id:'q19', emoji:'🏔️', name:'Résilient·e',       desc:"Tu te relèves toujours, encore plus fort·e." },
  { id:'q20', emoji:'🎵', name:'Spontané·e',        desc:"Tu vis dans l'instant et oses exprimer ce que tu ressens." },
  { id:'q21', emoji:'🌿', name:'Ancré·e',           desc:"Tu restes toi-même quelles que soient les circonstances." },
  { id:'q22', emoji:'🎤', name:'Expressif·ve',      desc:"Tu donnes vie à tes idées avec une énergie communicative." },
  { id:'q23', emoji:'🔍', name:'Observateur·trice', desc:"Tu remarques les détails qui échappent aux autres." },
  { id:'q24', emoji:'💪', name:'Tenace',            desc:"Tu ne lâches jamais, même face à l'adversité." },
  { id:'q25', emoji:'🌙', name:'Mystérieux·se',     desc:"Tu attires par ce que tu ne dis pas autant que par ce que tu dis." },
  { id:'q26', emoji:'🎁', name:'Générateur·trice',  desc:"Tu crées de la valeur pour les autres sans t'en rendre compte." },
  { id:'q27', emoji:'🤲', name:'Humble',            desc:"Ta grandeur s'exprime sans jamais écraser les autres." },
  { id:'q28', emoji:'🌍', name:'Ouvert·e',          desc:"Tu accueilles la différence avec une curiosité sincère." },
  { id:'q29', emoji:'⚖️', name:'Juste',             desc:"Tu traites chaque personne avec équité et respect." },
  { id:'q30', emoji:'🧘', name:'Serein·e',          desc:"Ta paix intérieure rayonne et apaise ceux qui t'entourent." },
  { id:'q31', emoji:'🔆', name:'Lumineux·se',       desc:"Ta présence éclaire les moments difficiles." },
  { id:'q32', emoji:'🎯', name:'Focalisé·e',        desc:"Tu sais exactement où tu vas et comment y arriver." },
  { id:'q33', emoji:'🌸', name:'Doux·ce',           desc:"Ta douceur est une force que peu de gens possèdent vraiment." },
  { id:'q34', emoji:'🦋', name:'Libre',             desc:"Tu inspires les autres à s'affranchir de leurs limites." },
  { id:'q35', emoji:'🔑', name:'Clairvoyant·e',     desc:"Tu vois la solution là où les autres voient un problème." },
  { id:'q36', emoji:'💎', name:'Authentique',       desc:"Ce que tu montres est ce que tu es, sans filtre ni masque." },
  { id:'q37', emoji:'🌊', name:'Fluide',            desc:"Tu t'adaptes avec souplesse sans perdre ton essence." },
  { id:'q38', emoji:'🏹', name:'Précis·e',          desc:"Tu vas à l'essentiel avec une efficacité remarquable." },
  { id:'q39', emoji:'🌻', name:'Rayonnant·e',       desc:"Ton énergie positive se propage naturellement autour de toi." },
  { id:'q40', emoji:'🔮', name:'Visionnaire',       desc:"Tu perçois des possibilités que les autres n'imaginent pas encore." },
  { id:'q41', emoji:'🌺', name:'Chaleureux·se',     desc:"Tu crées une atmosphère où chacun se sent le bienvenu." },
  { id:'q42', emoji:'💫', name:'Inspirant·e',       desc:"Tu donnes aux autres l'envie de donner le meilleur d'eux-mêmes." },
  { id:'q43', emoji:'🤺', name:'Audacieux·se',      desc:"Tu oses là où les autres hésitent encore." },
  { id:'q44', emoji:'🌱', name:'Nourrissant·e',     desc:"Tu fais grandir les personnes qui t'entourent." },
  { id:'q45', emoji:'🧩', name:'Ingénieux·se',      desc:"Tu assembles les pièces que personne d'autre ne voyait ensemble." },
  { id:'q46', emoji:'💌', name:'Affectueux·se',     desc:"Tu exprimes ton amour des autres de mille façons sincères." },
  { id:'q47', emoji:'🌿', name:'Équilibré·e',       desc:"Tu trouves l'harmonie entre les différentes dimensions de ta vie." },
  { id:'q48', emoji:'🔭', name:"Curieux·se d'avenir", desc:"Tu anticipes et prépares avec enthousiasme ce qui vient." },
  { id:'q49', emoji:'🛤️', name:'Guide',             desc:"Tu montres le chemin sans imposer ta direction." },
  { id:'q50', emoji:'🌊', name:'Profond·e',         desc:"Tes réflexions touchent des vérités que peu osent explorer." },
  { id:'q51', emoji:'🎶', name:'Harmonieux·se',     desc:"Tu crées de la cohésion là où règne la discorde." },
  { id:'q52', emoji:'🦅', name:'Ambitieux·se',      desc:"Tu vises haut et emmènes les autres dans ton élan." },
  { id:'q53', emoji:'🌸', name:'Délicat·e',         desc:"Tu sais aborder les sujets sensibles avec une touche rare." },
  { id:'q54', emoji:'💡', name:'Innovant·e',        desc:"Tu remets en question l'évident pour trouver mieux." },
  { id:'q55', emoji:'🤲', name:'Solidaire',         desc:"Tu ne laisses jamais quelqu'un derrière toi." },
  { id:'q56', emoji:'🔥', name:'Engagé·e',          desc:"Quand tu crois en quelque chose, tu t'y donnes entièrement." },
  { id:'q57', emoji:'🌍', name:'Altruiste',         desc:"Le bien des autres guide naturellement tes choix." },
  { id:'q58', emoji:'✨', name:'Pétillant·e',       desc:"Ta vivacité et ton esprit font briller les conversations." },
  { id:'q59', emoji:'🏡', name:'Rassurant·e',       desc:"Quand tu es là, les gens se sentent en sécurité." },
  { id:'q60', emoji:'🌱', name:'Évolutif·ve',       desc:"Tu grandis continuellement et entraînes les autres dans ce mouvement." },
  { id:'q61', emoji:'🦁', name:'Protecteur·trice',  desc:"Tu veilles sur ceux que tu aimes avec une force discrète." },
  { id:'q62', emoji:'🎨', name:'Poétique',          desc:"Tu trouves la beauté dans ce que les autres considèrent ordinaire." },
  { id:'q63', emoji:'⚡', name:'Réactif·ve',        desc:"Tu réponds vite et bien quand la situation l'exige." },
  { id:'q64', emoji:'🌺', name:'Magnétique',        desc:"Les gens sont naturellement attirés par ton énergie." },
];

// ── Helpers ───────────────────────────────────────────────
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

function getHandFor(receiverName, voterName, cardType, excludedIds = []) {
  const pool = cardType === 'animal' ? ANIMAL_CARDS : QUALITY_CARDS;
  const available = pool.filter(c => !excludedIds.includes(c.id));
  const shuffled = deterministicShuffle(available, receiverName + voterName + cardType);
  return shuffled.slice(0, 7);
}

// Cartes déjà attribuées en final à d'autres joueuses
function getGlobalTakenIds(gameState, cardType, excludeReceiver) {
  return PLAYERS
    .filter(p => p !== excludeReceiver)
    .map(p => cardType === 'animal' ? gameState[p]?.animalWinner : gameState[p]?.qualityWinner)
    .filter(Boolean);
}

// Cartes déjà proposées par d'AUTRES voteurs pour cette receveure
function getAlreadyProposedIds(gameState, receiverName, voterName, cardType) {
  const votes = realVotes(cardType === 'animal'
    ? gameState[receiverName]?.animalVotes
    : gameState[receiverName]?.qualityVotes);
  return Object.entries(votes)
    .filter(([voter]) => voter !== voterName)
    .map(([, cardId]) => cardId);
}

function initGameState() {
  const s = {};
  PLAYERS.forEach(p => {
    // On utilise null pour les champs vides: Firebase ne supprime pas un noeud
    // dont les champs ont des valeurs explicites (même null).
    s[p] = {
      animalVotes: { _init: true }, animalRunoffVotes: { _init: true }, animalWinner: null,
      qualityVotes: { _init: true }, qualityRunoffVotes: { _init: true }, qualityWinner: null,
    };
  });
  return s;
}

// Phase globale d'une receveure
function realVotes(votesObj) {
  if (!votesObj) return {};
  const { _init, ...real } = votesObj;
  return real;
}

function getPhaseFor(ps) {
  if (!ps) return 'animal-propose';
  const voters = PLAYERS.length - 1;
  if (ps.qualityWinner) return 'done';
  if (ps.animalWinner) return Object.keys(realVotes(ps.qualityVotes)).length >= voters ? 'quality-runoff' : 'quality-propose';
  return Object.keys(realVotes(ps.animalVotes)).length >= voters ? 'animal-runoff' : 'animal-propose';
}

// Ce qu'il reste à faire pour un voteur sur une receveure donnée
function getPendingActionsFor(gs, me, receiver) {
  if (me === receiver) return [];
  const ps = gs[receiver];
  if (!ps) return ['animal-propose'];
  const phase = getPhaseFor(ps);
  if (phase === 'done') return [];
  if (phase === 'animal-propose') return realVotes(ps.animalVotes)[me] ? [] : ['animal-propose'];
  if (phase === 'animal-runoff') return realVotes(ps.animalRunoffVotes)[me] ? [] : ['animal-runoff'];
  if (phase === 'quality-propose') return realVotes(ps.qualityVotes)[me] ? [] : ['quality-propose'];
  if (phase === 'quality-runoff') return realVotes(ps.qualityRunoffVotes)[me] ? [] : ['quality-runoff'];
  return [];
}

// ── CSS ───────────────────────────────────────────────────
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
.dashboard{padding:1.4rem;max-width:600px;margin:0 auto;}
.welcome-banner{background:linear-gradient(135deg,rgba(62,92,40,.5),rgba(46,32,14,.6));border:1px solid rgba(200,150,10,.3);border-radius:18px;padding:1.2rem 1.6rem;margin-bottom:1.8rem;text-align:center;}
.welcome-banner h2{font-family:'Cormorant Garamond',serif;font-size:1.6rem;font-weight:700;color:var(--amber);}
.welcome-banner p{color:var(--mist);font-size:.85rem;margin-top:.3rem;}
.vote-list{display:flex;flex-direction:column;gap:.7rem;margin-bottom:1.5rem;}
.vote-row{background:rgba(62,92,40,.2);border:1.5px solid rgba(90,128,64,.2);border-radius:14px;padding:.9rem 1.1rem;display:flex;align-items:center;justify-content:space-between;transition:all .2s;}
.vote-row.clickable{cursor:pointer;}
.vote-row.clickable:hover{border-color:rgba(200,150,10,.4);transform:translateX(4px);}
.vote-row.todo{border-color:rgba(200,150,10,.3);}
.vote-row.voted{opacity:.65;}
.vote-row.done-r{opacity:.4;}
.vote-row.runoff{border-color:rgba(160,100,220,.5);background:rgba(120,60,200,.1);}
.vote-row.runoff:hover{border-color:rgba(180,120,240,.7);transform:translateX(4px);}
.status-runoff{background:rgba(140,80,220,.15);border:1px solid rgba(160,100,220,.5);color:rgba(200,160,255,1);}
.vote-row-name{font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:600;color:var(--cream);}
.vote-row-status{font-size:.72rem;padding:.25rem .7rem;border-radius:20px;white-space:nowrap;}
.status-todo{background:rgba(200,150,10,.15);border:1px solid rgba(200,150,10,.4);color:var(--amber);}
.status-voted{background:rgba(62,92,40,.3);border:1px solid rgba(90,128,64,.4);color:var(--sage);}
.status-done{background:rgba(62,92,40,.15);border:1px solid rgba(90,128,64,.2);color:var(--mist);}
.my-totem-btn{background:linear-gradient(135deg,rgba(200,150,10,.15),rgba(62,92,40,.3));border:1.5px solid rgba(200,150,10,.4);border-radius:14px;padding:1rem 1.4rem;width:100%;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:1rem;}
.my-totem-btn:hover{border-color:var(--amber);transform:translateY(-2px);}
.my-totem-btn-label{font-size:.7rem;color:var(--sage);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.2rem;}
.my-totem-btn-name{font-family:'Cormorant Garamond',serif;font-size:1.2rem;color:var(--amber);font-weight:700;}
.game-header{position:sticky;top:0;z-index:50;background:rgba(28,26,20,.92);backdrop-filter:blur(12px);border-bottom:1px solid rgba(90,128,64,.2);display:flex;align-items:center;justify-content:space-between;padding:.9rem 1.4rem;gap:.8rem;}
.header-back{background:none;border:1px solid rgba(90,128,64,.35);color:var(--sage);padding:.35rem .9rem;border-radius:20px;cursor:pointer;font-size:.8rem;transition:all .2s;white-space:nowrap;}
.header-back:hover{border-color:var(--amber);color:var(--amber);}
.header-title{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:700;color:var(--amber);flex:1;text-align:center;}
.sync-dot{width:8px;height:8px;border-radius:50%;background:var(--sage);animation:pulse 2s ease-in-out infinite;flex-shrink:0;}
.sync-dot.busy{background:var(--amber);}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
.game-body{padding:1.4rem;max-width:900px;margin:0 auto;}
.receiver-banner{background:linear-gradient(135deg,rgba(62,92,40,.5),rgba(46,32,14,.6));border:1px solid rgba(200,150,10,.3);border-radius:18px;padding:1.4rem 1.6rem;margin-bottom:1.8rem;text-align:center;}
.receiver-banner h2{font-family:'Cormorant Garamond',serif;font-size:1.8rem;font-weight:700;color:var(--amber);}
.receiver-banner p{color:var(--mist);font-size:.85rem;margin-top:.3rem;}
.stitle{font-family:'Cormorant Garamond',serif;font-size:1.05rem;font-weight:600;color:var(--sage);display:flex;align-items:center;gap:.7rem;margin-bottom:1rem;margin-top:1.5rem;}
.stitle:first-of-type{margin-top:0;}
.stitle::after{content:'';flex:1;height:1px;background:linear-gradient(to right,rgba(90,128,64,.4),transparent);}
.pbar{background:rgba(90,128,64,.15);border-radius:20px;height:5px;margin:.6rem 0;overflow:hidden;}
.pfill{height:100%;background:linear-gradient(to right,var(--moss),var(--amber));border-radius:20px;transition:width .6s ease;}
.spanel{background:rgba(28,26,20,.5);border:1px solid rgba(90,128,64,.2);border-radius:12px;padding:.9rem 1.1rem;margin-bottom:1.4rem;font-size:.8rem;color:var(--mist);line-height:1.8;}
.spanel strong{color:var(--sage);}
.spanel .gold{color:var(--amber);}
.cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:.65rem;margin-bottom:1rem;}
.card{background:rgba(62,92,40,.22);border:1.5px solid rgba(90,128,64,.22);border-radius:12px;padding:.8rem .6rem;cursor:pointer;transition:all .2s;text-align:center;position:relative;}
.card:hover{border-color:rgba(200,150,10,.45);background:rgba(62,92,40,.4);transform:translateY(-2px);}
.card.sel{border-color:var(--amber);background:rgba(200,150,10,.12);box-shadow:0 0 14px rgba(200,150,10,.2);}
.card.sel::after{content:'✓';position:absolute;top:5px;right:8px;color:var(--amber);font-size:.75rem;font-weight:700;}
.card-em{font-size:1.7rem;margin-bottom:.35rem;display:block;}
.card-name{font-family:'Cormorant Garamond',serif;font-size:.85rem;font-weight:600;color:var(--cream);margin-bottom:.2rem;}
.card-desc{font-size:.62rem;color:var(--mist);line-height:1.4;}
.candidates{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:.8rem;margin-bottom:1.5rem;}
.cand{background:rgba(62,92,40,.25);border:1.5px solid rgba(90,128,64,.25);border-radius:14px;padding:1rem .8rem;cursor:pointer;transition:all .2s;text-align:center;position:relative;}
.cand:hover{border-color:rgba(200,150,10,.5);transform:translateY(-2px);}
.cand.sel{border-color:var(--amber);background:rgba(200,150,10,.13);box-shadow:0 0 16px rgba(200,150,10,.2);}
.cand.sel::after{content:'✓';position:absolute;top:6px;right:9px;color:var(--amber);font-size:.8rem;font-weight:700;}
.cand.taken{opacity:.3;pointer-events:none;}
.cand-em{font-size:2rem;margin-bottom:.4rem;display:block;}
.cand-name{font-family:'Cormorant Garamond',serif;font-size:.95rem;font-weight:700;color:var(--cream);margin-bottom:.2rem;}
.cand-desc{font-size:.62rem;color:var(--mist);line-height:1.4;}
.cand-badge{display:inline-block;background:rgba(90,128,64,.25);border:1px solid rgba(90,128,64,.4);border-radius:20px;padding:.05rem .5rem;font-size:.63rem;color:var(--sage);margin-top:.3rem;margin-right:.2rem;}
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
.phase-badge{display:inline-flex;align-items:center;gap:.4rem;background:rgba(200,150,10,.12);border:1px solid rgba(200,150,10,.3);border-radius:20px;padding:.3rem .9rem;font-size:.72rem;color:var(--amber);margin-bottom:1.2rem;}
.divider{border:none;border-top:1px solid rgba(90,128,64,.2);margin:1.5rem 0;}
@media(max-width:500px){
  .players-grid{grid-template-columns:repeat(2,1fr);}
  .cards-grid{grid-template-columns:repeat(2,1fr);}
  .candidates{grid-template-columns:repeat(2,1fr);}
  .tparts{flex-direction:column;align-items:center;}
}
`;

// ── App ───────────────────────────────────────────────────
export default function App() {
  const [gs, setGs] = useState(null);
  const [me, setMe] = useState(null);
  const [nav, setNav] = useState({ view: 'login', target: null });
  const view = nav.view;
  const voteTarget = nav.target;
  const setView = (v) => setNav(n => ({ ...n, view: v }));
  const navigate = (view, target = null) => setNav({ view, target });
  const [selAnimal, setSelAnimal] = useState(null);
  const [selQuality, setSelQuality] = useState(null);
  const [selRunoff, setSelRunoff] = useState(null);
  const [toast, setToast] = useState({ msg:'', on:false });
  const [busy, setBusy] = useState(false);
  const toastRef = useRef(null);

  // Firebase listener
  useEffect(() => {
    const gameRef = ref(db, 'gameState');
    const unsub = onValue(gameRef, snap => {
      const data = snap.val();
      if (data) setGs(data);
      else { const i = initGameState(); set(gameRef, i); setGs(i); }
    });
    return () => unsub();
  }, []);

  // Reset selections on navigation
  useEffect(() => {
    setSelAnimal(null); setSelQuality(null); setSelRunoff(null);
  }, [view, voteTarget]);

  const showToast = useCallback((msg) => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ msg, on:true });
    toastRef.current = setTimeout(() => setToast(t => ({...t, on:false})), 2800);
  }, []);

  const saveState = useCallback(async (next) => {
    setBusy(true);
    try { await set(ref(db, 'gameState'), next); }
    catch { showToast('Erreur réseau ⚠️'); }
    finally { setBusy(false); }
  }, [showToast]);

  const resolveRunoffIfReady = (state, receiver, cardType) => {
    const ps = state[receiver];
    const voters = PLAYERS.length - 1;
    const rv = realVotes(cardType === 'animal' ? ps.animalRunoffVotes : ps.qualityRunoffVotes);
    if (Object.keys(rv).length < voters) return state;
    const counts = {};
    Object.values(rv).forEach(cid => { counts[cid] = (counts[cid]||0)+1; });
    const takenIds = getGlobalTakenIds(state, cardType, receiver);
    const eligible = Object.entries(counts).filter(([cid]) => !takenIds.includes(cid));
    const pool = eligible.length > 0 ? eligible : Object.entries(counts);
    pool.sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]));
    const next = { ...state, [receiver]: { ...ps } };
    if (cardType === 'animal') next[receiver].animalWinner = pool[0][0];
    else next[receiver].qualityWinner = pool[0][0];
    return next;
  };

  // Soumettre animal + qualité en une seule fois (phase propose)
  const submitBothProposals = async (receiver) => {
    if (!selAnimal || !selQuality || !gs) return;
    const next = JSON.parse(JSON.stringify(gs));
    next[receiver].animalVotes = { ...next[receiver].animalVotes, [me]: selAnimal };
    next[receiver].qualityVotes = { ...next[receiver].qualityVotes, [me]: selQuality };
    await saveState(next);
    showToast('Propositions enregistrées ! 🌿');
    navigate('dashboard');
  };

  // Soumettre vote final (runoff) — animal ou qualité séparément
  const submitBothRunoff = async (receiver) => {
    if (!selAnimal || !selQuality || !gs) return;
    let next = JSON.parse(JSON.stringify(gs));
    next[receiver].animalRunoffVotes = { ...next[receiver].animalRunoffVotes, [me]: selAnimal };
    next[receiver].qualityRunoffVotes = { ...next[receiver].qualityRunoffVotes, [me]: selQuality };
    next = resolveRunoffIfReady(next, receiver, 'animal');
    next = resolveRunoffIfReady(next, receiver, 'quality');
    await saveState(next);
    showToast('Vote final enregistré ! 🗳️');
    navigate('dashboard');
  };

  const resetGame = async () => {
    if (!window.confirm('Remettre la partie à zéro ?')) return;
    await saveState(initGameState());
    showToast('Partie réinitialisée 🌱');
  };

  const goToDashboard = () => { navigate('dashboard'); };

  const phaseLabel = (name) => {
    if (!gs || !gs[name]) return '';
    const ps = gs[name];
    const voters = PLAYERS.length - 1;
    if (ps.qualityWinner) return '🌿 Totem complet';
    if (ps.animalWinner) {
      const qv = Object.keys(realVotes(ps.qualityVotes)).length;
      const qrv = Object.keys(realVotes(ps.qualityRunoffVotes)).length;
      if (qv >= voters) return `Vote final ${qrv}/${voters}`;
      return `Propositions ${qv}/${voters}`;
    }
    const av = Object.keys(realVotes(ps.animalVotes)).length;
    const arv = Object.keys(realVotes(ps.animalRunoffVotes)).length;
    if (av >= voters) return `Vote final ${arv}/${voters}`;
    return `Propositions ${av}/${voters}`;
  };

  if (!gs) return (
    <>
      <style>{css}</style>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',flexDirection:'column',gap:'1rem'}}>
        <div style={{fontSize:'3rem',animation:'sway 2s ease-in-out infinite'}}>🌿</div>
        <p style={{color:'var(--sage)',fontFamily:'Cormorant Garamond,serif',fontSize:'1.2rem'}}>Connexion…</p>
        <style>{`@keyframes sway{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}`}</style>
      </div>
    </>
  );

  // ── LOGIN ────────────────────────────────────────────────
  if (view === 'login') return (
    <>
      <style>{css}</style>
      <Bg />
      <div className="screen">
        <div className="login-wrap">
          <div className="brand-icon">🌿</div>
          <div className="brand-name">TOTEM</div>
          <div className="brand-tag">Le jeu qui fait du bien</div>
          <p style={{color:'var(--mist)',fontSize:'1.05rem',maxWidth:340,lineHeight:1.9,marginBottom:'2rem',textAlign:'center'}}>
            Qui êtes-vous ?<br/>Cliquez sur votre prénom.
          </p>
          <div className="players-grid">
            {PLAYERS.map(p => (
              <button key={p} className={`player-tile${gs[p]?.qualityWinner?' done':''}`}
                onClick={() => { setMe(p); setView('dashboard'); }}>
                {p}
                <span className="tile-status">{gs[p]?.qualityWinner ? '🌿 Totem complet' : ''}</span>
              </button>
            ))}
          </div>
          <button className="link-btn" style={{marginBottom:'.8rem'}} onClick={() => setView('overview')}>🏆 Voir tous les totems</button>
          <button className="admin-btn" onClick={resetGame}>⚙ Réinitialiser la partie</button>
          <div style={{marginTop:'1.5rem',display:'flex',alignItems:'center',gap:'.5rem'}}>
            <div className={`sync-dot${busy?' busy':''}`}/>
            <span style={{fontSize:'.7rem',color:'var(--sage)'}}>Synchronisé en temps réel</span>
          </div>
        </div>
      </div>
      <Toast t={toast}/>
    </>
  );

  // ── DASHBOARD ────────────────────────────────────────────
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
            <div className={`sync-dot${busy?' busy':''}`}/>
          </div>
          <div className="dashboard">
            {/* Mon totem */}
            <div className="my-totem-btn" onClick={() => setView('mytotem')}>
              <div className="my-totem-btn-label">Mon Totem</div>
              {gs[me]?.qualityWinner
                ? <div className="my-totem-btn-name">{getCard(gs[me].animalWinner)?.emoji} {getCard(gs[me].animalWinner)?.name} · {getCard(gs[me].qualityWinner)?.emoji} {getCard(gs[me].qualityWinner)?.name}</div>
                : <div className="my-totem-btn-name" style={{color:'var(--mist)',fontSize:'1rem'}}>En cours de construction… 👀</div>
              }
            </div>

            <div className="stitle" style={{marginTop:0}}>Voter pour mes amies</div>
            <div className="vote-list">
              {others.map(p => {
                const pending = getPendingActionsFor(gs, me, p);
                const phase = getPhaseFor(gs[p]);
                const isDone = phase === 'done';
                const isRunoff = phase === 'animal-runoff' || phase === 'quality-runoff';
                const hasPending = pending.length > 0;
                const isClickable = hasPending;
                return (
                  <div key={p}
                    className={`vote-row${hasPending?(isRunoff?' runoff clickable':' todo clickable'):''}${!hasPending&&!isDone?' voted':''}${isDone?' done-r':''}`}
                    onClick={() => { if (isClickable) { navigate('vote', p); } }}>
                    <div>
                      <div className="vote-row-name">{p}</div>
                      <div style={{fontSize:'.7rem',color:'var(--mist)',marginTop:'.15rem'}}>{phaseLabel(p)}</div>
                    </div>
                    <span className={`vote-row-status${hasPending?(isRunoff?' status-runoff':' status-todo'):isDone?' status-done':' status-voted'}`}>
                      {isDone ? '🌿 Complet' : isRunoff && hasPending ? '🗳️ Vote final' : hasPending ? '→ Voter' : '✓ Voté'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="bgroup" style={{justifyContent:'center'}}>
              <button className="link-btn" onClick={() => setView('overview')}>🏆 Voir tous les totems</button>
            </div>
          </div>
        </div>
        <Toast t={toast}/>
      </>
    );
  }

  // ── MON TOTEM ────────────────────────────────────────────
  if (view === 'mytotem' && me) {
    const phase = getPhaseFor(gs[me]);
    return (
      <>
        <style>{css}</style>
        <Bg />
        <div className="screen">
          <div className="game-header">
            <button className="header-back" onClick={goToDashboard}>← Retour</button>
            <div className="header-title">Mon Totem</div>
            <div className={`sync-dot${busy?' busy':''}`}/>
          </div>
          <div className="game-body">
            {phase === 'done'
              ? <FinalTotem gs={gs} name={me} goBack={goToDashboard}/>
              : <ReceiverWaitView gs={gs} name={me} phase={phase}/>
            }
          </div>
        </div>
        <Toast t={toast}/>
      </>
    );
  }

  // ── VOTE (pour une amie) ─────────────────────────────────
  if (view === 'vote' && me) {
    if (!voteTarget) { navigate('dashboard'); return null; }
    const phase = getPhaseFor(gs[voteTarget]);
    return (
      <>
        <style>{css}</style>
        <Bg />
        <div className="screen">
          <div className="game-header">
            <button className="header-back" onClick={goToDashboard}>← Retour</button>
            <div className="header-title" style={{fontSize:'1.05rem'}}>Pour {voteTarget}</div>
            <div className={`sync-dot${busy?' busy':''}`}/>
          </div>
          <div className="game-body">
            {/* Phase propose : animal + qualité en une seule page */}
            {(phase === 'animal-propose' || phase === 'quality-propose') &&
              <CombinedProposeView
                gs={gs} receiver={voteTarget} me={me}
                selAnimal={selAnimal} setSelAnimal={setSelAnimal}
                selQuality={selQuality} setSelQuality={setSelQuality}
                submitBothProposals={submitBothProposals}
                phase={phase}
              />
            }
            {/* Phase runoff : animal + qualité ensemble */}
            {(phase === 'animal-runoff' || phase === 'quality-runoff') &&
              <CombinedRunoffView
                gs={gs} receiver={voteTarget} me={me}
                selAnimal={selAnimal} setSelAnimal={setSelAnimal}
                selQuality={selQuality} setSelQuality={setSelQuality}
                submitBothRunoff={submitBothRunoff}
              />
            }
            {phase === 'done' && (
              <div className="wait">
                <div className="wi">🌿</div>
                <h3>Totem de {voteTarget} complet !</h3>
                <p>Le totem de {voteTarget} a déjà été établi.</p>
                <div className="bgroup" style={{justifyContent:'center',marginTop:'1.5rem'}}>
                  <button className="btn btn-g" onClick={goToDashboard}>← Retour</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <Toast t={toast}/>
      </>
    );
  }

  // ── OVERVIEW ─────────────────────────────────────────────
  if (view === 'overview') {
    const done = PLAYERS.filter(p => gs[p]?.qualityWinner);
    const inProg = PLAYERS.filter(p => !gs[p]?.qualityWinner);
    return (
      <>
        <style>{css}</style>
        <Bg />
        <div className="screen">
          <div className="game-header">
            <button className="header-back" onClick={() => setView(me?'dashboard':'login')}>← Retour</button>
            <div className="header-title">🏆 Tous les Totems</div>
            <div className={`sync-dot${busy?' busy':''}`}/>
          </div>
          <div className="game-body">
            {done.length > 0 && <>
              <div className="stitle" style={{marginTop:0}}>Totems complets ({done.length})</div>
              <div className="ov-grid" style={{marginBottom:'2rem'}}>
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
        <Toast t={toast}/>
      </>
    );
  }

  return null;
}

// ── CombinedProposeView ───────────────────────────────────
// Animal + Qualité sur une seule page, soumis ensemble
function CombinedProposeView({ gs, receiver, me, selAnimal, setSelAnimal, selQuality, setSelQuality, submitBothProposals, phase }) {
  const ps = gs[receiver] || {};
  const aVotes = realVotes(ps.animalVotes);
  const qVotes = realVotes(ps.qualityVotes);
  const others = PLAYERS.filter(p => p !== receiver);
  const aVoted = Object.keys(aVotes).length;
  const qVoted = Object.keys(qVotes).length;
  const alreadyVotedAnimal = !!aVotes[me];
  const alreadyVotedQuality = !!qVotes[me];

  // Si les deux sont déjà faits
  if (alreadyVotedAnimal && alreadyVotedQuality) {
    const ca = getCard(aVotes[me]), cq = getCard(qVotes[me]);
    return (
      <>
        <div className="receiver-banner"><h2>Propositions pour {receiver}</h2><p>Vous avez déjà voté pour les deux !</p></div>
        <div className="spanel" style={{borderColor:'rgba(200,150,10,.4)'}}>
          ✅ Animal : <strong>{ca.emoji} {ca.name}</strong><br/>
          ✅ Qualité : <strong>{cq.emoji} {cq.name}</strong>
        </div>
        <div className="spanel">
          <strong>{aVoted}/{others.length}</strong> propositions animal · <strong>{qVoted}/{others.length}</strong> propositions qualité
          <div className="pbar"><div className="pfill" style={{width:`${Math.min(aVoted,qVoted)/others.length*100}%`}}/></div>
        </div>
        <div className="wait"><div className="wi">⏳</div><h3>Propositions enregistrées !</h3><p>Attendez que le vote final commence.</p></div>
      </>
    );
  }

  // Sinon afficher les deux sélecteurs
  const globalTakenAnimal = getGlobalTakenIds(gs, 'animal', receiver);
  const globalTakenQuality = getGlobalTakenIds(gs, 'quality', receiver);
  const proposedAnimal = getAlreadyProposedIds(gs, receiver, me, 'animal');
  const proposedQuality = getAlreadyProposedIds(gs, receiver, me, 'quality');
  const excludeAnimal = [...new Set([...globalTakenAnimal, ...proposedAnimal])];
  const excludeQuality = [...new Set([...globalTakenQuality, ...proposedQuality])];

  const animalHand = getHandFor(receiver, me, 'animal', excludeAnimal);
  const qualityHand = getHandFor(receiver, me, 'quality', excludeQuality);

  const canSubmit = selAnimal && selQuality;

  return (
    <>
      <div className="receiver-banner">
        <h2>Proposer pour {receiver}</h2>
        <p>Choisissez l'animal <strong>ET</strong> la qualité qui lui correspondent le plus</p>
      </div>

      <div className="phase-badge">🐾 Étape 1 · Propositions</div>

      <div className="stitle" style={{marginTop:0}}>L'animal qui lui ressemble le plus</div>
      <div className="cards-grid">
        {animalHand.map(c => (
          <div key={c.id} className={`card${selAnimal===c.id?' sel':''}`} onClick={() => setSelAnimal(c.id)}>
            <span className="card-em">{c.emoji}</span>
            <div className="card-name">{c.name}</div>
            <div className="card-desc">{c.desc}</div>
          </div>
        ))}
      </div>

      <hr className="divider"/>

      <div className="stitle">La qualité qui lui correspond le plus</div>
      <div className="cards-grid">
        {qualityHand.map(c => (
          <div key={c.id} className={`card${selQuality===c.id?' sel':''}`} onClick={() => setSelQuality(c.id)}>
            <span className="card-em">{c.emoji}</span>
            <div className="card-name">{c.name}</div>
            <div className="card-desc">{c.desc}</div>
          </div>
        ))}
      </div>

      <div className="bgroup">
        <button className="btn btn-p" disabled={!canSubmit} onClick={() => submitBothProposals(receiver)}>
          {canSubmit
            ? `Proposer ${getCard(selAnimal)?.emoji} ${getCard(selAnimal)?.name} + ${getCard(selQuality)?.emoji} ${getCard(selQuality)?.name}`
            : 'Choisissez un animal et une qualité'}
        </button>
      </div>
    </>
  );
}

// ── RunoffView ────────────────────────────────────────────
function CombinedRunoffView({ gs, receiver, me, selAnimal, setSelAnimal, selQuality, setSelQuality, submitBothRunoff }) {
  const rps = gs[receiver] || {};
  const aProposals = realVotes(rps.animalVotes);
  const qProposals = realVotes(rps.qualityVotes);
  const aRunoff = realVotes(rps.animalRunoffVotes);
  const qRunoff = realVotes(rps.qualityRunoffVotes);
  const others = PLAYERS.filter(p => p !== receiver);
  const aVoted = Object.keys(aRunoff).length;
  const remaining = others.filter(p => !aRunoff[p]);
  const aTaken = getGlobalTakenIds(gs, 'animal', receiver);
  const qTaken = getGlobalTakenIds(gs, 'quality', receiver);

  const makeCandidates = (proposals, runoffVotes, takenIds) => {
    const ids = [...new Set(Object.values(proposals))];
    return ids.map(id => ({
      card: getCard(id),
      proposedBy: Object.entries(proposals).filter(([,v])=>v===id).map(([k])=>k),
      voteCount: Object.values(runoffVotes).filter(v=>v===id).length,
      taken: takenIds.includes(id),
    })).sort((a,b) => b.voteCount-a.voteCount);
  };

  const animalCandidates = makeCandidates(aProposals, aRunoff, aTaken);
  const qualityCandidates = makeCandidates(qProposals, qRunoff, qTaken);

  // Already voted
  if (aRunoff[me] && qRunoff[me]) {
    const ca = getCard(aRunoff[me]), cq = getCard(qRunoff[me]);
    return (
      <>
        <div className="receiver-banner"><h2>Vote final pour {receiver}</h2><p>Vous avez déjà voté !</p></div>
        <div className="spanel" style={{borderColor:'rgba(200,150,10,.4)'}}>
          ✅ Animal : <strong>{ca.emoji} {ca.name}</strong><br/>
          ✅ Qualité : <strong>{cq.emoji} {cq.name}</strong>
        </div>
        <div className="spanel">
          <strong>{aVoted}/{others.length}</strong> votes enregistrés
          <div className="pbar"><div className="pfill" style={{width:`${aVoted/others.length*100}%`}}/></div>
          {remaining.length > 0 ? <span>En attente : {remaining.join(', ')}</span> : <span className="gold">Résultat en cours… 🌿</span>}
        </div>
        <div className="wait"><div className="wi">⏳</div><h3>Vote enregistré !</h3><p>En attente des autres joueuses…</p></div>
      </>
    );
  }

  const canSubmit = selAnimal && selQuality;

  return (
    <>
      <div className="receiver-banner">
        <h2>Vote final pour {receiver}</h2>
        <p>Choisissez l'animal <strong>ET</strong> la qualité qui lui correspondent le plus</p>
      </div>
      <div className="phase-badge">🗳️ Étape 2 · Vote final</div>
      <div className="spanel">
        <strong>{aVoted}/{others.length}</strong> votes enregistrés
        <div className="pbar"><div className="pfill" style={{width:`${aVoted/others.length*100}%`}}/></div>
      </div>

      <div className="stitle" style={{marginTop:0}}>L'animal qui lui ressemble le plus</div>
      <div className="candidates">
        {animalCandidates.map(({card:c, proposedBy, voteCount, taken}) => (
          <div key={c.id} className={`cand${selAnimal===c.id?' sel':''}${taken?' taken':''}`} onClick={() => !taken && setSelAnimal(c.id)}>
            <span className="cand-em">{c.emoji}</span>
            <div className="cand-name">{c.name}</div>
            <div className="cand-desc">{c.desc}</div>
            <div><span className="cand-badge">par {proposedBy.join(', ')}</span></div>
            {voteCount > 0 && <div><span className={`cand-badge${voteCount>=2?' top':''}`}>{voteCount} vote{voteCount>1?'s':''}</span></div>}
            {taken && <div><span className="cand-badge red">déjà attribué</span></div>}
          </div>
        ))}
      </div>

      <hr className="divider"/>

      <div className="stitle">La qualité qui lui correspond le plus</div>
      <div className="candidates">
        {qualityCandidates.map(({card:c, proposedBy, voteCount, taken}) => (
          <div key={c.id} className={`cand${selQuality===c.id?' sel':''}${taken?' taken':''}`} onClick={() => !taken && setSelQuality(c.id)}>
            <span className="cand-em">{c.emoji}</span>
            <div className="cand-name">{c.name}</div>
            <div className="cand-desc">{c.desc}</div>
            <div><span className="cand-badge">par {proposedBy.join(', ')}</span></div>
            {voteCount > 0 && <div><span className={`cand-badge${voteCount>=2?' top':''}`}>{voteCount} vote{voteCount>1?'s':''}</span></div>}
            {taken && <div><span className="cand-badge red">déjà attribué</span></div>}
          </div>
        ))}
      </div>

      <div className="bgroup">
        <button className="btn btn-p" disabled={!canSubmit} onClick={() => submitBothRunoff(receiver)}>
          {canSubmit
            ? `Voter pour ${getCard(selAnimal)?.emoji} ${getCard(selAnimal)?.name} + ${getCard(selQuality)?.emoji} ${getCard(selQuality)?.name}`
            : 'Choisissez un animal et une qualité'}
        </button>
      </div>
    </>
  );
}

// ── ReceiverWaitView ──────────────────────────────────────
function ReceiverWaitView({ gs, name, phase }) {
  const voters = PLAYERS.length - 1;
  const ps = gs[name] || {};
  const isRunoff = phase === 'animal-runoff' || phase === 'quality-runoff';
  const votes = realVotes({
    'animal-propose': ps.animalVotes,
    'animal-runoff': ps.animalRunoffVotes,
    'quality-propose': ps.qualityVotes,
    'quality-runoff': ps.qualityRunoffVotes,
  }[phase]);
  const voted = Object.keys(votes).length;
  const labels = {
    'animal-propose': 'Vos amies choisissent votre animal et votre qualité en secret…',
    'animal-runoff': 'Vos amies votent pour votre animal totem définitif…',
    'quality-propose': 'Vos amies choisissent votre qualité en secret…',
    'quality-runoff': 'Vos amies votent pour votre qualité totem définitif…',
  };
  return (
    <>
      <div className="receiver-banner">
        <h2>✨ {name} ✨</h2>
        <p>{labels[phase]}</p>
      </div>
      <div className="spanel">
        <strong>{voted}/{voters}</strong> joueuses ont {isRunoff ? 'voté' : 'proposé'}
        <div className="pbar"><div className="pfill" style={{width:`${voted/voters*100}%`}}/></div>
        {voted < voters ? <span>Patience… vos amies s'occupent de vous 🌿</span> : <span className="gold">✨ Toutes ont participé ! Résultat en cours…</span>}
      </div>
      <div className="wait">
        <div className="wi">🌸</div>
        <h3>Installez-vous !</h3>
        <p>Votre totem se construit doucement.<br/>Revenez ici pour le découvrir quand il sera prêt.</p>
      </div>
    </>
  );
}

// ── FinalTotem ────────────────────────────────────────────
function FinalTotem({ gs, name, goBack }) {
  const fps = gs[name] || {};
  const a = getCard(fps.animalWinner), q = getCard(fps.qualityWinner);
  return (
    <>
      <div className="final-wrap">
        <h2>🌿 Totem de {name} 🌿</h2>
        <div className="tparts">
          <div className="tpart"><div className="pe">{a.emoji}</div><div className="pl">Force · Animal</div><div className="pn">{a.name}</div><div className="pd">{a.desc}</div></div>
          <div className="tpart"><div className="pe">{q.emoji}</div><div className="pl">Qualité</div><div className="pn">{q.name}</div><div className="pd">{q.desc}</div></div>
        </div>
      </div>
      <p style={{textAlign:'center',color:'var(--mist)',fontStyle:'italic',marginBottom:'2rem',fontSize:'.9rem'}}>
        « {a.name} {q.name.toLowerCase()} » — voilà qui vous êtes aux yeux de vos amies 💛
      </p>
      <div className="bgroup" style={{justifyContent:'center'}}>
        <button className="btn btn-g" onClick={goBack}>← Retour</button>
      </div>
    </>
  );
}

function Bg() {
  return (
    <div className="bg">
      <div className="bg-c" style={{width:600,height:600,top:'-200px',left:'-150px','--c':'rgba(62,92,40,.15)'}}/>
      <div className="bg-c" style={{width:400,height:400,bottom:'-100px',right:'-100px','--c':'rgba(46,32,14,.25)'}}/>
      <div className="bg-c" style={{width:300,height:300,top:'40%',right:'10%','--c':'rgba(200,150,10,.05)'}}/>
    </div>
  );
}

function Toast({ t }) {
  return <div className={`toast${t.on?' on':''}`}>{t.msg}</div>;
}
