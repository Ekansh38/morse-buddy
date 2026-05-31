// Morse code lookup
const MORSE = {
  'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....',
  'I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.',
  'Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-',
  'Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-',
  '5':'.....','6':'-....','7':'--...','8':'---..','9':'----.'
};

// Cumulative level definitions - each level ADDS new chars to all previous ones
const LEVEL_NEW_CHARS = [
  ['E','T'],
  ['A','I','M','N'],
  ['D','G','K','O'],
  ['R','S','U','W'],
  ['B','C','F','H'],
  ['J','L','P','Q'],
  ['V','X','Y','Z'],
  ['0','1','2','3','4'],
  ['5','6','7','8','9'],
];

// Build cumulative char sets
function buildCumulativeChars() {
  const cumulative = [];
  let all = [];
  for (const group of LEVEL_NEW_CHARS) {
    all = all.concat(group);
    cumulative.push([...all]);
  }
  return cumulative;
}
const CUMULATIVE = buildCumulativeChars();

const LEVELS = [
  { name: 'Level 1: E and T',          chars: CUMULATIVE[0],  newChars: LEVEL_NEW_CHARS[0], desc: 'E T', questions: 8,  lives: 5 },
  { name: 'Level 2: + A I M N',        chars: CUMULATIVE[1],  newChars: LEVEL_NEW_CHARS[1], desc: '+ A I M N', questions: 10, lives: 4 },
  { name: 'Level 3: + D G K O',        chars: CUMULATIVE[2],  newChars: LEVEL_NEW_CHARS[2], desc: '+ D G K O', questions: 10, lives: 4 },
  { name: 'Level 4: + R S U W',        chars: CUMULATIVE[3],  newChars: LEVEL_NEW_CHARS[3], desc: '+ R S U W', questions: 12, lives: 4 },
  { name: 'Level 5: + B C F H',        chars: CUMULATIVE[4],  newChars: LEVEL_NEW_CHARS[4], desc: '+ B C F H', questions: 12, lives: 3 },
  { name: 'Level 6: + J L P Q',        chars: CUMULATIVE[5],  newChars: LEVEL_NEW_CHARS[5], desc: '+ J L P Q', questions: 12, lives: 3 },
  { name: 'Level 7: + V X Y Z',        chars: CUMULATIVE[6],  newChars: LEVEL_NEW_CHARS[6], desc: 'full alphabet!', questions: 14, lives: 3 },
  { name: 'Level 8: + 0-4',            chars: CUMULATIVE[7],  newChars: LEVEL_NEW_CHARS[7], desc: '+ numbers 0-4', questions: 12, lives: 3 },
  { name: 'Level 9: + 5-9',            chars: CUMULATIVE[8],  newChars: LEVEL_NEW_CHARS[8], desc: 'all chars!', questions: 14, lives: 3 },
  { name: 'Level 10: Survival',        chars: CUMULATIVE[8],  newChars: null, desc: 'how far can you go?', questions: Infinity, lives: 3, survival: true },
  { name: 'Level 11: Speed Round',     chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), newChars: null, desc: '5s per letter', questions: 15, lives: 3, timed: true, timeLimit: 5000 },
  { name: 'Level 12: Common Words',    chars: null, newChars: null, words: ['SOS','HI','OK','GO','NO','YES','HELP','CQ','73','88'], desc: 'tap full words', questions: 10, lives: 3 },
  { name: 'Level 13: Reverse Mode',    chars: CUMULATIVE[8],  newChars: null, desc: 'hear it, type the letter', questions: 12, lives: 3, reverse: true },
  { name: 'Level 14: Free Practice',   chars: null, newChars: null, practice: true, desc: 'no pressure' },
];

const AUTO_SUBMIT_DELAY = 1200;
const WORD_AUTO_SUBMIT_DELAY = 1800;

// Audio
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

let holdOsc = null;
let holdGain = null;

function startHoldTone(freq = 600) {
  const ctx = getAudioCtx();
  holdOsc = ctx.createOscillator();
  holdGain = ctx.createGain();
  holdOsc.type = 'sine';
  holdOsc.frequency.value = freq;
  holdGain.gain.value = 0.3;
  holdOsc.connect(holdGain);
  holdGain.connect(ctx.destination);
  holdOsc.start();
}

function stopHoldTone() {
  if (holdOsc) {
    try { holdOsc.stop(); } catch {}
    holdOsc = null;
    holdGain = null;
  }
}

function playTone(durationMs, freq = 600) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.value = 0.3;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + durationMs / 1000);
}

