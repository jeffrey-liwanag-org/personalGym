// Builds the 12-week weight-loss programmes and their openGym-importable plan files.
//
//   node tools/build-program.js          offline pages in programs/, demos from ../media
//   node tools/build-program.js --cdn    publishable pages in docs/ (GitHub Pages); demos stream
//                                        from the dataset's jsDelivr mirror so the repo never
//                                        carries the Gym visual media
//
// Reads  data/exercises.json
// Writes programs/<slug>-program.html + programs/<slug>-plan.opengym.json
//        docs/[<path>/]index.html      + docs/[<path>/]<slug>-plan.opengym.json   (--cdn)
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'exercises.json'), 'utf8'))
const IDX = Object.fromEntries(data.map(e => [e.id, e]))
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-')
const CDN = process.argv.includes('--cdn')
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd/'
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// ---------------------------------------------------------------------------------------------
// Each exercise is an openGym exercise config (id, sets, reps/repsMin, sec, min, prog, sg, side,
// repsMax, warmupSets, restSec) plus a `note` shown only on the page. `sg` pairs adjacent
// exercises as a superset; `prog: 'double'` is double progression through the rep range;
// bodyweight work climbs reps then sets on its own, capped by `repsMax`.
// ---------------------------------------------------------------------------------------------
const GENERAL = {
  slug: 'weight-loss', pagePath: '', planName: '12-week weight loss',
  title: 'Weight loss programme', subtitle: '12 weeks · 4 gym days + 1 easy cardio',
  sibling: { label: "Women's version", href: 'women/' },
  audience: 'Written for someone with normal gym access (dumbbells, a barbell, cables and machines), new to or returning to training, with 45 to 55 minutes per session. General training advice, not medical advice. If you have a condition or an injury, check with a professional first.',
  why: [
    '<b>Fat loss comes from the kitchen, muscle comes from the gym.</b> Aim for a moderate deficit of about 300 to 500 kcal a day and 0.5 to 1 % of body weight lost per week. Faster than that and strength starts to go.',
    '<b>Protein first.</b> Roughly 1.6 to 2.2 g per kg of body weight a day. It is the biggest lever for keeping muscle in a deficit.',
    '<b>Full body three times a week</b> keeps every muscle, in 10 to 15 reps where the joints are happy.',
    '<b>Supersets</b> halve the resting and keep the heart rate up without turning it into a circuit.',
    '<b>Cardio is mostly easy.</b> Two steady sessions plus a short finisher after each lift. Walk 8 to 10k steps on rest days.',
  ],
  phases: [
    ['Weeks 1–4 · Learn and build', ['Numbers as written. Leave 2 to 3 reps in the tank on the last set.', 'Cardio at a pace where talking is easy.', 'Weigh in twice a week, watch the weekly average.']],
    ['Weeks 5–8 · Density', ['Cut rests by 15 to 30 s on everything except the barbell squat.', 'Steady cardio to 40 min; incline up before speed.', 'Scale stuck for two weeks? Trim 100 to 200 kcal from the day, not the training.']],
    ['Weeks 9–12 · Push', ['Add a fourth set to the first exercise of each lifting day.', 'Swap one easy cardio for intervals: 8 × 1 min hard, 1 min easy.', 'Week 12 is a deload: two sets of everything, then reassess.']],
  ],
  sources: [],
  routines: [
    {
      id: 'wl-a', name: 'Full Body A', emoji: 'dumbbell', day: 1, minutes: 50,
      ex: [
        { id: '1760', sets: 3, reps: 15, repsMin: 10, prog: 'double', restSec: 90, note: 'Main lift of the day. Heels down, chest up, sit between the knees.' },
        { id: '0293', sets: 3, reps: 15, repsMin: 10, prog: 'double', sg: 'a1', restSec: 60, note: 'Superset with the bench press: row, then press, then rest.' },
        { id: '0289', sets: 3, reps: 15, repsMin: 10, prog: 'double', sg: 'a1', restSec: 60 },
        { id: '1459', sets: 3, reps: 12, repsMin: 10, prog: 'double', restSec: 90, note: 'Hinge, do not squat. Stop when the hamstrings pull, not when the bar reaches the floor.' },
        { id: '0426', sets: 2, reps: 15, repsMin: 10, prog: 'double', sg: 'a2', restSec: 60, note: 'Superset with the pulldown.' },
        { id: '2330', sets: 2, reps: 15, repsMin: 10, prog: 'double', sg: 'a2', restSec: 60 },
        { id: '0276', sets: 3, mode: 'time', sec: 40, prog: 'time', restSec: 45, note: 'Low back stays pressed into the floor the whole time.' },
        { id: '0549', sets: 3, reps: 15, repsMin: 12, prog: 'double', restSec: 45, note: 'Finisher. Snap the hips; the arms are just ropes.' },
      ],
    },
    {
      id: 'wl-b', name: 'Cardio & Core', emoji: 'figureRun', day: 2, minutes: 45,
      ex: [
        { id: '3666', sets: 1, min: 30, speed: 5.5, note: 'Steady state. You should be able to talk in full sentences. Raise the incline before the speed.' },
        { id: '0464', sets: 3, mode: 'time', sec: 30, prog: 'time', restSec: 45 },
        { id: '0687', sets: 3, reps: 20, repsMax: 30, restSec: 45, note: 'Count both sides as one rep. Slow and controlled.' },
        { id: '0262', sets: 3, reps: 15, repsMax: 25, restSec: 45 },
      ],
    },
    {
      id: 'wl-c', name: 'Full Body B', emoji: 'machine', day: 4, minutes: 50,
      ex: [
        { id: '0739', sets: 3, reps: 15, repsMin: 12, prog: 'double', restSec: 90, note: 'Feet high on the platform shifts work toward glutes and hamstrings.' },
        { id: '0861', sets: 3, reps: 15, repsMin: 10, prog: 'double', sg: 'c1', restSec: 60, note: 'Superset with push-ups.' },
        { id: '0662', sets: 3, reps: 10, repsMax: 20, sg: 'c1', restSec: 60, note: 'Knees or an incline if 10 clean reps is not there yet. At 20 the app adds a set.' },
        { id: '0431', sets: 3, reps: 16, repsMin: 12, prog: 'double', side: true, restSec: 75, note: 'Reps are the total across both legs. Drive through the heel on the box.' },
        { id: '0334', sets: 2, reps: 15, repsMin: 12, prog: 'double', sg: 'c2', restSec: 45, note: 'Superset with hammer curls.' },
        { id: '0313', sets: 2, reps: 15, repsMin: 12, prog: 'double', sg: 'c2', restSec: 45 },
        { id: '0630', sets: 3, mode: 'time', sec: 40, prog: 'time', restSec: 45 },
        { id: '2612', sets: 5, mode: 'time', sec: 60, prog: 'time', restSec: 30, note: 'Finisher. Rest when you trip, then straight back in.' },
      ],
    },
    {
      id: 'wl-d', name: 'Full Body C', emoji: 'barbell', day: 6, minutes: 55,
      ex: [
        { id: '0043', sets: 3, reps: 12, repsMin: 8, prog: 'double', warmupSets: 2, restSec: 120, note: 'The heaviest work of the week. Two warm-up sets are planned; add a third if the bar feels cold.' },
        { id: '0025', sets: 3, reps: 12, repsMin: 8, prog: 'double', sg: 'd1', warmupSets: 1, restSec: 90, note: 'Superset with the barbell row.' },
        { id: '0027', sets: 3, reps: 12, repsMin: 8, prog: 'double', sg: 'd1', restSec: 90 },
        { id: '0336', sets: 3, reps: 16, repsMin: 12, prog: 'double', side: true, restSec: 75 },
        { id: '0585', sets: 2, reps: 15, repsMin: 12, prog: 'double', sg: 'd2', restSec: 45, note: 'Superset with leg curls.' },
        { id: '0586', sets: 2, reps: 15, repsMin: 12, prog: 'double', sg: 'd2', restSec: 45 },
        { id: '2133', sets: 3, mode: 'time', sec: 40, prog: 'time', restSec: 60, note: 'Heavy enough that the last 10 seconds are a fight for grip.' },
        { id: '1160', sets: 3, mode: 'reps', reps: 10, repsMax: 15, restSec: 60, note: 'Finisher. Step back instead of jumping if the knees complain.' },
      ],
    },
    {
      id: 'wl-e', name: 'Easy Cardio', emoji: 'heart', day: 0, minutes: 40,
      ex: [
        { id: '2141', sets: 1, min: 35, speed: 6, note: 'Recovery pace. A brisk outdoor walk or a bike ride is a fair swap.' },
        { id: '3013', sets: 2, reps: 15, repsMax: 25, restSec: 30, note: 'Optional. Squeeze at the top for a second.' },
      ],
    },
  ],
}

