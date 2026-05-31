// Morse code lookup
const MORSE = {
  'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....',
  'I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.',
  'Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-',
  'Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-',
  '5':'.....','6':'-....','7':'--...','8':'---..','9':'----.'
};

// Level definitions
const LEVELS = [
  { name: 'Level 1 — The Basics',     chars: ['E','T'],                                               desc: 'dot & dash' },
  { name: 'Level 2 — Short Codes',    chars: ['A','I','M','N'],                                       desc: '2-symbol letters' },
  { name: 'Level 3 — Building Up',    chars: ['D','G','K','O','R','S','U','W'],                       desc: '3-symbol letters' },
  { name: 'Level 4 — Full Alphabet',  chars: ['B','C','F','H','J','L','P','Q','V','X','Y','Z'],       desc: '4-symbol letters' },
  { name: 'Level 5 — Numbers',        chars: ['0','1','2','3','4','5','6','7','8','9'],                desc: '0-9' },
  { name: 'Level 6 — A-Z Review',     chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),                  desc: 'all letters' },
  { name: 'Level 7 — Everything',     chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split(''),         desc: 'letters + numbers' },
  { name: 'Level 8 — Common Words',   chars: null, words: ['SOS','HI','OK','GO','NO','YES','HELP','CQ','73','88'], desc: 'words' },
  { name: 'Level 9 — Speed Round',    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),                  desc: 'timed!', timed: true, timeLimit: 6000 },
  { name: 'Level 10 — Free Practice', chars: null, practice: true,                                    desc: 'no pressure' },
];

const QUESTIONS_PER_LEVEL = 10;
const PASS_THRESHOLD = 8;

// State
let currentLevel = 0;
let currentChar = '';
let currentWord = '';
let currentWordIndex = 0;
let inputBuffer = '';
let score = 0;
let questionNum = 0;
let pressStart = 0;
let timerInterval = null;
let timerStart = 0;

// Elements
const $ = id => document.getElementById(id);

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem('morsebuddy') || '{}');
  } catch { return {}; }
}

function saveProgress(data) {
  localStorage.setItem('morsebuddy', JSON.stringify(data));
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
}

// MENU
function renderMenu() {
  const progress = loadProgress();
  const list = $('level-list');
  list.innerHTML = '';
  LEVELS.forEach((level, i) => {
    const btn = document.createElement('button');
    btn.className = 'level-btn';
    const unlocked = i === 0 || progress[`level_${i - 1}`];
    if (!unlocked) btn.classList.add('locked');

    const completed = progress[`level_${i}`];
    btn.innerHTML = `
      <div class="level-info">
        <span>${level.name}</span>
        <span class="level-chars">${level.desc}</span>
      </div>
      ${completed ? '<span class="check">&#10003;</span>' : ''}
    `;
    btn.addEventListener('click', () => {
      if (!unlocked) return;
      if (level.practice) {
        startPractice();
      } else {
        startLevel(i);
      }
    });
    list.appendChild(btn);
  });
  showScreen('menu-screen');
}

// GAME
function startLevel(levelIndex) {
  currentLevel = levelIndex;
  const level = LEVELS[levelIndex];
  score = 0;
  questionNum = 0;
  $('level-title').textContent = level.name;
  updateScore();

  // Remove old timer bar if any
  const oldTimer = document.querySelector('#game-screen .timer-bar-container');
  if (oldTimer) oldTimer.remove();

  // Add timer bar for speed round
  if (level.timed) {
    const container = document.createElement('div');
    container.className = 'timer-bar-container';
    container.innerHTML = '<div class="timer-bar" id="timer-bar"></div>';
    $('game-screen').querySelector('.prompt-area').before(container);
  }

  showScreen('game-screen');
  nextQuestion();
}

function nextQuestion() {
  const level = LEVELS[currentLevel];
  if (questionNum >= QUESTIONS_PER_LEVEL) {
    endLevel();
    return;
  }

  inputBuffer = '';
  updateInputDisplay('input-display');
  clearFeedback('feedback');

  if (level.words) {
    // Word mode: pick a random word, show it
    currentWord = level.words[Math.floor(Math.random() * level.words.length)];
    currentWordIndex = 0;
    currentChar = currentWord[0];
    $('prompt-char').textContent = currentWord;
    $('prompt-char').style.fontSize = currentWord.length > 3 ? '3.5rem' : '5rem';
  } else {
    currentWord = '';
    currentChar = level.chars[Math.floor(Math.random() * level.chars.length)];
    $('prompt-char').textContent = currentChar;
    $('prompt-char').style.fontSize = '5rem';
  }

  updateScore();

  // Start timer for speed round
  if (level.timed) startTimer(level.timeLimit);
}

