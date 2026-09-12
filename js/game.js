/**
 * Passport Rush Core Game Engine & State Machine
 */
class PassportRushGame {
  constructor() {
    this.state = {
      gameStatus: 'home', // 'home' | 'spinning' | 'active' | 'roundEnd' | 'gameEnd'
      players: [
        { id: 1, name: 'Player 1', score: 0, countriesCount: 0 },
        { id: 2, name: 'Player 2', score: 0, countriesCount: 0 }
      ],
      currentPlayer: 0, // 0 = Player 1, 1 = Player 2
      currentLetter: null,
      validCountriesForLetter: [],
      discoveredCountries: [],
      roundNumber: 0,
      turnTimeLeft: 20,
      currentStreak: 0,
      stats: {
        totalCountriesNamed: 0,
        bestStreak: 0
      }
    };

    // Config Section
    this.config = {
      timerSeconds: 20,
      difficulty: 'normal',
      bothCompleteBonus: true // Award +1 to both if 100% discovered
    };

    this.timerInterval = null;
    this.spinInterval = null;
  }

  initSettings(cfg) {
    this.config = { ...this.config, ...cfg };
  }

  setPlayerNames(name1, name2) {
    this.state.players[0].name = (name1 && name1.trim()) || 'Player 1';
    this.state.players[1].name = (name2 && name2.trim()) || 'Player 2';
  }

  startNewGame() {
    this.state.players[0].score = 0;
    this.state.players[0].countriesCount = 0;
    this.state.players[1].score = 0;
    this.state.players[1].countriesCount = 0;
    this.state.roundNumber = 0;
    this.state.stats.totalCountriesNamed = 0;
    this.state.stats.bestStreak = 0;
    this.state.currentStreak = 0;

    this.startLetterSelection();
  }

  startLetterSelection() {
    this.state.gameStatus = 'spinning';
    UI.showScreen('letter');

    const display = document.getElementById('reels-letter');
    const availableLetters = DatasetService.getAvailableLetters(this.config.difficulty);

    display.classList.add('reels-spinning');

    let idx = 0;
    clearInterval(this.spinInterval);
    this.spinInterval = setInterval(() => {
      idx = (idx + 1) % availableLetters.length;
      display.textContent = availableLetters[idx];
      SoundManager.spin();
    }, 65);
  }

  stopLetterSelection() {
    if (this.state.gameStatus !== 'spinning') return;
    clearInterval(this.spinInterval);

    const display = document.getElementById('reels-letter');
    display.classList.remove('reels-spinning');
    display.classList.add('letter-locked');

    const availableLetters = DatasetService.getAvailableLetters(this.config.difficulty);
    // Pick random letter from pool
    const selectedChar = availableLetters[Utils.randomInt(0, availableLetters.length - 1)];
    display.textContent = selectedChar;

    SoundManager.lock();
    Utils.shake(document.querySelector('.letter-machine-chassis'));

    setTimeout(() => {
      display.classList.remove('letter-locked');
      this.beginRound(selectedChar);
    }, 1100);
  }

  beginRound(letter) {
    this.state.gameStatus = 'active';
    this.state.roundNumber += 1;
    this.state.currentLetter = letter;
    this.state.discoveredCountries = [];
    this.state.currentPlayer = 0; // P1 starts round

    // Query valid countries for this letter
    this.state.validCountriesForLetter = DatasetService.getCountriesForLetter(letter);

    UI.clearDiscoveredChips();
    UI.showScreen('game');
    UI.updateHUD(this.state);
    UI.updateDiscoveryProgress(0, this.state.validCountriesForLetter.length);

    this.startTurnTimer();
  }

  startTurnTimer() {
    clearInterval(this.timerInterval);

    if (this.config.timerSeconds <= 0) {
      // Unlimited timer
      this.state.turnTimeLeft = 0;
      UI.updateTimer(0, false);
      return;
    }

    this.state.turnTimeLeft = this.config.timerSeconds;
    UI.updateTimer(this.state.turnTimeLeft, false);

    this.timerInterval = setInterval(() => {
      this.state.turnTimeLeft -= 1;
      const isUrgent = this.state.turnTimeLeft <= 5;
      
      if (isUrgent && this.state.turnTimeLeft > 0) {
        SoundManager.warning();
      }

      UI.updateTimer(this.state.turnTimeLeft, isUrgent);

      if (this.state.turnTimeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.handleTurnTimeout();
      }
    }, 1000);
  }

