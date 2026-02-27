// ─── WORD BANKS ───────────────────────────────────────────────
const BANKS = {
  easy: ["the","be","to","of","and","a","in","that","have","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","people","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us"],
  medium: ["ability","absence","abstract","accept","account","achieve","acquire","address","advance","affect","afford","against","agency","agenda","agree","allied","amount","ancient","anger","answer","appeal","apply","argue","arise","arrive","aspect","assign","assume","attach","attempt","attend","attract","avoid","balance","battle","belief","benefit","beyond","border","break","bring","build","burden","capture","career","careful","central","certain","change","charge","choose","circle","claim","clear","close","common","complex","concept","concern","connect","consist","control","create","credit","culture","damage","debate","decide","defend","define","degree","design","detect","develop","differ","direct","discuss","disease","divide","domain","double","effect","effort","either","enable","engage","ensure","entire","escape","establish","examine","exceed","exist","expect"],
  hard: ["aberration","abysmal","accomplishment","acknowledgment","acquaintance","acquisition","administration","advantageous","affiliation","aggravation","ameliorate","anachronism","anticipation","approximately","archaeological","articulation","assassination","authentication","bureaucratic","catastrophic","chronological","circumference","collaboration","commemorate","complicated","comprehensive","concentration","consequently","constitution","controversial","coordination","correspondence","deterioration","development","differentiate","disappointment","discrimination","disintegration","documentation","ecclesiastical","electromagnetic","embarrassment","enlightenment","environmental","establishment","exaggeration","exhilaration","extraordinary","fluorescence","fundamental","globalization","hallucination","humanitarian","hypothetically","identification","implementation","incandescent","incomprehensible","inconvenience","infrastructure","instantaneous"],
  numbers: ["42","100","2024","3.14","1000","256","404","500","1024","99","7","365","12","60","1337","2048","9999","128","0","777","31415","2718","6174","8675","1001","2310","4096","16384","32767","65536","1729","2520","3367","9801","4321","1234","9876","5678","3141","2718","1618","1414","1732","2236","2449","2646","2828","3000","3162","3317"],
  punctuation: ["hello,","world!","it's","don't","can't","I've","you're","they're","we'll","he's","she'd","won't","isn't","aren't","wasn't","weren't","hasn't","haven't","doesn't","didn't","couldn't","wouldn't","shouldn't","that's","who's","what's","where's","when's","here's","there's","let's","I'm","you've","we're","they've","I'd","you'd","he'd","she'd","we'd","they'd","I'll","you'll","he'll","she'll","we'll","they'll","it'd","it'll","that'd","that'll","who'd","who'll"]
};

// ─── STATE ────────────────────────────────────────────────────
let words = [];
let currentWordIdx = 0;
let currentCharIdx = 0;
let totalCharsTyped = 0;
let totalErrors = 0;
let correctWords = 0;
let timer = null;
let timeLeft = 60;
let started = false;
let finished = false;
let difficulty = 'easy';
const TIMER_DURATION = 60;
const CIRCUMFERENCE = 163.4;

// ─── DOM ──────────────────────────────────────────────────────
const display = document.getElementById('word-display');
const input = document.getElementById('typing-input');
const liveWpm = document.getElementById('live-wpm');
const liveAcc = document.getElementById('live-acc');
const liveErrors = document.getElementById('live-errors');
const timerText = document.getElementById('timer-text');
const timerCircle = document.getElementById('timer-circle');
const progBar = document.getElementById('prog-bar');
const resultsPanel = document.getElementById('results-panel');
const mainCard = document.getElementById('main-card');

// ─── GENERATE WORDS ───────────────────────────────────────────
function generateWords(count = 80) {
  const bank = BANKS[difficulty];
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(bank[Math.floor(Math.random() * bank.length)]);
  }
  return result;
}

// ─── RENDER WORDS ─────────────────────────────────────────────
function renderWords() {
  display.innerHTML = '';
  words.forEach((word, wi) => {
    const wordEl = document.createElement('span');
    wordEl.className = 'word';
    wordEl.dataset.index = wi;
    word.split('').forEach((ch) => {
      const charEl = document.createElement('span');
      charEl.className = 'char';
      charEl.textContent = ch;
      wordEl.appendChild(charEl);
    });
    display.appendChild(wordEl);
    if (wi < words.length - 1) {
      display.appendChild(document.createTextNode(' '));
    }
  });
  setCursor();
}

