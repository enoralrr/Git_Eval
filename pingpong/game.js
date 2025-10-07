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

resetGame();
step();
