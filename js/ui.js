/**
 * UI Rendering and DOM Manipulation Controller
 */
const UI = {
  screens: {
    home: document.getElementById('screen-home'),
    letter: document.getElementById('screen-letter'),
    game: document.getElementById('screen-game'),
    roundEnd: document.getElementById('screen-round-end'),
    gameEnd: document.getElementById('screen-game-end')
  },

  modals: {
    cultural: document.getElementById('cultural-modal'),
    settings: document.getElementById('settings-modal')
  },

  showScreen(name) {
    Object.keys(this.screens).forEach(key => {
      if (this.screens[key]) {
        this.screens[key].classList.toggle('active', key === name);
      }
    });
  },

  setTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.textContent = themeName === 'dark' ? '🌙' : '☀️';
    }
  },

  updateHUD(state) {
    // Player 1
    const p1Card = document.getElementById('p1-card');
    const p1Name = document.getElementById('p1-hud-name');
    const p1Score = document.getElementById('p1-score');
    if (p1Name) p1Name.textContent = state.players[0].name;
    if (p1Score) p1Score.textContent = state.players[0].score;

    // Player 2
    const p2Card = document.getElementById('p2-card');
    const p2Name = document.getElementById('p2-hud-name');
    const p2Score = document.getElementById('p2-score');
    if (p2Name) p2Name.textContent = state.players[1].name;
    if (p2Score) p2Score.textContent = state.players[1].score;

    // Turn Highlights
    if (p1Card && p2Card) {
      p1Card.classList.toggle('active-turn', state.currentPlayer === 0);
      p2Card.classList.toggle('active-turn', state.currentPlayer === 1);
    }

    // Active Turn Banner
    const turnPrompt = document.getElementById('turn-prompt-text');
    if (turnPrompt) {
      const activeExplorer = state.players[state.currentPlayer];
      turnPrompt.textContent = `${activeExplorer.name.toUpperCase()}'S TURN`;
      turnPrompt.style.color = state.currentPlayer === 0 ? 'var(--p1-color)' : 'var(--p2-color)';
    }

    // Active Letter
    const activeLetter = document.getElementById('active-round-letter');
    if (activeLetter) activeLetter.textContent = state.currentLetter || '?';
  },

  updateTimer(seconds, isUrgent = false) {
    const timerVal = document.getElementById('turn-timer-val');
    const timerWrap = document.getElementById('timer-wrapper');
    if (timerVal) timerVal.textContent = seconds === 0 ? '∞' : seconds;
    if (timerWrap) {
      timerWrap.classList.toggle('urgent', isUrgent);
    }
  },

  updateDiscoveryProgress(discoveredCount, totalCount) {
    const counter = document.getElementById('discovered-counter');
    const remaining = document.getElementById('remaining-counter');
    const progressFill = document.getElementById('progress-bar-fill');

    if (counter) counter.textContent = `${discoveredCount} / ${totalCount}`;
    if (remaining) remaining.textContent = Math.max(0, totalCount - discoveredCount);

    if (progressFill) {
      const pct = totalCount > 0 ? (discoveredCount / totalCount) * 100 : 0;
      progressFill.style.width = `${pct}%`;
    }
  },

  addDiscoveredChip(country) {
    const container = document.getElementById('discovered-tags-container');
    if (!container) return;

    const chip = document.createElement('div');
    chip.className = 'country-chip';
    chip.innerHTML = `<span>${country.flagEmoji}</span> <strong>${country.name}</strong>`;
    container.prepend(chip);
  },

  clearDiscoveredChips() {
    const container = document.getElementById('discovered-tags-container');
    if (container) container.innerHTML = '';
  },

  setFeedback(text, isError = false) {
    const toast = document.getElementById('feedback-alert');
    if (!toast) return;

    toast.textContent = text;
    toast.className = `feedback-toast ${isError ? 'error' : 'success'}`;

    if (text) {
      setTimeout(() => {
        if (toast.textContent === text) {
          toast.textContent = '';
        }
      }, 3500);
    }
  },

  renderCulturalCharacter(style) {
    // Generate clean CSS/SVG vector illustration based on cultural style
    return `
      <svg viewBox="0 0 120 140" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <!-- Body / Traditional Robe -->
        <rect x="35" y="65" width="50" height="60" rx="12" fill="var(--accent-cyan)" />
        <path d="M 45 65 L 60 90 L 75 65" fill="none" stroke="#fff" stroke-width="3" opacity="0.6"/>
        <!-- Head -->
        <circle cx="60" cy="40" r="24" fill="#fbd38d" />
        <!-- Cheerful Eyes & Smile -->
        <circle cx="52" cy="38" r="2.5" fill="#2d3748" />
        <circle cx="68" cy="38" r="2.5" fill="#2d3748" />
        <path d="M 52 48 Q 60 56 68 48" fill="none" stroke="#2d3748" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Waving Arm (Animated) -->
        <g class="character-animated-arm">
          <rect x="18" y="45" width="16" height="35" rx="8" fill="var(--accent-cyan)" transform="rotate(35 26 45)"/>
          <circle cx="20" cy="42" r="8" fill="#fbd38d" />
        </g>
        <!-- Static Arm -->
        <rect x="85" y="68" width="14" height="32" rx="7" fill="var(--accent-cyan)" />
      </svg>
    `;
  },

  showCulturalModal(country) {
    const modal = this.modals.cultural;
    if (!modal) return;

    document.getElementById('visa-country-name').textContent = country.name;
    document.getElementById('stamp-country-name').textContent = country.name;
    document.getElementById('visa-flag-emoji').textContent = country.flagEmoji;
    document.getElementById('visa-continent').textContent = country.continent;
    document.getElementById('visa-capital').textContent = country.capital;
    document.getElementById('visa-lang').textContent = country.language;
    document.getElementById('visa-fact').textContent = country.funFact;

    document.getElementById('char-greeting-text').textContent = country.greeting;
    document.getElementById('char-greeting-sub').textContent = `“${country.greetingTranslation}”`;

    const avatarRoot = document.getElementById('vector-avatar-root');
    if (avatarRoot) {
      avatarRoot.innerHTML = this.renderCulturalCharacter(country.characterStyle);
    }

    const stamp = document.getElementById('visa-stamp-layer');
    if (stamp) {
      stamp.classList.remove('stamped');
      void stamp.offsetWidth; // Trigger reflow for re-stamp
      stamp.classList.add('stamped');
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    const resumeBtn = document.getElementById('modal-resume-btn');
    if (resumeBtn) resumeBtn.focus();
  },

  hideCulturalModal() {
    const modal = this.modals.cultural;
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  },

  showRoundEnd(state, onNextLetter, onEndGame) {
    this.showScreen('roundEnd');

    const letterVal = document.getElementById('end-round-letter');
    if (letterVal) letterVal.textContent = state.currentLetter;

    const p1Name = document.getElementById('rnd-p1-name');
    const p1Pts = document.getElementById('rnd-p1-pts');
    const p2Name = document.getElementById('rnd-p2-name');
    const p2Pts = document.getElementById('rnd-p2-pts');

    if (p1Name) p1Name.textContent = state.players[0].name;
    if (p1Pts) p1Pts.textContent = `${state.players[0].score} PTS`;
    if (p2Name) p2Name.textContent = state.players[1].name;
    if (p2Pts) p2Pts.textContent = `${state.players[1].score} PTS`;

    const summaryTags = document.getElementById('round-tags-summary');
    if (summaryTags) {
      summaryTags.innerHTML = state.discoveredCountries.map(c => `
        <span class="country-chip">
          <span>${c.flagEmoji}</span> ${c.name}
        </span>
      `).join('') || '<span class="text-muted">No countries discovered this round.</span>';
    }
  },

  showGameEnd(state) {
    this.showScreen('gameEnd');

    const p1 = state.players[0];
    const p2 = state.players[1];

    document.getElementById('fin-p1-name').textContent = p1.name;
    document.getElementById('fin-p1-points').textContent = p1.score;
    document.getElementById('fin-p2-name').textContent = p2.name;
    document.getElementById('fin-p2-points').textContent = p2.score;

    const winnerHeadline = document.getElementById('winner-headline');
    const podiumP1 = document.getElementById('podium-p1');
    const podiumP2 = document.getElementById('podium-p2');

    podiumP1.classList.remove('winner');
    podiumP2.classList.remove('winner');

    if (p1.score > p2.score) {
      winnerHeadline.textContent = `🏆 ${p1.name.toUpperCase()} WINS!`;
      podiumP1.classList.add('winner');
    } else if (p2.score > p1.score) {
      winnerHeadline.textContent = `🏆 ${p2.name.toUpperCase()} WINS!`;
      podiumP2.classList.add('winner');
    } else {
      winnerHeadline.textContent = `🤝 AN HONORABLE DRAW!`;
    }

    // Fill metrics
    document.getElementById('stat-total-named').textContent = state.stats.totalCountriesNamed;
    document.getElementById('stat-rounds-played').textContent = state.roundNumber;
    document.getElementById('stat-best-streak').textContent = state.stats.bestStreak;

    const topPlayer = p1.countriesCount >= p2.countriesCount ? p1.name : p2.name;
    document.getElementById('stat-top-player').textContent = topPlayer;
  }
};