# Mohamad Sameer — Portfolio

Java Backend Developer & Video Editor portfolio. Built with HTML, CSS, JavaScript, GSAP (ScrollTrigger) and Lenis smooth scroll.

## Files
```
index.html      → all page content (edit text here)
style.css       → design, colors, layout
script.js       → animations + your YouTube video list
assets/         → photo, showreel video, resume PDFs
assets/logos/   → tech logos (SVG) used in the hero, marquee, projects and toolkit
vendor/         → GSAP (+ ScrollTrigger, SplitText, ScrambleText, CustomEase) and Lenis, saved locally
```

## Put it live on GitHub Pages (free)
1. On GitHub, create a new repo named **sameeer7.github.io** (exact name = your username + `.github.io`).
2. Click **Add file → Upload files**, drag in everything from this folder (keep the `assets` and `vendor` folders), then **Commit**.
3. Go to **Settings → Pages**, set Source to **Deploy from a branch**, branch **main**, folder **/ (root)**, Save.
4. After 1–2 minutes your site is live at **https://sameeer7.github.io**

## Easy edits
- **Add your YouTube videos:** open `script.js`, find `const VIDEOS = [`, and add lines like
  `{ id: "abc123XYZ", type: "short" },` — the id is the part after `/shorts/` or `v=` in the link.
- **Change the showreel:** replace `assets/showreel.mp4` (keep the same name, under ~10 MB).
- **Change colors:** in `style.css`, edit `--code` (blue) and `--cut` (amber) at the top.
