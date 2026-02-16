const STORAGE_KEY = 'scoreKeeper';

const scoreAEl = document.getElementById('score1');
const scoreBEl = document.getElementById('score2');

let scoreA = 0;
let scoreB = 0;

function saveScores() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ scoreA, scoreB }));
}

function loadScores() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { scoreA: a, scoreB: b } = JSON.parse(saved);
      scoreA = Number(a) || 0;
      scoreB = Number(b) || 0;
    }
  } catch (_) {
    // ignore invalid or missing data
  }
  displayScores();
}

const bravoWrapEl = document.getElementById('bravo-wrap');
const headerCatEl = document.getElementById('header-cat');
const headerDogEl = document.getElementById('header-dog');
const headerDog2El = document.getElementById('header-dog2');
const headerCuteCatEl = document.getElementById('header-cute-cat');
const headerAnnoyingDogEl = document.getElementById('header-annoying-dog');
const headerNyanCatEl = document.getElementById('header-nyan-cat');
const headerPlantEl = document.getElementById('header-plant');
const headerCatnapEl = document.getElementById('header-catnap');
const headerCatMadEl = document.getElementById('header-cat-mad');
const headerCountdownEl = document.getElementById('header-countdown');
const headerCountdownFillEl = document.getElementById('header-countdown-fill');
const headerVideoEl = document.getElementById('header-video');
const bravoConfettiEl = document.getElementById('bravo-confetti');
const guessSuccessEl = document.getElementById('guess-success-message');
const scoreBoardEl = document.getElementById('score-board');
const allDoneMessageEl = document.getElementById('all-done-message');
const failureMessageEl = document.getElementById('failure-message');
const startWrapEl = document.getElementById('start-wrap');
const resetWrapEl = document.getElementById('reset-wrap');
const countdownOverlayEl = document.getElementById('countdown-overlay');

const headerImageEls = [headerCatEl, headerDogEl, headerDog2El, headerCuteCatEl, headerAnnoyingDogEl, headerNyanCatEl];
let gameStarted = false;
let headerPhase = -1; /* -1 = pre-game (3-2-1 countdown), 0-5 = phases, 6 = all done */
let allPhasesCorrectGuess = true; /* false if any phase was advanced by timeout */
let countdownCancelled = false;
let countdownRafId = null;
let guessSuccessTimeoutId = null;
let guessHoldTimeoutId = null;
const COUNTDOWN_DURATION_MS = 5000;
const GUESS_HOLD_MS = 1500;
const CAT_GUESS_MESSAGES = ['Purrfect!', 'Meow-velous!', 'Kitty-approved!'];
const DOG_GUESS_MESSAGES = ['Woof-tastic!', 'Bark yeah!', 'Paw-some!'];

function displayScores() {
  scoreAEl.textContent = scoreA;
  scoreBEl.textContent = scoreB;
  saveScores();
  if (!gameStarted) {
    scoreBoardEl.hidden = true;
    resetWrapEl.hidden = true;
    return;
  }
  const isBravo = scoreA === 8 && scoreB === 6; /* 8 dogs, 6 cats */
  bravoWrapEl.hidden = !isBravo;
  if (isBravo) {
    headerImageEls.forEach(el => { el.hidden = true; });
    headerVideoEl.hidden = false;
    headerVideoEl.play().catch(() => {});
    bravoConfettiEl.hidden = false;
    resetWrapEl.hidden = false;
  } else {
    headerVideoEl.hidden = true;
    headerVideoEl.pause();
    headerVideoEl.currentTime = 0;
    bravoConfettiEl.hidden = true;
    if (headerPhase === 6) {
      /* Success only when final scores are 3 dogs and 3 cats */
      const succeeded = scoreA === 3 && scoreB === 3;
      headerPlantEl.hidden = !succeeded;
      headerCatnapEl.hidden = true;
      headerCatMadEl.hidden = succeeded;
    } else {
      headerPlantEl.hidden = true;
      headerCatnapEl.hidden = true;
      headerCatMadEl.hidden = true;
    }
    if (headerPhase === -1) {
      headerCountdownEl.hidden = true;
      headerImageEls.forEach(el => { el.hidden = true; });
    } else {
      headerImageEls.forEach((el, i) => {
        el.hidden = headerPhase === 6 ? true : (headerPhase <= 5 ? i !== headerPhase : i !== 5);
      });
    }
    const isAllDone = headerPhase === 6;
    /* Show success only when cats === 3 and dogs === 3; otherwise show failure (mad cat + message) */
    const succeeded = isAllDone && scoreA === 3 && scoreB === 3;
    scoreBoardEl.hidden = isAllDone;
    resetWrapEl.hidden = !isAllDone;
    allDoneMessageEl.hidden = !succeeded;
    failureMessageEl.hidden = !isAllDone || succeeded;
  }
}

