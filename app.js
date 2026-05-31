// Morse code lookup
const MORSE = {
  'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....',
  'I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.',
  'Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-',
  'Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-',
  '5':'.....','6':'-....','7':'--...','8':'---..','9':'----.'
};

// Cumulative letter groups - 2 at a time, paired by contrast
const LETTER_GROUPS = [
  ['E','T'], ['A','N'], ['I','M'], ['S','O'], ['R','G'], ['D','K'],
  ['U','W'], ['H','B'], ['L','F'], ['C','P'], ['J','Q'], ['V','X'], ['Y','Z'],
];
const NUMBER_GROUPS = [['1','2'], ['3','4'], ['5','6'], ['7','8'], ['9','0']];

function buildCumulative(groups) {
  const c = []; let all = [];
  for (const g of groups) { all = all.concat(g); c.push([...all]); }
  return c;
}
const CUM_LETTERS = buildCumulative(LETTER_GROUPS);
const CUM_ALL = buildCumulative([...LETTER_GROUPS, ...NUMBER_GROUPS]);

const ALL_LETTERS = CUM_LETTERS[CUM_LETTERS.length - 1];
const ALL_CHARS = CUM_ALL[CUM_ALL.length - 1];

// Word banks
const WORDS_EASY =    ['HI','GO','NO','OK','IT','ME','WE','UP','ON','IN','AT','IS','DO','SO','TO','AN','AM','IF','OR','BE'];
const WORDS_MEDIUM =  ['SOS','YES','THE','AND','FOR','ARE','BUT','NOT','YOU','ALL','CAN','HER','WAS','ONE','OUR','OUT','HAD','HAS','HOT','OLD','NEW','NOW','WAR','TEN','RUN','RED','SET','SIT','TOP','TWO','USE','WIN'];
const WORDS_HARD =    ['HELP','STOP','SEND','COPY','OVER','COME','FIRE','SAFE','WAIT','CALL','TEST','CODE','WORK','GOOD','BACK','HOME','LAND','SHIP','BOAT','MOVE','TURN','FAST','SLOW','OPEN','DONE','RAIN','WIND','LOST','NEED','FOOD'];
const WORDS_PRO =     ['ROGER','BREAK','MAYDAY','SIGNAL','REPEAT','RESCUE','URGENT','DANGER','COURSE','REPORT','STANDBY','CONFIRM','WEATHER','CONTACT','MESSAGE','STATION','TROUBLE','CALLING','RESPOND','READING'];
const PHRASES_SHORT = ['CQ CQ','DE AA','73','88','QTH','QSL','QRZ','QRM','QRN','QSO','RST','TNX','OM','YL','XYL','FB','HW','ES','UR','MNI'];
const CALLSIGNS =     ['W1AW','VE3XYZ','G4ABC','JA1ZZZ','VK2DEF','K9DOG','N0CALL','W6RFU'];

// Build level list
const LEVELS = [];
let idx = 0;

// === SECTION: LEARN LETTERS ===
LEVELS.push({ section: 'Learn Letters' });
for (let i = 0; i < LETTER_GROUPS.length; i++) {
  const isFirst = i === 0;
  const isLast = i === LETTER_GROUPS.length - 1;
  LEVELS.push({
    name: isFirst ? `E T` : `+ ${LETTER_GROUPS[i].join(' ')}`,
    chars: CUM_LETTERS[i], newChars: LETTER_GROUPS[i],
    desc: isLast ? 'full alphabet!' : (isFirst ? 'dot and dash' : `+ ${LETTER_GROUPS[i].join(' ')}`),
    questions: isFirst ? 6 : 8, lives: 5,
  });
}

// === SECTION: LEARN NUMBERS ===
LEVELS.push({ section: 'Learn Numbers' });
for (let i = 0; i < NUMBER_GROUPS.length; i++) {
  const cumIdx = LETTER_GROUPS.length + i;
  const isLast = i === NUMBER_GROUPS.length - 1;
  LEVELS.push({
    name: `+ ${NUMBER_GROUPS[i].join(' ')}`,
    chars: CUM_ALL[cumIdx], newChars: NUMBER_GROUPS[i],
    desc: isLast ? 'all characters!' : `+ ${NUMBER_GROUPS[i].join(' ')}`,
    questions: 8, lives: 5,
  });
}

