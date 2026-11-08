/* ==========================================================
   Mohamad Sameer — Portfolio scripts
   GSAP 3.13 + ScrollTrigger + SplitText + CustomEase + Lenis
   ========================================================== */

/* ----------------------------------------------------------
   ✏️ YOUR VIDEOS — paste YouTube video IDs here to show them.
   The ID is the part after "v=" or after "/shorts/" in the link.
   type: "short" (9:16) or "long" (16:9)
   Example: { id: "dQw4w9WgXcQ", type: "long" }
   ---------------------------------------------------------- */
const VIDEOS = [
  // { id: "YOUR_SHORT_ID", type: "short" },
  // { id: "YOUR_LONG_VIDEO_ID", type: "long" },
];

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const isTouch = matchMedia("(hover: none), (pointer: coarse)").matches;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

$("#year").textContent = new Date().getFullYear();

/* ---------------- Logos inside skill pills ---------------- */
const PILL_LOGOS = {
  "Java 8": "java", "Core Java": "java", "Spring Boot": "springboot", "Spring MVC": "spring", "Spring Security": "spring",
  "GraphQL": "graphql", "RabbitMQ": "rabbitmq", "PostgreSQL": "postgresql", "MySQL": "mysql", "Redis (basics)": "redis",
  "Git": "git", "Maven": "maven", "Postman": "postman", "JIRA": "jira", "Docker": "docker", "JUnit": "junit",
  "Spring Data JPA": "spring", "Canva": "canva", "ElevenLabs": "elevenlabs", "Google Flow": "google", "YouTube Analytics": "youtube",
};
$$(".pills span").forEach(p => {
  const f = PILL_LOGOS[p.textContent.trim()];
  if (f) p.insertAdjacentHTML("afterbegin", `<img src="assets/logos/${f}.svg" alt="" />`);
});

/* ---------------- Split text helpers ---------------- */
function splitChars(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map(w => `<span class="w">${[...w].map(c => `<span class="ch">${c}</span>`).join("")}</span>`).join(" ");
  return $$(".ch", el);
}
function splitWords(el) {
  // keeps child elements (like .hl) but wraps every word
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else { const s = document.createElement("span"); s.className = "word"; s.textContent = part; frag.appendChild(s); }
        });
        node.replaceChild(frag, n);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(el);
  return $$(".word", el);
}

/* ---------------- Videos grid ---------------- */
const vWrap = $("#videos");
VIDEOS.forEach(v => {
  const d = document.createElement("div");
  d.className = `vcard vcard--${v.type === "short" ? "short" : "long"}`;
  d.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${v.id}" title="YouTube video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  vWrap.appendChild(d);
});

/* ---------------- Copy email ---------------- */
$("#copyEmail").addEventListener("click", async e => {
  const btn = e.currentTarget, mail = "sameer.mohamad.m@gmail.com";
  try { await navigator.clipboard.writeText(mail); btn.classList.add("is-copied"); setTimeout(() => btn.classList.remove("is-copied"), 1800); }
  catch (err) { window.location.href = "mailto:" + mail; }
});

/* ---------------- Resume download → confetti party 🎉 ---------------- */
const dlToast = document.createElement("div");
dlToast.className = "dl-toast mono"; dlToast.setAttribute("role", "status"); document.body.appendChild(dlToast);
// one celebration used for resume downloads and for messages sent through the form
function party(el, message) {
  dlToast.textContent = message;
  dlToast.classList.add("is-on"); clearTimeout(dlToast._t); dlToast._t = setTimeout(() => dlToast.classList.remove("is-on"), 3000);
  if (reduceMotion || typeof confetti !== "function") return;
  const r = el.getBoundingClientRect(), colors = ["#5b8cff", "#ffb547", "#3ddc97", "#ff5c8a", "#ffffff"];
  const origin = { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight };
  confetti({ particleCount: 110, spread: 80, startVelocity: 45, origin, colors, ticks: 220, zIndex: 1100 });
  confetti({ particleCount: 30, spread: 120, startVelocity: 30, origin, colors, shapes: ["star"], scalar: 1.3, ticks: 240, zIndex: 1100 });
  setTimeout(() => {
    confetti({ particleCount: 70, angle: 60, spread: 65, startVelocity: 55, origin: { x: 0, y: .8 }, colors, zIndex: 1100 });
    confetti({ particleCount: 70, angle: 120, spread: 65, startVelocity: 55, origin: { x: 1, y: .8 }, colors, zIndex: 1100 });
  }, 220);
}
// the download itself carries on as normal
$$("a[download]").forEach(link => link.addEventListener("click", () => party(link, "📄 Resume downloading, thanks for checking it out! 🎉")));

