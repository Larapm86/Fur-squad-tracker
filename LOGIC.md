# Fur Squad Tracker — Logic Summary

A short, user-friendly overview of how the game works. Use this for GitHub notes or onboarding.

---

## 🎯 What the game does

- **Goal:** Count the right number of cats and dogs in each round (one of each per round).
- **Win:** Finish all 6 rounds with **3 dogs** and **3 cats** → success screen.
- **Lose:** Finish with any other total → failure screen (you can still tap "Play again").

---

## 📱 Screens (in order)

| Screen | What you see |
|--------|----------------|
| **Start** | Headline, subheadline, **Start** button. |
| **3, 2, 1** | Countdown in the middle; headline/subheadline hidden. |
| **Play** | One random animal (gif), progress bar under it, **Cats** and **Dogs** counters with + / −. |
| **Success** | Black success message (subheadline style), plant gif, **Play again**. |
| **Failure** | Black failure message (subheadline style), cat-with-balloon gif, **Play again**. |

---

## 🐾 Game flow (high level)

1. User taps **Start** → 3, 2, 1 countdown.
2. After countdown → first **random** animal appears + progress bar + counters.
3. Each round: user has one animal to count. They tap **+** once for the correct team (Cats or Dogs).
4. **Correct guess** → short success message over the gif, then next animal (new round).
5. **Wrong or time runs out** → round still advances; game tracks that it wasn’t a “perfect” run.
6. After **6 rounds** → end screen: **success** if score is 3 dogs & 3 cats, otherwise **failure**.

---

## ➕➖ Counter rules (user-friendly)

- **At the start of each round:** both **Cats** and **Dogs** + and − are active.
- **After you tap + once (e.g. Cats +):**
  - That team’s **+** turns off (you’ve already added 1).
  - That team’s **−** stays on (you can undo).
  - The **other** team’s buttons turn off (so you don’t add the wrong animal).
- **If you tap − and undo:** counts go back and **all** counter buttons become active again for that round.
- **During the short “success” message:** all counter buttons are disabled so one tap = one animal (no double-tap).
- **Scores:** Only **+1** or **−1** per tap; minus is disabled when that team’s count is 0.

---

## 🎲 Random animal order

- Every **new game**, the **order of the 6 animals** is shuffled.
- So each run can be: e.g. cat → dog → cute cat → annoying dog → black cat → dog2 (order changes each time).

---

## ⏱️ Timers and delays

- **Per-round timer:** Progress bar fills over **5 seconds**. If it reaches 100% before a correct guess, the round advances anyway (no “correct guess” message).
- **After a correct guess:** Success message shows for **1.5 seconds**, then the next round starts.
- **3, 2, 1:** One number per second (3 → 2 → 1), then the first round starts.

---

## 💾 What we remember

- **Scores** (Cats and Dogs) are saved in the browser (**localStorage**) so they persist on refresh.
- We do **not** persist: current round, animal order, or whether you’re on start/play/end screen (those reset on refresh).

---

## 🏆 Special case: “Bravo”

- If the saved scores ever show **8 Dogs** and **6 Cats**, the app shows a special **Bravo** screen (video + confetti) instead of the normal end screen. That’s an Easter egg / bonus state.

---

## 📐 Layout and UI (for notes)

- **Start** and **end** screens: content aligned from the **top** (same idea as “subheadline” position).
- **Success / failure message:** In the **subheadline** position (above the gif), **16px** below the text to the gif, **16px** font, **black**.
- **Headline** is hidden on play and end screens; only the start screen shows headline + subheadline.
- **Progress bar** sits **below** the gif; when the success message shows, the bar is hidden but its space is kept so the layout doesn’t jump.
- **Counters** are in a fixed-height area so they don’t jump when the success message appears.

---

*Short version: count one cat or dog per round with + (and − to undo), finish with 3 and 3 to win; animal order is random each game; one tap per animal, timers and messages handle the rest.*
