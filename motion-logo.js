/* ==========================================================
   "Code → Cut" motion logo for MS.
   One source for the website loader and the video intros.
   MotionLogo(rootElement) → GSAP timeline (≈2.4 s)
     1. caret blinks, <MS/> types out (code)
     2. brackets fly apart, bold MS rises (brand)
     3. the blue dot drops in with a ripple
     4. an amber "film cut" slices the mark; halves slide apart and snap back (editor)
     5. tagline letters in
   ========================================================== */
(function () {
  function MotionLogo(root, opts) {
    opts = opts || {};
    const tag = opts.tag || "JAVA BACKEND · VIDEO EDITOR";
    const half = side => `<div class="ml__half ml__half--${side}"><span class="ml__l">M</span><span class="ml__l">S</span><span class="ml__dot"></span></div>`;
    root.innerHTML = `
      <div class="ml">
        <div class="ml__mark" role="img" aria-label="MS.">${half("top")}${half("bot")}<i class="ml__ring"></i><i class="ml__cut"></i>
          <div class="ml__code" aria-hidden="true"><span class="ml__c ml__c--lt">&lt;</span><span class="ml__c">M</span><span class="ml__c">S</span><span class="ml__c ml__c--sl">/</span><span class="ml__c ml__c--gt">&gt;</span><i class="ml__caret"></i></div>
        </div>
        <div class="ml__tag" aria-hidden="true">${tag.split("").map(c => `<span${c === "·" ? ' class="ml__sep"' : ""}>${c === " " ? "&nbsp;" : c}</span>`).join("")}</div>
      </div>`;
    const $ = s => root.querySelector(s), $$ = s => root.querySelectorAll(s);
    const chars = $$(".ml__c"), letters = $$(".ml__mark .ml__l"), dots = $$(".ml__dot");

    gsap.set(chars, { display: "none" });
    gsap.set(letters, { yPercent: 118 });
    gsap.set(dots, { yPercent: -900, opacity: 0 });
    gsap.set($(".ml__ring"), { scale: .2, opacity: 0 });
    gsap.set($(".ml__cut"), { scaleX: 0, opacity: 1 });
    gsap.set($$(".ml__tag span"), { opacity: 0, y: 10 });

    const tl = gsap.timeline();
    // 1 · type <MS/>
    chars.forEach((c, i) => tl.set(c, { display: "inline" }, .15 + i * .09));
    tl.to($(".ml__caret"), { opacity: 0, duration: .1 }, .78);
    // 2 · code → brand
    tl.to($(".ml__c--lt"), { x: -160, rotation: -25, opacity: 0, duration: .45, ease: "power3.in" }, .72)
      .to($$(".ml__c--sl, .ml__c--gt"), { x: 160, rotation: 25, opacity: 0, duration: .45, ease: "power3.in" }, .72)
      .to($$(".ml__code .ml__c:not(.ml__c--lt):not(.ml__c--sl):not(.ml__c--gt)"), { scale: .6, opacity: 0, filter: "blur(6px)", duration: .35, ease: "power2.in" }, .74)
      .to(letters, { yPercent: 0, duration: .7, stagger: i => (i % 2) * .07, ease: "expo.out" }, .86);
    // 3 · the dot drops in, ripple
    tl.to(dots, { yPercent: 0, opacity: 1, duration: .55, ease: "bounce.out" }, 1.08)
      .fromTo($(".ml__ring"), { scale: .2, opacity: .9 }, { scale: 2.6, opacity: 0, duration: .7, ease: "expo.out", immediateRender: false }, 1.36);
    // 4 · the cut
    tl.to($(".ml__cut"), { scaleX: 1, duration: .24, ease: "power4.out" }, 1.5)
      .to($(".ml__half--top"), { x: 26, duration: .16, ease: "power3.out" }, 1.58)
      .to($(".ml__half--bot"), { x: -26, duration: .16, ease: "power3.out" }, 1.58)
      .to($$(".ml__half"), { x: 0, duration: .7, ease: "elastic.out(1.1, .38)" }, 1.8)
      .to($(".ml__cut"), { opacity: 0, duration: .22, ease: "power2.out" }, 1.78);
    // 5 · tagline
    tl.to($$(".ml__tag span"), { opacity: 1, y: 0, duration: .45, stagger: .014, ease: "power3.out" }, 1.82);
    return tl;
  }
  window.MotionLogo = MotionLogo;
})();
