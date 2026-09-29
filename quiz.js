// The first two suggestions are deliberately close sounds or shapes.
// Remaining choices are drawn from the same section.
const closeChoices = {
  'ㅏ':['ㅑ','ㅓ'], 'ㅑ':['ㅏ','ㅕ'], 'ㅓ':['ㅕ','ㅏ'], 'ㅕ':['ㅓ','ㅑ'],
  'ㅐ':['ㅏ','ㅒ'], 'ㅔ':['ㅓ','ㅖ'], 'ㅒ':['ㅑ','ㅐ'], 'ㅖ':['ㅕ','ㅔ'],
  'ㅗ':['ㅛ','ㅜ'], 'ㅛ':['ㅗ','ㅠ'], 'ㅜ':['ㅠ','ㅗ'], 'ㅠ':['ㅜ','ㅛ'],
  'ㅘ':['ㅗ','ㅝ'], 'ㅝ':['ㅜ','ㅘ'], 'ㅙ':['ㅘ','ㅚ'], 'ㅚ':['ㅗ','ㅘ'], 'ㅞ':['ㅝ','ㅟ'],
  'ㅟ':['ㅜ','ㅢ'], 'ㅡ':['ㅣ','ㅜ'], 'ㅢ':['ㅡ','ㅟ'], 'ㅣ':['ㅡ','ㅟ'],
  '가':['갸','까'], '갸':['가','나'], '꼬':['또','쪼'], '께':['꼬','키'],
  '나':['다','라'], '뉴':['퓨','나'], '다':['타','나'], '돼':['봐','해'],
  '또':['꼬','쪼'], '뜨':['또','써'], '라':['나','마'], '료':['라','뉴'],
  '마':['바','나'], '뭐':['봐','마'], '바':['빠','파'], '봐':['바','뭐'],
  '빠':['바','파'], '뿌':['빠','퓨'], '사':['싸','자'], '쇠':['사','쥐'],
  '싸':['사','짜'], '써':['싸','커'], '얘':['예','해'], '예':['얘','해'],
  '자':['짜','차'], '쥐':['자','키'], '짜':['자','차'], '쪼':['꼬','또'],
  '차':['자','짜'], '쳐':['차','커'], '커':['꺼','쳐'], '키':['커','쥐'],
  '타':['다','파'], '퉤':['타','돼'], '파':['바','타'], '퓨':['뉴','뿌'],
  '해':['돼','예'], '희':['해','쥐'],
  '국':['꽃','책'], '눈':['손','문'], '옷':['꽃','손'], '달':['밤','눈'],
  '밤':['밥','방'], '밥':['밤','방'], '방':['밤','밥'], '집':['책','밥'],
  '꽃':['옷','국'], '책':['꽃','집'], '손':['눈','옷']
};
// Common modern pronunciations can merge. Never show two from one set
// in the same question, even when both spellings are in the card list.
const sameSound = [
  ['ㅐ','ㅔ'], ['ㅒ','ㅖ'], ['ㅙ','ㅚ','ㅞ'], ['얘','예']
];
const equivalent = (a,b) => a === b || sameSound.some(group => group.includes(a) && group.includes(b));
const shuffled = items => {
  const copy = [...items];
  for (let i=copy.length-1;i>0;i--) {
    const j=Math.floor(Math.random()*(i+1));
    [copy[i],copy[j]]=[copy[j],copy[i]];
  }
  return copy;
};
const quizRoot=document.querySelector('#quiz');
let questions=[];
let questionIndex=0;
let correctCount=0;
let answered=false;

function setMode(quizMode) {
  audio.pause();
  document.querySelector('#flashcards').hidden=quizMode;
  quizRoot.hidden=!quizMode;
  document.querySelector('#cards-mode').setAttribute('aria-pressed',String(!quizMode));
  document.querySelector('#quiz-mode').setAttribute('aria-pressed',String(quizMode));
}
document.querySelector('#cards-mode').addEventListener('click',()=>setMode(false));
document.querySelector('#quiz-mode').addEventListener('click',()=>setMode(true));

function makeChoices(section,correct) {
  const selected=[correct];
  for (const candidate of shuffled(closeChoices[correct] || []).slice(0,2)) {
    if (section.characters.includes(candidate) && selected.every(c=>!equivalent(c,candidate))) selected.push(candidate);
  }
  for (const candidate of shuffled(section.characters)) {
    if (selected.length===4) break;
    if (selected.every(c=>!equivalent(c,candidate))) selected.push(candidate);
  }
  if(selected.length!==4) throw new Error('Not enough distinct answers');
  return shuffled(selected);
}

function startQuiz() {
  questions=shuffled(sections.flatMap((section,sectionIndex)=>
    shuffled(section.characters.map((character,cardIndex)=>({sectionIndex,cardIndex,character}))).slice(0,4)
  ));
  questionIndex=0;
  correctCount=0;
  document.querySelector('#quiz-start').hidden=true;
  document.querySelector('#quiz-result').hidden=true;
  document.querySelector('#quiz-question').hidden=false;
  showQuestion();
}

function playQuestion() {
  const q=questions[questionIndex];
  const section=sections[q.sectionIndex];
  const number=String(section.first+q.cardIndex).padStart(2,'0');
  audio.src=`audio/${number}-${section.suffix}.mp3`;
  audio.currentTime=0;
  audio.play().catch(()=>{document.querySelector('#feedback').textContent='Audio could not play. Please try again.';});
}

function showQuestion() {
  answered=false;
  audio.pause();
  const q=questions[questionIndex];
  document.querySelector('#quiz-section').textContent=sections[q.sectionIndex].name;
  document.querySelector('#quiz-progress').textContent=`Question ${questionIndex+1} / 12`;
  document.querySelector('#feedback').textContent='';
  document.querySelector('#quiz-next').hidden=true;
  const choices=document.querySelector('#choices');
  choices.replaceChildren();
  makeChoices(sections[q.sectionIndex],q.character).forEach(choice=>{
    const button=document.createElement('button');
    button.type='button';
    button.lang='ko';
    button.textContent=choice;
    button.addEventListener('click',()=>{
      if(answered) return;
      answered=true;
      if(choice===q.character) correctCount++;
      [...choices.children].forEach(b=>{
        b.disabled=true;
        if(b.textContent===q.character) b.classList.add('correct');
        else if(b===button) b.classList.add('incorrect');
      });
      document.querySelector('#feedback').textContent=choice===q.character ? 'Correct!' : `The answer is ${q.character}.`;
      const next=document.querySelector('#quiz-next');
      next.textContent=questionIndex===11?'See results →':'Next question →';
      next.hidden=false;
    });
    choices.append(button);
  });
}
document.querySelector('#start-quiz').addEventListener('click',startQuiz);
document.querySelector('#restart-quiz').addEventListener('click',startQuiz);
document.querySelector('#quiz-play').addEventListener('click',playQuestion);
document.querySelector('#quiz-next').addEventListener('click',()=>{
  if(!answered)return;
  audio.pause();
  questionIndex++;
  if(questionIndex===12){
    document.querySelector('#quiz-question').hidden=true;
    document.querySelector('#quiz-result').hidden=false;
    document.querySelector('#score').textContent=`You answered ${correctCount} of 12 correctly.`;
  } else showQuestion();
});