/* ---------------- Contact form → Sameer's Gmail (FormSubmit) ---------------- */
const MAIL_TO = "sameer.mohamad.m@gmail.com";
const form = $("#contactForm");
if (form) form.addEventListener("submit", async e => {
  e.preventDefault();
  const status = $("#formStatus"), btn = form.querySelector(".cform__send");
  const f = Object.fromEntries(new FormData(form));
  if (f._honey) return; // bots fill the hidden field
  const bad = [];
  if (!f.name.trim()) bad.push("name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) bad.push("email");
  if (f.message.trim().length < 5) bad.push("message");
  $$("input, textarea", form).forEach(el => el.classList.toggle("is-bad", bad.includes(el.name)));
  if (bad.length) { status.className = "cform__status mono err"; status.textContent = "Please fill in your " + bad.join(", ") + "."; return; }
  btn.disabled = true; status.className = "cform__status mono"; status.textContent = "Sending…";
  try {
    const res = await fetch("https://formsubmit.co/ajax/" + MAIL_TO, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: f.name.trim(), email: f.email.trim(), company: f.company.trim() || "-", message: f.message.trim(),
        _subject: "Portfolio: new message from " + f.name.trim(), _replyto: f.email.trim(), _template: "table", _captcha: "false",
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (/activat/i.test(data.message || "")) { // first-time setup: FormSubmit is waiting for Sameer to click its activation email
      status.className = "cform__status mono err"; status.textContent = "Almost ready: the inbox owner still needs to activate this form. Please email me directly for now.";
      return;
    }
    if (!res.ok || String(data.success) !== "true") throw new Error(data.message || "send failed");
    form.reset(); status.className = "cform__status mono ok"; status.textContent = "Sent ✓ Thanks! I'll reply to you soon.";
    party(btn, "✉️ Message sent! I'll get back to you soon 🎉");
  } catch (err) {
    status.className = "cform__status mono err";
    status.innerHTML = `Couldn't send right now. Please email me at <a href="mailto:${MAIL_TO}" style="text-decoration:underline">${MAIL_TO}</a>`;
  } finally { btn.disabled = false; }
});

/* ---------------- Mobile menu ---------------- */
const burger = $("#burger"), menu = $("#menu");
burger.addEventListener("click", () => { burger.classList.toggle("is-open"); menu.classList.toggle("is-open"); });
$$("a", menu).forEach(a => a.addEventListener("click", () => { burger.classList.remove("is-open"); menu.classList.remove("is-open"); }));

/* ---------------- Showreel video ---------------- */
const reelVideo = $("#reelVideo"), reelSound = $("#reelSound"), reelFrame = $("#reelFrame");
const setSoundLabel = () => { reelSound.textContent = reelVideo.muted ? "🔇 Tap for sound" : "🔊 Sound on"; };
reelFrame.addEventListener("click", () => {
  reelVideo.muted = !reelVideo.muted;
  if (reelVideo.paused) reelVideo.play().catch(() => {});
  setSoundLabel();
});
reelVideo.addEventListener("timeupdate", () => {
  if (reelVideo.duration) $("#reelProgress").style.width = (reelVideo.currentTime / reelVideo.duration * 100) + "%";
});
// pause the reel when it's off-screen (saves battery on phones)
new IntersectionObserver(([en]) => { en.isIntersecting ? reelVideo.play().catch(() => {}) : reelVideo.pause(); }, { threshold: .2 }).observe(reelFrame);

/* ---------------- Video cards: preview clips ---------------- */
// Clips load only when first needed. Desktop: play on hover. Phones: play while the card is on screen.
const vidCards = $$(".vid");
const vidEl = card => { const v = card.querySelector("video"); if (!v.getAttribute("src") && v.dataset.src) v.src = v.dataset.src; return v; };
const playCard = card => { const v = vidEl(card); v.play().then(() => { if (!v.paused) card.classList.add("is-playing"); }).catch(() => {}); };
const stopCard = card => { const v = card.querySelector("video"); card.classList.remove("is-playing"); v.pause(); };
if (isTouch) {
  const io = new IntersectionObserver(entries => entries.forEach(en => en.isIntersecting ? playCard(en.target) : stopCard(en.target)), { threshold: .6 });
  vidCards.forEach(c => io.observe(c));
} else {
  vidCards.forEach(c => { c.addEventListener("pointerenter", () => playCard(c)); c.addEventListener("pointerleave", () => stopCard(c)); });
}
// the editor-panel clip only runs while visible
const edVideo = $(".editor__video");
if (edVideo) new IntersectionObserver(([en]) => { en.isIntersecting ? edVideo.play().catch(() => {}) : edVideo.pause(); }, { threshold: .15 }).observe(edVideo);

/* ---------------- Edit bay ruler + timecode ---------------- */
const pad = n => String(n).padStart(2, "0");
const toTC = secs => { const f = Math.floor((secs % 1) * 24), s = Math.floor(secs) % 60, m = Math.floor(secs / 60) % 60, h = Math.floor(secs / 3600); return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`; };
const ruler = $("#ruler");
for (let i = 0; i <= 6; i++) { const s = document.createElement("span"); s.textContent = `00:${pad(i * 10)}`; ruler.appendChild(s); }

/* ---------------- Terminal typing ---------------- */
const CODE = [
  ["c", "// Shopify order webhook → RabbitMQ → CW Suite\n"],
  ["a", "@Component\n"],
  ["k", "public class "], ["t", "OrderConsumer"], ["", " {\n\n"],
  ["", "  "], ["a", "@RabbitListener"], ["", "(queues = "], ["s", "\"shopify.orders\""], ["", ")\n"],
  ["", "  "], ["k", "public void "], ["", "consume("], ["t", "OrderEvent"], ["", " event) {\n"],
  ["", "    "], ["k", "if "], ["", "(repo.existsBySourceId(event.id())) {\n"],
  ["", "      "], ["k", "return"], ["", "; "], ["c", "// idempotent: no duplicates\n"],
  ["", "    }\n"],
  ["", "    orderService.create(event);\n"],
  ["", "  }\n}"],
];
let typed = false;
function typeCode() {
  if (typed) return; typed = true;
  const out = $("#typeCode");
  if (reduceMotion) { out.innerHTML = CODE.map(([c, t]) => `<span class="${c}">${t}</span>`).join(""); showOut(); return; }
  let ti = 0, ci = 0, span = null;
  (function step() {
    if (ti >= CODE.length) { showOut(); return; }
    const [cls, txt] = CODE[ti];
    if (ci === 0) { span = document.createElement("span"); span.className = cls; out.appendChild(span); }
    span.textContent += txt[ci++];
    if (ci >= txt.length) { ti++; ci = 0; }
    setTimeout(step, txt[ci - 1] === "\n" ? 70 : 14 + Math.random() * 18);
  })();
}
function showOut() {
  $$("#termOut span").forEach((s, i) => setTimeout(() => { s.style.transition = "all .5s"; s.style.opacity = 1; s.style.transform = "none"; }, 300 + i * 450));
}

/* ---------------- Mode (Code / Cut) ---------------- */
const root = document.documentElement;
// every visit opens in Code mode (the default); only a ?mode=cut or #cut link opens Cut
{ // a shared link like ?mode=cut or #cut opens that side directly
  const q = new URLSearchParams(location.search).get("mode"), h = location.hash.slice(1);
  if (q === "cut" || q === "code") root.dataset.mode = q; else if (h === "cut" || h === "code") root.dataset.mode = h;
}
const RESUME = { code: "assets/Sameer_Java_Backend_Resume.pdf", cut: "assets/Sameer_Video_Editor_Resume.pdf" };
const setResume = () => $$(".js-resume").forEach(a => a.setAttribute("href", RESUME[root.dataset.mode] || RESUME.code));
setResume();
let onModeChange = () => {}; // set up by the GSAP block: scroll to top, re-measure, replay reveals
const saveMode = () => { try { localStorage.setItem("ms-mode", root.dataset.mode); } catch (e) {} fitSwap(); setResume(); onModeChange(); inviteAfterSwitch(); };
// "build backends" / "cut stories": size the slot to the visible phrase so there's no gap
function fitSwap() {
  const active = $(root.dataset.mode === "cut" ? ".swap__b" : ".swap__a");
  if (active) $(".swap").style.width = active.offsetWidth + "px";
}
fitSwap();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitSwap);
window.addEventListener("resize", fitSwap);
let switching = false;
$("#modeToggle").addEventListener("click", e => {
  const next = root.dataset.mode === "code" ? "cut" : "code";
  if (!hasGsap || reduceMotion) { root.dataset.mode = next; saveMode(); return; }
  if (switching) return; switching = true;
  window.__lenis && window.__lenis.stop(); // no scrolling while the screen is covered

  // full-screen circular wipe in the new colour, starting from the toggle
  const r = e.currentTarget.getBoundingClientRect();
  const at = `${r.left + r.width / 2}px ${r.top + r.height / 2}px`;
  const wipe = $("#wipe"), label = $("#wipeLabel");
  wipe.style.background = getComputedStyle(root).getPropertyValue(next === "cut" ? "--cut" : "--code");
  label.textContent = next === "cut" ? "Editor" : "Engineer";
  const chars = splitChars(label);
  gsap.timeline({ onComplete: () => { switching = false; gsap.set(wipe, { clearProps: "clipPath" }); window.__lenis && window.__lenis.start(); } })
    .fromTo(wipe, { clipPath: `circle(0% at ${at})` }, { clipPath: `circle(150% at ${at})`, duration: .8, ease: "hop" })
    .from(chars, { yPercent: 120, rotate: 8, opacity: 0, duration: .55, stagger: .03, ease: "expo.out" }, "-=.35")
    .add(() => { root.dataset.mode = next; saveMode(); })
    .to(chars, { yPercent: -120, opacity: 0, duration: .4, stagger: .02, ease: "expo.in" }, "+=.15")
    .fromTo(wipe, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)", duration: .7, ease: "hop" }, "-=.15")
    .fromTo(".bg-glow", { scale: .8, opacity: .4 }, { scale: 1, opacity: 1, duration: 1, ease: "expo.out" }, "<");
});

/* ---------------- Switch invite: the other side asks to be clicked ---------------- */
// Code mode → the ✂ Cut side snips + glows amber; Cut mode → the </> Code side bounces + glows blue.
const modeBtn = $("#modeToggle"), modeHint = $("#modeHint");
const HINT_TXT = { code: "<b>✂</b>I'm also a video editor. <u>Peek →</u>", cut: "<b>&lt;/&gt;</b>See the developer side. <u>Switch →</u>" };
let hasSwitched = false, hintShows = 0, inviteTl = null;
try { hasSwitched = localStorage.getItem("ms-switched") === "1"; } catch (e) {}
const otherOpt = () => $(root.dataset.mode === "code" ? ".mode__opt--cut" : ".mode__opt--code");
function placeHint() {
  const r = otherOpt().getBoundingClientRect(), w = modeHint.offsetWidth, cx = r.left + r.width / 2;
  const left = Math.max(12, Math.min(innerWidth - w - 12, cx - w / 2));
  modeHint.style.left = left + "px"; modeHint.style.top = r.bottom + 14 + "px"; modeHint.style.setProperty("--ax", cx - left + "px");
}
function hideHint() { if (!window.gsap) return; gsap.killTweensOf(modeHint); gsap.to(modeHint, { opacity: 0, y: -6, duration: .25, onComplete: () => gsap.set(modeHint, { visibility: "hidden" }) }); }
function showHint() {
  if (!window.gsap || reduceMotion || hasSwitched || hintShows >= 2 || scrollY > 150 || document.body.classList.contains("is-loading")) return;
  hintShows++; modeHint.innerHTML = HINT_TXT[root.dataset.mode]; placeHint();
  gsap.killTweensOf(modeHint);
  gsap.timeline()
    .set(modeHint, { visibility: "visible" })
    .fromTo(modeHint, { opacity: 0, y: -12, scale: .8, transformOrigin: "50% 0" }, { opacity: 1, y: 0, scale: 1, duration: .7, ease: "back.out(2.4)" })
    .to(modeHint, { y: -3, duration: .5, yoyo: true, repeat: 7, ease: "sine.inOut" })
    .to(modeHint, { opacity: 0, y: -8, duration: .4 })
    .set(modeHint, { visibility: "hidden" });
}
function buildInvite() {
  if (!window.gsap || reduceMotion) return;
  inviteTl && inviteTl.kill();
  const toCut = root.dataset.mode === "code", rgb = toCut ? "255,181,71" : "91,140,255";
  inviteTl = gsap.timeline({ repeat: -1, repeatDelay: hasSwitched ? 7 : 2.6, delay: .8 })
    .fromTo(".mode__invite", { boxShadow: `0 0 0 0 rgba(${rgb},.7)` }, { boxShadow: `0 0 0 12px rgba(${rgb},0)`, duration: 1.2, ease: "power2.out" }, 0);
  if (toCut) { // snip-snip
    const sc = $(".mode__ico--cut");
    inviteTl.to(sc, { rotate: -30, scale: 1.4, duration: .13, ease: "power2.out" }, 0)
      .to(sc, { rotate: 0, scale: 1.1, duration: .11, ease: "power2.in" })
      .to(sc, { rotate: -30, scale: 1.4, duration: .13, ease: "power2.out" })
      .to(sc, { rotate: 0, scale: 1, duration: .6, ease: "elastic.out(1, .4)" });
  } else { // brackets breathe apart, slash tilts
    const [a, sl, b] = $$(".mode__ico--code i");
    inviteTl.to(a, { x: -4, duration: .25, ease: "power2.out" }, 0).to(b, { x: 4, duration: .25, ease: "power2.out" }, 0)
      .to(sl, { rotate: 25, scale: 1.25, duration: .25, ease: "power2.out" }, 0)
      .to([a, sl, b], { x: 0, rotate: 0, scale: 1, duration: .7, ease: "elastic.out(1, .4)" }, .3);
  }
}
// hover: sparks fly from the scissors, or 0s and 1s float up from the code side
function burst() {
  if (!window.gsap || reduceMotion) return;
  const toCut = root.dataset.mode === "code", opt = otherOpt(), b = modeBtn.getBoundingClientRect(), o = opt.getBoundingClientRect();
  for (let i = 0; i < 6; i++) {
    const s = document.createElement("span"); s.className = "mode-bit";
    s.textContent = toCut ? (i % 2 ? "✦" : "·") : (Math.random() > .5 ? "1" : "0");
    s.style.color = toCut ? "#ffb547" : "#8fb2ff";
    s.style.left = (o.left - b.left + 10 + Math.random() * (o.width - 20)) + "px"; s.style.top = (o.top - b.top + o.height / 2 - 6) + "px";
    modeBtn.appendChild(s);
    gsap.to(s, toCut
      ? { x: gsap.utils.random(-26, 26), y: gsap.utils.random(-24, 24), rotate: gsap.utils.random(-90, 90), opacity: 0, scale: 1.6, duration: .7, ease: "power3.out", onComplete: () => s.remove() }
      : { y: gsap.utils.random(-34, -20), x: gsap.utils.random(-6, 6), opacity: 0, duration: .9, delay: i * .05, ease: "power2.out", onComplete: () => s.remove() });
  }
  const sc = $(".mode__ico--cut");
  if (toCut) gsap.fromTo(sc, { rotate: -35, scale: 1.45 }, { rotate: 0, scale: 1, duration: .6, ease: "elastic.out(1, .35)" });
}
modeBtn.addEventListener("pointerenter", burst);
modeHint.addEventListener("click", () => { hideHint(); modeBtn.click(); });
$$("[data-switch]").forEach(b => b.addEventListener("click", () => modeBtn.click()));
window.addEventListener("scroll", () => { if (scrollY > 150 && modeHint.style.visibility === "visible") hideHint(); }, { passive: true });
window.addEventListener("resize", () => { if (modeHint.style.visibility === "visible") placeHint(); });
window.addEventListener("site:ready", () => { buildInvite(); setTimeout(showHint, 2200); setTimeout(showHint, 22000); });
function inviteAfterSwitch() {
  hasSwitched = true; try { localStorage.setItem("ms-switched", "1"); } catch (e) {}
  hideHint(); buildInvite();
}

/* ==========================================================
   GSAP animations
   ========================================================== */
if (!hasGsap) {
  // Fallback: libraries failed to load — show everything statically
  $("#loader").remove(); document.body.classList.remove("is-loading");
  $(".viewfinder__img").style.clipPath = "none";
  $$(".about__text .word").forEach(e => e.style.opacity = 1);
  typeCode();
} else {
  const plugins = [ScrollTrigger];
  if (window.SplitText) plugins.push(SplitText);
  if (window.CustomEase) plugins.push(CustomEase);
  gsap.registerPlugin(...plugins);
  if (window.CustomEase) {
    CustomEase.create("hop", ".77,0,.175,1");
    CustomEase.create("silk", ".16,1,.3,1");
  } else {
    gsap.registerEase("hop", gsap.parseEase("expo.inOut"));
    gsap.registerEase("silk", gsap.parseEase("expo.out"));
  }
  gsap.defaults({ ease: "silk" });
  document.body.classList.add("is-loading");

  /* ---- Smooth scroll (Lenis) ---- */
  let lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({ lerp: .085, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.4 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const id = a.getAttribute("href"); const target = id === "#top" ? 0 : $(id);
    if (target === null) return; e.preventDefault();
    lenis ? lenis.scrollTo(target, { offset: 0, duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4) })
          : (target === 0 ? scrollTo({ top: 0, behavior: "smooth" }) : target.scrollIntoView({ behavior: "smooth" }));
  }));

  /* ---- Split targets ---- */
  const heroChars = $$(".hero__title .split").map(splitChars);
  const contactChars = $$(".contact__big .split").map(splitChars);
  gsap.set(heroChars.flat(), { yPercent: 115, rotate: 6 });

  /* ---- Preloader: the "Code → Cut" motion logo (motion-logo.js) ---- */
  const counter = { v: 0 };
  let seenBefore = false;
  try { seenBefore = localStorage.getItem("ms-seen") === "1"; localStorage.setItem("ms-seen", "1"); } catch (e) {}
  const quick = seenBefore || reduceMotion;
  const logoTl = window.MotionLogo ? MotionLogo($("#loaderLogo")) : gsap.timeline();
  logoTl.timeScale(quick ? 3 : 1.5);
  gsap.timeline()
    .add(logoTl, 0)
    .to(counter, { v: 100, duration: reduceMotion ? .2 : quick ? .75 : 1.55, ease: "power2.inOut", onUpdate: () => {
      $("#loaderCount").textContent = String(Math.round(counter.v)).padStart(3, "0");
      $("#loaderBar").style.width = counter.v + "%";
    } }, 0)
    .to("#loaderLogo", { scale: 1.08, opacity: 0, filter: "blur(8px)", duration: .35, ease: "power2.in" }, quick ? "+=.02" : "+=.15")
    .to(".loader__top, .loader__bottom", { opacity: 0, duration: .3, ease: "power2.out" }, "<") // nothing lingers on the curtain
    .to(".loader__curtain", { scaleY: 1, duration: .5, ease: "hop" }, "-=.35")
    .to("#loader", { yPercent: -100, duration: .8, ease: "hop" })
    .add(() => { $("#loader").remove(); document.body.classList.remove("is-loading"); lenis && lenis.start(); ScrollTrigger.refresh(); window.dispatchEvent(new Event("site:ready")); })
    .add(heroIntro(), "-=.6");

  function heroIntro() {
    const tl = gsap.timeline();
    tl.to(heroChars[0], { yPercent: 0, rotate: 0, duration: 1.3, stagger: .04, ease: "expo.out" })
      .to(heroChars[1], { yPercent: 0, rotate: 0, duration: 1.3, stagger: .04, ease: "expo.out" }, "-=1.15")
      .to(".viewfinder__img", { clipPath: "inset(0% 0 0 0 round 18px)", duration: 1.5, ease: "hop" }, "-=1.3")
      .to(".viewfinder__img img", { scale: 1, duration: 2, ease: "expo.out" }, "<")
      .from(".vf-corner", { scale: 0, opacity: 0, duration: .6, stagger: .08, ease: "back.out(2)" }, "-=1")
      .from(".vf-tag", { y: 20, opacity: 0, duration: .8 }, "-=.8")
      .from(".hero__lead, .hero__sub, .hero__ctas, .hero__switch, .hero__scroll", { y: 30, opacity: 0, duration: 1.1, stagger: .08 }, "-=1.3")
      .from(".hero__meta span", { y: 14, opacity: 0, duration: .8, stagger: .08 }, "<")
      .fromTo(".nav", { yPercent: -100, y: 0, opacity: 0 }, { yPercent: 0, y: 0, opacity: 1, duration: .9, clearProps: "transform,translate" }, .3);
    return tl;
  }

  /* ---- Scroll progress bar ---- */
  gsap.to("#progressBar", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });

  /* ---- Hero: rubber-band letters on hover ---- */
  if (!isTouch) [...heroChars.flat(), ...contactChars.flat()].forEach(ch => {
    ch.addEventListener("pointerenter", () => {
      if (gsap.isTweening(ch) && ch._rb) return;
      ch._rb = true;
      gsap.timeline({ onComplete: () => (ch._rb = false) })
        .to(ch, { scaleY: .72, scaleX: 1.18, transformOrigin: "50% 100%", duration: .12, ease: "power2.out" })
        .to(ch, { scaleY: 1, scaleX: 1, duration: .9, ease: "elastic.out(1.2, .3)" });
    });
  });

  /* ---- Hero: 3D photo follows the mouse, chips float at different depths ---- */
  if (!isTouch && !reduceMotion) {
    const vf = $("#vfInner"), hero = $(".hero");
    const rX = gsap.quickTo(vf, "rotationX", { duration: .9, ease: "power3" }), rY = gsap.quickTo(vf, "rotationY", { duration: .9, ease: "power3" });
    const chipMoves = $$(".chip").map(c => ({ x: gsap.quickTo(c, "x", { duration: 1, ease: "power3" }), d: +c.dataset.depth || 1 }));
    hero.addEventListener("pointermove", e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      rY(x * 14); rX(-y * 10);
      chipMoves.forEach(c => c.x(x * 26 * c.d));
      const r = vf.getBoundingClientRect();
      vf.style.setProperty("--sx", ((e.clientX - r.left) / r.width * 100) + "%");
      vf.style.setProperty("--sy", ((e.clientY - r.top) / r.height * 100) + "%");
    });
    hero.addEventListener("pointerleave", () => { rX(0); rY(0); chipMoves.forEach(c => c.x(0)); });
  }
  gsap.to(".viewfinder__img img", { yPercent: -12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .6 } });
  gsap.to(".hero__left", { yPercent: -14, opacity: .2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .6 } });
  gsap.to(".viewfinder", { yPercent: 10, scale: .94, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .6 } });

  /* ---- Nav hide/show ---- */
  const nav = $("#nav"); let lastY = 0;
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: self => {
    const y = self.scroll();
    nav.classList.toggle("is-scrolled", y > 40);
    nav.classList.toggle("is-hidden", y > lastY && y > 400 && !menu.classList.contains("is-open"));
    lastY = y;
  } });

  /* ---- Marquee: infinite, speeds up and flips with scroll direction ---- */
  ["#marquee1", "#marquee2", "#marquee3", "#marquee4"].forEach(id => { const el = $(id); if (el) el.innerHTML += el.innerHTML; });
  const m1 = gsap.to(["#marquee1", "#marquee4"], { xPercent: -50, duration: 32, ease: "none", repeat: -1 });
  const m2 = gsap.fromTo(["#marquee2", "#marquee3"], { xPercent: -50 }, { xPercent: 0, duration: 34, ease: "none", repeat: -1 });
  let mDir = 1;
  ScrollTrigger.create({ onUpdate: self => {
    if (self.direction !== mDir) mDir = self.direction;
    const v = Math.min(Math.abs(self.getVelocity()) / 260, 5);
    gsap.to([m1, m2], { timeScale: (1 + v) * mDir, duration: .25, overwrite: true });
    gsap.to([m1, m2], { timeScale: mDir, duration: 1.2, delay: .25, overwrite: false });
  } });

  /* ---- Velocity skew: cards lean with scroll speed, then settle ---- */
  if (!reduceMotion) {
    const skewTargets = $$(".tl-item__card, .ch-card, .reel__frame, .skills__col");
    const setters = skewTargets.map(el => gsap.quickTo(el, "skewY", { duration: .6, ease: "power3" }));
    const settle = gsap.delayedCall(.12, () => setters.forEach(fn => fn(0))).pause();
    ScrollTrigger.create({ onUpdate: self => {
      const s = gsap.utils.clamp(-2.5, 2.5, self.getVelocity() / -500);
      setters.forEach(fn => fn(s));
      settle.restart(true); // straighten back up as soon as scrolling stops
    } });
  }

  /* ---- Showreel grows on scroll ---- */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 1025px)", () => {
    gsap.fromTo("#reelFrame", { width: "62%", borderRadius: 22 }, { width: "100%", borderRadius: 8, ease: "none", scrollTrigger: { trigger: "#reel", start: "top 85%", end: "bottom 70%", scrub: .8 } });
  });
  gsap.from("#reelFrame", { y: 100, opacity: 0, clipPath: "inset(18% 10% 18% 10% round 22px)", duration: 1.4, scrollTrigger: { trigger: "#reel", start: "top 85%" } });

  /* ---- About: words light up while scrolling ---- */
  $$(".about__text").forEach(p => {
    gsap.to(splitWords(p), { opacity: 1, stagger: .05, ease: "none", scrollTrigger: { trigger: p, start: "top 80%", end: "bottom 45%", scrub: .5 } });
  });

  /* ---- Stats counters ---- */
  $$(".stat__num").forEach(el => {
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0), o = { v: 0 };
    gsap.to(o, { v: end, duration: 2.2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" }, onUpdate: () => el.textContent = o.v.toFixed(dec) });
  });
  gsap.from(".stat", { y: 60, opacity: 0, duration: 1.1, stagger: .1, scrollTrigger: { trigger: ".stats", start: "top 85%" } });

  /* ---- Headings: words rise from behind a mask ---- */
  $$(".split-up").forEach(h => {
    let w;
    if (window.SplitText) {
      const st = SplitText.create(h, { type: "words", mask: "words", wordsClass: "w-up" });
      // give italic words room so their slanted edge isn't cut off by the mask
      (st.masks || []).forEach(m => { m.style.paddingRight = ".1em"; m.style.marginRight = "-.1em"; });
      w = st.words;
    }
    else { w = splitWords(h); w.forEach(x => (x.style.display = "inline-block")); }
    gsap.from(w, { yPercent: 115, rotate: 5, duration: 1.2, stagger: .07, scrollTrigger: { trigger: h, start: "top 86%" } });
  });

  /* ---- Eyebrows: clean wipe-in from the left ---- */
  $$(".eyebrow").forEach(el => {
    gsap.fromTo(el, { clipPath: "inset(0 100% 0 0)", x: -12, opacity: 0 }, { clipPath: "inset(0 0% 0 0)", x: 0, opacity: 1, duration: 1.1, ease: "hop", scrollTrigger: { trigger: el, start: "top 92%" } });
  });
  $$(".section__lead").forEach(el => gsap.from(el, { y: 24, opacity: 0, duration: 1, scrollTrigger: { trigger: el, start: "top 90%" } }));

  /* ---- Two worlds panels ---- */
  gsap.from(".terminal", { x: -80, rotateY: 8, opacity: 0, duration: 1.3, transformPerspective: 1200, scrollTrigger: { trigger: ".worlds__grid", start: "top 80%", onEnter: typeCode } });
  gsap.from(".editor", { x: 80, rotateY: -8, opacity: 0, duration: 1.3, transformPerspective: 1200, scrollTrigger: { trigger: ".worlds__grid", start: "top 80%" } });
  const captions = ["Let's learn something new!", "Meet Sam, Rosy & Coco", "Ready? Let's go! 🚀"];
  gsap.fromTo("#miniPlayhead", { left: "56px" }, { left: "calc(100% - 16px)", duration: 9, ease: "none", repeat: -1 });
  let capI = 0;
  setInterval(() => { capI = (capI + 1) % captions.length; gsap.to("#caption", { opacity: 0, y: 6, duration: .25, onComplete: () => { $("#caption").textContent = captions[capI]; gsap.to("#caption", { opacity: 1, y: 0, duration: .3 }); } }); }, 3000);

  /* ---- Experience timeline ---- */
  gsap.to("#tlFill", { height: "100%", ease: "none", scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 60%", scrub: .6 } });
  $$(".tl-item").forEach(item => {
    const card = item.querySelector(".tl-item__card");
    gsap.from(card, { y: 70, opacity: 0, clipPath: "inset(0% 0% 100% 0% round 18px)", duration: 1.3, scrollTrigger: { trigger: item, start: "top 85%" } });
    gsap.from(card.querySelectorAll("li, .tags span"), { x: -16, opacity: 0, duration: .8, stagger: .05, delay: .25, scrollTrigger: { trigger: item, start: "top 85%" } });
    gsap.from(item.querySelector(".tl-item__dot"), { scale: 0, duration: .7, ease: "back.out(3)", scrollTrigger: { trigger: item, start: "top 80%" } });
    gsap.from(item.querySelector(".tl-item__date"), { x: -20, opacity: 0, duration: .9, scrollTrigger: { trigger: item, start: "top 85%" } });
  });

  /* ---- Work: horizontal scroll (desktop / tablet) ---- */
  mm.add("(min-width: 761px)", () => {
    const track = $("#workTrack");
    const dist = () => Math.max(0, track.scrollWidth + track.getBoundingClientRect().left - window.innerWidth + 40);
    const tween = gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: ".work", pin: ".work__pin", start: "top top", end: () => "+=" + dist(), scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
    // heading steps back and fades as the first card slides over it, so nothing overlaps
    gsap.to(".work__head", { x: -80, opacity: 0, scale: .92, transformOrigin: "left center", ease: "none", scrollTrigger: { trigger: ".work", start: "top top", end: () => "+=" + Math.min(dist(), $(".work__head").offsetWidth * 1.1), scrub: 1, invalidateOnRefresh: true } });
    $$(".case:not(.case--end)").forEach(c => {
      gsap.from(c, { rotateY: -18, scale: .9, opacity: .3, transformPerspective: 1400, transformOrigin: "left center", ease: "none", scrollTrigger: { trigger: c, containerAnimation: tween, start: "left 100%", end: "left 55%", scrub: true } });
      gsap.from(c.querySelectorAll(".case__title, .flow, .tags span"), { y: 40, opacity: 0, duration: 1, stagger: .08, scrollTrigger: { trigger: c, containerAnimation: tween, start: "left 80%" } });
    });
  });
  mm.add("(max-width: 760px)", () => {
    $$(".case").forEach(c => gsap.from(c, { y: 60, opacity: 0, duration: 1, scrollTrigger: { trigger: c, start: "top 88%" } }));
  });
  $$(".case").forEach(c => c.addEventListener("pointermove", e => {
    const r = c.getBoundingClientRect(); c.style.setProperty("--mx", e.clientX - r.left + "px"); c.style.setProperty("--my", e.clientY - r.top + "px");
  }));

  /* ---- Edit bay: scroll scrubs the playhead ---- */
  const scenes = $$(".scene"), bayTc = $("#bayTc"), bayPlayhead = $("#bayPlayhead"), phLabel = $("#bayPlayhead span");
  let activeScene = 0;
  ScrollTrigger.create({
    trigger: "#bayPin", pin: true, start: () => window.innerWidth > 760 ? "top 12%" : "top 10%", end: "+=180%", scrub: true,
    onUpdate: self => {
      const p = self.progress;
      bayPlayhead.style.left = `calc(${42 + 14}px + (100% - ${42 + 28}px) * ${p})`;
      const tc = toTC(p * 60); bayTc.textContent = tc; phLabel.textContent = tc.slice(3, 8);
      const idx = Math.min(scenes.length - 1, Math.floor(p * scenes.length));
      if (idx !== activeScene) {
        gsap.to(scenes[activeScene], { opacity: 0, scale: 1.06, filter: "blur(6px)", duration: .45, overwrite: true });
        gsap.fromTo(scenes[idx], { opacity: 0, scale: .94, filter: "blur(8px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: .6, overwrite: true });
        gsap.fromTo(scenes[idx].querySelector("b"), { yPercent: 50, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .7 });
        gsap.fromTo(scenes[idx].querySelector("em"), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .7, delay: .08 });
        activeScene = idx;
      }
    }
  });
  gsap.from(".meter b", { scaleX: 0, duration: 1.4, stagger: .12, scrollTrigger: { trigger: ".nle", start: "top 75%" } });
  gsap.from(".nle__timeline .clip", { scaleX: 0, transformOrigin: "left", duration: .8, stagger: .025, scrollTrigger: { trigger: ".nle", start: "top 70%" } });

  /* ---- Channel card + tilt ---- */
  gsap.from(".channels .ch-card", { y: 90, opacity: 0, duration: 1.3, scrollTrigger: { trigger: ".channels__grid", start: "top 85%" } });
  /* ---- Code in Motion: cinematic reveal, parallax, light sweep, kinetic headline ---- */
  if ($("#teach")) {
    // 1. the episode card opens like a shutter, then a light sweep crosses it
    gsap.timeline({ scrollTrigger: { trigger: ".teach__grid", start: "top 82%" } })
      .fromTo(".teach__feature", { clipPath: "inset(48% 48% 48% 48% round 18px)", rotateX: 12, y: 60, transformPerspective: 1400 },
        { clipPath: "inset(0% 0% 0% 0% round 18px)", rotateX: 0, y: 0, duration: 1.5, ease: "hop", clearProps: "clipPath" })
      .from(".teach__feature .vid__fmt, .teach__feature .vid__time", { y: -16, opacity: 0, duration: .7, stagger: .08 }, "-=.6")
      .from(".teach__feature .vid__meta b", { yPercent: 60, opacity: 0, duration: .9 }, "<")
      .from(".teach__feature .vid__play", { scale: 0, rotate: -90, duration: 1, ease: "back.out(2.2)" }, "<.1")
      .fromTo(".teach__sheen", { xPercent: -120 }, { xPercent: 120, duration: 1.2, ease: "power2.inOut" }, "-=.7")
      // 2. the channel card rises in 3D beside it
      .from(".ch-card--cim", { x: 80, rotateY: -16, opacity: 0, transformPerspective: 1200, duration: 1.3 }, .25)
      .from(".ch-card__avatar--cim", { scale: 0, rotation: -220, duration: 1.4, ease: "elastic.out(1, .55)" }, .6)
      .from(".ch-card--cim h3", { yPercent: 70, opacity: 0, duration: 1 }, .7)
      // 3. learning path draws in, row by row, from the live episode
      .from(".teach__path li", { clipPath: "inset(0 100% 0 0)", x: -10, duration: .8, stagger: .07, ease: "hop" }, .9)
      .from(".teach__path li.is-live i", { scale: 0, duration: .6, ease: "back.out(3)" }, "-=.3");
    // 4. scroll parallax inside the episode card + a slow orbiting border light
    gsap.fromTo(".teach__feature img", { yPercent: -2.5, scale: 1.06 }, { yPercent: 2.5, scale: 1.06, ease: "none", scrollTrigger: { trigger: ".teach__feature", start: "top bottom", end: "bottom top", scrub: .8 } });
    const ring = gsap.to(".teach__ring", { "--spin": "360deg", duration: 6, ease: "none", repeat: -1, paused: true });
    ScrollTrigger.create({ trigger: ".teach__grid", start: "top bottom", end: "bottom top", onToggle: st => st.isActive ? ring.play() : ring.pause() });
    $(".teach__feature").addEventListener("pointerenter", () => gsap.fromTo(".teach__sheen", { xPercent: -120 }, { xPercent: 120, duration: .9, ease: "power2.inOut" }));
    // 5. kinetic headline: "in motion." dashes forward with speed lines every few seconds
    const accent = $(".teach .accent-code"), streaks = $(".teach__streaks");
    if (accent && !reduceMotion) {
      const kick = gsap.timeline({ repeat: -1, repeatDelay: 3.2, paused: true })
        .set(streaks, { opacity: 1 })
        .fromTo(accent, { x: -46, skewX: -18 }, { x: 0, skewX: 0, duration: .9, ease: "elastic.out(1.1, .45)" })
        .fromTo(".teach__streaks i", { scaleX: 1.6, transformOrigin: "right center", opacity: 1 }, { scaleX: 0, opacity: 0, duration: .55, stagger: .05, ease: "power3.out" }, 0)
        .set(streaks, { opacity: 0 });
      ScrollTrigger.create({ trigger: ".teach", start: "top 75%", end: "bottom top", onToggle: st => st.isActive ? kick.play() : kick.pause() });
    }
    // 6. "Built with code" decodes like a terminal
    const built = $(".teach__built");
    if (built) {
      const final = built.innerHTML, plain = built.textContent, glyphs = "01<>{}[]/=+*#$%&";
      ScrollTrigger.create({ trigger: built, start: "top 95%", onEnter: () => {
        if (reduceMotion) return;
        const o = { p: 0 };
        gsap.to(o, { p: 1, duration: 1.6, ease: "power2.out", onUpdate: () => {
          const n = Math.floor(o.p * plain.length);
          built.textContent = plain.slice(0, n) + [...plain.slice(n)].map(c => c === " " ? " " : glyphs[(Math.random() * glyphs.length) | 0]).join("").slice(0, Math.max(0, Math.min(18, plain.length - n)));
        }, onComplete: () => (built.innerHTML = final) });
      } });
    }
  }
  gsap.from(".ch-card__steps li", { x: 40, opacity: 0, duration: .9, stagger: .07, scrollTrigger: { trigger: ".channels__grid", start: "top 75%" } });
  if (!isTouch) $$(".tilt").forEach(card => {
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      gsap.to(card, { rotateY: x * 8, rotateX: -y * 8, transformPerspective: 1100, duration: .6, ease: "power3.out" });
      const g = card.querySelector(".ch-card__glow"); if (g) gsap.to(g, { x: x * 120, y: y * 120, duration: .8 });
    });
    card.addEventListener("pointerleave", () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: .9, ease: "elastic.out(1, .5)" }));
  });

  /* ---- Sam logo pops in and bobs ---- */
  gsap.from(".channels .ch-card__avatar", { scale: 0, rotation: -200, duration: 1.4, ease: "elastic.out(1, .55)", scrollTrigger: { trigger: ".channels__grid", start: "top 75%" } });
  gsap.to(".channels .ch-card__avatar", { y: -8, rotation: 6, duration: 1.8, repeat: -1, yoyo: true, ease: "sine.inOut" });

  /* ---- Video trio: curtain reveal, image settles, Shorts drift with scroll ---- */
  gsap.from(".gallery__head > *", { y: 30, opacity: 0, duration: 1, stagger: .1, scrollTrigger: { trigger: ".gallery", start: "top 85%" } });
  gsap.from(".trio .vid", { y: 80, clipPath: "inset(100% 0% 0% 0% round 18px)", duration: 1.4, stagger: .14, ease: "hop", scrollTrigger: { trigger: ".trio", start: "top 85%" } });
  gsap.from(".trio .vid img", { scale: 1.35, duration: 1.8, stagger: .14, ease: "expo.out", scrollTrigger: { trigger: ".trio", start: "top 85%" } });
  mm.add("(min-width: 761px)", () => {
    $$(".trio .vid--short").forEach((c, i) => gsap.fromTo(c, { yPercent: 8 + i * 5 }, { yPercent: -6 - i * 4, ease: "none", scrollTrigger: { trigger: ".trio", start: "top bottom", end: "bottom top", scrub: .8 } }));
  });
  if (!isTouch) vidCards.forEach(c => {
    c.addEventListener("pointermove", e => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      gsap.to(c, { rotationY: x * 10, rotationX: -y * 10, transformPerspective: 900, duration: .5, ease: "power3.out" });
    });
    c.addEventListener("pointerleave", () => gsap.to(c, { rotationX: 0, rotationY: 0, duration: .9, ease: "elastic.out(1, .5)" }));
  });

  /* ---- More Shorts strip ---- */
  gsap.from("#moreShorts > *", { y: 60, opacity: 0, rotate: 3, duration: 1.1, stagger: .09, scrollTrigger: { trigger: "#moreShorts", start: "top 88%" } });
  gsap.from(".gallery__head--more > *", { y: 24, opacity: 0, duration: .9, stagger: .08, scrollTrigger: { trigger: ".gallery__head--more", start: "top 90%" } });

  /* ---- Floating resume button: visible after the hero, hidden near the contact section ---- */
  const floatCta = $("#floatCta");
  const setFloat = () => {
    const y = scrollY, heroEnd = $(".hero").offsetHeight * .8, contactTop = $("#contact").getBoundingClientRect().top + y - innerHeight * .6;
    floatCta.classList.toggle("is-visible", y > heroEnd && y < contactTop);
  };
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: setFloat }); setFloat();

  /* ---- Logo wall: tiles fly in from everywhere and assemble ---- */
  const tiles = $$(".logo");
  mm.add("(min-width: 761px)", () => {
    const rnd = gsap.utils.random;
    tiles.forEach(t => gsap.from(t, {
      x: () => rnd(-innerWidth * .35, innerWidth * .35), y: () => rnd(180, 520), rotation: () => rnd(-50, 50),
      scale: () => rnd(.3, .7), opacity: 0, ease: "power2.out",
      scrollTrigger: { trigger: "#stack", start: "top 98%", end: "top 35%", scrub: 1, invalidateOnRefresh: true },
    }));
  });
  mm.add("(max-width: 760px)", () => {
    ScrollTrigger.batch(tiles, { start: "top 92%", once: true, onEnter: b => gsap.from(b, { y: 50, scale: .6, opacity: 0, rotation: () => gsap.utils.random(-20, 20), duration: .9, stagger: .05, ease: "back.out(1.6)" }) });
  });
  if (!isTouch) tiles.forEach(t => {
    const img = t.querySelector("img");
    t.addEventListener("pointermove", e => {
      const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      gsap.to(t, { rotationY: x * 26, rotationX: -y * 26, transformPerspective: 600, duration: .5, ease: "power3.out" });
      gsap.to(img, { x: x * 10, y: y * 10, scale: 1.14, duration: .5 });
    });
    t.addEventListener("pointerleave", () => { gsap.to(t, { rotationX: 0, rotationY: 0, duration: 1, ease: "elastic.out(1, .4)" }); gsap.to(img, { x: 0, y: 0, scale: 1, duration: .8 }); });
  });
  // the RabbitMQ tile gently pulses — it's the star of the backend work
  gsap.to(".logo--star", { boxShadow: "0 0 50px -6px rgba(255,102,0,.55)", duration: 1.6, repeat: -1, yoyo: true, ease: "sine.inOut" });

  /* ---- Skills + education ---- */
  $$(".skills__col").forEach(col => {
    gsap.from(col, { y: 60, opacity: 0, duration: 1.2, scrollTrigger: { trigger: col, start: "top 88%" } });
    gsap.from(col.querySelectorAll(".pills span"), { y: 20, opacity: 0, scale: .8, duration: .6, stagger: .02, ease: "back.out(2)", scrollTrigger: { trigger: col, start: "top 80%" } });
  });
  gsap.from(".edu__item", { y: 40, opacity: 0, duration: 1, stagger: .1, scrollTrigger: { trigger: ".edu", start: "top 88%" } });

  /* ---- Contact ---- */
  gsap.set(contactChars.flat(), { yPercent: 115, rotate: 6 });
  gsap.to(contactChars.flat(), { yPercent: 0, rotate: 0, duration: 1.3, stagger: .025, ease: "expo.out", scrollTrigger: { trigger: ".contact__big", start: "top 85%" } });
  gsap.from(".cform, .email, .contact__links a, .resume", { y: 40, opacity: 0, duration: 1, stagger: .06, scrollTrigger: { trigger: ".email", start: "top 92%" } });
  gsap.from(".footer > *", { y: 20, opacity: 0, duration: .8, stagger: .1, scrollTrigger: { trigger: ".footer", start: "top 98%" } });

  /* ---- Mode switch: new sections appear, so re-measure and replay their scroll reveals ---- */
  onModeChange = () => {
    lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : window.scrollTo(0, 0);
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
    // scroll-linked effects (hero fade, parallax) must land exactly on their top-of-page state
    const settle = () => ScrollTrigger.getAll().forEach(st => {
      if (!st.vars.scrub || !st.animation) return;
      const t = st.getTween && st.getTween(); t && t.progress(1);
      st.animation.progress(st.progress);
    });
    settle(); requestAnimationFrame(settle); gsap.delayedCall(.3, settle);
    ScrollTrigger.getAll().forEach(st => {
      const v = st.vars, a = st.animation;
      if (!a || v.scrub || v.pin || v.containerAnimation) return;
      if (st.start > 2) a.pause(0); // below the fold: reset so it plays again when scrolled into view
    });
    lenis && lenis.resize && lenis.resize();
    // the hero re-enters for the new side: letters wave, then the new lines rise in
    const vis = el => el && getComputedStyle(el).display !== "none";
    gsap.fromTo(heroChars.flat(), { yPercent: 0 }, { keyframes: [{ yPercent: -18, duration: .22, ease: "power2.out" }, { yPercent: 0, duration: .6, ease: "elastic.out(1, .4)" }], stagger: .025, delay: .55 });
    gsap.from([...$$(".hero__sub")].filter(vis).concat($$(".hero__ctas > *").filter(vis), $$(".hero__switch").filter(vis)), { y: 26, opacity: 0, filter: "blur(6px)", duration: .9, stagger: .07, delay: .7, clearProps: "filter" });
    gsap.from(".marquee", { opacity: 0, y: 30, duration: 1, delay: .8 });
  };

  /* ---- Custom cursor, spotlight + magnetic buttons ---- */
  if (!isTouch) {
    const cur = $("#cursor"), dot = $("#cursorDot"), label = $("#cursorLabel"), spot = $("#spotlight");
    const xC = gsap.quickTo(cur, "x", { duration: .45, ease: "power3" }), yC = gsap.quickTo(cur, "y", { duration: .45, ease: "power3" });
    const xD = gsap.quickTo(dot, "x", { duration: .08 }), yD = gsap.quickTo(dot, "y", { duration: .08 });
    const xS = gsap.quickTo(spot, "x", { duration: 1.2, ease: "power3" }), yS = gsap.quickTo(spot, "y", { duration: 1.2, ease: "power3" });
    window.addEventListener("pointermove", e => { xC(e.clientX); yC(e.clientY); xD(e.clientX); yD(e.clientY); xS(e.clientX); yS(e.clientY); });
    document.addEventListener("pointerleave", () => gsap.to([cur, dot], { opacity: 0, duration: .3 }));
    document.addEventListener("pointerenter", () => gsap.to([cur, dot], { opacity: 1, duration: .3 }));
    $$("[data-cursor]").forEach(el => {
      el.addEventListener("pointerenter", () => { label.textContent = el.dataset.cursor; cur.classList.add("is-big"); });
      el.addEventListener("pointerleave", () => cur.classList.remove("is-big"));
    });
    // small hover lifts (done in GSAP so they never fight the scroll animations)
    $$(".pills span, .tl-item__card").forEach(el => {
      el.addEventListener("pointerenter", () => gsap.to(el, { y: el.classList.contains("tl-item__card") ? -6 : -4, duration: .4, ease: "power3.out", overwrite: "auto" }));
      el.addEventListener("pointerleave", () => gsap.to(el, { y: 0, duration: .6, ease: "elastic.out(1, .5)", overwrite: "auto" }));
    });
    $$(".magnetic").forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .35, duration: .5, ease: "power3.out" });
      });
      el.addEventListener("pointerleave", () => gsap.to(el, { x: 0, y: 0, duration: .9, ease: "elastic.out(1, .4)" }));
    });
  }

  /* ---- Earth → Hyderabad: a pre-rendered satellite flight, scrubbed by scroll ---- */
  (() => {
    const HYD = [78.4867, 17.385];
    const video = $("#globeVideo"), label = $("#hydLabel");
    const l1 = $(".locate__line--1"), l2 = $(".locate__line--2"), note = $(".locate__note");
    const hudLat = $("#hudLat"), hudLng = $("#hudLng"), hudAlt = $("#hudAlt");
    const portrait = () => innerHeight > innerWidth;
    const cl = k => Math.max(0, Math.min(1, k));
    const ease = k => (k = cl(k), k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
    const lerp = (a, b, k) => a + (b - a) * k;
    // same camera path the video was rendered with, so the readouts match the picture
    const camera = p => {
      const z0 = portrait() ? 1.7 : 2.2, z1 = portrait() ? 11.6 : 12.0, kc = ease((p - .06) / .5);
      return { lng: lerp(-42 + p * 60, HYD[0], kc), lat: lerp(14, HYD[1], kc), zoom: lerp(z0, z1, ease((p - .14) / .7)) + .35 * cl((p - .86) / .14) };
    };
    const fmt = (v, pos, neg) => `${Math.abs(v).toFixed(4)}° ${v >= 0 ? pos : neg}`;
    let progress = reduceMotion ? 1 : 0, shown = -1, loaded = false;

    const pickSrc = () => `assets/globe/flight-${portrait() ? "port" : "land"}.mp4`;
    // show the Earth picture straight away (also covers phones whose data saver blocks video)
    const posterUrl = () => pickSrc().replace(".mp4", "-poster.jpg");
    video.poster = posterUrl();
    $("#locateStage").style.backgroundImage = `url(${posterUrl()})`;
    const load = () => {
      if (loaded) return; loaded = true;
      video.poster = pickSrc().replace(".mp4", "-poster.jpg");
      video.src = pickSrc(); video.preload = "auto"; video.load();
    };
    // iPhone/Android need one muted play() before seeking works smoothly
    const unlock = () => { load(); const pr = video.play(); if (pr) pr.then(() => video.pause()).catch(() => {}); };
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    ScrollTrigger.create({ trigger: "#locate", start: "top bottom+=200%", onEnter: load, onEnterBack: load });

    const apply = () => {
      const p = progress, c = camera(p);
      hudLat.textContent = fmt(c.lat, "N", "S");
      hudLng.textContent = fmt(((c.lng + 540) % 360) - 180, "E", "W");
      hudAlt.textContent = `${Math.round(36000 / Math.pow(2, c.zoom - 1.3)).toLocaleString("en-IN")} km`;
      const o1 = 1 - cl((p - .3) / .14), o2 = cl((p - .7) / .12), on = cl((p - .84) / .1), ol = cl((p - .66) / .1);
      gsap.set(l1, { opacity: o1, y: (1 - o1) * -30 });
      gsap.set(l2, { opacity: o2, y: (1 - o2) * 30 });
      gsap.set(note, { opacity: on, y: (1 - on) * 14 });
      gsap.set(label, { opacity: ol, x: (1 - ol) * -12, xPercent: innerWidth <= 760 ? -50 : 0 });
    };
    // seek the video toward the scroll position every frame (smooth, never piles up seeks)
    gsap.ticker.add(() => {
      if (!video.duration) return;
      const t = Math.min(video.duration - .04, progress * video.duration);
      if (Math.abs(t - shown) > .02 && !video.seeking) { video.currentTime = t; shown = t; }
    });

    if (reduceMotion) { load(); video.addEventListener("loadedmetadata", () => { video.currentTime = video.duration - .05; }, { once: true }); apply(); return; }
    ScrollTrigger.create({
      trigger: "#locate", pin: "#locateStage", start: "top top", end: () => "+=" + innerHeight * 2.6, scrub: true, anticipatePin: 1,
      onUpdate: self => { progress = self.progress; apply(); },
    });
    apply();
  })();

  /* ---- Phones: touch + motion-sensor versions of the hover effects ---- */
  if (isTouch && !reduceMotion) {
    const jelly = el => gsap.timeline()
      .to(el, { scaleY: .76, scaleX: 1.18, transformOrigin: "50% 100%", duration: .1, ease: "power2.out", overwrite: "auto" })
      .to(el, { scaleY: 1, scaleX: 1, duration: .85, ease: "elastic.out(1.2, .3)" });
    const press = el => gsap.fromTo(el, { scale: .9 }, { scale: 1, duration: .7, ease: "elastic.out(1, .4)", overwrite: "auto" });

    // tap a letter → jelly; and one jelly wave across the name once the intro has played
    [...heroChars.flat(), ...contactChars.flat()].forEach(ch => ch.addEventListener("pointerdown", () => jelly(ch)));
    gsap.delayedCall(7.4, () => heroChars.flat().forEach((ch, i) => gsap.delayedCall(i * .055, () => jelly(ch))));

    // tap buttons, tags and tiles → press-in spring
    $$(".btn, .pills span, .contact__links a, .resume, .email, .mode").forEach(el => el.addEventListener("pointerdown", () => press(el)));

    // logo tiles: tilt toward the finger, glow in brand colour, spring back
    tiles.forEach(t => {
      const tilt = e => {
        const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        gsap.to(t, { rotationY: x * 34, rotationX: -y * 34, scale: 1.06, transformPerspective: 500, duration: .35, ease: "power3.out" });
      };
      t.addEventListener("pointerdown", e => { t.classList.add("is-touch"); tilt(e); });
      const release = () => { gsap.to(t, { rotationX: 0, rotationY: 0, scale: 1, duration: 1, ease: "elastic.out(1, .35)" }); setTimeout(() => t.classList.remove("is-touch"), 450); };
      t.addEventListener("pointerup", release); t.addEventListener("pointercancel", release); t.addEventListener("pointerleave", release);
    });

    // motion sensor: tilting the phone tilts the photo (with moving glare), the chips, and the cards
    const vf = $("#vfInner");
    const tilters = [{ el: vf, k: 1 }, ...$$(".ch-card, .vid").map(el => ({ el, k: .45 }))].map(({ el, k }) => ({
      k, rx: gsap.quickTo(el, "rotationX", { duration: .9, ease: "power3" }), ry: gsap.quickTo(el, "rotationY", { duration: .9, ease: "power3" }),
    }));
    $$(".ch-card, .vid").forEach(el => gsap.set(el, { transformPerspective: 1000 }));
    const chipX = $$(".chip").map(c => ({ x: gsap.quickTo(c, "x", { duration: 1, ease: "power3" }), d: +c.dataset.depth || 1 }));
    let base = null, gotSensor = false;
    const onTilt = e => {
      if (e.gamma == null || e.beta == null) return;
      gotSensor = true;
      if (!base) base = { b: e.beta, g: e.gamma };
      base.b += (e.beta - base.b) * .015; base.g += (e.gamma - base.g) * .015; // slowly re-centre to however the phone is held
      const x = gsap.utils.clamp(-1, 1, (e.gamma - base.g) / 22), y = gsap.utils.clamp(-1, 1, (e.beta - base.b) / 22);
      tilters.forEach(s => { s.ry(x * 16 * s.k); s.rx(-y * 12 * s.k); });
      chipX.forEach(c => c.x(x * 22 * c.d));
      vf.style.setProperty("--sx", 50 + x * 45 + "%"); vf.style.setProperty("--sy", 30 + y * 45 + "%");
    };
    // Android sends motion data straight away; iPhone only after the visitor allows it on their first tap
    window.addEventListener("deviceorientation", onTilt);
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      window.addEventListener("touchend", () => { DeviceOrientationEvent.requestPermission().catch(() => {}); }, { once: true });
    }
    // no motion sensor? keep the photo gently swaying in 3D so it still feels alive
    gsap.delayedCall(8, () => {
      if (gotSensor) return;
      gsap.to(vf, { rotationY: 9, rotationX: -5, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(vf, { "--sx": "80%", "--sy": "60%", duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
}