  submitAnswer(inputCountryText) {
    if (this.state.gameStatus !== 'active') return;

    const trimmed = inputCountryText ? inputCountryText.trim() : '';
    if (!trimmed) {
      UI.setFeedback('Please enter a country name!', true);
      SoundManager.wrong();
      return;
    }

    const matchedCountry = DatasetService.findCountry(trimmed);

    // Check 1: Is it a valid sovereign nation in our database?
    if (!matchedCountry) {
      this.handleIncorrectAnswer(`"${trimmed}" is not recognized as a sovereign country.`);
      return;
    }

    // Check 2: Does it begin with the selected letter?
    if (matchedCountry.name.charAt(0).toUpperCase() !== this.state.currentLetter) {
      this.handleIncorrectAnswer(`${matchedCountry.name} starts with '${matchedCountry.name.charAt(0)}', not '${this.state.currentLetter}'.`);
      return;
    }

    // Check 3: Has it already been discovered this round?
    const alreadyUsed = this.state.discoveredCountries.some(
      c => c.name.toLowerCase() === matchedCountry.name.toLowerCase()
    );

    if (alreadyUsed) {
      SoundManager.wrong();
      UI.setFeedback(`"${matchedCountry.name}" has already been stamped in this round!`, true);
      return;
    }

    // Valid discovery success
    this.handleCorrectAnswer(matchedCountry);
  }

  handleCorrectAnswer(country) {
    clearInterval(this.timerInterval);

    const active = this.state.players[this.state.currentPlayer];
    active.score += 1;
    active.countriesCount += 1;
    this.state.stats.totalCountriesNamed += 1;

    // Streak tracker
    this.state.currentStreak += 1;
    if (this.state.currentStreak > this.state.stats.bestStreak) {
      this.state.stats.bestStreak = this.state.currentStreak;
    }

    this.state.discoveredCountries.push(country);

    SoundManager.correct();
    UI.addDiscoveredChip(country);
    UI.updateHUD(this.state);
    UI.updateDiscoveryProgress(
      this.state.discoveredCountries.length,
      this.state.validCountriesForLetter.length
    );

    // Trigger Cultural Discovery Modal
    this.state.gameStatus = 'modal';
    UI.showCulturalModal(country);
  }

  resumeAfterModal() {
    UI.hideCulturalModal();

    // Verify if all countries for this letter have been discovered
    if (this.state.discoveredCountries.length >= this.state.validCountriesForLetter.length) {
      this.completeRound(true);
      return;
    }

    this.state.gameStatus = 'active';
    this.switchPlayer();
  }

  handleIncorrectAnswer(reasonMessage) {
    SoundManager.wrong();
    this.state.currentStreak = 0;

    // Opponent receives 1 point penalty award
    const opponentIdx = this.state.currentPlayer === 0 ? 1 : 0;
    this.state.players[opponentIdx].score += 1;

    UI.setFeedback(`${reasonMessage} Point granted to ${this.state.players[opponentIdx].name}!`, true);
    UI.updateHUD(this.state);

    this.switchPlayer();
  }

  passTurn() {
    if (this.state.gameStatus !== 'active') return;

    // Opponent receives 1 point
    const opponentIdx = this.state.currentPlayer === 0 ? 1 : 0;
    this.state.players[opponentIdx].score += 1;

    SoundManager.wrong();
    UI.setFeedback(`${this.state.players[this.state.currentPlayer].name} passed. Point awarded to ${this.state.players[opponentIdx].name}!`, true);
    UI.updateHUD(this.state);

    this.switchPlayer();
  }

  handleTurnTimeout() {
    const opponentIdx = this.state.currentPlayer === 0 ? 1 : 0;
    this.state.players[opponentIdx].score += 1;

    SoundManager.wrong();
    UI.setFeedback(`Time up! Point to ${this.state.players[opponentIdx].name}!`, true);
    UI.updateHUD(this.state);

    this.switchPlayer();
  }

  switchPlayer() {
    this.state.currentPlayer = this.state.currentPlayer === 0 ? 1 : 0;
    UI.updateHUD(this.state);

    // Clear input field for next player
    const input = document.getElementById('country-entry-field');
    if (input) {
      input.value = '';
      input.focus();
    }

    this.startTurnTimer();
  }

  completeRound(allDiscovered = false) {
    clearInterval(this.timerInterval);
    this.state.gameStatus = 'roundEnd';

    // Check optional bonus config
    if (allDiscovered && this.config.bothCompleteBonus) {
      this.state.players[0].score += 1;
      this.state.players[1].score += 1;
    }

    SoundManager.roundComplete();
    UI.showRoundEnd(this.state);
  }

  finishGame() {
    clearInterval(this.timerInterval);
    this.state.gameStatus = 'gameEnd';
    SoundManager.victory();
    UI.showGameEnd(this.state);
  }
}