// ─── CURSOR ───────────────────────────────────────────────────
function setCursor() {
  document.querySelectorAll('.char.cursor').forEach(el => el.classList.remove('cursor'));
  const wordEl = display.querySelector(`[data-index="${currentWordIdx}"]`);
  if (!wordEl) return;
  const chars = wordEl.querySelectorAll('.char');
  const target = chars[currentCharIdx] || chars[chars.length - 1];
  if (target) {
    target.classList.add('cursor');
    scrollToCursor(wordEl);
  }
}

function scrollToCursor(wordEl) {
  const containerTop = display.getBoundingClientRect().top;
  const wordTop = wordEl.getBoundingClientRect().top;
  const offset = wordTop - containerTop;
  if (offset > 80) {
    display.scrollTop += offset - 40;
  }
}

// ─── TIMER ────────────────────────────────────────────────────
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerText.textContent = timeLeft;
    const pct = timeLeft / TIMER_DURATION;
    timerCircle.style.strokeDashoffset = CIRCUMFERENCE * (1 - pct);
    if (timeLeft <= 10) timerCircle.style.stroke = 'var(--accent2)';
    updateLiveStats();
    if (timeLeft <= 0) endTest();
  }, 1000);
}

// ─── LIVE STATS ───────────────────────────────────────────────
function updateLiveStats() {
  const elapsed = TIMER_DURATION - timeLeft;
  if (elapsed === 0) return;
  const wpm = Math.round((correctWords / elapsed) * 60);
  liveWpm.textContent = wpm;
  liveErrors.textContent = totalErrors;
  if (totalCharsTyped > 0) {
    const acc = Math.round(((totalCharsTyped - totalErrors) / totalCharsTyped) * 100);
    liveAcc.textContent = acc + '%';
  }
  progBar.style.width = Math.min((currentWordIdx / words.length) * 100, 100) + '%';
}

// ─── INPUT HANDLING ───────────────────────────────────────────
input.addEventListener('input', handleInput);

function handleInput() {
  if (finished) return;
  if (!started) {
    started = true;
    startTimer();
    input.placeholder = '';
  }

  const val = input.value;

  if (val.endsWith(' ')) {
    submitWord(val.trim());
    return;
  }

  totalCharsTyped++;
  currentCharIdx = val.length;

  const wordEl = display.querySelector(`[data-index="${currentWordIdx}"]`);
  if (!wordEl) return;
  const chars = wordEl.querySelectorAll('.char');

  chars.forEach((ch, i) => {
    ch.classList.remove('correct', 'incorrect', 'current');
    if (i < val.length) {
      if (val[i] === words[currentWordIdx][i]) {
        ch.classList.add('correct');
      } else {
        ch.classList.add('incorrect');
        if (i === val.length - 1) totalErrors++;
      }
    }
  });

  let hasError = false;
  for (let i = 0; i < val.length; i++) {
    if (val[i] !== words[currentWordIdx][i]) { hasError = true; break; }
  }

  if (hasError) {
    input.classList.add('error');
    setTimeout(() => input.classList.remove('error'), 200);
  } else {
    input.classList.remove('error');
  }

  currentCharIdx = val.length;
  setCursor();
  updateLiveStats();
}

