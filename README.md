
# CF Pathfinder: Codeforces Problem Recommender CLI & Desktop App 

CF Pathfinder is an advanced tool that recommends Codeforces problems tailored to your skill level and learning needs. It now features both a command-line interface (CLI) and a modern desktop pop-up app built with Electron, providing a seamless and interactive experience.

---
##  Features
- **Personalized Recommendations:** Suggests problems based on your tag gaps compared to users with ~+500 rating.
- **Recent Problems:** Only recommends from the latest 1000 problems, ensuring up-to-date practice.
- **Multi-Tag, Non-Special Problems:** Filters out problems with only one tag or any tag starting with `*` (e.g., `*special`).
- **Fast and Modular:** Uses a local cache for fast recommendations and modular code for easy maintenance.
- **Easy CLI & Desktop App:** Simple commands for refreshing cache and getting recommendations, plus a beautiful pop-up GUI.
- **Interactive Pop-up:** Electron-based desktop app with form input and clickable links that open in your default browser.

>  **Note:** CF Pathfinder works best for users with Codeforces rating **below 2500**. For very high-rated users, the tag gap algorithm may not be as effective due to limited data.

---

##  Installation
1. **Clone this repository:**
   ```sh
   git clone <your-repo-url>
   cd cf-pathfinder
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **(Optional) Refresh the problem cache:**
   ```sh
   node src/index.js refresh
   ```

---

##  Usage

### Get Recommendations (CLI)
```
node src/index.js recommend --handle <handle> [--count <count>]
```
- `--handle <handle>`: Your Codeforces username (required)
- `--count <count>`: Number of problems to recommend (default: 20)

Example:
```
node src/index.js recommend --handle tourist --count 10
```

### Refresh Problem Cache
```
node src/index.js refresh
```

### Show Help
```
node src/index.js --help
node src/index.js recommend --help
```

### Launch the Pop-up Desktop App
```
npm run start:popup
```

---

##  User Manual

### CLI Mode
- Run `node src/index.js recommend --handle <your-handle>` to get personalized recommendations in your terminal.
- Use `node src/index.js refresh` to update the local problem cache.
- All output is color-coded and formatted for easy reading.

### Desktop Pop-up Mode
- Run `npm run start:popup` to launch the Electron-based GUI.
- Enter your Codeforces handle and the number of problems you want.
- Click "Get Recommendations" to see a table of suggested problems.
- Click any problem link to open it in your default web browser.
- The app is cross-platform and works on Windows, macOS, and Linux.

---

##  Tech Documentation

### Project Structure
- `src/index.js` — CLI entry point (uses Commander.js)
- `src/api.js` — Handles Codeforces API calls and local cache
- `src/recommender.js` — Recommendation engine and tag gap analysis
- `src/popup.js` — Interactive CLI (inquirer-based)
- `src/popup.html` — Electron GUI for the pop-up app
- `main.cjs` — Electron main process (launches the pop-up window)
- `cache.json` — Local cache of Codeforces problems

### Key Technologies
- **Node.js** (ESM & CommonJS)
- **Commander.js** for CLI parsing
- **Inquirer** for interactive CLI
- **Electron** for desktop GUI
- **cli-table3** and **chalk** for beautiful CLI output
- **node-fetch** for API requests

### How the Pop-up App Works
- Electron launches `src/popup.html` in a desktop window.
- The HTML form collects user input and calls backend logic via Node.js integration.
- Recommendations are displayed in a table; links open in the user's default browser using Electron's `shell.openExternal`.

### Extending the Project
- Add more filters (e.g., by tag, contest type) in `recommender.js`.
- Integrate with other platforms or add export features.
- Improve the GUI with more stats or visualizations.

---

##  Algorithm Details

1. **Fetch User Data:**
   - Retrieves your solved problems and current rating from Codeforces.
2. **Find Similar Users:**
   - Finds 15 users with rating ≈ (your rating + 500), within ±100 rating points.
3. **Analyze Tag Distribution:**
   - Computes the frequency of each tag in the solved problems of these similar users.
   - Computes your own tag distribution from your solved problems.
4. **Identify Tag Gaps:**
   - For each tag, calculates the difference between the group (similar users) and your tag ratios.
   - Selects the top 3 tags where you lag the most (biggest positive difference).
5. **Filter Problems:**
   - Considers only the latest 1000 problems (sorted by contestId and index).
   - Filters for problems:
     - With at least one of your top 3 tag gaps
     - Within ±200 rating of your current rating
     - Not already solved by you
     - With more than one tag
     - With no tag starting with `*` (e.g., `*special`)
6. **Recommend:**
   - Returns up to the requested number of problems, sorted by recency.

---

##  Example Output
```
 Recommendations for beastw
┌─────────────┬────────┬──────────────────────────────┬──────────────────────────────────────────────┐
│ Name        │ Rating │ Tags                         │ Link                                         │
├─────────────┼────────┼──────────────────────────────┼──────────────────────────────────────────────┤
│ ...         │ ...    │ ...                          │ ...                                          │
└─────────────┴────────┴──────────────────────────────┴──────────────────────────────────────────────┘
Query completed in 2.34 seconds.
```

---

##  All Commands
- `node src/index.js recommend --handle <handle> [--count <count>]`  
  Get personalized problem recommendations.
- `node src/index.js refresh`  
  Refresh the local problem cache from Codeforces.
- `node src/index.js --help`  
  Show general help and available commands.
- `node src/index.js recommend --help`  
  Show help for the recommend command.
- `npm run start:popup`  
  Launch the desktop pop-up app.

---

##  Troubleshooting
- If you see outdated problems, run `node src/index.js refresh` to update the cache.
- If you get network errors, check your internet connection and try again.
- If you get zero recommendations, try lowering your count or refreshing the cache.

---

##  License

MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
=======