// The women's version keeps the same engine and the same weekly shape. What changes, and why:
//  · a lower-body and glute emphasis (two lower days, hinge and bridge patterns weekly), because
//    that is what most women training for fat loss ask for; it is a preference, not a physiology
//  · shorter rests and higher accessory rep ranges, because women recover faster between sets
//    and complete more reps at a given relative load
//  · no cycle-phase periodisation, because the best current evidence finds no effect on strength
//    or adaptation; train by feel on a bad day instead
//  · the four exercises the library demonstrates with a female model, where they fit
const WOMEN = {
  slug: 'weight-loss-women', pagePath: 'women', planName: '12-week weight loss (women)',
  title: "Weight loss programme · women's version", subtitle: '12 weeks · 4 gym days + 1 easy cardio · lower-body emphasis',
  sibling: { label: 'General version', href: '../' },
  audience: 'Written for a woman with normal gym access (dumbbells, a barbell, cables and machines), new to or returning to training, with 45 to 55 minutes per session. General training advice, not medical advice. If you are pregnant, postpartum, or have a condition or an injury, check with a professional first.',
  why: [
    '<b>Same engine, different emphasis.</b> Muscle and strength adapt the same way in women and men, so the fundamentals are unchanged: a moderate deficit of about 300 to 500 kcal a day, 0.5 to 1 % of body weight per week, protein at 1.6 to 2.2 g per kg.',
    '<b>Two lower-body days.</b> Glutes, hamstrings and quads each get hit twice a week with a hinge, a bridge and a squat pattern. Upper body once, plus push-ups and rows inside the full-body day. This is what most women training for fat loss want more of; it is a priority, not a rule.',
    '<b>Shorter rests, higher reps on accessories.</b> Women recover faster between sets and complete more reps at the same relative load, so accessory ranges run 12 to 20 and rests sit at 45 to 75 s. The barbell lifts keep their full rest.',
    '<b>No cycle-phase periodisation.</b> The best current evidence finds no effect of cycle phase on strength or on how muscle adapts. On a day you feel flat, drop a set or lighten the load and carry on; do not re-plan the month around it.',
    '<b>Do not under-eat.</b> A very low calorie intake is the fastest way to lose muscle, stall, and feel awful. If periods become irregular or stop, the deficit is too big. Iron-rich foods matter when menstruating.',
    '<b>Lift something heavy once a week.</b> The barbell squat and deadlift day is there for bone density as much as for fat loss. Keep it even when the scale is the goal.',
  ],
  phases: [
    ['Weeks 1–4 · Learn and build', ['Numbers as written. Leave 2 to 3 reps in the tank on the last set.', 'Cardio at a pace where talking is easy.', 'Weigh in twice a week, watch the weekly average, and expect it to swing with your cycle.']],
    ['Weeks 5–8 · Density', ['Cut rests by 15 s on every accessory; keep the barbell rests.', 'Steady cardio to 40 min; incline up before speed.', 'Scale stuck for two weeks? Trim 100 to 200 kcal from the day, not the training.']],
    ['Weeks 9–12 · Push', ['Add a fourth set to the first exercise of each lifting day.', 'Swap one easy cardio for intervals: 8 × 1 min hard, 1 min easy.', 'Week 12 is a deload: two sets of everything, then reassess.']],
  ],
  sources: [
    ['Resistance training induces similar adaptations of upper and lower-body muscles between sexes (Sci Rep, 2021)', 'https://www.nature.com/articles/s41598-021-02867-y'],
    ['The effects of biological sex on fatigue during and recovery from resistance exercise (PeerJ, 2025)', 'https://peerj.com/articles/20542/'],
    ['Current evidence shows no influence of menstrual cycle phase on strength or adaptation (Colenso-Semple et al., Front Sports Act Living, 2023)', 'https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2023.1054542/full'],
    ['Menstrual cycle phase does not influence training-induced hypertrophy or strength: RCT (Med Sci Sports Exerc, 2025)', 'https://www.ovid.com/jnls/acsm-msse/fulltext/10.1249/mss.0000000000004031~menstrual-cycle-phase-does-not-influence-training-induced'],
  ],
  routines: [
    {
      id: 'wlw-a', name: 'Lower · Glutes & Hinge', emoji: 'legs', day: 1, minutes: 50,
      ex: [
        { id: '1409', sets: 3, reps: 15, repsMin: 12, prog: 'double', warmupSets: 1, restSec: 90, note: 'The main lift of the day. Chin tucked, ribs down, squeeze hard at the top for a second. A bench under the shoulders turns it into a hip thrust.' },
        { id: '1459', sets: 3, reps: 15, repsMin: 10, prog: 'double', restSec: 75, note: 'Hinge, do not squat. Stop when the hamstrings pull.' },
        { id: '0431', sets: 3, reps: 20, repsMin: 16, prog: 'double', side: true, restSec: 60, note: 'Reps are the total across both legs. Knee-height box; drive through the heel.' },
        { id: '0597', sets: 2, reps: 20, repsMin: 15, prog: 'double', sg: 'a1', restSec: 45, note: 'Superset with leg curls. Lean forward slightly to feel the glutes rather than the hip flexors.' },
        { id: '0586', sets: 2, reps: 15, repsMin: 12, prog: 'double', sg: 'a1', restSec: 45 },
        { id: '3236', sets: 3, reps: 15, repsMax: 25, restSec: 45, note: 'Band just above the knees, push the knees out the whole way up. Finisher for the glutes.' },
        { id: '2801', sets: 3, reps: 12, repsMax: 20, restSec: 45, note: 'Low back stays on the floor. Count one twist to each side as a rep.' },
      ],
    },
    {
      id: 'wlw-b', name: 'Upper & Core', emoji: 'dumbbell', day: 2, minutes: 45,
      ex: [
        { id: '2327', sets: 3, reps: 15, repsMin: 10, prog: 'double', sg: 'b1', restSec: 60, note: 'Superset with the bench press: row, then press, then rest. Elbows stay close to the body.' },
        { id: '0289', sets: 3, reps: 15, repsMin: 10, prog: 'double', sg: 'b1', restSec: 60 },
        { id: '2330', sets: 3, reps: 15, repsMin: 10, prog: 'double', sg: 'b2', restSec: 60, note: 'Superset with the overhead press.' },
        { id: '0426', sets: 3, reps: 15, repsMin: 10, prog: 'double', sg: 'b2', restSec: 60 },
        { id: '0334', sets: 2, reps: 20, repsMin: 15, prog: 'double', sg: 'b3', restSec: 45, note: 'Superset with the pushdown. Light and strict.' },
        { id: '0241', sets: 2, reps: 15, repsMin: 12, prog: 'double', sg: 'b3', restSec: 45 },
        { id: '0276', sets: 3, mode: 'time', sec: 40, prog: 'time', restSec: 45, note: 'Low back pressed into the floor the whole time.' },
        { id: '2612', sets: 5, mode: 'time', sec: 60, prog: 'time', restSec: 30, note: 'Finisher. Rest when you trip, then straight back in.' },
      ],
    },
    {
      id: 'wlw-c', name: 'Lower · Quads & Conditioning', emoji: 'figureStrength', day: 4, minutes: 50,
      ex: [
        { id: '1760', sets: 3, reps: 15, repsMin: 12, prog: 'double', restSec: 90, note: 'Heels down, chest up, sit between the knees. Elbows inside the knees at the bottom.' },
        { id: '0336', sets: 3, reps: 20, repsMin: 16, prog: 'double', side: true, restSec: 60, note: 'Reps are the total across both legs. Long step, front knee over the laces.' },
        { id: '0585', sets: 2, reps: 20, repsMin: 15, prog: 'double', sg: 'c1', restSec: 45, note: 'Superset with calf raises. Pause a second at the top.' },
        { id: '0605', sets: 2, reps: 20, repsMin: 15, prog: 'double', sg: 'c1', restSec: 45 },
        { id: '0489', sets: 3, reps: 12, repsMax: 20, restSec: 45, note: 'Hips on the pad, not the stomach. Squeeze the glutes to come up; do not arch past straight.' },
        { id: '0630', sets: 3, mode: 'time', sec: 40, prog: 'time', restSec: 45 },
        { id: '3666', sets: 1, min: 15, speed: 5.5, note: 'Finisher. Incline up to where you cannot hold a conversation easily, then hold that for 15 min.' },
      ],
    },
    {
      id: 'wlw-d', name: 'Full Body & Barbell', emoji: 'barbell', day: 6, minutes: 55,
      ex: [
        { id: '0043', sets: 3, reps: 12, repsMin: 8, prog: 'double', warmupSets: 2, restSec: 120, note: 'The heaviest work of the week. Two warm-up sets are planned; add a third if the bar feels cold.' },
        { id: '0085', sets: 3, reps: 12, repsMin: 8, prog: 'double', warmupSets: 1, restSec: 120, note: 'Bar stays on the thighs the whole way. This and the squat are the bone-density work.' },
        { id: '0027', sets: 3, reps: 12, repsMin: 10, prog: 'double', sg: 'd1', restSec: 60, note: 'Superset with push-ups.' },
        { id: '0662', sets: 3, reps: 8, repsMax: 20, sg: 'd1', restSec: 60, note: 'Hands on a bench or the knees on the floor if 8 clean reps is not there yet. At 20 the app adds a set.' },
        { id: '2133', sets: 3, mode: 'time', sec: 40, prog: 'time', restSec: 60, note: 'Heavy enough that the last 10 seconds are a fight for grip.' },
        { id: '0687', sets: 3, reps: 20, repsMax: 30, restSec: 45, note: 'Count both sides as one rep. Slow and controlled.' },
        { id: '0549', sets: 3, reps: 20, repsMin: 15, prog: 'double', restSec: 45, note: 'Finisher. Snap the hips; the arms are just ropes.' },
      ],
    },
    {
      id: 'wlw-e', name: 'Easy Cardio', emoji: 'heart', day: 0, minutes: 40,
      ex: [
        { id: '2141', sets: 1, min: 35, speed: 6, note: 'Recovery pace. A brisk outdoor walk or a bike ride is a fair swap.' },
        { id: '3013', sets: 2, reps: 20, repsMax: 30, restSec: 30, note: 'Optional. Squeeze at the top for a second.' },
      ],
    },
  ],
}