// ─── SUBMIT WORD ──────────────────────────────────────────────
function submitWord(typed) {
  const word = words[currentWordIdx];
  const correct = typed === word;
  if (correct) correctWords++;
  else totalErrors++;

  const wordEl = display.querySelector(`[data-index="${currentWordIdx}"]`);
  if (wordEl) {
    const chars = wordEl.querySelectorAll('.char');
    chars.forEach((ch, i) => {
      ch.classList.remove('correct', 'incorrect', 'cursor');
      if (correct) {
        ch.classList.add('correct');
      } else if (i < typed.length && typed[i] === word[i]) {
        ch.classList.add('correct');
      } else {
        ch.classList.add('incorrect');
      }
    });
  }

  currentWordIdx++;
  currentCharIdx = 0;
  input.value = '';
  input.classList.remove('error');
  setCursor();
  updateLiveStats();

  // Load more words if needed
  if (currentWordIdx >= words.length) {
    const newWords = generateWords(40);
    words = words.concat(newWords);
    newWords.forEach((word, wi) => {
      const actualIdx = words.length - newWords.length + wi;
      const newWordEl = document.createElement('span');
      newWordEl.className = 'word';
      newWordEl.dataset.index = actualIdx;
      word.split('').forEach((ch) => {
        const charEl = document.createElement('span');
        charEl.className = 'char';
        charEl.textContent = ch;
        newWordEl.appendChild(charEl);
      });
      display.appendChild(document.createTextNode(' '));
      display.appendChild(newWordEl);
    });
    setCursor();
  }
}

// ─── END TEST ─────────────────────────────────────────────────
function endTest() {
  clearInterval(timer);
  finished = true;
  input.disabled = true;

  const wpm = Math.round((correctWords / TIMER_DURATION) * 60);
  const acc = totalCharsTyped > 0
    ? Math.round(((totalCharsTyped - totalErrors) / totalCharsTyped) * 100)
    : 100;

  document.getElementById('r-wpm').textContent = wpm;
  document.getElementById('r-acc').textContent = acc + '%';
  document.getElementById('r-chars').textContent = totalCharsTyped;
  document.getElementById('r-errors').textContent = totalErrors;
  document.getElementById('r-words').textContent = correctWords;

  const gradeEl = document.getElementById('r-grade');
  let grade, color;
  if (wpm >= 100)      { grade = '🏆 Blazing Fast';      color = '#e8ff47'; }
  else if (wpm >= 70)  { grade = '⚡ Fast Typer';         color = '#47ffb2'; }
  else if (wpm >= 50)  { grade = '✅ Good Speed';         color = '#47b2ff'; }
  else if (wpm >= 30)  { grade = '🌱 Keep Practicing';   color = '#ff9947'; }
  else                 { grade = '🐢 Slow and Steady';   color = '#ff4757'; }

  gradeEl.textContent = grade;
  gradeEl.style.background = color + '22';
  gradeEl.style.color = color;
  gradeEl.style.border = `1px solid ${color}44`;

  mainCard.style.display = 'none';
  resultsPanel.style.display = 'block';
}

// ─── RESET ────────────────────────────────────────────────────
function resetTest() {
  clearInterval(timer);
  words = generateWords(80);
  currentWordIdx = 0;
  currentCharIdx = 0;
  totalCharsTyped = 0;
  totalErrors = 0;
  correctWords = 0;
  timeLeft = TIMER_DURATION;
  started = false;
  finished = false;
  input.value = '';
  input.disabled = false;
  input.placeholder = 'Start typing to begin the test...';
  input.classList.remove('error');
  liveWpm.textContent = '0';
  liveAcc.textContent = '—';
  liveErrors.textContent = '0';
  timerText.textContent = TIMER_DURATION;
  timerCircle.style.strokeDashoffset = '0';
  timerCircle.style.stroke = 'var(--accent)';
  progBar.style.width = '0%';
  display.scrollTop = 0;
  resultsPanel.style.display = 'none';
  mainCard.style.display = 'block';
  renderWords();
  input.focus();
}

// ─── DIFFICULTY BUTTONS ───────────────────────────────────────
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    difficulty = btn.dataset.diff;
    resetTest();
  });
});

// ─── CONTROL BUTTONS ──────────────────────────────────────────
document.getElementById('btn-restart').addEventListener('click', resetTest);
document.getElementById('btn-new').addEventListener('click', resetTest);
document.getElementById('btn-retry').addEventListener('click', resetTest);

// ─── KEYBOARD SHORTCUTS ───────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Tab') { e.preventDefault(); resetTest(); }
  if (e.key === 'Escape') { e.preventDefault(); resetTest(); }
});

// ─── INIT ─────────────────────────────────────────────────────
resetTest();