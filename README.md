# 🧭 Passport Rush: Global Geography Duel

> "How far can you travel without leaving the room?"

**Passport Rush** is an offline, zero-dependency, 2-player competitive browser game built with vanilla HTML5, modern CSS3, and JavaScript. Players take turns naming sovereign nations beginning with a dynamically spun letter, unlocking authentic cultural greetings, trivia, vector characters, and collectible passport stamps.

---

## 🌟 Key Features

* **Zero Build Pipeline:** No Webpack, Vite, React, npm, or node_modules. Runs directly in any web browser.
* **100% Offline Sovereign Dataset:** Contains 195+ sovereign nations, accurate capitals, languages, greetings with English meanings, fun facts, and common international aliases (`USA`, `UK`, `UAE`, `Burma`, etc.).
* **Web Audio API Sound Engine:** No external audio files or copyright concerns. Realistic synthesizer tones for letter reels, locks, chimes, buzzers, and celebratory fanfares.
* **Cultural Discovery Dossier:** Stamping animation and custom vector character illustrations that wave and deliver greetings.
* **Customizable Game Rules:** Configurable timers (10s, 15s, 20s, 30s, Unlimited), letter difficulty (Easy, Normal, Expert), and dual-mode theme engine (Night Sky Explorer / Daytime Paper Passport).

---

## 💻 How to Run Locally

1. Create a folder named `passport-rush` on your computer.
2. Replicate the directory structure and create the 12 files provided above.
3. Open `index.html` directly in any modern browser (Chrome, Safari, Firefox, Edge).
   * Alternatively, if using VS Code, install the **Live Server** extension, right-click `index.html`, and click **"Open with Live Server"**.

---

## 🚀 How to Deploy

### 1. GitHub Pages (Free)
1. Push your project files to a GitHub repository.
2. In your repository, go to **Settings** > **Pages**.
3. Under **Source**, select `Deploy from a branch`.
4. Choose `main` (or `master`) and folder `/ (root)`.
5. Click **Save**. Your site will be live at `https://<username>.github.io/<repo-name>/`.

### 2. Netlify (Drag and Drop)
1. Go to [app.netlify.com](https://app.netlify.com/).
2. Drag and drop the `passport-rush` folder into the Netlify dashboard.
3. Your game is live in seconds.

### 3. Vercel
1. Install Vercel CLI via `npm i -g vercel` or link your GitHub repo at [vercel.com](https://vercel.com).
2. Deploy with zero configuration (it automatically detects pure static HTML).

---

## ⚙️ Game Customization & Tuning

### Changing the Timer Limit
Modify line 21 in `js/game.js`:
```javascript
this.config = {
  timerSeconds: 20, // Change to your preferred turn duration
  difficulty: 'normal',
  bothCompleteBonus: true
};