function playMorse(morseStr) {
  const ctx = getAudioCtx();
  let time = ctx.currentTime;
  const dotLen = 0.08;
  const dashLen = 0.24;
  const gap = 0.1;
  const letterGap = 0.3;

  for (const ch of morseStr) {
    if (ch === '.') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = 600; gain.gain.value = 0.3;
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(time); osc.stop(time + dotLen);
      time += dotLen + gap;
    } else if (ch === '-') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = 600; gain.gain.value = 0.3;
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(time); osc.stop(time + dashLen);
      time += dashLen + gap;
    } else if (ch === ' ') {
      time += letterGap;
    }
  }
  return time - ctx.currentTime; // return total duration in seconds
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
let pressStart = 0;
let timerInterval = null;
let timerStart = 0;
let autoSubmitTimeout = null;
let isProcessing = false;
let survivalHighScore = 0;

const $ = id => document.getElementById(id);

function loadProgress() {
  try { return JSON.parse(localStorage.getItem('morsebuddy') || '{}'); }
  catch { return {}; }
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
  survivalHighScore = progress.survivalHigh || 0;
  const list = $('level-list');
  list.innerHTML = '';
  LEVELS.forEach((level, i) => {
    const btn = document.createElement('button');
    btn.className = 'level-btn';
    const unlocked = i === 0 || progress[`level_${i - 1}`];
    if (!unlocked) btn.classList.add('locked');

    const completed = progress[`level_${i}`];
    let extra = '';
    if (level.survival && survivalHighScore > 0) extra = ` (best: ${survivalHighScore})`;

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
        startLevel(i);
      }
    });
    list.appendChild(btn);
  });
  showScreen('menu-screen');
}

// Weighted random: 60% chance of picking from new chars, 40% from old
function pickChar(level) {
  const newChars = level.newChars;
  const allChars = level.chars;
  if (!newChars || newChars.length === 0 || allChars.length === newChars.length) {
    return allChars[Math.floor(Math.random() * allChars.length)];
  }
  if (Math.random() < 0.6) {
    return newChars[Math.floor(Math.random() * newChars.length)];
  }
  return allChars[Math.floor(Math.random() * allChars.length)];
}

// GAME
function startLevel(levelIndex) {
  currentLevel = levelIndex;
  const level = LEVELS[levelIndex];
  score = 0;
  questionNum = 0;
  lives = level.lives || 3;
  maxLives = lives;
  isProcessing = false;
  $('level-title').textContent = level.name;
  updateHUD();

  // Remove old timer bar
  const oldTimer = document.querySelector('#game-screen .timer-bar-container');
  if (oldTimer) oldTimer.remove();

  if (level.timed) {
    const container = document.createElement('div');
    container.className = 'timer-bar-container';
    container.innerHTML = '<div class="timer-bar" id="timer-bar"></div>';
    $('game-screen').querySelector('.prompt-area').before(container);
  }

  // Reverse mode setup
  if (level.reverse) {
    $('prompt-label-text').textContent = 'You hear it. Type the letter!';
  } else {
    $('prompt-label-text').textContent = 'Tap the Morse code for';
  }

  removeSpaceButton();
  if (level.words) addSpaceButton();

  // For reverse mode, hide tap controls and show letter input
  document.querySelector('.reverse-area').style.display = level.reverse ? '' : 'none';
  $('input-display').style.display = level.reverse ? 'none' : '';
  $('tap-btn').style.display = level.reverse ? 'none' : '';
  $('clear-btn').style.display = level.reverse ? 'none' : '';

  showScreen('game-screen');
  nextQuestion();
}

function nextQuestion() {
  const level = LEVELS[currentLevel];

  if (lives <= 0) {
    endLevel();
    return;
  }
  if (!level.survival && questionNum >= level.questions) {
    endLevel();
    return;
  }

  inputBuffer = '';
  isProcessing = false;
  clearTimeout(autoSubmitTimeout);
  updateInputDisplay('input-display');
  clearFeedback('feedback');

  if (level.reverse) {
    // Reverse mode: play morse, user types the letter
    currentChar = pickChar(level);
    $('prompt-char').textContent = '?';
    $('prompt-char').style.fontSize = '5rem';
    $('reverse-input').value = '';
    $('reverse-input').focus();
    // Play the morse after a short delay
    setTimeout(() => playMorse(MORSE[currentChar]), 400);
  } else if (level.words) {
    currentWord = level.words[Math.floor(Math.random() * level.words.length)];
    currentChar = currentWord[0];
    $('prompt-char').textContent = currentWord;
    $('prompt-char').style.fontSize = currentWord.length > 3 ? '3.5rem' : '5rem';
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
  // Lives display
  let livesStr = '';
  for (let i = 0; i < maxLives; i++) {
    livesStr += i < lives ? '\u2764' : '\u2661';
  }
  if (level.survival) {
    $('score-display').textContent = `${livesStr}  #${questionNum}`;
  } else {
    $('score-display').textContent = `${livesStr}  ${questionNum}/${level.questions}`;
  }
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
    el.textContent = `Nope: ${expected}`;
    el.className = 'feedback wrong';
  }
}