function updateScore() {
  $('score-display').textContent = `${score} / ${questionNum}`;
}

function updateInputDisplay(elementId) {
  const el = $(elementId);
  el.textContent = inputBuffer || '\u00a0';
}

function clearFeedback(elementId) {
  const el = $(elementId);
  el.textContent = '';
  el.className = 'feedback';
}

function showFeedback(elementId, correct, expected) {
  const el = $(elementId);
  if (correct) {
    el.textContent = 'Correct!';
    el.className = 'feedback correct';
  } else {
    el.textContent = `Wrong — it's ${expected}`;
    el.className = 'feedback wrong';
  }
}

// Timer for speed round
function startTimer(ms) {
  clearInterval(timerInterval);
  timerStart = Date.now();
  const bar = $('timer-bar');
  if (!bar) return;
  bar.style.width = '100%';
  bar.classList.remove('warning');

  timerInterval = setInterval(() => {
    const elapsed = Date.now() - timerStart;
    const pct = Math.max(0, 1 - elapsed / ms) * 100;
    bar.style.width = pct + '%';
    if (pct < 30) bar.classList.add('warning');

    if (elapsed >= ms) {
      clearInterval(timerInterval);
      // Time's up — count as wrong
      handleAnswer(false, getExpected());
    }
  }, 50);
}

function getExpected() {
  if (LEVELS[currentLevel].words) {
    return currentWord.split('').map(c => MORSE[c]).join(' ');
  }
  return MORSE[currentChar];
}

// Check answer
async function checkAnswer() {
  const level = LEVELS[currentLevel];
  clearInterval(timerInterval);

  let expected, correct;

  if (level.words) {
    // For words: expected is each letter's morse separated by space
    expected = currentWord.split('').map(c => MORSE[c]).join(' ');
    // User input: dots/dashes with spaces between letters
    correct = inputBuffer.trim() === expected;
  } else {
    expected = MORSE[currentChar];
    correct = inputBuffer.trim() === expected;
  }

  // Also verify with backend
  try {
    const res = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ char: level.words ? currentWord : currentChar, input: inputBuffer.trim(), isWord: !!level.words })
    });
    const data = await res.json();
    correct = data.correct;
    expected = data.expected;
  } catch {
    // Offline fallback: use client-side check
  }

  handleAnswer(correct, expected);
}

function handleAnswer(correct, expected) {
  if (correct) score++;
  questionNum++;
  showFeedback('feedback', correct, expected);
  if (navigator.vibrate) navigator.vibrate(correct ? 50 : [100, 50, 100]);

  setTimeout(() => nextQuestion(), correct ? 800 : 1500);
}

function endLevel() {
  clearInterval(timerInterval);
  const passed = score >= PASS_THRESHOLD;

  $('complete-title').textContent = passed ? 'Level Complete!' : 'Not Quite...';
  $('complete-score').textContent = `You got ${score} out of ${QUESTIONS_PER_LEVEL}`;
  $('complete-msg').textContent = passed
    ? 'Nice work! Keep going.'
    : `You need ${PASS_THRESHOLD} to pass. Try again!`;

  // Show/hide next level button
  const nextExists = currentLevel + 1 < LEVELS.length;
  $('next-level-btn').style.display = (passed && nextExists) ? '' : 'none';

  if (passed) {
    const progress = loadProgress();
    progress[`level_${currentLevel}`] = true;
    saveProgress(progress);
  }

  showScreen('complete-screen');
}

// TAP BUTTON LOGIC
function setupTapButton(btnId, inputDisplayId) {
  const btn = $(btnId);

  function onDown(e) {
    e.preventDefault();
    pressStart = Date.now();
    btn.classList.add('pressing');
  }

  function onUp(e) {
    e.preventDefault();
    if (!pressStart) return;
    const duration = Date.now() - pressStart;
    pressStart = 0;
    btn.classList.remove('pressing');

    const isWord = LEVELS[currentLevel] && LEVELS[currentLevel].words;
    if (duration < 200) {
      inputBuffer += '.';
    } else {
      inputBuffer += '-';
    }
    updateInputDisplay(inputDisplayId);

    if (navigator.vibrate) navigator.vibrate(duration < 200 ? 20 : 40);
  }

  btn.addEventListener('pointerdown', onDown);
  btn.addEventListener('pointerup', onUp);
  btn.addEventListener('pointerleave', () => {
    pressStart = 0;
    btn.classList.remove('pressing');
  });
  // Prevent context menu on long press
  btn.addEventListener('contextmenu', e => e.preventDefault());
}

