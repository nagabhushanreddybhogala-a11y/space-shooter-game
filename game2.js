const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreLabel = document.getElementById("score");
const overlay = document.getElementById("overlay");
const message = document.getElementById("message");
const instructions = document.getElementById("instructions");
const startBtn = document.getElementById("startBtn");

const W = canvas.width, H = canvas.height;
let player, bullets, enemies, stars, score, keys, running, lastSpawn, animationId;

function resetGame() {
  player = { x: W / 2, y: H - 58, width: 42, height: 38, speed: 6 };
  bullets = [];
  enemies = [];
  stars = Array.from({ length: 90 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    size: Math.random() * 2 + 0.5, speed: Math.random() * 1.5 + 0.4
  }));
  score = 0;
  keys = {};
  lastSpawn = 0;
  scoreLabel.textContent = score;
}

function drawBackground() {
  ctx.fillStyle = "#050b1d";
  ctx.fillRect(0, 0, W, H);
  for (const star of stars) {
    ctx.fillStyle = "#b9dcff";
    ctx.globalAlpha = 0.45 + star.size / 4;
    ctx.fillRect(star.x, star.y, star.size, star.size);
    star.y += star.speed;
    if (star.y > H) { star.y = 0; star.x = Math.random() * W; }
  }
  ctx.globalAlpha = 1;
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = "#39d5ff";
  ctx.beginPath();
  ctx.moveTo(0, -23); ctx.lineTo(20, 17); ctx.lineTo(0, 9); ctx.lineTo(-20, 17);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#e7faff";
  ctx.beginPath(); ctx.arc(0, -5, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffad42";
  ctx.fillRect(-5, 17, 10, 10 + Math.random() * 7);
  ctx.restore();
}

function spawnEnemy() {
  enemies.push({ x: 25 + Math.random() * (W - 50), y: -25, r: 15 + Math.random() * 8, speed: 1.8 + Math.random() * 1.4 });
}

function drawEnemies() {
  for (const enemy of enemies) {
    ctx.fillStyle = "#ff557e";
    ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#ffc1d0"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "#6b153b";
    ctx.beginPath(); ctx.arc(enemy.x - 5, enemy.y - 2, 3, 0, Math.PI * 2); ctx.arc(enemy.x + 5, enemy.y - 2, 3, 0, Math.PI * 2); ctx.fill();
    enemy.y += enemy.speed;
  }
}

function drawBullets() {
  ctx.fillStyle = "#ffe66d";
  for (const bullet of bullets) {
    ctx.fillRect(bullet.x - 3, bullet.y - 10, 6, 16);
    bullet.y -= 8;
  }
}

function update() {
  if (keys.ArrowLeft || keys.a || keys.A) player.x -= player.speed;
  if (keys.ArrowRight || keys.d || keys.D) player.x += player.speed;
  player.x = Math.max(23, Math.min(W - 23, player.x));

  const now = performance.now();
  if (now - lastSpawn > 850) { spawnEnemy(); lastSpawn = now; }

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (e.y > H + 25 || Math.hypot(e.x - player.x, e.y - player.y) < e.r + 16) {
      endGame();
      return;
    }
    for (let j = bullets.length - 1; j >= 0; j--) {
      const b = bullets[j];
      if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + 7) {
        enemies.splice(i, 1); bullets.splice(j, 1);
        score += 10; scoreLabel.textContent = score;
        break;
      }
    }
  }
  bullets = bullets.filter(b => b.y > -20);
}

function render() {
  drawBackground();
  if (running) {
    update();
    if (!running) return;
    drawBullets(); drawEnemies(); drawPlayer();
    animationId = requestAnimationFrame(render);
  }
}

function shoot() {
  if (running && (!player.lastShot || performance.now() - player.lastShot > 260)) {
    bullets.push({ x: player.x, y: player.y - 20 });
    player.lastShot = performance.now();
  }
}

function endGame() {
  running = false;
  cancelAnimationFrame(animationId);
  message.textContent = "Game over!";
  instructions.textContent = `Your final score is ${score}. Try again and beat it!`;
  startBtn.textContent = "PLAY AGAIN";
  overlay.classList.remove("hidden");
}

function startGame() {
  cancelAnimationFrame(animationId);
  resetGame();
  running = true;
  overlay.classList.add("hidden");
  render();
}

document.addEventListener("keydown", event => {
  keys[event.key] = true;
  if (event.code === "Space") { event.preventDefault(); shoot(); }
});
document.addEventListener("keyup", event => { keys[event.key] = false; });
startBtn.addEventListener("click", startGame);

resetGame();
drawBackground();