// Timer
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
      handleAnswer(false, getExpected());
    }
  }, 50);
}

function getExpected() {
  const level = LEVELS[currentLevel];
  if (level && level.words) {
    return currentWord.split('').map(c => MORSE[c]).join(' ');
  }
  if (level && level.reverse) {
    return currentChar;
  }
  return MORSE[currentChar];
}

// Auto-submit
function scheduleAutoSubmit(displayId) {
  clearTimeout(autoSubmitTimeout);
  if (isProcessing) return;
  const level = LEVELS[currentLevel];
  const delay = (level && level.words) ? WORD_AUTO_SUBMIT_DELAY : AUTO_SUBMIT_DELAY;
  const isGameScreen = displayId === 'input-display';

  autoSubmitTimeout = setTimeout(() => {
    if (!inputBuffer.trim()) return;
    if (isGameScreen) {
      checkAnswer();
    } else {
      practiceCheck();
    }
  }, delay);
}

// Check answer
async function checkAnswer() {
  if (isProcessing) return;
  isProcessing = true;
  clearTimeout(autoSubmitTimeout);
  const level = LEVELS[currentLevel];
  clearInterval(timerInterval);

  let expected, correct;

  if (level.reverse) {
    // Reverse mode: compare typed letter
    const typed = $('reverse-input').value.trim().toUpperCase();
    expected = currentChar;
    correct = typed === expected;
  } else if (level.words) {
    expected = currentWord.split('').map(c => MORSE[c]).join(' ');
    correct = inputBuffer.trim() === expected;
  } else {
    expected = MORSE[currentChar];
    correct = inputBuffer.trim() === expected;
  }

  // Backend verify (skip for reverse mode)
  if (!level.reverse) {
    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ char: level.words ? currentWord : currentChar, input: inputBuffer.trim(), isWord: !!level.words })
      });
      const data = await res.json();
      correct = data.correct;
      expected = data.expected;
    } catch {}
  }

  handleAnswer(correct, expected);
}

function handleAnswer(correct, expected) {
  const level = LEVELS[currentLevel];
  if (correct) {
    score++;
  } else {
    lives--;
  }
  questionNum++;
  updateHUD();

  showFeedback('feedback', correct, expected);
  if (navigator.vibrate) navigator.vibrate(correct ? 50 : [100, 50, 100]);

  if (!correct) {
    if (level.reverse) {
      // Show the letter and play its morse
      $('prompt-char').textContent = currentChar;
      setTimeout(() => playMorse(MORSE[currentChar]), 300);
    } else {
      setTimeout(() => playMorse(expected), 300);
    }
  }

  const delay = correct ? 800 : 2000;
  setTimeout(() => nextQuestion(), delay);
}

function endLevel() {
  clearInterval(timerInterval);
  clearTimeout(autoSubmitTimeout);
  const level = LEVELS[currentLevel];

  if (level.survival) {
    // Survival: save high score
    const progress = loadProgress();
    const prevHigh = progress.survivalHigh || 0;
    if (score > prevHigh) {
      progress.survivalHigh = score;
      saveProgress(progress);
    }
    // Always mark survival as "completed" so next level unlocks
    progress[`level_${currentLevel}`] = true;
    saveProgress(progress);

    $('complete-title').textContent = 'Game Over';
    $('complete-score').textContent = `You got ${score} correct`;
    const best = Math.max(score, prevHigh);
    $('complete-msg').textContent = score >= prevHigh && score > 0
      ? `New best! Previous: ${prevHigh}`
      : `Best: ${best}`;
  } else {
    const passed = lives > 0;
    $('complete-title').textContent = passed ? 'Level Complete!' : 'Out of Lives';
    $('complete-score').textContent = `${score} correct out of ${questionNum}`;
    $('complete-msg').textContent = passed
      ? `Finished with ${lives} ${lives === 1 ? 'life' : 'lives'} left`
      : 'Try again!';

    if (passed) {
      const progress = loadProgress();
      progress[`level_${currentLevel}`] = true;
      saveProgress(progress);
    }

    const nextExists = currentLevel + 1 < LEVELS.length;
    $('next-level-btn').style.display = (passed && nextExists) ? '' : 'none';
  }

  showScreen('complete-screen');
}

