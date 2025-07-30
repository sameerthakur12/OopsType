let words = [];
let wordsCount = 0;
const gameTime = 30 * 1000;
window.timer = null;
window.gameStart = null;
window.pauseTime = 0;

const urlParams = new URLSearchParams(window.location.search);
const selectedLevel = urlParams.get("level") || "easy";

function loadParagraph(difficulty) {
  let url = "";

  switch (difficulty) {
    case "easy":
      url =
        "https://gist.githubusercontent.com/sameerthakur12/5eada1ab6c1f00b6d78004959002f1e3/raw/e8477ee24cd36635a074b4e5743e9b56c0744d95/easy-paragraph.txt";
      break;
    case "medium":
      url =
        "https://gist.githubusercontent.com/sameerthakur12/f54dd57b6484c3eeff615923ef8fbe90/raw/fca307f44dede634b9173a2cc4a704401aef350e/medium-paragraph.txt";
      break;
    case "pro":
      url =
        "https://gist.githubusercontent.com/sameerthakur12/50fb42df6ab0270fd548ab7a4d4fc395/raw/b9f225b9bac3186dafa8f309b01f465b7c24e125/pro-paragraph.txt";
      break;
    default:
      console.error("Invalid difficulty level");
      return;
  }
  fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch paragraph");
      return response.text();
    })
    .then((text) => {
      words = text.trim().split(/\s+/);
      wordsCount = words.length;
      newGame(); // now this will have data to use
    })
    .catch((error) => {
      console.error("Error loading paragraph:", error);
    });
}
loadParagraph(selectedLevel);

function addClass(el, name) {
  el.className += " " + name;
}

function removeClass(el, name) {
  el.className = el.className.replace(name, "");
}

function randomWord() {
  const randomIndex = Math.ceil(Math.random() * wordsCount);
  return words[randomIndex - 1];
}

function formatWord(word) {
  return `<div class="word"><span class="letter">${word
    .split("")
    .join('</span><span class="letter">')}</span></div>`;
}

function newGame() {
  document.getElementById("words").innerHTML = "";
  for (let i = 0; i < 200; i++) {
    document.getElementById("words").innerHTML += formatWord(randomWord());
  }
  addClass(document.querySelector(".word"), "current");
  addClass(document.querySelector(".letter"), "current");
  document.getElementById("info").innerHTML = gameTime / 1000 + "";
  window.timer = null;
}
function getWpm() {
  const words = [...document.querySelectorAll(".word")];
  const lastTypedWord = document.querySelector(".word.current");
  const lastTypedWordIndex = words.indexOf(lastTypedWord) + 1;
  const typedWords = words.slice(0, lastTypedWordIndex);
  const correctWords = typedWords.filter((word) => {
    const letters = [...word.children];
    const incorrectLetters = letters.filter((letter) =>
      letter.className.includes("incorrect")
    );
    const correctLetters = letters.filter((letter) =>
      letter.className.includes("correct")
    );
    return (
      incorrectLetters.length === 0 && correctLetters.length === letters.length
    );
  });
  return (correctWords.length / gameTime) * 60000;
}

function gameOver() {
  clearInterval(window.timer);
  addClass(document.getElementById("game"), "over");
  const result = getWpm();
  document.getElementById("info").innerHTML = `WPM: ${result}`;
}

document.getElementById("game").addEventListener("keyup", (ev) => {
  const key = ev.key;
  const currentWord = document.querySelector(".word.current");
  const currentLetter = document.querySelector(".letter.current");
  const expected = currentLetter?.innerHTML || " ";
  const isLetter = key.length === 1 && key !== " ";
  const isSpace = key === " ";
  const isBackspace = key === "Backspace";
  const isFirstLetter = currentLetter === currentWord.firstChild;

  if (document.querySelector("#game.over")) {
    return;
  }

  console.log({ key, expected });

  if (!window.timer && isLetter) {
    window.timer = setInterval(() => {
      if (!window.gameStart) {
        window.gameStart = new Date().getTime();
      }
      const currentTime = new Date().getTime();
      const msPassed = currentTime - window.gameStart;
      const sPassed = Math.round(msPassed / 1000);
      const sLeft = Math.round(gameTime / 1000 - sPassed);
      if (sLeft <= 0) {
        gameOver();
        return;
      }
      document.getElementById("info").innerHTML = sLeft + "";
    }, 1000);
  }

  if (isLetter) {
    if (currentLetter) {
      addClass(currentLetter, key === expected ? "correct" : "incorrect");
      removeClass(currentLetter, "current");
      if (currentLetter.nextSibling) {
        addClass(currentLetter.nextSibling, "current");
      }
    } else {
      const incorrectLetter = document.createElement("span");
      incorrectLetter.innerHTML = key;
      incorrectLetter.className = "letter incorrect extra";
      currentWord.appendChild(incorrectLetter);
    }
  }

  if (isSpace) {
    if (expected !== " ") {
      const lettersToInvalidate = [
        ...document.querySelectorAll(".word.current .letter:not(.correct)"),
      ];
      lettersToInvalidate.forEach((letter) => {
        addClass(letter, "incorrect");
      });
    }
    removeClass(currentWord, "current");
    addClass(currentWord.nextSibling, "current");
    if (currentLetter) {
      removeClass(currentLetter, "current");
    }
    addClass(currentWord.nextSibling.firstChild, "current");
  }

  if (isBackspace) {
    if (currentLetter && isFirstLetter) {
      removeClass(currentWord, "current");
      addClass(currentWord.previousElementSibling, "current");
      removeClass(currentLetter, "current");
      addClass(currentWord.previousSibling.lastChild, "current");
      removeClass(currentWord.previousSibling.lastChild, "incorrect");
      removeClass(currentWord.previousSibling.lastChild, "correct");
    }
    if (currentLetter && !isFirstLetter) {
      removeClass(currentLetter, "current");
      addClass(currentLetter.previousSibling, "current");
      removeClass(currentLetter.previousSibling, "incorrect");
      removeClass(currentLetter.previousSibling, "correct");
    }
    if (!currentLetter && currentWord) {
      const extras = currentWord.querySelectorAll(".letter.extra");
      if (extras.length > 0) {
        const lastExtra = extras[extras.length - 1];
        currentWord.removeChild(lastExtra);
      } else {
        const prevWord = currentWord.previousSibling;
        if (prevWord) {
          removeClass(currentWord, "current");
          addClass(prevWord, "current");
          const lastLetter = prevWord.querySelector(".letter:last-child");
          if (lastLetter) {
            addClass(lastLetter, "current");
            removeClass(lastLetter, "incorrect");
            removeClass(lastLetter, "correct");
          }
        }
      }
    }
  }

  if (currentWord.getBoundingClientRect().top > 300) {
    const words = document.getElementById("words");
    const margin = parseInt(words.style.mrginTop || "0px");
    words.style.marginTop = margin - 35 + "px";
  }

  const nextLetter = document.querySelector(".letter.current");
  const nextWord = document.querySelector(".word.current");
  const cursor = document.getElementById("cursor");
  cursor.style.top =
    (nextLetter || nextWord).getBoundingClientRect().top + 2 + "px";
  cursor.style.left =
    (nextLetter || nextWord).getBoundingClientRect()[
      nextLetter ? "left" : "right"
    ] + "px";
});

document.getElementById("newGameBtn").addEventListener("click", () => {
  gameOver();
  newGame();
});

if (performance.getEntriesByType("navigation")[0].type === "reload") {
  window.location.href = "index.html";
}
