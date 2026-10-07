'use strict';
const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};
const digit=['','일','이','삼','사','오','육','칠','팔','구'];
function numberHangul(n){if(!Number.isInteger(n)||n<1||n>999)throw Error('Number out of range');const h=Math.floor(n/100),t=Math.floor(n%100/10);return(h?(h>1?digit[h]:'')+'백':'')+(t?(t>1?digit[t]:'')+'십':'')+digit[n%10];}
const excluded=new Set([11,15,20,21,30,99,100,101,203]);
function generated(n,reverse){let candidates=[n+1,n-1,n+10,n-10,Number(String(n).split('').reverse().join('')),Math.floor(n/10),n+100,n-100];let wrong=[...new Set(candidates)].filter(x=>x>=11&&x<=999&&x!==n);while(wrong.length<3){const x=11+Math.floor(Math.random()*989);if(x!==n&&!wrong.includes(x))wrong.push(x);}wrong=shuffle(wrong).slice(0,3);const convert=x=>reverse?numberHangul(x):String(x);return {id:'generated-'+n,group:reverse?'New number · digits → Hangul':'New number · Hangul → digits',prompt:reverse?'Choose the Sino-Korean reading: '+n:'Choose the number: '+numberHangul(n),options:shuffle([n,...wrong].map(convert)),correct:convert(n),feedback:n+' = '+numberHangul(n)+'. Omit empty places; use 십 and 백 without 일.',audio:'',value:n};}
function makeQuiz(){const pick=g=>shuffle(DATA.pool.filter(q=>q.group===g));const nums=pick('Recorded number');const first=nums[0],second=nums.find(q=>q.correct!==first.correct);const eligible=shuffle(Array.from({length:989},(_,i)=>i+11).filter(n=>!excluded.has(n)));const vocab=pick('Vocabulary').slice(0,2),response=pick('Appropriate response')[0];const meanings=pick('Expression meaning').filter(q=>q.id.slice(2)!==response.id.slice(2));const subj=pick('Subject particle');const negatives=pick('Negative form');const ga=negatives.find(q=>q.correct==='가 아니에요');const other=negatives.find(q=>q.correct!=='가 아니에요');return [first,second,generated(eligible[0],false),generated(eligible[1],true),...vocab,response,meanings[0],subj.find(q=>q.correct==='이'),subj.find(q=>q.correct==='가'),ga,other].map(q=>({...q,options:shuffle(q.options)}));}
if(typeof module!=='undefined')module.exports={numberHangul,makeQuiz,generated};
if(typeof document!=='undefined'){
const $=id=>document.getElementById(id);let deck=[],at=0,revealed=false,mode='study',quiz=[],qi=0,answers=[],locked=false;let playing=null;
function stop(){if(playing){playing.pause();playing.currentTime=0;playing=null;}}
async function play(path,status){stop();$(status).textContent='';if(!path)return;const audio=new Audio(path);playing=audio;try{await audio.play();}catch{$(status).textContent='Audio could not play. Check that the audio/Ch2 folders are in the app’s main folder and try again.';}}
function loadDeck(){const c=$('category').value;deck=DATA.cards.filter(x=>c==='vocabularyAll'?['numbers','vocabulary'].includes(x.group):x.group===c);at=0;revealed=false;showCard();}
function showCard(){stop();const c=deck[at];$('cardCount').textContent=(at+1)+' / '+deck.length;$('sideLabel').textContent=c.group==='expressions'?(revealed?(c.kind==='question'?'Meaning & possible answers':'Meaning'):(c.kind==='question'?'Question':'Sample answer')):(revealed?'Answer':'Prompt');$('cardText').textContent=revealed?c.back:c.front;
if(revealed&&Number.isInteger(c.highlightStart)){
 const t=$('cardText');t.replaceChildren();
 t.append(document.createTextNode(c.back.slice(0,c.highlightStart)));
 const marked=document.createElement('strong');marked.className='particle';
 marked.textContent=c.back[c.highlightStart];t.append(marked);
 t.append(document.createTextNode(c.back.slice(c.highlightStart+1)));
}
$('cardMeaning').textContent=c.meaning||'';$('card').classList.toggle('explanation',!!c.explanation);$('flip').textContent=revealed?'Show prompt':c.group==='expressions'?'Reveal meaning':'Reveal answer';const path=c.group==='expressions'?(revealed?null:c.frontAudio):c.group==='grammar'?(revealed?c.audio:null):c.audio;$('listen').hidden=!path;$('listen').onclick=()=>play(path,'audioStatus');$('audioStatus').textContent='';$('numberNote').hidden=!['numbers','vocabularyAll'].includes($('category').value);}
function flip(){revealed=!revealed;showCard();}function move(n){at=(at+n+deck.length)%deck.length;revealed=false;showCard();}
function switchMode(m){stop();mode=m;$('study').hidden=m!=='study';$('quiz').hidden=m!=='quiz';$('studyTab').classList.toggle('active',m==='study');$('quizTab').classList.toggle('active',m==='quiz');}
$('studyTab').onclick=()=>switchMode('study');$('quizTab').onclick=()=>switchMode('quiz');$('category').onchange=loadDeck;$('shuffle').onclick=()=>{deck=shuffle(deck);at=0;revealed=false;showCard();};$('flip').onclick=flip;$('card').onclick=flip;$('prev').onclick=()=>move(-1);$('next').onclick=()=>move(1);
document.addEventListener('keydown',e=>{if(mode!=='study'||['SELECT','INPUT','BUTTON'].includes(e.target.tagName))return;if(e.key===' '){e.preventDefault();flip();}if(e.key==='ArrowLeft')move(-1);if(e.key==='ArrowRight')move(1);});
function start(){stop();quiz=makeQuiz();qi=0;answers=[];$('quizIntro').hidden=true;$('results').hidden=true;$('quizRun').hidden=false;showQuestion();}
function showQuestion(){stop();locked=false;const q=quiz[qi];$('questionCount').textContent='Question '+(qi+1)+' of 12';$('questionType').textContent=q.group;$('progress').value=qi;$('prompt').textContent=q.prompt;$('quizListen').hidden=!q.audio;$('quizListen').onclick=()=>play(q.audio,'quizAudioStatus');$('quizAudioStatus').textContent='';$('feedback').textContent='';$('continue').hidden=true;$('choices').replaceChildren();q.options.forEach(o=>{const b=document.createElement('button');b.textContent=o;b.onclick=()=>choose(o,b);$('choices').append(b);});}
function choose(o,b){if(locked)return;locked=true;stop();const q=quiz[qi],ok=o===q.correct;answers.push({q,chosen:o,ok});for(const x of $('choices').children){x.disabled=true;if(x.textContent===q.correct)x.classList.add('correct');}if(!ok)b.classList.add('wrong');$('feedback').textContent = ok
  ? 'Correct.'
  : 'Incorrect. Correct answer: ' + q.correct;$('continue').textContent=qi===11?'See results':'Next question →';$('continue').hidden=false;}
function results(){stop();$('quizRun').hidden=true;const r=$('results');r.hidden=false;r.replaceChildren();const score=answers.filter(a=>a.ok).length;const h=document.createElement('h2');h.textContent=score+' / 12';r.append(h);const p=document.createElement('p');p.textContent=score===12?'All correct! Try again for new questions.':'Review your answers below, then try a fresh quiz.';r.append(p);const list=document.createElement('ol');answers.forEach(a=>{const li=document.createElement('li');if (!a.ok) {
  const marker = document.createElement('span');
  marker.textContent = '✗ ';
  marker.style.color = '#c62828';
  marker.style.fontWeight = 'bold';
  marker.setAttribute('aria-label', 'Incorrect');
  li.append(marker);
}li.append(document.createTextNode(a.q.prompt+' — '+(a.ok?'Correct: '+a.q.correct:'Your answer: '+a.chosen+'. Correct: '+a.q.correct)));list.append(li);});r.append(list);const b=document.createElement('button');b.className='primary';b.textContent='Start a new quiz';b.onclick=start;r.append(b);}
$('start').onclick=start;$('continue').onclick=()=>{qi++;if(qi===12)results();else showQuestion();};loadDeck();
}
