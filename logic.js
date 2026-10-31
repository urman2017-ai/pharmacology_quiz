// State
let pool = [];
let idx = 0;
let correctCount = 0;
let answered = false;
let currentCat = "all";
let chainMode = false;
let chainOrder = ["la", "mimetics", "blockers", "classify"];
let chainPos = 0;

const CAT_LABELS = {
  all: "Все темы",
  la: "Местные анестетики",
  mimetics: "Адреномиметики",
  blockers: "Адреноблокаторы",
  classify: "Классификация и клиника"
};

const $ = (id) => document.getElementById(id);
const screens = {
  home: $("home"),
  quiz: $("quiz"),
  results: $("results")
};

function show(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
  window.scrollTo(0, 0);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function filterByCat(cat) {
  if (cat === "all") return QUESTIONS.slice();
  return QUESTIONS.filter((q) => q.cat === cat);
}

function startQuiz(cat, fromChain) {
  currentCat = cat;
  if (!fromChain) {
    chainMode = false;
    chainPos = chainOrder.indexOf(cat);
  }
  pool = shuffle(filterByCat(cat));
  idx = 0;
  correctCount = 0;
  answered = false;
  if (!pool.length) {
    alert("Нет вопросов в этой теме");
    return;
  }
  $("btn-next").disabled = true;
  show("quiz");
  renderQuestion();
}

function startChain() {
  chainMode = true;
  chainPos = 0;
  startQuiz(chainOrder[0], true);
}

function nextInChain() {
  chainPos++;
  if (chainPos >= chainOrder.length) {
    chainMode = false;
    show("home");
    return;
  }
  startQuiz(chainOrder[chainPos], true);
}

function renderQuestion() {
  answered = false;
  const q = pool[idx];
  $("q-num").textContent = "Вопрос " + (idx + 1) + " / " + pool.length;
  $("score-live").textContent = "Верно: " + correctCount;
  const topicEl = $("topic-label");
  if (topicEl) topicEl.textContent = CAT_LABELS[currentCat] || "";
  $("progress").style.width = ((idx / pool.length) * 100) + "%";
  $("q-text").textContent = q.q;
  $("explanation").className = "explanation";
  $("explanation").textContent = "";
  $("btn-next").disabled = true;
  $("btn-next").textContent = idx === pool.length - 1 ? "Итог" : "Далее";

  const box = $("options");
  box.innerHTML = "";
  q.options.forEach((opt, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "option";
    b.textContent = opt;
    b.addEventListener("click", () => selectAnswer(i));
    box.appendChild(b);
  });
}

function selectAnswer(i) {
  if (answered) return;
  answered = true;
  const q = pool[idx];
  const buttons = $("options").querySelectorAll(".option");
  buttons.forEach((b, j) => {
    b.disabled = true;
    if (j === q.correct) b.classList.add("correct");
    if (j === i && i !== q.correct) b.classList.add("wrong");
    if (j === i) b.classList.add("selected");
  });
  if (i === q.correct) correctCount++;
  $("score-live").textContent = "Верно: " + correctCount;
  const exp = $("explanation");
  exp.textContent = q.exp || "";
  exp.className = "explanation show " + (i === q.correct ? "ok" : "bad");
  $("btn-next").disabled = false;
  $("progress").style.width = (((idx + 1) / pool.length) * 100) + "%";
}

function nextQuestion() {
  if (!answered) return;
  if (idx >= pool.length - 1) {
    showResults();
    return;
  }
  idx++;
  renderQuestion();
}

function showResults() {
  const total = pool.length;
  const pct = Math.round((correctCount / total) * 100);
  const scoreEl = $("final-score");
  scoreEl.textContent = pct + "%";
  scoreEl.className = "score-big " + (pct >= 80 ? "good" : pct >= 50 ? "mid" : "bad");
  $("final-detail").textContent =
    correctCount + " из " + total + " · " + (CAT_LABELS[currentCat] || "");

  const nextBtn = $("btn-next-topic");
  const hint = $("next-topic-hint");
  if (chainMode && chainPos < chainOrder.length - 1) {
    const nextCat = chainOrder[chainPos + 1];
    nextBtn.style.display = "";
    nextBtn.textContent = "Следующая тема → " + CAT_LABELS[nextCat];
    if (hint) {
      hint.style.display = "";
      hint.textContent = "Можно сразу перейти дальше, не возвращаясь к списку";
    }
  } else if (!chainMode && currentCat !== "all" && chainOrder.includes(currentCat)) {
    const pos = chainOrder.indexOf(currentCat);
    if (pos < chainOrder.length - 1) {
      nextBtn.style.display = "";
      nextBtn.textContent = "Следующая тема → " + CAT_LABELS[chainOrder[pos + 1]];
      if (hint) {
        hint.style.display = "";
        hint.textContent = "Можно сразу перейти дальше, не возвращаясь к списку";
      }
    } else {
      nextBtn.style.display = "none";
      if (hint) hint.style.display = "none";
    }
  } else {
    nextBtn.style.display = "none";
    if (hint) hint.style.display = "none";
  }
  show("results");
}

function goNextTopic() {
  if (chainMode) {
    nextInChain();
    return;
  }
  const pos = chainOrder.indexOf(currentCat);
  if (pos >= 0 && pos < chainOrder.length - 1) {
    chainMode = true;
    chainPos = pos + 1;
    startQuiz(chainOrder[chainPos], true);
  } else {
    show("home");
  }
}

document.querySelectorAll(".cat-card").forEach((card) => {
  card.addEventListener("click", () => {
    const cat = card.getAttribute("data-cat");
    if (cat === "chain") startChain();
    else startQuiz(cat, false);
  });
});
$("btn-next").addEventListener("click", nextQuestion);
$("btn-home").addEventListener("click", () => {
  chainMode = false;
  show("home");
});
$("btn-to-home").addEventListener("click", () => {
  chainMode = false;
  show("home");
});
$("btn-retry").addEventListener("click", () => startQuiz(currentCat, chainMode));
$("btn-next-topic").addEventListener("click", goNextTopic);
