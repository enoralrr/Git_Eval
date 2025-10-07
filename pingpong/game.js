const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const GAME_STATE = {
    running: false,
    finished: false,
    targetScore: 5,
    ball: {
        size: 12,
        baseSpeed: 3.2,
        maxSpeed: 8.5,
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: 0,
        vy: 0
    },
    player: {
        width: 12,
        height: 90,
        x: 30,
        y: canvas.height / 2 - 45,
        dy: 0,
        speed: 6,
        score: 0
    },
    cpu: {
        width: 12,
        height: 90,
        x: canvas.width - 42,
        y: canvas.height / 2 - 45,
        dy: 0,
        speed: 5.2,
        score: 0
    }
};

const QUIZ_BANK = [
    {
        question: 'Quelle commande affiche la liste des commits d\'une branche ?',
        options: ['git log', 'git status', 'git branch'],
        answer: 0,
        explanation: 'git log liste l\'historique des commits et leurs métadonnées.'
    },
    {
        question: 'Quelle instruction enregistre des fichiers précis pour le prochain commit ?',
        options: ['git checkout', 'git add', 'git revert'],
        answer: 1,
        explanation: 'git add place les modifications sélectionnées dans l\'index (staging).'
    },
    {
        question: 'Quel fichier permet de ne pas versionner certains fichiers ?',
        options: ['README.md', '.gitignore', '.gitkeep'],
        answer: 1,
        explanation: '.gitignore contient les motifs de fichiers à exclure du suivi Git.'
    },
    {
        question: 'Quelle commande récupère les nouveautés depuis un dépôt distant ?',
        options: ['git pull', 'git init', 'git commit'],
        answer: 0,
        explanation: 'git pull fusionne votre branche locale avec les nouvelles mises à jour distantes.'
    },
    {
        question: 'Quel est le rôle principal d\'une branche ?',
        options: ['Sauvegarder les identifiants', 'Isoler un lot de commits', 'Supprimer l\'historique'],
        answer: 1,
        explanation: 'Une branche sert à isoler un flux de travail ou une fonctionnalité.'
    },
    {
        question: 'Que fait git clone ?',
        options: ['Crée un nouveau dépôt vide', 'Copie un dépôt distant en local', 'Supprime un dépôt local'],
        answer: 1,
        explanation: 'git clone télécharge l\'historique et crée un dépôt local identique au distant.'
    },
    {
        question: 'Quelle commande change de branche ?',
        options: ['git switch', 'git merge', 'git tag'],
        answer: 0,
        explanation: 'git switch (ou git checkout) permet de basculer d\'une branche à l\'autre.'
    }
];

const quizOverlay = document.getElementById('quizOverlay');
const quizQuestionEl = document.getElementById('quizQuestion');
const quizOptionsEl = document.getElementById('quizOptions');
const quizFeedbackEl = document.getElementById('quizFeedback');
const quizContinueButton = document.getElementById('quizContinue');

const quizState = {
    active: false,
    answered: false,
    current: null
};

function resetBall(direction = Math.random() > 0.5 ? 1 : -1) {
    const { ball } = GAME_STATE;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    const angle = (Math.random() * 0.7 - 0.35) * Math.PI; // petit angle pour varier
    const speed = ball.baseSpeed + Math.random() * 2;
    ball.vx = Math.cos(angle) * speed * direction;
    ball.vy = Math.sin(angle) * speed;
}

function resetMatch() {
    GAME_STATE.player.score = 0;
    GAME_STATE.cpu.score = 0;
    GAME_STATE.finished = false;
    resetBall();
}

function showQuiz() {
    if (!QUIZ_BANK.length) {
        return;
    }
    const question = QUIZ_BANK[Math.floor(Math.random() * QUIZ_BANK.length)];
    quizState.current = question;
    quizState.active = true;
    quizState.answered = false;

    quizQuestionEl.textContent = question.question;
    quizOptionsEl.innerHTML = '';
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.index = String(index);
        button.textContent = option;
        quizOptionsEl.appendChild(button);
    });

    quizFeedbackEl.textContent = '';
    quizFeedbackEl.classList.remove('positive', 'negative');
    quizContinueButton.hidden = true;

    quizOverlay.classList.add('visible');
    quizOverlay.setAttribute('aria-hidden', 'false');
}

