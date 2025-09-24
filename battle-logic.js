// ================================
// POKÉMON PORTFOLIO – GAME FLOW
// ================================

const loadingScreen = document.getElementById("loading-screen");
const battleScreen  = document.getElementById("battle-screen");
const aboutSection  = document.getElementById("about-section");
const aboutContent  = document.getElementById("about-content");
const victoryScreen = document.getElementById("victory-screen");

const moveButtons   = document.querySelectorAll("#move-buttons button");
const victoryMoveButtons = document.querySelectorAll("#victory-move-buttons button");
const battleMessage = document.getElementById("battle-message");

const playerPokemon   = document.getElementById("player-pokemon");
const opponentPokemon = document.getElementById("opponent-pokemon");
const sparkEffect     = document.getElementById("spark-effect");
const auraEffect      = document.getElementById("aura-effect");

const ashTrainer  = document.getElementById("ash-trainer");
const garyTrainer = document.getElementById("gary-trainer");

const playerBall   = document.getElementById("player-ball");
const opponentBall = document.getElementById("opponent-ball");

const playerHp   = document.getElementById("player-hp");
const opponentHp = document.getElementById("opponent-hp");

const introMusic   = document.getElementById("intro-music");
const battleMusic  = document.getElementById("battle-music");
const victoryMusic = document.getElementById("victory-music");

// Dynamic flash elements for the ball pop
const playerFlash = document.createElement("div");
const opponentFlash = document.createElement("div");
[playerFlash, opponentFlash].forEach(el => {
  el.className = "flash";
  el.style.position = "absolute";
  el.style.width = "120px";
  el.style.height = "120px";
  el.style.borderRadius = "50%";
  el.style.background = "#fff";
  el.style.opacity = "0";
  el.style.pointerEvents = "none";
  el.style.zIndex = "5";
});
battleScreen.appendChild(playerFlash);
battleScreen.appendChild(opponentFlash);

function placeFlashes() {
  playerFlash.style.left = "calc(12% + 40px)";
  playerFlash.style.bottom = "calc(18% + 10px)";
  opponentFlash.style.right = "calc(18% + 40px)";
  opponentFlash.style.top   = "calc(20% + 10px)";
}
placeFlashes();

let playerHpPercent = 100;
let opponentHpPercent = 100;

// Track where an about page was opened from: 'battle' (default) or 'victory'
let returnTarget = "battle";

// ---- Helper: reset FX
function resetEffects() {
  if (sparkEffect) {
    sparkEffect.classList.remove("active");
    sparkEffect.classList.add("hidden");
  }
  if (auraEffect) {
    auraEffect.classList.remove("active");
    auraEffect.classList.add("hidden");
  }
}
if (sparkEffect) {
  sparkEffect.addEventListener("animationend", () => {
    sparkEffect.classList.remove("active");
    sparkEffect.classList.add("hidden");
  });
}
if (auraEffect) {
  auraEffect.addEventListener("animationend", () => {
    auraEffect.classList.remove("active");
    auraEffect.classList.add("hidden");
  });
}

// ================================
// INTRO MUSIC & START SEQUENCE
// ================================

// Try to autoplay intro music on load
window.addEventListener("DOMContentLoaded", () => {
  introMusic.play().catch(()=>{}); // some browsers will wait until first click
});

// Advance to battle only on click
window.addEventListener("click", () => {
  if (loadingScreen.style.display !== "none") {
    setTimeout(() => {
      loadingScreen.style.display = "none";
      battleScreen.style.display = "block";
      introMusic.pause();
      introMusic.currentTime = 0; // reset intro for consistency
      battleMusic.play().catch(()=>{});

      battleMessage.textContent = "Ash: Pikachu, I choose you!";

      setTimeout(() => {
        ashTrainer.src = "assets/images/Trainers/ash-throwing.png";
        playerBall.classList.remove("hidden");
        playerBall.classList.add("active");

        setTimeout(() => {
          flash(playerFlash);
          setTimeout(() => {
            playerPokemon.classList.remove("hidden");
            playerBall.classList.add("hidden");
            playerBall.classList.remove("active");
            ashTrainer.src = "assets/images/Trainers/ash-standing.png";

            setTimeout(() => {
              battleMessage.textContent = "Gary: Haha, go Lucario!";
              garyTrainer.src = "assets/images/Trainers/gary-throwing.png";

              opponentBall.classList.remove("hidden");
              opponentBall.classList.add("active");

              setTimeout(() => {
                flash(opponentFlash);
                setTimeout(() => {
                  opponentPokemon.classList.remove("hidden");
                  opponentBall.classList.add("hidden");
                  opponentBall.classList.remove("active");
                  garyTrainer.src = "assets/images/Trainers/gary-standing.png";

                  setTimeout(() => {
                    battleMessage.textContent = "Get ready to battle!";
                    document.getElementById("move-buttons").style.display = "flex";
                  }, 1200);
                }, 160);
              }, 700);
            }, 900);
          }, 250);
        }, 350);
      }, 800);
    }, 300);
  }
}, { once: true });

function flash(el) {
  el.animate(
    [
      { opacity: 0, transform: "scale(0.2)" },
      { opacity: 1, transform: "scale(1.4)" },
      { opacity: 0, transform: "scale(0.8)" }
    ],
    { duration: 420, easing: "ease-out" }
  );
}