const PROGRAMS = [GENERAL, WOMEN]

// --- plan file ------------------------------------------------------------------------------
const PAGE_ONLY = new Set(['note'])
function planBundle(p) {
  const week = {}
  for (const r of p.routines) week[r.day] = [r.id]
  const bundle = {
    opengym_plan: 1,
    exported: new Date().toISOString().slice(0, 10),
    name: p.planName,
    unit: 'kg',
    week,
    routines: p.routines.map(r => ({
      id: r.id, name: r.name, emoji: r.emoji,
      ex: r.ex.map(e => Object.fromEntries(Object.entries(e).filter(([k]) => !PAGE_ONLY.has(k)))),
    })),
    customEx: [],
  }
  for (const r of bundle.routines) for (const e of r.ex) if (!IDX[e.id]) throw new Error('unknown exercise id ' + e.id)
  return bundle
}

// --- the page --------------------------------------------------------------------------------
// Phone-first: one training day on screen at a time, picked by a tab row that defaults to today.
// Exercise cards sit in a single column with a thumbnail, the prescription in large type, one
// tap-target per set to tick off, and the GIF in a full-screen viewer. Ticks are kept in the
// browser's localStorage under today's date, so a session survives a screen lock at the gym.
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const media = (e, kind) => CDN
  ? CDN_BASE + (kind === 'gifs' ? 'videos/' + e.gif : 'images/' + e.img)
  : '../media/' + kind + '/' + slug(e.bp) + '/' + (kind === 'gifs' ? e.gif : e.img)

