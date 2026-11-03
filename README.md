# Sweet Potato

A small phone web app for a friend's trip to Taiwan: friends' place picks for every stop, a checklist, phrase cards and a travel note.

**All the words, places and photos live in the `content` folder.** You can change them on the GitHub website without touching any code. Every change is checked automatically before it goes live, so a typo can't break the app.

---

## What's where

```
content/              ← everything you edit
  places.yaml           every place (friends' picks and your own saved places)
  trip.yaml             traveller, friends, stops and dates, place categories
  checklist.yaml        the "before you fly" checklist
  phrases.yaml          phrase cards
  text.yaml             the wording on every screen
  photos/               place photos

src/                  ← the app's code (screens, layout)
scripts/              ← the content check and photo resizing
.github/workflows/    ← publishes the site
```

Each content file starts with notes and a **sample entry** showing every field. Copy the sample when you add something new.

---

## Editing on the GitHub website

1. Open the file on GitHub, e.g. `content/places.yaml`.
2. Click the **pencil icon** (Edit this file).
3. Make your change.
4. Click **Commit changes…**, write a short note (e.g. "Add Amei Teahouse") and click **Commit changes**.
5. Wait about two minutes. The site updates by itself.

To see whether it worked, open the **Actions** tab:
- **Green tick:** your change is live.
- **Red cross:** the check found a mistake, and the live site was **not** changed. Click the run, then **build**, then **Check content and build**. The message gives the file, the line number and what to fix, for example:

  ```
  ✖ content/places.yaml, line 61
      Place "Gold Museum": category "Sights" isn't allowed. Did you mean "Sight"?
  ```

  Fix it with the pencil icon again. When the next check passes, the site updates.

**Safer option:** in step 4, choose **Create a new branch… and start a pull request**. The check runs on the pull request first. Only click **Merge** when it shows a green tick.

### Four rules that keep the files working

1. **Keep the spaces at the start of each line** exactly as in the lines around it. YAML uses them to tell entries apart.
2. **Put text in "double quotes"**, like the existing entries.
3. **Dates are written year-month-day:** `2026-11-22`.
4. Lines starting with `#` are notes. The app ignores them.

---

## Places (`content/places.yaml`)

There are two types of place:
- `friend-pick` is a friend's recommendation. It appears in **Explore** under its stop, and tapping it opens the full pick.
- `my-place` is one of the traveller's own saved places. It appears in **Your places** and **Share your places**. The first one also appears on the Note screen.

### Add a place
1. Open `content/places.yaml` and click the pencil.
2. Find the section for the type you want (friends' picks are at the top, your own places at the bottom).
3. Copy the sample at the top of the file, or an existing place, and paste it as a new entry. Leave an empty line between places.
4. Remove any `#` signs from the copied sample. Every place line starts with `- type:`, and the lines under it start with **two spaces**.
5. Fill in the values. `stop` must be a stop name from `trip.yaml`, and `category` must be one of the categories there (Food, Sight, Nature, Trail, Shop, Stay).
6. Leave out any line marked "optional" that you don't need.
7. Commit.

### Edit a place
Change the text inside the quotes and commit.

### Remove a place
Delete the place's lines, from its `- type:` line down to the line before the next `- type:`. Commit.

Places in Explore appear in the order they're listed in this file.

---

## Photos (`content/photos/`)

1. Name the photo with **lowercase words joined by dashes**, starting with the stop. For example `jiufen-amei-teahouse.jpg`. No spaces or capitals. Use `.jpg`, `.png` or `.webp`.
2. On GitHub, open the `content/photos` folder and choose **Add file → Upload files**. Drag the photo in and commit.
3. Open `content/places.yaml` and add a line to the place:
   ```yaml
     photo: "jiufen-amei-teahouse.jpg"
   ```
   It goes with the other lines of that place, starting with two spaces.

You can upload photos straight from your phone. When the site is published, each photo is resized to a phone-friendly size (1200 pixels wide at most) and its hidden details, such as the GPS location, are removed. **The original you upload stays in the GitHub project**, so turn off location when you export the photo (on iPhone: Share → Options → Location off).

iPhone **HEIC** photos don't work in browsers. Export them as JPG first. The check tells you if you forget.

---

## Checklist, phrases, stops and wording

- **Checklist** (`content/checklist.yaml`): one entry per item. `hint` is the small grey line. `ticked: yes` makes the item start ticked. Items appear in file order.
- **Phrases** (`content/phrases.yaml`): one entry per phrase. `group` is the section heading. `pinned: yes` also shows the phrase at the top. `open_on_start: yes` opens it when the tab loads (use it on one phrase only).
- **Stops and dates** (`content/trip.yaml`):
  - `arrive` and `leave` set each stop's dates. The trip's length and the Note tab's days are worked out from them.
  - A stop without dates shows in Explore but not on the trip route. Taichung is an example.
  - `map_x` and `map_y` place the pin on the Explore map: `map_x` from 0 (left) to 350 (right), `map_y` from 0 (top) to 540 (bottom). Leave both out to hide a stop from Explore.
  - If you rename a stop, also change the `stop:` of its places in `places.yaml`. The check reminds you.
- **Wording** (`content/text.yaml`): every sentence on every screen, grouped by screen. Only change the text inside the quotes:
  - Words in `{curly brackets}` are filled in by the app. Keep them.
  - `**two stars**` around words make them bold.
  - The form on "A place you loved" has English (`en`) and Chinese (`zh`) wording.

---

## Previewing on your own computer (optional)

You don't need this to edit content. It's for seeing changes before publishing them.

1. Install **Node.js 24** from nodejs.org.
2. Download the project. On GitHub: **Code → Download ZIP**, then unzip it.
3. In a terminal, inside the project folder, run:
   ```bash
   npm install
   ```
4. Then run:
   ```bash
   npm run dev
   ```
5. Open http://localhost:5173. Changes to the content files show up when you save them.
6. To check the content without opening the app, run:
   ```bash
   npm run check
   ```

To jump straight to any screen, open http://localhost:5173/#/screens.

---

## How the site goes live

The workflow in `.github/workflows/deploy.yml` runs every time something changes on the `main` branch. It checks the content, builds the site, resizes the photos and publishes the result to **GitHub Pages**. If the check fails, it stops, and the previous version stays online.

**One-time setup** (done once, by whoever creates the GitHub project):
1. Create a repository on GitHub and upload this folder to it.
2. In the repository, go to **Settings → Pages**. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. After the first run, the site's address is shown on that page. It looks like `https://<account>.github.io/<repository>/`.

**Cloudflare Workers** can publish the same site. `wrangler.jsonc` holds its settings: the Worker is named `sweet-potato` and serves the built `dist` folder. In Cloudflare, set the build command to `npm run build` and the deploy command to `npx wrangler deploy`. `.node-version` tells Cloudflare to build with Node.js 24.

---

## Files you never need to touch

Everything outside `content/`:

- `src/`: the screens and layout
- `scripts/`: the content check and photo resizing
- `.github/`: publishing
- `index.html`, `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `wrangler.jsonc`, `.node-version`, `.gitignore`

If a content change seems to need one of these (a new screen, a new kind of field), that's a job for a developer.
