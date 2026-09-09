const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('js/sketch.js', 'utf8');

function mount({ saved = null, blocked = false, missingCanvas = false, ratio = 2, clockDate = Date } = {}) {
  let depth = 0, minDepth = 0;
  const transforms = [];
  const ctx = new Proxy({}, { get(target, key) {
    if (key === 'save') return () => depth++;
    if (key === 'restore') return () => { depth--; minDepth = Math.min(minDepth, depth); };
    if (key === 'setTransform') return (...args) => transforms.push(args);
    return target[key] ?? (() => {});
  }});
  const element = extra => ({ attributes: {}, events: {}, style: {},
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(key, fn) { this.events[key] = fn; }, ...extra });
  const canvas = element({ clientWidth: 600, clientHeight: 500,
    getContext: () => missingCanvas ? null : ctx,
    getBoundingClientRect: () => ({ left: 0, top: 100 }) });
  const button = element({});
  const time = element({});
  const document = element({ body: { dataset: {} }, hidden: false,
    getElementById: id => ({ canvas, theme: button, time })[id] });
  const timers = new Map(), windowEvents = {};
  let nextTimer = 0;
  const context = {
    document, devicePixelRatio: ratio, Date: clockDate,
    localStorage: { getItem() { if (blocked) throw Error('blocked'); return saved; },
      setItem(_, value) { if (blocked) throw Error('blocked'); saved = value; } },
    addEventListener: (key, fn) => windowEvents[key] = fn,
    setInterval: fn => { const id = ++nextTimer; timers.set(id, fn); return id; },
    clearInterval: id => timers.delete(id), console,
  };
  vm.createContext(context);
  vm.runInContext(source, context, { timeout: 1000 });
  return { canvas, button, time, document, timers, windowEvents, transforms,
    angles: () => vm.runInContext('({ hours: watch.hours, minutes: watch.minutes, seconds: watch.seconds })', context),
    depth: () => depth, minDepth: () => minDepth, saved: () => saved };
}

test('draws time with balanced canvas state across repeated ticks', () => {
  const app = mount();
  for (let n = 0; n < 500; n++) for (const tick of app.timers.values()) tick();
  assert.equal(app.depth(), 0);
  assert.equal(app.minDepth(), 0);
  assert.ok(app.time.textContent);
  assert.match(app.time.dateTime, /^\d{4}-\d\d-\d\dT/);
  assert.match(app.canvas.attributes['aria-label'], /Analog clock showing/);
});
test('theme button updates accessible state and persisted preference', () => {
  const app = mount();
  assert.equal(app.document.body.dataset.theme, 'dark');
  app.button.events.click();
  assert.equal(app.document.body.dataset.theme, 'light');
  assert.equal(app.button.attributes['aria-pressed'], 'true');
  assert.equal(app.saved(), '0');
  app.button.events.click();
  assert.equal(app.saved(), '1');
});
test('restores valid themes and recovers from corrupt stored values', () => {
  assert.equal(mount({ saved: '0' }).document.body.dataset.theme, 'light');
  for (const saved of ['999', '-1', 'NaN', 'bad', '']) {
    assert.equal(mount({ saved }).document.body.dataset.theme, 'dark');
  }
});
test('works when browser storage is unavailable', () => {
  const app = mount({ blocked: true });
  app.button.events.click();
  assert.equal(app.document.body.dataset.theme, 'light');
});
test('scales backing resolution for high-density displays and resizes', () => {
  const app = mount({ ratio: 4 });
  assert.equal(app.canvas.width, 1800);
  assert.equal(app.canvas.height, 1500);
  app.canvas.clientWidth = 390;
  app.windowEvents.resize();
  assert.equal(app.canvas.width, 1170);
  assert.deepEqual(app.transforms.at(-1), [3,0,0,3,0,0]);
  assert.equal(app.depth(), 0);
});
test('suspends timer while hidden and restores one timer on return', () => {
  const app = mount();
  assert.equal(app.timers.size, 1);
  app.document.hidden = true;
  app.document.events.visibilitychange();
  assert.equal(app.timers.size, 0);
  app.document.hidden = false;
  app.document.events.visibilitychange();
  app.document.events.visibilitychange();
  assert.equal(app.timers.size, 1);
});
test('digital time remains available without Canvas support', () => {
  const app = mount({ missingCanvas: true });
  assert.ok(app.time.textContent);
  app.button.events.click();
  assert.equal(app.document.body.dataset.theme, 'light');
});

test('hour and minute hands include elapsed smaller units', () => {
  class FixedDate extends Date {
    getHours() { return 3; }
    getMinutes() { return 30; }
    getSeconds() { return 15; }
  }
  const angles = mount({ clockDate: FixedDate }).angles();
  assert.ok(Math.abs(angles.hours * 180 / Math.PI - 105.125) < 1e-10);
  assert.ok(Math.abs(angles.minutes * 180 / Math.PI - 181.5) < 1e-10);
  assert.ok(Math.abs(angles.seconds * 180 / Math.PI - 90) < 1e-10);
});