// === SECTION: WORDS ===
LEVELS.push({ section: 'Words' });
LEVELS.push({
  name: 'Easy Words', words: WORDS_EASY, desc: '2-letter words',
  questions: 8, lives: 4,
});
LEVELS.push({
  name: 'Medium Words', words: WORDS_MEDIUM, desc: '3-letter words',
  questions: 8, lives: 4,
});
LEVELS.push({
  name: 'Hard Words', words: WORDS_HARD, desc: '4-letter words',
  questions: 8, lives: 3,
});
LEVELS.push({
  name: 'Pro Words', words: WORDS_PRO, desc: '5+ letter words',
  questions: 8, lives: 3,
});
LEVELS.push({
  name: 'Q-Codes and Lingo', words: PHRASES_SHORT, desc: 'ham radio shorthand',
  questions: 10, lives: 4,
});
LEVELS.push({
  name: 'Callsigns', words: CALLSIGNS, desc: 'real callsign formats',
  questions: 8, lives: 3,
});

// === SECTION: SPEED ===
LEVELS.push({ section: 'Speed' });
LEVELS.push({
  name: 'Speed: Easy', chars: CUM_LETTERS[5], newChars: null,
  desc: '10s, first 12 letters', questions: 10, lives: 3,
  timed: true, timeLimit: 10000,
});
LEVELS.push({
  name: 'Speed: Medium', chars: ALL_LETTERS, newChars: null,
  desc: '8s, full alphabet', questions: 12, lives: 3,
  timed: true, timeLimit: 8000,
});
LEVELS.push({
  name: 'Speed: Hard', chars: ALL_CHARS, newChars: null,
  desc: '5s, everything', questions: 15, lives: 3,
  timed: true, timeLimit: 5000,
});
LEVELS.push({
  name: 'Speed: Insane', chars: ALL_CHARS, newChars: null,
  desc: '3s, no mercy', questions: 15, lives: 2,
  timed: true, timeLimit: 3000,
});

// === SECTION: REVERSE ===
LEVELS.push({ section: 'Reverse (Decode)' });
LEVELS.push({
  name: 'Decode: Letters', chars: ALL_LETTERS, newChars: null,
  desc: 'hear morse, type the letter', questions: 12, lives: 4, reverse: true,
});
LEVELS.push({
  name: 'Decode: Everything', chars: ALL_CHARS, newChars: null,
  desc: 'letters + numbers', questions: 12, lives: 3, reverse: true,
});

// === SECTION: CHALLENGE ===
LEVELS.push({ section: 'Challenge' });
LEVELS.push({
  name: 'Survival', chars: ALL_CHARS, newChars: null,
  desc: 'how far can you go?', questions: Infinity, lives: 3, survival: true,
});
LEVELS.push({
  name: 'Speed Survival', chars: ALL_CHARS, newChars: null,
  desc: '6s timer, infinite', questions: Infinity, lives: 3,
  survival: true, timed: true, timeLimit: 6000, survivalKey: 'speedSurvivalHigh',
});
LEVELS.push({
  name: 'Word Survival', words: [...WORDS_EASY, ...WORDS_MEDIUM, ...WORDS_HARD],
  desc: 'endless words', questions: Infinity, lives: 3,
  survival: true, survivalKey: 'wordSurvivalHigh',
});

// === FREE PRACTICE (always last) ===
LEVELS.push({ section: 'Practice' });
LEVELS.push({ name: 'Free Practice', practice: true, desc: 'no pressure, with hints' });

const AUTO_SUBMIT_DELAY = 1200;
const WORD_AUTO_SUBMIT_DELAY = 1800;

// Audio
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

let holdOsc = null;
function startHoldTone(freq = 600) {
  const ctx = getAudioCtx();
  holdOsc = ctx.createOscillator();
  const gain = ctx.createGain();
  holdOsc.type = 'sine';
  holdOsc.frequency.value = freq;
  gain.gain.value = 0.3;
  holdOsc.connect(gain);
  gain.connect(ctx.destination);
  holdOsc.start();
}
function stopHoldTone() {
  if (holdOsc) { try { holdOsc.stop(); } catch {} holdOsc = null; }
}

function playMorse(morseStr) {
  const ctx = getAudioCtx();
  let time = ctx.currentTime + 0.05;
  for (const ch of morseStr) {
    if (ch === '.' || ch === '-') {
      const len = ch === '.' ? 0.08 : 0.24;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = 600; g.gain.value = 0.3;
      osc.connect(g); g.connect(ctx.destination);
      osc.start(time); osc.stop(time + len);
      time += len + 0.1;
    } else if (ch === ' ') {
      time += 0.3;
    }
  }
}