function prescription(cfg) {
  if (cfg.min != null) return { big: cfg.min + ' min', small: cfg.speed ? 'about ' + cfg.speed + ' km/h' : 'steady pace' }
  if (cfg.mode === 'time') return { big: cfg.sets + ' × ' + cfg.sec + ' s', small: cfg.sets + ' holds' }
  const range = cfg.repsMin ? cfg.repsMin + '–' + cfg.reps : String(cfg.reps)
  const side = cfg.side ? (cfg.repsMin ? cfg.repsMin / 2 + '–' + cfg.reps / 2 : cfg.reps / 2) + ' per side' : ''
  const cap = cfg.repsMax ? 'climb to ' + cfg.repsMax : ''
  return { big: cfg.sets + ' × ' + range, small: [side, cap].filter(Boolean).join(' · ') || (cfg.sets + ' sets') }
}
function progressionLabel(cfg) {
  if (cfg.min != null) return 'Add 5 min every two weeks'
  if (cfg.prog === 'time') return 'Hold every set in full → add 5 s next time'
  if (cfg.prog === 'double') return 'Top of the range in every set → add weight, start at the bottom again'
  if (cfg.repsMax) return 'Every rep → one more next time; at the cap, add a set'
  return 'Every rep → add weight next time'
}
const setCount = cfg => cfg.min != null ? 1 : cfg.sets

