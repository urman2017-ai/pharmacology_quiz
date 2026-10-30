// State
let pool = [];
let idx = 0;
let correctCount = 0;
let answered = false;
let currentCat = "all";

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
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function startQuiz(cat) {
  currentCat = cat;
  if (typeof QUESTIONS === "undefined" || !QUESTIONS.length) {
    alert("Вопросы не загрузились. Обнови страницу.");
    return;
  }
  pool = QUESTIONS.filter((q) => cat === "all" || q.cat === cat);
  pool = shuffle([...pool]);
  idx = 0;
  correctCount = 0;
  answered = false;
  show("quiz");
  renderQuestion();
}

function renderQuestion() {
  answered = false;
  const nextBtn = $("btn-next");
  nextBtn.disabled = true;
  nextBtn.textContent = idx === pool.length - 1 ? "Завершить" : "Далее";
  $("q-num").textContent = `Вопрос ${idx + 1} из ${pool.length}`;
  $("score-live").textContent = `Верно: ${correctCount}`;
  $("progress").style.width = `${(idx / pool.length) * 100}%`;

  const item = pool[idx];
  $("q-text").textContent = item.q;
  $("explanation").className = "explanation";
  $("explanation").textContent = "";

  const opts = $("options");
  opts.innerHTML = "";
  item.options.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option";
    btn.textContent = text;
    btn.addEventListener("click", () => selectOption(i, btn));
    opts.appendChild(btn);
  });
}

function selectOption(i, btn) {
  if (answered) return;
  answered = true;
  const item = pool[idx];
  const all = [...$("options").children];
  all.forEach((b) => { b.disabled = true; });

  btn.classList.add("selected");
  if (i === item.correct) {
    btn.classList.add("correct");
    correctCount++;
    $("explanation").className = "explanation show ok";
    $("explanation").textContent = "✓ Верно. " + item.exp;
  } else {
    btn.classList.add("wrong");
    all[item.correct].classList.add("correct");
    $("explanation").className = "explanation show bad";
    $("explanation").textContent = "✗ Неверно. " + item.exp;
  }
  $("score-live").textContent = `Верно: ${correctCount}`;
  $("btn-next").disabled = false;
}

function next() {
  if (idx < pool.length - 1) {
    idx++;
    renderQuestion();
  } else {
    finish();
  }
}

function finish() {
  const pct = Math.round((correctCount / pool.length) * 100);
  $("final-score").textContent = pct + "%";
  $("final-score").className = "score-big " + (pct >= 80 ? "good" : pct >= 50 ? "mid" : "bad");
  $("final-detail").textContent = `Правильных ответов: ${correctCount} из ${pool.length}`;
  $("progress").style.width = "100%";
  show("results");
}

document.querySelectorAll(".cat-card").forEach((card) => {
  card.addEventListener("click", () => startQuiz(card.dataset.cat));
});
$("btn-next").addEventListener("click", next);
$("btn-home").addEventListener("click", () => show("home"));
$("btn-to-home").addEventListener("click", () => show("home"));
$("btn-retry").addEventListener("click", () => startQuiz(currentCat));