// State
let currentLevel = 0;
let currentChar = '';
let currentWord = '';
let inputBuffer = '';
let score = 0;
let questionNum = 0;
let lives = 0;
let maxLives = 0;
let streak = 0;
let bestStreak = 0;
let pressStart = 0;
let timerInterval = null;
let autoSubmitTimeout = null;
let isProcessing = false;

const $ = id => document.getElementById(id);

function loadProgress() {
  try { return JSON.parse(localStorage.getItem('morsebuddy') || '{}'); }
  catch { return {}; }
}
function saveProgress(data) { localStorage.setItem('morsebuddy', JSON.stringify(data)); }

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
}

// Get the actual level index (skipping section headers)
function getLevelIndex(displayIndex) {
  let count = -1;
  for (let i = 0; i < LEVELS.length; i++) {
    if (!LEVELS[i].section) count++;
    if (count === displayIndex) return i;
  }
  return -1;
}

// Get display index from actual index
function getDisplayIndex(actualIndex) {
  let count = 0;
  for (let i = 0; i < actualIndex; i++) {
    if (!LEVELS[i].section) count++;
  }
  return count;
}

// MENU
function renderMenu() {
  const progress = loadProgress();
  const list = $('level-list');
  list.innerHTML = '';
  let levelNum = 0;

  LEVELS.forEach((level, actualIdx) => {
    if (level.section) {
      const header = document.createElement('div');
      header.className = 'section-header';
      header.textContent = level.section;
      list.appendChild(header);
      return;
    }

    const displayIdx = levelNum;
    levelNum++;

    const btn = document.createElement('button');
    btn.className = 'level-btn';
    const unlocked = displayIdx === 0 || progress[`level_${displayIdx - 1}`];
    if (!unlocked) btn.classList.add('locked');

    const completed = progress[`level_${displayIdx}`];
    const surveyKey = level.survivalKey || 'survivalHigh';
    const highScore = level.survival ? (progress[surveyKey] || 0) : 0;
    let extra = '';
    if (level.survival && highScore > 0) extra = ` (best: ${highScore})`;

    btn.innerHTML = `
      <div class="level-info">
        <span>${level.name}</span>
        <span class="level-chars">${level.desc}${extra}</span>
      </div>
      ${completed ? '<span class="check">&#10003;</span>' : ''}
    `;
    btn.addEventListener('click', () => {
      if (!unlocked) return;
      getAudioCtx();
      if (level.practice) {
        startPractice();
      } else {
        startLevel(actualIdx, displayIdx);
      }
    });
    list.appendChild(btn);
  });
  showScreen('menu-screen');
}

// Weighted random: favor new chars
function pickChar(level) {
  const nc = level.newChars, ac = level.chars;
  if (!nc || !nc.length || ac.length === nc.length) return ac[Math.floor(Math.random() * ac.length)];
  return (Math.random() < 0.6) ? nc[Math.floor(Math.random() * nc.length)] : ac[Math.floor(Math.random() * ac.length)];
}

let currentDisplayIdx = 0;

function startLevel(actualIdx, displayIdx) {
  currentLevel = actualIdx;
  currentDisplayIdx = displayIdx;
  const level = LEVELS[actualIdx];
  score = 0; questionNum = 0; streak = 0; bestStreak = 0;
  lives = level.lives || 3; maxLives = lives;
  isProcessing = false;
  $('level-title').textContent = level.name;
  updateHUD();

  const oldTimer = document.querySelector('#game-screen .timer-bar-container');
  if (oldTimer) oldTimer.remove();
  if (level.timed) {
    const c = document.createElement('div');
    c.className = 'timer-bar-container';
    c.innerHTML = '<div class="timer-bar" id="timer-bar"></div>';
    $('game-screen').querySelector('.prompt-area').before(c);
  }

  $('prompt-label-text').textContent = level.reverse ? 'Listen and type the character' : 'Tap the Morse code for';
  $('streak-display').textContent = '';

  removeSpaceButton();
  if (level.words) addSpaceButton();

  document.querySelector('.reverse-area').style.display = level.reverse ? '' : 'none';
  $('input-display').style.display = level.reverse ? 'none' : '';
  $('tap-btn').style.display = level.reverse ? 'none' : '';
  $('clear-btn').style.display = level.reverse ? 'none' : '';

  showScreen('game-screen');
  nextQuestion();
}