function hideQuiz() {
    quizOverlay.classList.remove('visible');
    quizOverlay.setAttribute('aria-hidden', 'true');
    quizOptionsEl.innerHTML = '';
    quizFeedbackEl.textContent = '';
    quizFeedbackEl.classList.remove('positive', 'negative');
    quizContinueButton.hidden = true;
    quizState.active = false;
    quizState.answered = false;
    quizState.current = null;
}

function handleQuizOptionClick(event) {
    if (!quizState.active || quizState.answered) {
        return;
    }
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
        return;
    }
    const selectedIndex = Number(target.dataset.index);
    if (Number.isNaN(selectedIndex) || !quizState.current) {
        return;
    }

    const buttons = Array.from(quizOptionsEl.querySelectorAll('button'));
    buttons.forEach((button) => {
        button.disabled = true;
    });

    const isCorrect = selectedIndex === quizState.current.answer;

    buttons.forEach((button) => {
        const optionIndex = Number(button.dataset.index);
        if (optionIndex === quizState.current.answer) {
            button.classList.add('is-correct');
        } else if (optionIndex === selectedIndex) {
            button.classList.add('is-incorrect');
        }
    });

    const explanation = quizState.current.explanation;
    if (isCorrect) {
        quizFeedbackEl.textContent = `Bonne réponse ! ${explanation}`;
        quizFeedbackEl.classList.add('positive');
        quizFeedbackEl.classList.remove('negative');
    } else {
        quizFeedbackEl.textContent = `Mauvaise réponse... ${explanation}`;
        quizFeedbackEl.classList.add('negative');
        quizFeedbackEl.classList.remove('positive');
    }

    quizState.answered = true;
    quizContinueButton.hidden = false;
    quizContinueButton.focus();
}

function clampPaddle(paddle) {
    paddle.y = Math.max(20, Math.min(canvas.height - paddle.height - 20, paddle.y));
}

function updatePlayer() {
    GAME_STATE.player.y += GAME_STATE.player.dy;
    clampPaddle(GAME_STATE.player);
}

function updateCpu() {
    const { cpu, ball } = GAME_STATE;
    const target = ball.y - cpu.height / 2;
    const smoothing = 0.08;
    cpu.y += (target - cpu.y) * smoothing;
    clampPaddle(cpu);
}

function updateBall() {
    const { ball, player, cpu } = GAME_STATE;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // collisions verticales
    if (ball.y - ball.size <= 15 || ball.y + ball.size >= canvas.height - 15) {
        ball.vy *= -1;
        ball.y = Math.max(ball.size + 15, Math.min(canvas.height - ball.size - 15, ball.y));
    }

    // collision avec le joueur
    if (
        ball.x - ball.size <= player.x + player.width &&
        ball.x - ball.size >= player.x &&
        ball.y >= player.y &&
        ball.y <= player.y + player.height
    ) {
        const collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        const angle = collidePoint * (Math.PI / 3);
        const speed = Math.min(Math.hypot(ball.vx, ball.vy) + 0.5, GAME_STATE.ball.maxSpeed);
        ball.vx = Math.cos(angle) * speed;
        ball.vy = Math.sin(angle) * speed;
        ball.vx = Math.abs(ball.vx);
    }

    // collision avec l'IA
    if (
        ball.x + ball.size >= cpu.x &&
        ball.x + ball.size <= cpu.x + cpu.width &&
        ball.y >= cpu.y &&
        ball.y <= cpu.y + cpu.height
    ) {
        const collidePoint = (ball.y - (cpu.y + cpu.height / 2)) / (cpu.height / 2);
        const angle = collidePoint * (Math.PI / 3);
        const speed = Math.min(Math.hypot(ball.vx, ball.vy) + 0.5, GAME_STATE.ball.maxSpeed);
        ball.vx = -Math.cos(angle) * speed;
        ball.vy = Math.sin(angle) * speed;
        ball.vx = -Math.abs(ball.vx);
    }

    // sorties de l'écran
    if (ball.x + ball.size < 0) {
        scorePoint('cpu');
    } else if (ball.x - ball.size > canvas.width) {
        scorePoint('player');
    }
}