function card(cfg, i, rid) {
  const e = IDX[cfg.id]
  const rx = prescription(cfg)
  const n = setCount(cfg)
  const key = rid + ':' + cfg.id
  const ticks = Array.from({ length: n }, (_, k) => '<button class="tick" data-key="' + key + '" data-i="' + k + '" aria-label="Set ' + (k + 1) + '">' + (k + 1) + '</button>').join('')
  const meta = [cfg.warmupSets ? cfg.warmupSets + ' warm-up set' + (cfg.warmupSets > 1 ? 's' : '') : '', cfg.restSec ? 'rest ' + cfg.restSec + ' s' : ''].filter(Boolean).join(' · ')
  const name = e.n.replace(/\s*\((fe)?male\)\s*$/, '')
  return '<article class="ex" data-key="' + key + '">' +
    '<button class="thumb" data-gif="' + media(e, 'gifs') + '" data-name="' + esc(name) + '" aria-label="Show demo"><img loading="lazy" src="' + media(e, 'images') + '" alt=""><span class="play">▶</span></button>' +
    '<div class="info">' +
    '<div class="top"><span class="num">' + (i + 1) + '</span><h3>' + esc(name) + '</h3></div>' +
    '<div class="rx"><b>' + esc(rx.big) + '</b><span>' + esc(rx.small) + '</span></div>' +
    (meta ? '<div class="meta">' + esc(meta) + '</div>' : '') +
    '<div class="ticks">' + ticks + '</div>' +
    '</div>' +
    '<div class="more">' +
    (cfg.note ? '<p class="note">' + esc(cfg.note) + '</p>' : '') +
    '<p class="prog">' + esc(progressionLabel(cfg)) + '</p>' +
    '<details><summary>How to do it</summary><ol>' + (e.st || []).map(s => '<li>' + esc(s) + '</li>').join('') + '</ol>' +
    '<p class="tags">' + esc(e.eq) + ' · ' + esc(e.tg) + (e.sm && e.sm.length ? ' · also ' + esc(e.sm.join(', ')) : '') + '</p></details>' +
    '</div></article>'
}