function nextQuestion() {
  const level = LEVELS[currentLevel];
  if (lives <= 0 || (!level.survival && questionNum >= level.questions)) { endLevel(); return; }

  inputBuffer = ''; isProcessing = false;
  clearTimeout(autoSubmitTimeout);
  updateInputDisplay('input-display');
  clearFeedback('feedback');

  if (level.reverse) {
    currentChar = pickChar(level);
    $('prompt-char').textContent = '?';
    $('prompt-char').style.fontSize = '5rem';
    $('reverse-input').value = '';
    setTimeout(() => { $('reverse-input').focus(); }, 50);
    setTimeout(() => playMorse(MORSE[currentChar]), 400);
  } else if (level.words) {
    currentWord = level.words[Math.floor(Math.random() * level.words.length)];
    currentChar = currentWord[0];
    $('prompt-char').textContent = currentWord;
    $('prompt-char').style.fontSize = currentWord.length > 4 ? '2.8rem' : currentWord.length > 3 ? '3.5rem' : '5rem';
  } else {
    currentWord = '';
    currentChar = pickChar(level);
    $('prompt-char').textContent = currentChar;
    $('prompt-char').style.fontSize = '5rem';
  }

  updateHUD();
  if (level.timed) startTimer(level.timeLimit);
}

function updateHUD() {
  const level = LEVELS[currentLevel];
  let hearts = '';
  for (let i = 0; i < maxLives; i++) hearts += i < lives ? '\u2764' : '\u2661';
  if (level.survival) {
    $('score-display').textContent = `${hearts} #${score}`;
  } else {
    $('score-display').textContent = `${hearts} ${questionNum}/${level.questions}`;
  }
  if (streak >= 3) {
    $('streak-display').textContent = `${streak} streak!`;
    $('streak-display').className = 'streak-display hot';
  } else {
    $('streak-display').textContent = '';
    $('streak-display').className = 'streak-display';
  }
}

function updateInputDisplay(id) { $(id).textContent = inputBuffer || '\u00a0'; }
function clearFeedback(id) { const el = $(id); el.textContent = ''; el.className = 'feedback'; }

function showFeedback(id, correct, expected) {
  const el = $(id);
  if (correct) {
    const msgs = streak >= 5 ? ['On fire!','Unstoppable!','Machine!'] : streak >= 3 ? ['Nice streak!','Keep going!','Smooth!'] : ['Correct!','Got it!','Right!'];
    el.textContent = msgs[Math.floor(Math.random() * msgs.length)];
    el.className = 'feedback correct';
  } else {
    el.textContent = `Nope: ${expected}`;
    el.className = 'feedback wrong';
  }
}

function startTimer(ms) {
  clearInterval(timerInterval);
  const start = Date.now();
  const bar = $('timer-bar');
  if (!bar) return;
  bar.style.width = '100%'; bar.classList.remove('warning');
  timerInterval = setInterval(() => {
    const pct = Math.max(0, 1 - (Date.now() - start) / ms) * 100;
    bar.style.width = pct + '%';
    if (pct < 30) bar.classList.add('warning');
    if (pct <= 0) { clearInterval(timerInterval); handleAnswer(false, getExpected()); }
  }, 50);
}

function getExpected() {
  const level = LEVELS[currentLevel];
  if (level && level.words) return currentWord.split('').map(c => MORSE[c]).join(' ');
  if (level && level.reverse) return currentChar;
  return MORSE[currentChar];
}

function scheduleAutoSubmit(displayId) {
  clearTimeout(autoSubmitTimeout);
  if (isProcessing) return;
  const level = LEVELS[currentLevel];
  const delay = (level && level.words) ? WORD_AUTO_SUBMIT_DELAY : AUTO_SUBMIT_DELAY;
  autoSubmitTimeout = setTimeout(() => {
    if (!inputBuffer.trim()) return;
    if (displayId === 'input-display') checkAnswer(); else practiceCheck();
  }, delay);
}