function scorePoint(winner) {
    GAME_STATE[winner].score += 1;
    GAME_STATE.running = false;
    if (GAME_STATE[winner].score >= GAME_STATE.targetScore) {
        GAME_STATE.finished = true;
    }
    resetBall(winner === 'player' ? 1 : -1);
    showQuiz();
}

function drawBoard() {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.setLineDash([10, 15]);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 20);
    ctx.lineTo(canvas.width / 2, canvas.height - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(GAME_STATE.player.x, GAME_STATE.player.y, GAME_STATE.player.width, GAME_STATE.player.height);

    ctx.fillStyle = '#f97316';
    ctx.fillRect(GAME_STATE.cpu.x, GAME_STATE.cpu.y, GAME_STATE.cpu.width, GAME_STATE.cpu.height);

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(GAME_STATE.ball.x, GAME_STATE.ball.y, GAME_STATE.ball.size, 0, Math.PI * 2);
    ctx.fill();
}

function drawScore() {
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '36px Manrope, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${GAME_STATE.player.score} — ${GAME_STATE.cpu.score}`, canvas.width / 2, 60);
}

function drawOverlay() {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '32px Manrope, sans-serif';
    ctx.textAlign = 'center';

    if (GAME_STATE.finished) {
        const message = GAME_STATE.player.score > GAME_STATE.cpu.score ? 'Victoire !' : 'Perdu...';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px Manrope, sans-serif';
        ctx.fillText('Cliquez sur Réinitialiser pour relancer une partie.', canvas.width / 2, canvas.height / 2 + 25);
    } else {
        ctx.fillText('Cliquez sur Lancer / Reprendre ou appuyez sur Espace.', canvas.width / 2, canvas.height / 2);
    }
}

function render() {
    drawBoard();
    drawScore();
    if (!GAME_STATE.running) {
        drawOverlay();
    }
}

function step() {
    if (GAME_STATE.running && !GAME_STATE.finished) {
        updatePlayer();
        updateCpu();
        updateBall();
    }
    render();
    requestAnimationFrame(step);
}

function toggleGame() {
    if (quizState.active) {
        return;
    }
    if (GAME_STATE.finished) {
        return;
    }
    if (!GAME_STATE.running) {
        GAME_STATE.running = true;
        if (GAME_STATE.ball.vx === 0 && GAME_STATE.ball.vy === 0) {
            resetBall();
        }
    } else {
        GAME_STATE.running = false;
    }
}

function resetGame() {
    hideQuiz();
    resetMatch();
    GAME_STATE.running = false;
}

function handleKeyDown(event) {
    if (event.code === 'KeyW') {
        GAME_STATE.player.dy = -GAME_STATE.player.speed;
    }
    if (event.code === 'KeyS') {
        GAME_STATE.player.dy = GAME_STATE.player.speed;
    }
    if (event.code === 'Space') {
        event.preventDefault();
        toggleGame();
    }
    if (['ArrowUp', 'ArrowDown'].includes(event.code)) {
        event.preventDefault();
    }
}

function handleKeyUp(event) {
    if (event.code === 'KeyW' || event.code === 'KeyS') {
        GAME_STATE.player.dy = 0;
    }
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

document.getElementById('startButton').addEventListener('click', toggleGame);
document.getElementById('resetButton').addEventListener('click', () => {
    resetGame();
});

quizOptionsEl.addEventListener('click', handleQuizOptionClick);
quizContinueButton.addEventListener('click', () => {
    hideQuiz();
});

resetGame();
step();