function showGuessSuccessAndHold() {
  if (guessHoldTimeoutId != null) return; /* already in hold, ignore extra taps */
  if (guessSuccessTimeoutId != null) clearTimeout(guessSuccessTimeoutId);
  if (guessHoldTimeoutId != null) clearTimeout(guessHoldTimeoutId);
  countdownCancelled = true;
  if (countdownRafId != null) {
    cancelAnimationFrame(countdownRafId);
    countdownRafId = null;
  }
  headerCountdownEl.hidden = true;
  const isCat = headerPhase === 0 || headerPhase === 3 || headerPhase === 5;
  const messages = isCat ? CAT_GUESS_MESSAGES : DOG_GUESS_MESSAGES;
  guessSuccessEl.textContent = messages[Math.floor(Math.random() * messages.length)];
  guessSuccessEl.hidden = false;
  guessHoldTimeoutId = setTimeout(() => {
    guessHoldTimeoutId = null;
    guessSuccessEl.hidden = true;
    headerCountdownEl.hidden = false;
    doAdvanceToNextPhase();
  }, GUESS_HOLD_MS);
}

function advanceToNextPhase(fromUserGuess) {
  if (fromUserGuess) {
    showGuessSuccessAndHold();
    return;
  }
  allPhasesCorrectGuess = false;
  doAdvanceToNextPhase();
}

function doAdvanceToNextPhase() {
  headerCountdownFillEl.style.width = '100%';
  headerCountdownEl.setAttribute('aria-valuenow', 100);
  headerImageEls.forEach(el => { el.hidden = true; });
  if (headerPhase === 0) {
    headerPhase = 1;
    headerDogEl.hidden = false;
    headerCountdownEl.hidden = true;
    runCountdown();
  } else if (headerPhase === 1) {
    headerPhase = 2;
    headerDog2El.hidden = false;
    headerCountdownEl.hidden = true;
    runCountdown();
  } else if (headerPhase === 2) {
    headerPhase = 3;
    headerCuteCatEl.hidden = false;
    headerCountdownEl.hidden = true;
    runCountdown();
  } else if (headerPhase === 3) {
    headerPhase = 4;
    headerAnnoyingDogEl.hidden = false;
    headerCountdownEl.hidden = true;
    runCountdown();
  } else if (headerPhase === 4) {
    headerPhase = 5;
    headerNyanCatEl.hidden = false;
    headerCountdownEl.hidden = true;
    runCountdown();
  } else {
    headerPhase = 6;
    headerImageEls.forEach(el => { el.hidden = true; });
    const succeeded = scoreA === 3 && scoreB === 3;
    headerPlantEl.hidden = !succeeded;
    headerCatnapEl.hidden = true;
    headerCatMadEl.hidden = succeeded;
    headerCountdownEl.hidden = true;
    displayScores();
  }
}

function runCountdown() {
  headerCountdownEl.hidden = false;
  headerCountdownFillEl.style.width = '0%';
  headerCountdownEl.setAttribute('aria-valuenow', 0);
  const start = performance.now();
  let prevElapsed = 0;

  function update(now) {
    if (countdownCancelled) return;
    let elapsed = (now - start);
    elapsed = Math.min(elapsed, prevElapsed + 150);
    prevElapsed = elapsed;
    const pct = Math.min(100, (elapsed / COUNTDOWN_DURATION_MS) * 100);
    headerCountdownFillEl.style.width = pct + '%';
    headerCountdownEl.setAttribute('aria-valuenow', Math.round(pct));
    if (pct >= 100) {
      countdownRafId = null;
      advanceToNextPhase(false);
      return;
    }
    countdownRafId = requestAnimationFrame(update);
  }
  countdownCancelled = false;
  countdownRafId = requestAnimationFrame(update);
}

