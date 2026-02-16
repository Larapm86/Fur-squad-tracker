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
const headerImageEl = document.getElementById('header-image');
const headerVideoEl = document.getElementById('header-video');
const bravoConfettiEl = document.getElementById('bravo-confetti');

function displayScores() {
  scoreAEl.textContent = scoreA;
  scoreBEl.textContent = scoreB;
  saveScores();
  const isBravo = scoreA === 8 && scoreB === 6; /* 8 dogs, 6 cats */
  bravoWrapEl.hidden = !isBravo;
  if (isBravo) {
    headerImageEl.hidden = true;
    headerVideoEl.hidden = false;
    headerVideoEl.play().catch(() => {});
    bravoConfettiEl.hidden = false;
  } else {
    headerImageEl.hidden = false;
    headerVideoEl.hidden = true;
    headerVideoEl.pause();
    headerVideoEl.currentTime = 0;
    bravoConfettiEl.hidden = true;
  }
}

function incrementTeamA() {
  scoreA++;
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
  displayScores();
}

loadScores();

document.getElementById('plus1').addEventListener('click', incrementTeamA);
document.getElementById('minus1').addEventListener('click', decrementTeamA);
document.getElementById('plus2').addEventListener('click', incrementTeamB);
document.getElementById('minus2').addEventListener('click', decrementTeamB);
document.getElementById('reset').addEventListener('click', resetScores);
