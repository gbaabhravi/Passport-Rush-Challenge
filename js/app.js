/**
 * Application Orchestrator & Event Binding
 */
document.addEventListener('DOMContentLoaded', () => {
  const game = new PassportRushGame();

  // Load preferences from localStorage
  const savedTheme = StorageManager.get('theme') || 'dark';
  const savedSound = StorageManager.get('sound');
  const savedTimer = StorageManager.get('timerSeconds');
  const savedDifficulty = StorageManager.get('difficulty');

  UI.setTheme(savedTheme);
  SoundManager.setEnabled(savedSound !== false);

  game.initSettings({
    timerSeconds: Number(savedTimer !== undefined ? savedTimer : 20),
    difficulty: savedDifficulty || 'normal'
  });

  // Sync settings modal elements
  const cfgSound = document.getElementById('cfg-sound-toggle');
  const cfgTimer = document.getElementById('cfg-timer-select');
  const cfgDiff = document.getElementById('cfg-diff-select');
  const cfgTheme = document.getElementById('cfg-theme-select');

  if (cfgSound) cfgSound.checked = (savedSound !== false);
  if (cfgTimer) cfgTimer.value = String(savedTimer !== undefined ? savedTimer : 20);
  if (cfgDiff) cfgDiff.value = savedDifficulty || 'normal';
  if (cfgTheme) cfgTheme.value = savedTheme;

  // Global Audio Unlock on first interaction
  const unlockAudio = () => {
    SoundManager.init();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);

  // Top Nav Toggles
  document.getElementById('sound-toggle-btn').addEventListener('click', () => {
    const isMuted = !SoundManager.enabled;
    SoundManager.setEnabled(isMuted);
    StorageManager.set('sound', isMuted);
    document.getElementById('sound-icon').textContent = isMuted ? '🔊' : '🔇';
    SoundManager.click();
  });

  document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    UI.setTheme(next);
    StorageManager.set('theme', next);
    if (cfgTheme) cfgTheme.value = next;
    SoundManager.click();
  });

  // Settings Modal Controls
  const settingsModal = document.getElementById('settings-modal');
  document.getElementById('settings-open-btn').addEventListener('click', () => {
    SoundManager.click();
    settingsModal.classList.add('active');
    settingsModal.setAttribute('aria-hidden', 'false');
  });

  const closeSettings = () => {
    SoundManager.click();
    settingsModal.classList.remove('active');
    settingsModal.setAttribute('aria-hidden', 'true');
  };

  document.getElementById('settings-close-btn').addEventListener('click', closeSettings);

  document.getElementById('settings-save-btn').addEventListener('click', () => {
    const timer = parseInt(cfgTimer.value, 10);
    const diff = cfgDiff.value;
    const theme = cfgTheme.value;
    const sound = cfgSound.checked;

    game.initSettings({ timerSeconds: timer, difficulty: diff });
    SoundManager.setEnabled(sound);
    UI.setTheme(theme);

    StorageManager.set('timerSeconds', timer);
    StorageManager.set('difficulty', diff);
    StorageManager.set('theme', theme);
    StorageManager.set('sound', sound);

    // Update tags on home screen
    document.getElementById('quick-diff-tag').textContent = `${diff.toUpperCase()} MODE`;
    document.getElementById('quick-time-tag').textContent = timer === 0 ? 'TIMER OFF' : `${timer}S PER TURN`;

    closeSettings();
  });

  // Start Journey Button
  document.getElementById('start-game-btn').addEventListener('click', () => {
    SoundManager.click();
    const p1Name = document.getElementById('p1-name-input').value;
    const p2Name = document.getElementById('p2-name-input').value;
    game.setPlayerNames(p1Name, p2Name);
    game.startNewGame();
  });

  // Letter Reel Stop Button
  document.getElementById('stop-letter-btn').addEventListener('click', () => {
    game.stopLetterSelection();
  });

  // Country Submission Form
  const inputForm = document.getElementById('country-input-form');
  const inputField = document.getElementById('country-entry-field');

  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = inputField.value;
    inputField.value = '';
    game.submitAnswer(val);
  });

  // Pass Turn Button ("I can't think of one")
  document.getElementById('pass-turn-btn').addEventListener('click', () => {
    game.passTurn();
  });

  // Cultural Modal Resume Button
  document.getElementById('modal-resume-btn').addEventListener('click', () => {
    SoundManager.click();
    game.resumeAfterModal();
  });

  // Round Over Actions
  document.getElementById('next-letter-btn').addEventListener('click', () => {
    SoundManager.click();
    game.startLetterSelection();
  });

  document.getElementById('finish-game-now-btn').addEventListener('click', () => {
    SoundManager.click();
    game.finishGame();
  });

  // Final Game Over Actions
  document.getElementById('play-again-btn').addEventListener('click', () => {
    SoundManager.click();
    game.startNewGame();
  });

  document.getElementById('home-return-btn').addEventListener('click', () => {
    SoundManager.click();
    UI.showScreen('home');
  });

  // Keyboard Shortcuts (Enter to resume from modal)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const modal = document.getElementById('cultural-modal');
      if (modal && modal.classList.contains('active')) {
        e.preventDefault();
        game.resumeAfterModal();
      }
    }
  });
});