async function checkAnswer() {
  if (isProcessing) return;
  isProcessing = true;
  clearTimeout(autoSubmitTimeout);
  clearInterval(timerInterval);
  const level = LEVELS[currentLevel];
  let expected, correct;

  if (level.reverse) {
    const typed = $('reverse-input').value.trim().toUpperCase();
    expected = currentChar; correct = typed === expected;
  } else if (level.words) {
    expected = currentWord.split('').map(c => MORSE[c]).join(' ');
    correct = inputBuffer.trim() === expected;
  } else {
    expected = MORSE[currentChar]; correct = inputBuffer.trim() === expected;
  }

  if (!level.reverse) {
    try {
      const res = await fetch('/api/check', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ char: level.words ? currentWord : currentChar, input: inputBuffer.trim(), isWord: !!level.words })
      });
      const data = await res.json();
      correct = data.correct; expected = data.expected;
    } catch {}
  }

  handleAnswer(correct, expected);
}

function handleAnswer(correct, expected) {
  const level = LEVELS[currentLevel];
  if (correct) { score++; streak++; if (streak > bestStreak) bestStreak = streak; }
  else { lives--; streak = 0; }
  questionNum++;
  updateHUD();
  showFeedback('feedback', correct, expected);
  if (navigator.vibrate) navigator.vibrate(correct ? 50 : [100, 50, 100]);

  if (!correct) {
    if (level.reverse) {
      $('prompt-char').textContent = currentChar;
      setTimeout(() => playMorse(MORSE[currentChar]), 300);
    } else {
      setTimeout(() => playMorse(expected), 300);
    }
  }
  setTimeout(() => nextQuestion(), correct ? 800 : 2000);
}

function endLevel() {
  clearInterval(timerInterval);
  clearTimeout(autoSubmitTimeout);
  const level = LEVELS[currentLevel];
  const progress = loadProgress();

  if (level.survival) {
    const key = level.survivalKey || 'survivalHigh';
    const prev = progress[key] || 0;
    if (score > prev) { progress[key] = score; }
    progress[`level_${currentDisplayIdx}`] = true;
    saveProgress(progress);

    $('complete-title').textContent = 'Game Over';
    $('complete-score').textContent = `Score: ${score}`;
    $('complete-msg').textContent = score > prev && score > 0
      ? `New best! (was ${prev})` : `Best: ${Math.max(score, prev)}`;
    $('complete-extra').textContent = bestStreak >= 3 ? `Best streak: ${bestStreak}` : '';
  } else {
    const passed = lives > 0;
    $('complete-title').textContent = passed ? 'Level Complete!' : 'Out of Lives';
    $('complete-score').textContent = `${score} / ${questionNum} correct`;
    $('complete-msg').textContent = passed
      ? `${lives} ${lives === 1 ? 'life' : 'lives'} remaining`
      : 'Try again!';
    $('complete-extra').textContent = bestStreak >= 3 ? `Best streak: ${bestStreak}` : '';

    if (passed) {
      progress[`level_${currentDisplayIdx}`] = true;
      saveProgress(progress);
    }
    $('next-level-btn').style.display = (passed && currentDisplayIdx + 1 < LEVELS.filter(l => !l.section).length) ? '' : 'none';
  }
  showScreen('complete-screen');
}

// TAP
function setupTapButton(btnId, displayId) {
  const btn = $(btnId);
  function onDown(e) {
    e.preventDefault(); if (isProcessing) return;
    pressStart = Date.now(); btn.classList.add('pressing'); startHoldTone();
  }
  function onUp(e) {
    e.preventDefault(); stopHoldTone();
    if (!pressStart || isProcessing) return;
    const dur = Date.now() - pressStart; pressStart = 0; btn.classList.remove('pressing');
    inputBuffer += dur < 200 ? '.' : '-';
    updateInputDisplay(displayId);
    if (navigator.vibrate) navigator.vibrate(dur < 200 ? 20 : 40);
    scheduleAutoSubmit(displayId);
  }
  btn.addEventListener('pointerdown', onDown);
  btn.addEventListener('pointerup', onUp);
  btn.addEventListener('pointerleave', () => { stopHoldTone(); pressStart = 0; btn.classList.remove('pressing'); });
  btn.addEventListener('contextmenu', e => e.preventDefault());
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    const s = document.querySelector('.screen.active');
    if (s && (s.id === 'game-screen' || s.id === 'practice-screen')) {
      const level = LEVELS[currentLevel];
      if (level && level.reverse) return;
      e.preventDefault();
      inputBuffer += ' ';
      const d = s.id === 'game-screen' ? 'input-display' : 'practice-input';
      updateInputDisplay(d); scheduleAutoSubmit(d);
    }
  }
  if (e.key === 'Enter') {
    const level = LEVELS[currentLevel];
    if (level && level.reverse && document.querySelector('#game-screen.active')) {
      e.preventDefault(); checkAnswer();
    }
  }
});