function startCountdown() {
  countdownCancelled = false;
  runCountdown();
}

function incrementTeamA() {
  scoreA++;
  if (headerPhase === 1 || headerPhase === 2 || headerPhase === 4) advanceToNextPhase(true);
  displayScores();
}

function decrementTeamA() {
  if (scoreA > 0) {
    scoreA--;
    displayScores();
  }
}

function incrementTeamB() {
  scoreB++;
  if (headerPhase === 0 || headerPhase === 3 || headerPhase === 5) advanceToNextPhase(true);
  displayScores();
}

function decrementTeamB() {
  if (scoreB > 0) {
    scoreB--;
    displayScores();
  }
}

function resetScores() {
  scoreA = 0;
  scoreB = 0;
  countdownCancelled = true;
  if (countdownRafId != null) {
    cancelAnimationFrame(countdownRafId);
    countdownRafId = null;
  }
  if (guessSuccessTimeoutId != null) {
    clearTimeout(guessSuccessTimeoutId);
    guessSuccessTimeoutId = null;
  }
  if (guessHoldTimeoutId != null) {
    clearTimeout(guessHoldTimeoutId);
    guessHoldTimeoutId = null;
  }
  gameStarted = false;
  headerPhase = -1;
  bravoWrapEl.hidden = true;
  headerVideoEl.hidden = true;
  headerVideoEl.pause();
  headerVideoEl.currentTime = 0;
  bravoConfettiEl.hidden = true;
  showPreGameUI();
  displayScores();
}

function showPreGameUI() {
  headerImageEls.forEach(el => { el.hidden = true; });
  headerPlantEl.hidden = true;
  headerCatnapEl.hidden = true;
  headerCatMadEl.hidden = true;
  headerCountdownEl.hidden = true;
  headerCountdownFillEl.style.width = '0%';
  headerCountdownEl.setAttribute('aria-valuenow', 0);
  guessSuccessEl.hidden = true;
  countdownOverlayEl.hidden = true;
  countdownOverlayEl.textContent = '';
  startWrapEl.hidden = false;
  scoreBoardEl.hidden = true;
  resetWrapEl.hidden = true;
  allDoneMessageEl.hidden = true;
  failureMessageEl.hidden = true;
}

function runStartCountdown(callback) {
  countdownOverlayEl.hidden = false;
  countdownOverlayEl.textContent = '3';
  let step = 3;
  const tick = () => {
    step--;
    if (step > 0) {
      countdownOverlayEl.textContent = String(step);
      setTimeout(tick, 1000);
    } else {
      countdownOverlayEl.hidden = true;
      countdownOverlayEl.textContent = '';
      callback();
    }
  };
  setTimeout(tick, 1000);
}

function startGame() {
  scoreA = 0;
  scoreB = 0;
  startWrapEl.hidden = true;
  gameStarted = true;
  headerPhase = -1;
  scoreBoardEl.hidden = false;
  resetWrapEl.hidden = true;
  displayScores();
  runStartCountdown(() => {
    allPhasesCorrectGuess = true;
    headerPhase = 0;
    headerImageEls.forEach(el => { el.hidden = true; });
    headerCatEl.hidden = false;
    headerCountdownEl.hidden = false;
    headerCountdownFillEl.style.width = '0%';
    headerCountdownEl.setAttribute('aria-valuenow', 0);
    startCountdown();
    displayScores();
  });
}

loadScores();
if (!gameStarted) showPreGameUI();

document.getElementById('start').addEventListener('click', startGame);
document.getElementById('plus1').addEventListener('click', incrementTeamA);
document.getElementById('minus1').addEventListener('click', decrementTeamA);
document.getElementById('plus2').addEventListener('click', incrementTeamB);
document.getElementById('minus2').addEventListener('click', decrementTeamB);
document.getElementById('reset').addEventListener('click', resetScores);