// WORD MODE: space key or button to separate letters
document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen && (activeScreen.id === 'game-screen' || activeScreen.id === 'practice-screen')) {
      inputBuffer += ' ';
      const displayId = activeScreen.id === 'game-screen' ? 'input-display' : 'practice-input';
      updateInputDisplay(displayId);
    }
  }
});

// Add space button for word levels
function addSpaceButton() {
  // Check if already exists
  if (document.getElementById('space-btn')) return;
  const row = document.querySelector('#game-screen .action-row');
  const spaceBtn = document.createElement('button');
  spaceBtn.id = 'space-btn';
  spaceBtn.className = 'action-btn';
  spaceBtn.textContent = 'Space';
  spaceBtn.addEventListener('click', () => {
    inputBuffer += ' ';
    updateInputDisplay('input-display');
  });
  row.insertBefore(spaceBtn, $('submit-btn'));
}

function removeSpaceButton() {
  const btn = document.getElementById('space-btn');
  if (btn) btn.remove();
}

// FREE PRACTICE
function startPractice() {
  const allChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
  currentChar = allChars[Math.floor(Math.random() * allChars.length)];
  inputBuffer = '';
  $('practice-char').textContent = currentChar;
  updateInputDisplay('practice-input');
  clearFeedback('practice-feedback');
  $('practice-ref').textContent = `Hint: ${currentChar} = ${MORSE[currentChar]}`;
  showScreen('practice-screen');
}

function practiceCheck() {
  const expected = MORSE[currentChar];
  const correct = inputBuffer.trim() === expected;
  showFeedback('practice-feedback', correct, expected);
  if (navigator.vibrate) navigator.vibrate(correct ? 50 : [100, 50, 100]);
  setTimeout(() => {
    inputBuffer = '';
    updateInputDisplay('practice-input');
    const allChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    currentChar = allChars[Math.floor(Math.random() * allChars.length)];
    $('practice-char').textContent = currentChar;
    clearFeedback('practice-feedback');
    $('practice-ref').textContent = `Hint: ${currentChar} = ${MORSE[currentChar]}`;
  }, 1000);
}

// WIRE UP EVENTS
function init() {
  setupTapButton('tap-btn', 'input-display');
  setupTapButton('practice-tap-btn', 'practice-input');

  $('clear-btn').addEventListener('click', () => {
    inputBuffer = '';
    updateInputDisplay('input-display');
  });

  $('submit-btn').addEventListener('click', () => checkAnswer());

  $('back-btn').addEventListener('click', () => {
    clearInterval(timerInterval);
    removeSpaceButton();
    renderMenu();
  });

  $('next-level-btn').addEventListener('click', () => {
    removeSpaceButton();
    if (currentLevel + 1 < LEVELS.length) {
      const next = LEVELS[currentLevel + 1];
      if (next.practice) {
        startPractice();
      } else {
        startLevel(currentLevel + 1);
      }
    }
  });

  $('retry-btn').addEventListener('click', () => startLevel(currentLevel));
  $('menu-btn').addEventListener('click', () => {
    removeSpaceButton();
    renderMenu();
  });

  // Practice controls
  $('practice-clear-btn').addEventListener('click', () => {
    inputBuffer = '';
    updateInputDisplay('practice-input');
  });
  $('practice-submit-btn').addEventListener('click', () => practiceCheck());
  $('practice-skip-btn').addEventListener('click', () => {
    inputBuffer = '';
    updateInputDisplay('practice-input');
    clearFeedback('practice-feedback');
    const allChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    currentChar = allChars[Math.floor(Math.random() * allChars.length)];
    $('practice-char').textContent = currentChar;
    $('practice-ref').textContent = `Hint: ${currentChar} = ${MORSE[currentChar]}`;
  });
  $('practice-back-btn').addEventListener('click', () => renderMenu());

  // Watch for word-level to add/remove space button
  const origNextQ = nextQuestion;

  renderMenu();
}

// Override nextQuestion to manage space button
const _origNextQuestion = nextQuestion;

// Patch startLevel to handle space button
const _origStartLevel = startLevel;
startLevel = function(levelIndex) {
  removeSpaceButton();
  _origStartLevel(levelIndex);
  if (LEVELS[levelIndex].words) {
    addSpaceButton();
  }
};

init();
