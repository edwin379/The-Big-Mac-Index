/* =========================================================
   Same burger, different price — Big Mac index slides
   Data: window.BIGMAC (data.js), from The Economist
   ========================================================= */
(() => {
const D = window.BIGMAC;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Language ---------- */
let lang = "en";   // English first; visitors can switch to Japanese
const L = (ja, en) => (lang === "ja" ? ja : en);

const NAMES = {
  ARE:["UAE","アラブ首長国連邦"],ARG:["Argentina","アルゼンチン"],AUS:["Australia","オーストラリア"],AZE:["Azerbaijan","アゼルバイジャン"],
  BHR:["Bahrain","バーレーン"],BRA:["Brazil","ブラジル"],CAN:["Canada","カナダ"],CHE:["Switzerland","スイス"],CHL:["Chile","チリ"],
  CHN:["China","中国"],COL:["Colombia","コロンビア"],CRI:["Costa Rica","コスタリカ"],CZE:["Czech Republic","チェコ"],DNK:["Denmark","デンマーク"],
  EGY:["Egypt","エジプト"],EUZ:["Euro area","ユーロ圏"],GBR:["Britain","イギリス"],GTM:["Guatemala","グアテマラ"],HKG:["Hong Kong","香港"],
  HND:["Honduras","ホンジュラス"],HUN:["Hungary","ハンガリー"],IDN:["Indonesia","インドネシア"],IND:["India","インド"],ISR:["Israel","イスラエル"],
  JOR:["Jordan","ヨルダン"],JPN:["Japan","日本"],KOR:["South Korea","韓国"],KWT:["Kuwait","クウェート"],LBN:["Lebanon","レバノン"],
  LKA:["Sri Lanka","スリランカ"],MDA:["Moldova","モルドバ"],MEX:["Mexico","メキシコ"],MYS:["Malaysia","マレーシア"],NIC:["Nicaragua","ニカラグア"],
  NOR:["Norway","ノルウェー"],NZL:["New Zealand","ニュージーランド"],OMN:["Oman","オマーン"],PAK:["Pakistan","パキスタン"],PER:["Peru","ペルー"],
  PHL:["Philippines","フィリピン"],POL:["Poland","ポーランド"],QAT:["Qatar","カタール"],ROU:["Romania","ルーマニア"],RUS:["Russia","ロシア"],
  SAU:["Saudi Arabia","サウジアラビア"],SGP:["Singapore","シンガポール"],SWE:["Sweden","スウェーデン"],THA:["Thailand","タイ"],TUR:["Turkey","トルコ"],
  TWN:["Taiwan","台湾"],UKR:["Ukraine","ウクライナ"],URY:["Uruguay","ウルグアイ"],USA:["United States","アメリカ"],VEN:["Venezuela","ベネズエラ"],
  VNM:["Vietnam","ベトナム"],ZAF:["South Africa","南アフリカ"]
};
const nm = iso => (NAMES[iso] ? NAMES[iso][lang === "ja" ? 1 : 0] : iso);

/* latest row: [iso, localPrice, currency, rate, usdPrice, valuation] */
const ROW = Object.fromEntries(D.latest.map(r => [r[0], r]));
const US = ROW.USA[4];
const JP = ROW.JPN;
const money = (v, cur) => {
  try {
    return new Intl.NumberFormat(lang === "ja" ? "ja-JP" : "en-US", {
      style: "currency", currency: cur, maximumFractionDigits: v >= 100 ? 0 : 2
    }).format(v);
  } catch (e) { return `${v} ${cur}`; }
};
const usd = v => "$" + v.toFixed(2);
const dateLabel = ym => {
  const [y, m] = ym.split("-").map(Number);
  return L(`${y}年${m}月`, new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" }));
};

/* ---------- Small animation helpers ---------- */
function tween(from, to, ms, onStep, onDone) {
  if (reduce || ms <= 0) { onStep(to); onDone && onDone(); return () => {}; }
  let raf, t0;
  const ease = t => 1 - Math.pow(1 - t, 3);
  const step = now => {
    t0 ??= now;
    const t = Math.min(1, (now - t0) / ms);
    onStep(from + (to - from) * ease(t));
    if (t < 1) raf = requestAnimationFrame(step); else onDone && onDone();
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}
const restartAnim = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
const later = (() => { let ids = []; return {
  add(fn, ms) { ids.push(setTimeout(fn, ms)); },
  clear() { ids.forEach(clearTimeout); ids = []; }
}; })();

/* =========================================================
   Slide 1 — burger builds itself
   ========================================================= */
const s1 = {
  enter() {},
  replay() { $$(".s1 .layer").forEach(l => { l.style.animation = "none"; void l.getBoundingClientRect(); l.style.animation = ""; }); }
};
$("#build").addEventListener("click", () => s1.replay());

/* =========================================================
   Slide 2 — price tag flips from local money to dollars
   ========================================================= */
const s2 = {
  list: ["CHE", "EUZ", "GBR", "USA", "KOR", "CHN", "JPN", "IND"],
  iso: "CHE",
  timers: [],
  build() {
    $("#chips").innerHTML = this.list.map(c =>
      `<button type="button" class="chip" data-c="${c}" aria-pressed="${c === this.iso}">${nm(c)}</button>`).join("");
    $$("#chips .chip").forEach(b => b.addEventListener("click", () => this.pick(b.dataset.c)));
  },
  pick(iso) {
    this.iso = iso;
    this.timers.forEach(clearTimeout); this.timers = [];
    $$("#chips .chip").forEach(b => b.setAttribute("aria-pressed", b.dataset.c === iso));
    const r = ROW[iso], tag = $("#tag"), burger = $("#tagBurger");
    tag.classList.add("instant"); tag.classList.remove("flipped"); void tag.offsetWidth; tag.classList.remove("instant");
    $("#tagLocal").textContent = money(r[1], r[2]);
    $("#tagUsd").textContent = usd(r[4]);
    $("#tagCaption").textContent = "";
    burger.style.transform = "scale(1)";
    this.timers.push(setTimeout(() => {
      tag.classList.add("flipped");
      burger.style.transform = `scale(${(r[4] / US).toFixed(3)})`;
    }, reduce ? 0 : 700));
    this.timers.push(setTimeout(() => this.caption(), reduce ? 0 : 1300));
  },
  caption() {
    const r = ROW[this.iso];
    if (this.iso === "USA") {
      $("#tagCaption").textContent = L(`アメリカは ${usd(r[4])}。これが基準です。`, `The US price, ${usd(r[4])}, is the baseline.`);
      return;
    }
    const pct = Math.round(Math.abs(r[5]) * 100), cheap = r[5] < 0;
    $("#tagCaption").innerHTML = L(
      `${nm(this.iso)}は アメリカより <b class="${cheap ? "u" : "o"}">${pct}%${cheap ? "安い" : "高い"}</b>`,
      `${nm(this.iso)} is <b class="${cheap ? "u" : "o"}">${pct}% ${cheap ? "cheaper" : "pricier"}</b> than the US`);
  },
  enter() { this.pick(this.iso); },
  render() { this.build(); if ($("#tag").classList.contains("flipped")) this.caption(); }
};

/* =========================================================
   Slide 3 — balance scale
   ========================================================= */
const s3 = {
  fair: JP[1] / US,                      // yen per dollar that makes prices equal
  real: Math.round(JP[3]),
  angle: 0, vel: 0, target: 0, raf: null, stopTween: null,
  init() {
    const r = $("#rate");
    r.value = this.real;
    r.addEventListener("input", () => { this.stopTween && this.stopTween(); this.update(); });
    $("#goFair").addEventListener("click", () => this.slideTo(Math.round(this.fair)));
    $("#goReal").addEventListener("click", () => this.slideTo(this.real));
  },
  slideTo(v) {
    const r = $("#rate");
    this.stopTween && this.stopTween();
    this.stopTween = tween(+r.value, v, 900, x => { r.value = Math.round(x); this.update(); });
  },
  update() {
    const rate = +$("#rate").value, jp = JP[1] / rate, diff = jp - US;
    $("#rateOut").textContent = rate;
    $("#priceL").textContent = usd(US);
    $("#priceR").textContent = usd(jp);
    this.target = Math.max(-18, Math.min(18, diff * 4.5));
    const msg = $("#scaleMsg");
    const balanced = Math.abs(diff) < 0.12;
    if (balanced && !msg.classList.contains("balanced")) restartAnim(msg, "balanced");
    if (!balanced) msg.classList.remove("balanced");
    msg.innerHTML = balanced
      ? L("つり合った！これが「公平な」レートです。", "Balanced! That's the “fair” exchange rate.")
      : diff < 0
        ? L(`日本側が軽い → 円が<b class="u">弱すぎる（割安）</b>`, `Japan's side is lighter → the yen is <b class="u">too weak (undervalued)</b>`)
        : L(`日本側が重い → 円が<b class="o">強すぎる（割高）</b>`, `Japan's side is heavier → the yen is <b class="o">too strong (overvalued)</b>`);
    this.kick();
  },
  kick() {
    if (reduce) { this.angle = this.target; this.place(); return; }
    if (this.raf) return;
    const loop = () => {
      this.vel += (this.target - this.angle) * 0.06;
      this.vel *= 0.86;
      this.angle += this.vel;
      this.place();
      if (Math.abs(this.target - this.angle) < 0.01 && Math.abs(this.vel) < 0.01) { this.raf = null; return; }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  },
  place() {
    const a = this.angle * Math.PI / 180, cx = 300, cy = 119, R = 212;
    $("#beam").setAttribute("transform", `rotate(${this.angle.toFixed(2)} ${cx} ${cy})`);
    $("#panL").setAttribute("transform", `translate(${cx - R * Math.cos(a)} ${cy - R * Math.sin(a)})`);
    $("#panR").setAttribute("transform", `translate(${cx + R * Math.cos(a)} ${cy + R * Math.sin(a)})`);
  },
  render() {
    $("#panNameL").textContent = nm("USA");
    $("#panNameR").textContent = nm("JPN");
    $("#goFair").textContent = L(`公平なレート（${Math.round(this.fair)}円）`, `Fair rate (¥${Math.round(this.fair)})`);
    $("#goReal").textContent = L(`実際のレート（${this.real}円）`, `Real rate (¥${this.real})`);
    this.update();
  },
  enter() { this.angle = 0; this.vel = 0; this.place(); this.update(); },
  leave() { this.stopTween && this.stopTween(); }
};

/* =========================================================
   Slide 4 — time machine (2000 → 2026)
   ========================================================= */
const s4 = {
  S: D.japan,                // [ym, jpLocal, jpUsd, usUsd, valuation, rank, total, rate]
  i: 0, timer: null, played: false,
  init() {
    const sl = $("#tmSlider");
    sl.max = this.S.length - 1; sl.value = 0;
    sl.addEventListener("input", () => { this.pause(); this.show(+sl.value); });
    $("#play").addEventListener("click", () => (this.timer ? this.pause() : this.play()));
  },
  show(i) {
    this.i = i;
    const [ym, loc, jp, us, val, rank, total] = this.S[i];
    const [y, m] = ym.split("-");
    $("#tmYear").innerHTML = `${y}<small>${L(`${+m}月`, new Date(2000, m - 1, 1).toLocaleDateString("en-GB", { month: "long" }))}</small>`;
    $("#tmUS").style.transform = `scale(${(us / US).toFixed(3)})`;
    $("#tmJP").style.transform = `scale(${(jp / US).toFixed(3)})`;
    $("#tmUSp").textContent = usd(us);
    $("#tmJPp").textContent = usd(jp);
    $("#tmJPl").textContent = "¥" + loc;
    const pos = Math.max(2, Math.min(98, 50 + (val / 0.6) * 50));
    const pct = Math.round(val * 100);
    $("#needle").style.left = pos + "%";
    $("#needleVal").textContent = (pct > 0 ? "+" : pct < 0 ? "−" : "") + Math.abs(pct) + "%";
    $("#needleVal").className = val < 0 ? "u" : "o";
    $("#tmRank").innerHTML = L(`日本のビッグマックは世界 <b>${rank}</b> 位 / ${total}か国`, `Japan's Big Mac ranks <b>#${rank}</b> of ${total} by price`);
    $("#tmSlider").value = i;
  },
  play() {
    if (this.i >= this.S.length - 1) this.show(0);
    $("#playIcon").setAttribute("d", "M7 5h4v14H7zM13 5h4v14h-4z");
    $("#play").setAttribute("aria-label", "Pause");
    this.timer = setInterval(() => {
      if (this.i >= this.S.length - 1) return this.pause();
      this.show(this.i + 1);
    }, reduce ? 600 : 280);
  },
  pause() {
    clearInterval(this.timer); this.timer = null;
    $("#playIcon").setAttribute("d", "M7 5l12 7-12 7z");
    $("#play").setAttribute("aria-label", "Play");
  },
  enter() {
    this.show(this.i);
    if (!this.played) { this.played = true; later.add(() => this.play(), 900); }
  },
  leave() { this.pause(); },
  render() { this.show(this.i); }
};

/* =========================================================
   Slide 5 — what ¥1,000 buys
   ========================================================= */
const s6 = {
  list: ["CHE", "GBR", "USA", "KOR", "CHN", "JPN", "IND", "IDN"],
  iso: "JPN", stop: null,
  build() {
    $("#buyChips").innerHTML = this.list.map(c =>
      `<button type="button" class="chip" data-c="${c}" aria-pressed="${c === this.iso}">${nm(c)}</button>`).join("");
    $$("#buyChips .chip").forEach(b => b.addEventListener("click", () => this.pick(b.dataset.c)));
  },
  pick(iso) {
    this.iso = iso;
    later.clear();
    this.stop && this.stop();
    $$("#buyChips .chip").forEach(b => b.setAttribute("aria-pressed", b.dataset.c === iso));
    const dollars = 1000 / JP[3];
    const n = dollars / ROW[iso][4];
    const tray = $("#tray");
    tray.innerHTML = "";
    restartAnim($(".bill"), "spend");
    const full = Math.floor(n), frac = n - full, gap = reduce ? 0 : 260;
    const add = w => {
      const d = document.createElement("div");
      d.className = "item";
      if (w < 1) d.style.width = `calc(var(--iw) * ${w.toFixed(3)})`;
      d.innerHTML = `<svg viewBox="0 0 200 140" aria-hidden="true"><use href="#bm"/></svg>`;
      tray.appendChild(d);
    };
    for (let k = 0; k < full; k++) later.add(() => add(1), 250 + k * gap);
    if (frac > 0.02) later.add(() => add(frac), 250 + full * gap);
    const out = $("#buyCount");
    this.stop = tween(0, n, 250 + (full + 1) * gap, v => { out.textContent = v.toFixed(1); });
  },
  render() {
    this.build();
    $("#billLead").textContent = L(
      `${dateLabel(D.latestDate)}のレート（1ドル＝${Math.round(JP[3])}円）で両替すると、1,000円＝${usd(1000 / JP[3])}。国を選んでビッグマックを買ってみよう。`,
      `At the ${dateLabel(D.latestDate)} rate (¥${Math.round(JP[3])} per $1), ¥1,000 is ${usd(1000 / JP[3])}. Pick a country and go shopping.`);
  },
  enter() { this.pick(this.iso); }
};

/* =========================================================
   Slide 6 — lineup: all 54 countries by region and price
   ========================================================= */
const sLine = {
  NS: "http://www.w3.org/2000/svg",
  sel: "JPN",
  LANES: [
    ["eu", ["ヨーロッパ", "Europe"], "CHE EUZ GBR NOR SWE DNK POL CZE HUN ROU MDA UKR TUR"],
    ["am", ["アメリカ大陸", "Americas"], "USA CAN MEX GTM HND NIC CRI COL VEN PER BRA CHL ARG URY"],
    ["me", ["中東・アフリカ", "Middle East & Africa"], "EGY ISR JOR LBN SAU KWT BHR QAT ARE OMN AZE ZAF"],
    ["ap", ["アジア・太平洋", "Asia-Pacific"], "CHN JPN KOR TWN HKG VNM THA MYS SGP IDN PHL IND LKA PAK AUS NZL"]
  ],
    X0: 190, X1: 975, P0: 2, P1: 9.5, TOP: 40, LANE: 128,
  x(p) { return this.X0 + (p - this.P0) / (this.P1 - this.P0) * (this.X1 - this.X0); },
  w(p) { return 12 + p * 2.9; },

  init() {
    const pinsG = $("#lnPins");
    this.pins = [];
    this.LANES.forEach(([key, , list], li) => {
      const cy = this.TOP + li * this.LANE + this.LANE / 2;
      const rows = list.split(" ").map(c => ROW[c]).filter(Boolean).sort((a, b) => a[4] - b[4]);
      const placed = [];
      rows.forEach(r => {
        const w = this.w(r[4]), h = w * 0.7, x = this.x(r[4]);
        // beeswarm: nearest free vertical slot to the lane centre
        let y = cy;
        for (let k = 0; k < 40; k++) {
          const off = Math.ceil(k / 2) * 6 * (k % 2 ? -1 : 1);
          const ty = cy + off;
          const hit = placed.some(q => Math.abs(q.x - x) < (q.w + w) / 2 + 2 && Math.abs(q.y - ty) < (q.h + h) / 2 + 2);
          if (!hit) { y = ty; break; }
        }
        const o = { iso: r[0], p: r[4], x, y, w, h, lane: li };
        placed.push(o);
        this.pins.push(o);
      });
    });
    // draw pins (index order by price → stagger the slide-in)
    const byPrice = [...this.pins].sort((a, b) => a.p - b.p);
    byPrice.forEach((o, k) => {
      const g = document.createElementNS(this.NS, "g");
      g.setAttribute("class", "lpin");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.style.setProperty("--d", 150 + k * 18);
      g.style.setProperty("--dx", `${this.X0 - o.x}px`);
      g.innerHTML = `<rect class="hit" x="${o.x - o.w / 2 - 4}" y="${o.y - o.h / 2 - 4}" width="${o.w + 8}" height="${o.h + 8}" rx="8"/>
        <use href="#bm" x="${o.x - o.w / 2}" y="${o.y - o.h / 2}" width="${o.w}" height="${o.h}"/>`;
      g.addEventListener("pointerenter", () => { pinsG.classList.add("focus"); this.pick(o.iso); });
      g.addEventListener("focus", () => { pinsG.classList.add("focus"); this.pick(o.iso); });
      g.addEventListener("blur", () => pinsG.classList.remove("focus"));
      g.addEventListener("click", () => this.pick(o.iso));
      o.g = g;
      pinsG.appendChild(g);
    });
    $("#lineup").addEventListener("pointerleave", () => pinsG.classList.remove("focus"));
  },

  background() {
    const H = this.TOP + this.LANES.length * this.LANE, xu = this.x(US);
    let s = `<rect class="ln-under" x="${this.X0}" y="${this.TOP}" width="${xu - this.X0}" height="${H - this.TOP}"/>
             <rect class="ln-over" x="${xu}" y="${this.TOP}" width="${this.X1 - xu}" height="${H - this.TOP}"/>`;
    for (let p = 3; p <= 9; p++) {
      const x = this.x(p);
      s += `<line class="ln-grid" x1="${x}" x2="${x}" y1="${this.TOP}" y2="${H}"/><text class="ln-tick" x="${x}" y="${H + 22}">$${p}</text>`;
    }
    this.LANES.forEach(([, name, list], li) => {
      const y = this.TOP + li * this.LANE;
      const n = list.split(" ").filter(c => ROW[c]).length;
      if (li) s += `<line class="ln-sep" x1="20" x2="${this.X1}" y1="${y}" y2="${y}"/>`;
      s += `<text class="ln-lane" x="20" y="${y + this.LANE / 2 + 2}">${L(...name)}</text>
            <text class="ln-count" x="20" y="${y + this.LANE / 2 + 22}">${L(`${n}か国`, `${n} countries`)}</text>`;
    });
    s += `<line class="ln-us" x1="${xu}" x2="${xu}" y1="${this.TOP - 8}" y2="${H}"/>
          <text class="ln-uslbl" x="${xu}" y="${this.TOP - 16}">${L("アメリカ", "US")} ${usd(US)}</text>
          <text class="ln-side u" x="${this.X0 + 6}" y="${this.TOP - 16}">← ${L("アメリカより安い", "CHEAPER THAN US")}</text>
          <text class="ln-side o" x="${this.X1 - 6}" y="${this.TOP - 16}" text-anchor="end">${L("アメリカより高い", "PRICIER THAN US")} →</text>`;
    $("#lnBg").innerHTML = s;
  },

  labels() {                         // one clear label for the selected burger
    const o = this.pins.find(p => p.iso === this.sel);
    const top = $("#lnTop");
    if (!o) { top.innerHTML = ""; return; }
    const above = o.y - o.h / 2 - 12 > this.TOP + o.lane * this.LANE + 8;
    const ty = above ? o.y - o.h / 2 - 10 : o.y + o.h / 2 + 20;
    top.innerHTML = `<rect class="ln-tag"/><text class="ln-label" x="${o.x}" y="${ty}">${nm(o.iso)}  ${usd(o.p)}</text>`;
    const bb = top.querySelector("text").getBBox();
    const r = top.querySelector("rect");
    const pad = 6;
    let x = bb.x - pad;
    const shift = Math.min(0, this.X1 - (bb.x + bb.width + pad)) + Math.max(0, 20 - x);
    top.querySelector("text").setAttribute("x", o.x + shift);
    Object.entries({ x: x + shift, y: bb.y - 3, width: bb.width + pad * 2, height: bb.height + 6, rx: 6 }).forEach(([k, v]) => r.setAttribute(k, v));
  },

  pick(iso, force) {
    const r = ROW[iso]; if (!r) return;
    if (iso === this.sel && !force) return;
    this.sel = iso;
    this.pins.forEach(o => o.g.classList.toggle("sel", o.iso === iso));
    this.labels();
    const pct = Math.round(Math.abs(r[5]) * 100), cheap = r[5] < 0;
    const rel = iso === "USA"
      ? L("基準（0%）", "The baseline (0%)")
      : L(`アメリカより <b class="${cheap ? "u" : "o"}">${pct}%${cheap ? "安い" : "高い"}</b>`,
          `<b class="${cheap ? "u" : "o"}">${pct}% ${cheap ? "cheaper" : "pricier"}</b> than the US`);
    const rank = [...D.latest].sort((a, b) => b[4] - a[4]).findIndex(x => x[0] === iso) + 1;
    const card = $("#linecard");
    card.innerHTML = `<span class="n">${nm(iso)}</span><span class="p">${usd(r[4])}</span><span class="l">${money(r[1], r[2])}</span>
      <span class="r">${rel}</span><span class="r">${L(`世界 ${rank}位 / ${D.latest.length}か国`, `#${rank} of ${D.latest.length}`)}</span>`;
    restartAnim(card, "bump");
  },

  render() {
    this.background();
    this.pins.forEach(o => o.g.setAttribute("aria-label", `${nm(o.iso)} ${usd(o.p)}`));
    this.pick(this.sel, true);
  },
  enter() { this.pick(this.sel, true); },
  leave() { $("#lnPins").classList.remove("focus"); }
};

/* =========================================================
   Slide 7 — wrap-up with falling burgers
   ========================================================= */
const s7 = {
  init() {
    const rain = $("#rain");
    for (let k = 0; k < 16; k++) {
      const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      el.setAttribute("viewBox", "0 0 200 140");
      el.innerHTML = `<use href="#bm"/>`;
      el.style.left = (Math.random() * 96) + "%";
      el.style.animationDuration = (7 + Math.random() * 7) + "s";
      el.style.animationDelay = (-Math.random() * 14) + "s";
      el.style.setProperty("--r", (Math.random() * 400 - 200) + "deg");
      const s = 0.6 + Math.random() * 0.9;
      el.style.width = 60 * s + "px"; el.style.height = 42 * s + "px";
      rain.appendChild(el);
    }
    $("#restart").addEventListener("click", () => go(0));
  }
};

/* =========================================================
   Deck navigation
   ========================================================= */
const slides = $$(".slide");
const hooks = [s1, s2, s3, s4, s6, sLine, s7];
const track = $("#track");
let cur = -1;

$("#dots").innerHTML = slides.map((_, k) => `<button type="button" aria-label="Slide ${k + 1}"></button>`).join("");
$$("#dots button").forEach((b, k) => b.addEventListener("click", () => go(k)));

function go(i, instant) {
  i = Math.max(0, Math.min(slides.length - 1, i));
  if (i === cur) return;
  later.clear();
  if (cur >= 0) { hooks[cur].leave && hooks[cur].leave(); slides[cur].classList.remove("active"); }
  cur = i;
  if (instant) { track.style.transition = "none"; }
  track.style.transform = `translateX(${-100 * i}vw)`;
  if (instant) { void track.offsetWidth; track.style.transition = ""; }
  slides.forEach((s, k) => {
    s.inert = k !== i;
    s.setAttribute("aria-label", `${k + 1} / ${slides.length}`);
  });
  $$("#dots button").forEach((b, k) => b.setAttribute("aria-current", k === i));
  $("#prev").disabled = i === 0;
  $("#next").disabled = i === slides.length - 1;
  $("#pageNum").textContent = `${i + 1} / ${slides.length}`;
  history.replaceState(null, "", `#${i + 1}`);
  const arrive = () => { slides[i].classList.add("active"); slides[i].scrollTop = 0; hooks[i].enter && hooks[i].enter(); };
  if (instant || reduce) arrive(); else setTimeout(arrive, 380);
}

$("#prev").addEventListener("click", () => go(cur - 1));
$("#next").addEventListener("click", () => go(cur + 1));
document.addEventListener("keydown", e => {
  if (e.target.matches("input, select, textarea")) return;
  if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); go(cur + 1); }
  if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(cur - 1); }
  if (e.key === "Home") go(0);
  if (e.key === "End") go(slides.length - 1);
});

/* swipe on touch screens */
let sx = null, sy = null;
$("#deck").addEventListener("pointerdown", e => {
  if (e.pointerType === "mouse" || e.target.closest("input")) return;
  sx = e.clientX; sy = e.clientY;
});
$("#deck").addEventListener("pointerup", e => {
  if (sx === null) return;
  const dx = e.clientX - sx, dy = e.clientY - sy;
  sx = null;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) go(cur + (dx < 0 ? 1 : -1));
});

/* ---------- Language switch ---------- */
function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;
  document.title = L("同じバーガー、ちがう値段 — ビッグマック指数", "Same burger, different price — The Big Mac index");
  $$("[data-setlang]").forEach(b => b.setAttribute("aria-pressed", b.dataset.setlang === lang));
  $("#prev").setAttribute("aria-label", L("前のスライド", "Previous slide"));
  $("#next").setAttribute("aria-label", L("次のスライド", "Next slide"));
  s2.render(); s3.render(); s4.render(); s6.render(); sLine.render();
}
$$("[data-setlang]").forEach(b => b.addEventListener("click", () => {
  lang = b.dataset.setlang;
  applyLang();
}));

addEventListener("hashchange", () => {
  const n = parseInt(location.hash.slice(1), 10);
  if (Number.isFinite(n)) go(n - 1);
});

/* ---------- Start ---------- */
s3.init(); s4.init(); sLine.init(); s7.init();
applyLang();
const start = parseInt(location.hash.slice(1), 10);
go(Number.isFinite(start) ? start - 1 : 0, true);
})();