// Adjacent exercises sharing `sg` are wrapped in one superset block so the pairing reads at a glance.
function dayBody(r) {
  const out = []
  for (let i = 0; i < r.ex.length; i++) {
    const cfg = r.ex[i]
    if (cfg.sg && r.ex[i + 1] && r.ex[i + 1].sg === cfg.sg) {
      const group = [card(cfg, i, r.id)]
      let j = i + 1
      while (r.ex[j] && r.ex[j].sg === cfg.sg) { group.push(card(r.ex[j], j, r.id)); j++ }
      out.push('<div class="superset"><div class="ss-label">Superset · back to back, then rest</div>' + group.join('') + '</div>')
      i = j - 1
    } else out.push(card(cfg, i, r.id))
  }
  return out.join('')
}

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

function pageHTML(p, planFile) {
  const tabs = DAY_ORDER.map(d => {
    const r = p.routines.find(x => x.day === d)
    return '<button class="tab' + (r ? '' : ' rest') + '" data-day="' + d + '"><span class="td">' + DAYS[d].slice(0, 3) + '</span><span class="tn">' + (r ? esc(r.name) : 'Rest') + '</span></button>'
  }).join('')
  const panels = DAY_ORDER.map(d => {
    const r = p.routines.find(x => x.day === d)
    if (!r) return '<section class="panel" data-day="' + d + '" hidden><div class="dayhead"><h2>' + DAYS[d] + ' · Rest</h2><p>Walk 8 to 10k steps, eat your protein, sleep. Nothing to tick today.</p></div></section>'
    return '<section class="panel" data-day="' + d + '" hidden>' +
      '<div class="dayhead"><h2>' + DAYS[d] + ' · ' + esc(r.name) + '</h2><p>' + r.ex.length + ' exercises · about ' + r.minutes + ' min · <span class="done" data-rid="' + r.id + '"></span></p>' +
      '<button class="reset" data-rid="' + r.id + '">Clear ticks</button></div>' +
      dayBody(r) + '</section>'
  }).join('')
  const phases = p.phases.map(([h, items]) => '<div class="phase"><b>' + esc(h) + '</b><ul>' + items.map(s => '<li>' + esc(s) + '</li>').join('') + '</ul></div>').join('')
  const sources = p.sources.length
    ? '<details><summary>Sources</summary><ul>' + p.sources.map(([t, u]) => '<li><a href="' + u + '" target="_blank" rel="noopener">' + esc(t) + '</a></li>').join('') + '</ul></details>'
    : ''
  const storeKey = 'wl.' + p.slug + '.'

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#c2410c">
<title>${esc(p.title)}</title>
<style>
/* Layout: sticky day tabs on top, one day panel at a time, single-column exercise cards. */
:root{
  --bg:#f6f5f2; --panel:#ffffff; --fg:#1d1c1a; --muted:#6b675f; --line:#e2dfd8;
  --accent:#c2410c; --accent-soft:#fdebe1; --chip:#efece6; --good:#2f6f4e; --good-soft:#dff0e6;
  --font:ui-sans-serif,system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  --tap:44px;
}
@media (prefers-color-scheme: dark){:root{
  --bg:#17171a; --panel:#202024; --fg:#ecebe7; --muted:#a19d95; --line:#33333a;
  --accent:#f0853f; --accent-soft:#3a2416; --chip:#2b2b31; --good:#7fc79e; --good-soft:#1d3327; color-scheme:dark;
}}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.45 var(--font)}
button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
a{color:var(--accent)}
.page{max-width:720px;margin:0 auto;padding:0 16px calc(24px + env(safe-area-inset-bottom,0px))}
.bar{position:sticky;top:0;z-index:10;background:var(--bg);padding-top:env(safe-area-inset-top,0px);margin:0 -16px;padding-left:16px;padding-right:16px;border-bottom:1px solid var(--line)}
.bar h1{font-size:18px;margin:12px 0 8px}
.bar h1 small{display:block;font-size:13px;font-weight:400;color:var(--muted)}
.bar h1 small a{white-space:nowrap}
.tabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:10px;scroll-snap-type:x proximity}
.tabs::-webkit-scrollbar{display:none}
.tab{flex:0 0 auto;min-width:72px;min-height:var(--tap);padding:6px 10px;border:1px solid var(--line);border-radius:10px;background:var(--panel);text-align:center;scroll-snap-align:start}
.tab .td{display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.tab .tn{display:block;font-size:13px;font-weight:600;white-space:nowrap}
.tab.rest .tn{font-weight:400;color:var(--muted)}
.tab.on{background:var(--accent);border-color:var(--accent);color:#fff}
.tab.on .td,.tab.on .tn{color:#fff}
.tab.today::after{content:"today";display:block;font-size:10px;color:var(--accent);margin-top:1px}
.tab.on.today::after{color:#fff}
.dayhead{padding:16px 0 8px;display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline}
.dayhead h2{font-size:22px;margin:0;flex:1 1 100%}
.dayhead p{margin:0;color:var(--muted);font-size:14px;flex:1}
.dayhead .done{color:var(--good);font-weight:600}
.reset{min-height:36px;padding:0 12px;border-radius:8px;border:1px solid var(--line);font-size:13px;color:var(--muted)}
.ex{background:var(--panel);border:1px solid var(--line);border-radius:12px;margin:10px 0;display:grid;grid-template-columns:104px 1fr;overflow:hidden}
.thumb{position:relative;width:104px;height:104px;background:#fff;display:block}
.thumb img{width:100%;height:100%;object-fit:contain;display:block}
.thumb .play{position:absolute;right:6px;bottom:6px;width:26px;height:26px;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;font-size:11px;display:flex;align-items:center;justify-content:center}
.info{padding:10px 12px 10px 10px;min-width:0;display:flex;flex-direction:column;gap:6px}
.top{display:flex;gap:8px;align-items:flex-start}
.num{flex:none;width:22px;height:22px;border-radius:50%;background:var(--chip);color:var(--muted);font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;margin-top:1px}
.ex h3{font-size:15px;margin:0;line-height:1.3;text-transform:capitalize;font-weight:600}
.rx{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}
.rx b{font-size:20px;color:var(--accent);font-variant-numeric:tabular-nums}
.rx span{font-size:13px;color:var(--muted)}
.meta{font-size:12px;color:var(--muted)}
.ticks{display:flex;gap:6px;flex-wrap:wrap}
.tick{width:var(--tap);height:var(--tap);border-radius:10px;border:1.5px solid var(--line);font-weight:600;color:var(--muted);background:var(--bg)}
.tick.on{background:var(--good);border-color:var(--good);color:#fff}
.ex.complete{border-color:var(--good)}
.ex.complete .num{background:var(--good);color:#fff}
.more{grid-column:1/-1;border-top:1px solid var(--line);padding:8px 12px 10px;font-size:14px}
.more p{margin:0 0 6px}
.note{color:var(--fg)}
.prog{color:var(--good);font-size:13px}
details{font-size:14px;color:var(--muted)}
summary{cursor:pointer;color:var(--accent);min-height:32px;display:flex;align-items:center}
details ol{margin:4px 0 0;padding-left:20px}
details li{margin-bottom:4px}
.tags{font-size:12px;text-transform:capitalize;margin-top:6px}
.superset{border:2px solid var(--accent);border-radius:14px;padding:0 6px 6px;margin:12px 0;background:var(--accent-soft)}
.ss-label{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--accent);font-weight:600;padding:8px 6px 2px}
.superset .ex{margin:6px 0 0}
.about{margin-top:28px}
.about details{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:0 14px;margin:8px 0;color:var(--fg)}
.about summary{font-weight:600;color:var(--fg);min-height:var(--tap)}
.about ul{padding-left:20px;margin:0 0 12px;color:var(--muted);font-size:14px}
.about li{margin-bottom:6px}
.about p{color:var(--muted);font-size:14px;margin:0 0 12px}
.phase{margin:0 0 12px}
.phase b{display:block;color:var(--accent);font-size:12px;letter-spacing:.06em;text-transform:uppercase}
code{background:var(--chip);padding:1px 5px;border-radius:4px;font-size:13px}
.viewer{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;padding-top:calc(16px + env(safe-area-inset-top,0px))}
.viewer[hidden]{display:none}
.viewer img{max-width:100%;max-height:70vh;background:#fff;border-radius:12px}
.viewer .vn{color:#fff;font-weight:600;margin:12px 0 4px;text-transform:capitalize;text-align:center}
.viewer .vh{color:#bbb;font-size:13px}
.viewer .close{position:absolute;top:calc(12px + env(safe-area-inset-top,0px));right:12px;width:var(--tap);height:var(--tap);border-radius:50%;background:rgba(255,255,255,.15);color:#fff;font-size:22px}
@media (min-width:600px){.ex{grid-template-columns:128px 1fr}.thumb{width:128px;height:128px}}
@media (prefers-reduced-motion: reduce){*{scroll-behavior:auto}}
</style>
</head>
<body>
<div class="page">
<div class="bar">
  <h1>${esc(p.title)} <small>${esc(p.subtitle)} · <a href="${p.sibling.href}">${esc(p.sibling.label)} →</a></small></h1>
  <div class="tabs" id="tabs">${tabs}</div>
</div>

${panels}

<section class="about">
  <details><summary>How to use this page</summary>
    <ul>
      <li>Tap a day at the top. Today is picked for you.</li>
      <li>Tap a picture to watch the movement.</li>
      <li>Tap a numbered box after each set. Ticks stay on this phone for the day and clear themselves tomorrow.</li>
      <li>The big orange number is what to do. The green line underneath says when to add weight.</li>
      <li>Exercises in an orange frame are a superset: do one, then the other, then rest.</li>
    </ul>
  </details>
  <details><summary>Why the programme looks like this</summary>
    <ul>${p.why.map(s => '<li>' + s + '</li>').join('')}</ul>
    <p>${esc(p.audience)}</p>
  </details>
  <details><summary>The three phases</summary>${phases}</details>
  ${sources}
  <details><summary>Import into openGym</summary>
    <p>The file <a href="${planFile}" download><code>${planFile}</code></a> next to this page is an openGym plan. In the app, open <b>Plan</b>, choose <b>Import plan</b> and pick it. The five routines arrive with this weekly schedule. Weights are left empty so your first session sets the baseline and the app's progression takes over.</p>
  </details>
</section>
</div>

<div class="viewer" id="viewer" hidden>
  <button class="close" id="vclose" aria-label="Close">×</button>
  <img id="vimg" alt="">
  <div class="vn" id="vname"></div>
  <div class="vh">Tap anywhere to close</div>
</div>

<script>
(function(){
  var K=${JSON.stringify(storeKey)};
  var today=new Date().getDay();
  var tabs=document.querySelectorAll('.tab'),panels=document.querySelectorAll('.panel');
  function iso(){var n=new Date();return n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0')}
  function show(d){
    tabs.forEach(function(t){t.classList.toggle('on',+t.dataset.day===d)});
    panels.forEach(function(p){p.hidden=+p.dataset.day!==d});
    var on=document.querySelector('.tab.on');if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest',inline:'center'});
    try{localStorage.setItem(K+'day',d);localStorage.setItem(K+'dayDate',iso())}catch(e){}
  }
  tabs.forEach(function(t){if(+t.dataset.day===today)t.classList.add('today');t.addEventListener('click',function(){show(+t.dataset.day)})});
  var start=today;try{var s=localStorage.getItem(K+'day');var sd=localStorage.getItem(K+'dayDate');if(s!=null&&sd===iso())start=+s}catch(e){}
  show(start);

  // Ticks: one localStorage key per exercise, holding the date and the set indexes ticked.
  function load(key){try{var v=JSON.parse(localStorage.getItem(K+'t.'+key)||'null');return v&&v.d===iso()?v.s:[]}catch(e){return[]}}
  function save(key,s){try{localStorage.setItem(K+'t.'+key,JSON.stringify({d:iso(),s:s}))}catch(e){}}
  function paint(key){
    var s=load(key),art=document.querySelector('.ex[data-key="'+key+'"]');if(!art)return;
    var ticks=art.querySelectorAll('.tick');ticks.forEach(function(b){b.classList.toggle('on',s.indexOf(+b.dataset.i)>=0)});
    art.classList.toggle('complete',ticks.length>0&&s.length>=ticks.length);
  }
  function paintDay(rid){
    var arts=document.querySelectorAll('.ex[data-key^="'+rid+':"]'),done=0;
    arts.forEach(function(a){if(a.classList.contains('complete'))done++});
    var el=document.querySelector('.done[data-rid="'+rid+'"]');if(el)el.textContent=done?done+' of '+arts.length+' done':'';
  }
  document.querySelectorAll('.ex').forEach(function(a){paint(a.dataset.key)});
  document.querySelectorAll('.done').forEach(function(d){paintDay(d.dataset.rid)});
  var viewer=document.getElementById('viewer'),vimg=document.getElementById('vimg'),vname=document.getElementById('vname');
  document.addEventListener('click',function(e){
    var b=e.target.closest('.tick');
    if(b){var key=b.dataset.key,i=+b.dataset.i,s=load(key);var at=s.indexOf(i);if(at>=0)s.splice(at,1);else s.push(i);save(key,s);paint(key);paintDay(key.split(':')[0]);return}
    var r=e.target.closest('.reset');
    if(r){document.querySelectorAll('.ex[data-key^="'+r.dataset.rid+':"]').forEach(function(a){save(a.dataset.key,[]);paint(a.dataset.key)});paintDay(r.dataset.rid);return}
    var t=e.target.closest('.thumb');
    if(t){vimg.src=t.dataset.gif;vname.textContent=t.dataset.name;viewer.hidden=false;return}
    if(e.target.closest('#viewer')){viewer.hidden=true;vimg.src='';}
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){viewer.hidden=true;vimg.src=''}});
})();
</script>
</body>
</html>
`
}

// --- write ----------------------------------------------------------------------------------
for (const p of PROGRAMS) {
  const outDir = CDN ? path.join(ROOT, 'docs', p.pagePath) : path.join(ROOT, 'programs')
  const pageName = CDN ? 'index.html' : p.slug + '-program.html'
  const planFile = p.slug + '-plan.opengym.json'
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, planFile), JSON.stringify(planBundle(p), null, 2))
  const html = pageHTML(p, planFile)
  fs.writeFileSync(path.join(outDir, pageName), html)
  console.log(path.relative(ROOT, path.join(outDir, pageName)) + ': ' + p.routines.length + ' routines, ' + p.routines.reduce((n, r) => n + r.ex.length, 0) + ' exercises, ' + (html.length / 1024 | 0) + ' KB')
}