function addSpaceButton() {
  if (document.getElementById('space-btn')) return;
  const row = document.querySelector('#game-screen .action-row');
  const b = document.createElement('button');
  b.id = 'space-btn'; b.className = 'action-btn'; b.textContent = 'Space';
  b.addEventListener('click', () => { inputBuffer += ' '; updateInputDisplay('input-display'); scheduleAutoSubmit('input-display'); });
  row.appendChild(b);
}
function removeSpaceButton() { const b = document.getElementById('space-btn'); if (b) b.remove(); }

// PRACTICE
function startPractice() {
  isProcessing = false;
  const allChars = ALL_CHARS;
  currentChar = allChars[Math.floor(Math.random() * allChars.length)];
  inputBuffer = '';
  $('practice-char').textContent = currentChar;
  updateInputDisplay('practice-input');
  clearFeedback('practice-feedback');
  $('practice-ref').textContent = `Hint: ${currentChar} = ${MORSE[currentChar]}`;
  showScreen('practice-screen');
}

function practiceCheck() {
  if (isProcessing) return;
  isProcessing = true;
  clearTimeout(autoSubmitTimeout);
  const expected = MORSE[currentChar];
  const correct = inputBuffer.trim() === expected;
  showFeedback('practice-feedback', correct, expected);
  if (navigator.vibrate) navigator.vibrate(correct ? 50 : [100, 50, 100]);
  if (!correct) setTimeout(() => playMorse(expected), 300);

  setTimeout(() => {
    isProcessing = false; inputBuffer = '';
    updateInputDisplay('practice-input');
    currentChar = ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
    $('practice-char').textContent = currentChar;
    clearFeedback('practice-feedback');
    $('practice-ref').textContent = `Hint: ${currentChar} = ${MORSE[currentChar]}`;
  }, correct ? 800 : 1800);
}

// INIT
function init() {
  setupTapButton('tap-btn', 'input-display');
  setupTapButton('practice-tap-btn', 'practice-input');

  $('clear-btn').addEventListener('click', () => { inputBuffer = ''; clearTimeout(autoSubmitTimeout); updateInputDisplay('input-display'); });
  $('hear-btn').addEventListener('click', () => {
    const level = LEVELS[currentLevel];
    if (level && level.reverse) playMorse(MORSE[currentChar]); else playMorse(getExpected());
  });
  $('back-btn').addEventListener('click', () => { clearInterval(timerInterval); clearTimeout(autoSubmitTimeout); removeSpaceButton(); renderMenu(); });

  $('next-level-btn').addEventListener('click', () => {
    removeSpaceButton();
    // Find next actual level
    const nextDisplay = currentDisplayIdx + 1;
    let count = -1;
    for (let i = 0; i < LEVELS.length; i++) {
      if (!LEVELS[i].section) count++;
      if (count === nextDisplay) {
        if (LEVELS[i].practice) startPractice();
        else startLevel(i, nextDisplay);
        return;
      }
    }
  });

  $('retry-btn').addEventListener('click', () => startLevel(currentLevel, currentDisplayIdx));
  $('menu-btn').addEventListener('click', () => { removeSpaceButton(); renderMenu(); });

  $('practice-clear-btn').addEventListener('click', () => { inputBuffer = ''; clearTimeout(autoSubmitTimeout); updateInputDisplay('practice-input'); });
  $('practice-hear-btn').addEventListener('click', () => playMorse(MORSE[currentChar]));
  $('practice-skip-btn').addEventListener('click', () => {
    isProcessing = false; inputBuffer = ''; clearTimeout(autoSubmitTimeout);
    updateInputDisplay('practice-input'); clearFeedback('practice-feedback');
    currentChar = ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
    $('practice-char').textContent = currentChar;
    $('practice-ref').textContent = `Hint: ${currentChar} = ${MORSE[currentChar]}`;
  });
  $('practice-back-btn').addEventListener('click', () => { clearTimeout(autoSubmitTimeout); renderMenu(); });
  $('reverse-submit-btn').addEventListener('click', () => checkAnswer());

  renderMenu();
}

init();