// ================================
// Moves (battle screen) -> open about page
// ================================
moveButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    returnTarget = "battle"; // back to battle after viewing

    const moveName = btn.textContent;
    battleMessage.textContent = "Pikachu used " + moveName + "!";
    btn.disabled = true;

    playerPokemon.classList.add("attack");
    setTimeout(() => playerPokemon.classList.remove("attack"), 600);

    // Lightning FX
    setTimeout(() => {
      sparkEffect.classList.remove("hidden");
      sparkEffect.classList.remove("active");
      void sparkEffect.offsetWidth; // restart CSS animation
      sparkEffect.classList.add("active");
    }, 350);

    setTimeout(resetEffects, 900);
    loadAbout(btn.dataset.page);
  });
});

// ================================
// Victory screen buttons -> open about page
// ================================
victoryMoveButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    returnTarget = "victory"; // back to victory hub
    loadAbout(btn.dataset.page);
  });
});

// ================================
// loadAbout (works for both battle & victory origins)
// ================================
function loadAbout(page) {
  if (returnTarget === "victory") {
    victoryScreen.style.display = "none";   // hide victory
    // keep victory music running
  } else {
    battleScreen.style.display = "none";    // hide battle
    battleMusic.pause();
  }

  aboutSection.style.display = "block";     // show about content

  fetch(page)
    .then(r => {
      if (!r.ok) throw new Error("Failed to fetch " + page + " — status " + r.status);
      return r.text();
    })
    .then(html => {
      let fixed = html
        .replace(/href="\.\.\/battle-style\.css"/g, '')           
        .replace(/href="\.\.\//g, 'href="')
        .replace(/src="\.\.\/assets\//g, 'src="assets/')
        .replace(/src="\.\.\/images\//g, 'src="assets/images/')
        .replace(/src="\.\.\/\.\.\/assets\//g, 'src="assets/');

      aboutContent.innerHTML = fixed;
      document.body.classList.add("about-page");

      let attached = false;
      const idBtn = aboutContent.querySelector("#back-to-battle");
      if (idBtn) {
        idBtn.addEventListener("click", returnToBattle);
        attached = true;
      } else {
        aboutContent.querySelectorAll("button").forEach(b => {
          if (b.textContent.trim().toLowerCase().includes("back to battle")) {
            b.addEventListener("click", returnToBattle);
            attached = true;
          }
        });
      }
      if (!attached) {
        const fallback = document.createElement("button");
        fallback.id = "back-to-battle-fallback";
        fallback.textContent = "Back to Battle";
        fallback.style.marginTop = "18px";
        fallback.addEventListener("click", returnToBattle);
        aboutContent.appendChild(fallback);
      }
    })
    .catch(err => {
      console.error(err);
      aboutContent.innerHTML = "<p style='color:#fff'>Failed to load page.</p>";
    });
}

// ================================
// Return from about page
// ================================
function returnToBattle() {
  document.body.classList.remove("about-page");
  aboutSection.style.display = "none";

  if (returnTarget === "victory") {
    victoryScreen.style.display = "flex";   // go back to victory hub
    victoryMusic.play().catch(()=>{});
    return;
  }

  // Back to battle flow (next turn)
  battleScreen.style.display = "block";
  battleMusic.play().catch(()=>{});
  resetEffects();

  doPikachuAttack(() => {
    if (opponentHpPercent > 0) {
      setTimeout(() => {
        doLucarioAttack();
      }, 1200);
    }
  });
}

// ================================
// Pikachu’s Attack
// ================================
function doPikachuAttack(onComplete) {
  playerPokemon.classList.add("attack");
  setTimeout(() => playerPokemon.classList.remove("attack"), 600);

  setTimeout(() => {
    sparkEffect.classList.remove("hidden");
    sparkEffect.classList.remove("active");
    void sparkEffect.offsetWidth;
    sparkEffect.classList.add("active");
  }, 350);

  setTimeout(() => {
    opponentPokemon.classList.add("hit");
    opponentHpPercent = Math.max(0, opponentHpPercent - 25);
    if (opponentHp) opponentHp.style.width = opponentHpPercent + "%";

    setTimeout(() => {
      battleMessage.textContent = "It was effective!";
      opponentPokemon.classList.remove("hit");

      if (opponentHpPercent <= 0) {
        opponentPokemon.classList.add("faint");
        battleMusic.pause();
        victoryMusic.play().catch(()=>{});

        setTimeout(() => {
          battleScreen.style.display = "none";
          victoryScreen.style.display = "flex";
          const vt = document.getElementById("victory-textbox");
          if (vt) vt.textContent = "The battle is over! You can now freely explore the moves.";
        }, 4000);
      } else if (onComplete) {
        onComplete();
      }
    }, 1000);
  }, 400);
}

// ================================
// Lucario’s Attack
// ================================
function doLucarioAttack() {
  battleMessage.textContent = "Lucario used Aura Sphere!";

  auraEffect.classList.remove("hidden");
  auraEffect.classList.remove("active");
  void auraEffect.offsetWidth; // restart CSS animation
  auraEffect.classList.add("active");

  setTimeout(() => {
    playerPokemon.classList.add("hit-strong");
    playerHpPercent = Math.max(0, playerHpPercent - 15);
    if (playerHp) playerHp.style.width = playerHpPercent + "%";
    setTimeout(() => {
      battleMessage.textContent = "It’s not very effective...";
      playerPokemon.classList.remove("hit-strong");
    }, 1000);
  }, 900);
}
