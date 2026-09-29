const sections = [
  { name: 'Vowels', characters: 'ㅏ ㅐ ㅑ ㅒ ㅓ ㅔ ㅕ ㅖ ㅗ ㅘ ㅙ ㅚ ㅛ ㅜ ㅝ ㅞ ㅟ ㅠ ㅡ ㅢ ㅣ'.split(' '), first: 1, suffix: 'vowel' },
  { name: 'Consonants in CV Syllables', characters: '가 갸 꼬 께 나 뉴 다 돼 또 뜨 라 료 마 뭐 바 봐 빠 뿌 사 쇠 싸 써 얘 예 자 쥐 짜 쪼 차 쳐 커 키 타 퉤 파 퓨 해 희'.split(' '), first: 22, suffix: 'cv' },
  { name: 'CVC Syllables', characters: '국 눈 옷 달 밤 밥 방 집 꽃 책 손'.split(' '), first: 60, suffix: 'cvc' }
];
const nav = document.querySelector('.sections');
const character = document.querySelector('#character');
const position = document.querySelector('#position');
const sectionLabel = document.querySelector('#section-label');
const status = document.querySelector('#status');
const audio = new Audio();
let sectionIndex = 0;
let cardIndex = 0;

function showCard() {
  audio.pause();
  audio.removeAttribute('src');
  status.textContent = '';
  const section = sections[sectionIndex];
  character.textContent = section.characters[cardIndex];
  sectionLabel.textContent = section.name;
  position.textContent = `${cardIndex + 1} / ${section.characters.length}`;
  document.querySelector('#hint').textContent = 'Tap “Hear it” and repeat aloud.';
  [...nav.children].forEach((button, index) => button.setAttribute('aria-current', String(index === sectionIndex)));
}

sections.forEach((section, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = section.name;
  button.addEventListener('click', () => { sectionIndex = index; cardIndex = 0; showCard(); });
  nav.append(button);
});

document.querySelector('#previous').addEventListener('click', () => {
  cardIndex = (cardIndex - 1 + sections[sectionIndex].characters.length) % sections[sectionIndex].characters.length;
  showCard();
});
document.querySelector('#next').addEventListener('click', () => {
  cardIndex = (cardIndex + 1) % sections[sectionIndex].characters.length;
  showCard();
});
document.querySelector('#play').addEventListener('click', async () => {
  const section = sections[sectionIndex];
  const number = String(section.first + cardIndex).padStart(2, '0');
  const source = `audio/${number}-${section.suffix}.mp3`;
  if (!audio.src.endsWith(source)) audio.src = source;
  audio.currentTime = 0;
  status.textContent = '';
  try { await audio.play(); }
  catch { status.textContent = 'Audio could not play. Please try again.'; }
});
showCard();