// TAP BUTTON LOGIC
function setupTapButton(btnId, inputDisplayId) {
  const btn = $(btnId);

  function onDown(e) {
    e.preventDefault();
    if (isProcessing) return;
    pressStart = Date.now();
    btn.classList.add('pressing');
    startHoldTone();
  }

  function onUp(e) {
    e.preventDefault();
    stopHoldTone();
    if (!pressStart || isProcessing) return;
    const duration = Date.now() - pressStart;
    pressStart = 0;
    btn.classList.remove('pressing');

    if (duration < 200) {
      inputBuffer += '.';
    } else {
      inputBuffer += '-';
    }
    updateInputDisplay(inputDisplayId);
    if (navigator.vibrate) navigator.vibrate(duration < 200 ? 20 : 40);
    scheduleAutoSubmit(inputDisplayId);
  }

  btn.addEventListener('pointerdown', onDown);
  btn.addEventListener('pointerup', onUp);
  btn.addEventListener('pointerleave', () => {
    stopHoldTone();
    pressStart = 0;
    btn.classList.remove('pressing');
  });
  btn.addEventListener('contextmenu', e => e.preventDefault());
}

// Space key for word levels
document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen && (activeScreen.id === 'game-screen' || activeScreen.id === 'practice-screen')) {
      // Don't prevent default if reverse-input is focused
      const level = LEVELS[currentLevel];
      if (level && level.reverse) return;
      e.preventDefault();
      inputBuffer += ' ';
      const displayId = activeScreen.id === 'game-screen' ? 'input-display' : 'practice-input';
      updateInputDisplay(displayId);
      scheduleAutoSubmit(displayId);
    }
  }
});

// Space button for word levels
function addSpaceButton() {
  if (document.getElementById('space-btn')) return;
  const row = document.querySelector('#game-screen .action-row');
  const spaceBtn = document.createElement('button');
  spaceBtn.id = 'space-btn';
  spaceBtn.className = 'action-btn';
  spaceBtn.textContent = 'Space';
  spaceBtn.addEventListener('click', () => {
    inputBuffer += ' ';
    updateInputDisplay('input-display');
    scheduleAutoSubmit('input-display');
  });
  row.appendChild(spaceBtn);
}

function removeSpaceButton() {
  const btn = document.getElementById('space-btn');
  if (btn) btn.remove();
}

// FREE PRACTICE
function startPractice() {
  isProcessing = false;
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
  if (isProcessing) return;
  isProcessing = true;
  clearTimeout(autoSubmitTimeout);
  const expected = MORSE[currentChar];
  const correct = inputBuffer.trim() === expected;
  showFeedback('practice-feedback', correct, expected);
  if (navigator.vibrate) navigator.vibrate(correct ? 50 : [100, 50, 100]);

  if (!correct) {
    setTimeout(() => playMorse(expected), 300);
  }

  setTimeout(() => {
    isProcessing = false;
    inputBuffer = '';
    updateInputDisplay('practice-input');
    const allChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    currentChar = allChars[Math.floor(Math.random() * allChars.length)];
    $('practice-char').textContent = currentChar;
    clearFeedback('practice-feedback');
    $('practice-ref').textContent = `Hint: ${currentChar} = ${MORSE[currentChar]}`;
  }, correct ? 800 : 1800);
}

// Reverse mode: submit on Enter
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const level = LEVELS[currentLevel];
    if (level && level.reverse && document.querySelector('#game-screen.active')) {
      e.preventDefault();
      checkAnswer();
    }
  }
});

// WIRE UP EVENTS
function init() {
  setupTapButton('tap-btn', 'input-display');
  setupTapButton('practice-tap-btn', 'practice-input');

  $('clear-btn').addEventListener('click', () => {
    inputBuffer = '';
    clearTimeout(autoSubmitTimeout);
    updateInputDisplay('input-display');
  });

  $('hear-btn').addEventListener('click', () => {
    const level = LEVELS[currentLevel];
    if (level && level.reverse) {
      playMorse(MORSE[currentChar]);
    } else {
      playMorse(getExpected());
    }
  });

  $('back-btn').addEventListener('click', () => {
    clearInterval(timerInterval);
    clearTimeout(autoSubmitTimeout);
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
    clearTimeout(autoSubmitTimeout);
    updateInputDisplay('practice-input');
  });
  $('practice-hear-btn').addEventListener('click', () => {
    playMorse(MORSE[currentChar]);
  });
  $('practice-skip-btn').addEventListener('click', () => {
    isProcessing = false;
    inputBuffer = '';
    clearTimeout(autoSubmitTimeout);
    updateInputDisplay('practice-input');
    clearFeedback('practice-feedback');
    const allChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    currentChar = allChars[Math.floor(Math.random() * allChars.length)];
    $('practice-char').textContent = currentChar;
    $('practice-ref').textContent = `Hint: ${currentChar} = ${MORSE[currentChar]}`;
  });
  $('practice-back-btn').addEventListener('click', () => {
    clearTimeout(autoSubmitTimeout);
    renderMenu();
  });

  // Reverse mode submit button
  $('reverse-submit-btn').addEventListener('click', () => checkAnswer());

  renderMenu();
}

init();
