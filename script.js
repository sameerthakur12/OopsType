const words = 'The sun is high in the sky. Birds fly across the blue clouds. A dog runs in the yard with a red ball. Kids laugh and play on the grass. It is a bright and happy day for everyone.'.split(' ');

const wordsCount = words.length;

function randomWord() {
    const randomIndex = Math.floor(Math.random() * wordsCount);
    return words[randomIndex];
}

function formatWord(word) {
    return `<div class="word">${word}</div>`;
}

function newGame() {
    const wordsContainer = document.getElementById('words');
    wordsContainer.innerHTML = '';
    
    for (let i = 0; i < 200; i++) {
        wordsContainer.innerHTML += formatWord(randomWord());
    }
}

newGame();
