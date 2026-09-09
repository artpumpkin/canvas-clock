// Original Canvas drawing study: 2019. Release cleanup and accessible controls: 2026.
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const themeButton = document.getElementById('theme');
const timeLabel = document.getElementById('time');
let width = canvas.clientWidth, height = canvas.clientHeight;
let centerX = width / 2, centerY = height / 2;
let mouseX = -1, mouseY = -1;
let date = new Date();
let watch;
let colorSchemeIndex = 1;
let colorScheme = [
  {
    background: "#eff2dd",
    iconBackground: "#b7b9a8",
    sunColor: "#8c8e82",
    sunHoveredColor: "#4d4e46",
    strDateColor: "#009688",
    dateColor: "#74756a",
    circularHoursColor: "#009688",
    circularHoursColorTrack: "#80cbc4",
    circularMinutesColor: "#f18f01",
    circularMinutesColorTrack: "#e8ae5a",
    circularSecondsColor: "#2e4057",
    circularSecondsColorTrack: "#66778c",
    shadowColor: "#0002",
    clockHandsColor: "#2e2c2d",
    secondsHandColor: "#f44336",
    capNutColor: "#2e4057",
    dialColor: "#b7b9a8",
    segmentColor: "#8c8e82",
    numbersColor: "#74756a",
    specialNumbersColor: "#009688"
  },
  {
    background: "#000",
    iconBackground: "#1e1e1e",
    sunColor: "#FFF",
    sunHoveredColor: "#FFC107",
    strDateColor: "#E10014",
    dateColor: "#FFF",
    circularHoursColor: "#E10014",
    circularHoursColorTrack: "#220003",
    circularMinutesColor: "#37dc00",
    circularMinutesColorTrack: "#082100",
    circularSecondsColor: "#00bae1",
    circularSecondsColorTrack: "#001c22",
    shadowColor: "#0002",
    clockHandsColor: "#FFF",
    secondsHandColor: "#ff9800",
    capNutColor: "#100900",
    dialColor: "#212121",
    segmentColor: "#737373",
    numbersColor: "#bbb",
    specialNumbersColor: "#e10014"
  }
];
class CalendarIcon {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;

    this.strDate = null;
    this.date = null;
  }

  isMouseIn() {
    return dist(this.x, this.y, mouseX, mouseY) < this.radius;
  }

  resize(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = colorScheme[colorSchemeIndex].iconBackground;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colorScheme[colorSchemeIndex].strDateColor;
    ctx.font = `${this.radius * 0.5}px Georgia`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.strDate, 0, -this.radius * 0.4);
    ctx.fillStyle = colorScheme[colorSchemeIndex].dateColor;
    ctx.font = `${this.radius}px Georgia`;
    ctx.fillText(this.date, 0, this.radius * 0.3);
    ctx.restore();
  }

  update() {
    this.strDate = date.toString().slice(0, 3).toUpperCase();
    this.date = date.getDate();

    this.draw();
  }
}

class ThemeIcon {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;

    this.sunColor = colorScheme[colorSchemeIndex].sunColor;
  }

  isMouseIn() {
    return dist(this.x, this.y, mouseX, mouseY) < this.radius;
  }

  resize(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = colorScheme[colorSchemeIndex].iconBackground;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.sunColor;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = this.sunColor;
    ctx.lineWidth = this.radius * 0.075;
    ctx.lineCap = "round";
    ctx.beginPath();
    for(let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.moveTo(0, this.radius * 0.35);
      ctx.lineTo(0, this.radius * 0.35 + (i % 2 ? this.radius * 0.2 : this.radius * 0.15));
    }
    ctx.stroke();
    ctx.restore();
  }

  update() {
    this.sunColor = this.isMouseIn()
      ? colorScheme[colorSchemeIndex].sunHoveredColor
      : colorScheme[colorSchemeIndex].sunColor;
    this.draw();
  }
}

class Watch {
  constructor(x, y, n) {
    this.x = x;
    this.y = y;
    this.n = n;

    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;


    let radius = (dist(this.x, this.y, this.x - this.n / 2, this.y - this.n / 2) - this.n / 2) / 2.5;
    this.themeIcon = new ThemeIcon(x - (this.n / 2 - radius), y - (this.n / 2 - radius), radius);
    this.calendarIcon = new CalendarIcon(x + (this.n / 2 - radius), y + (this.n / 2 - radius), radius);
  }

  get n() {
    return this.nValue;
  }

  set n(value) {
    this.nValue = value;
    this.lineWidth = value * 0.05;
    this.hourMarkWidth = value * 0.01;
    this.circularHandWidth = value * 0.08;
    this.gap = value * 0.01;
  }

  resize() {
    this.x = centerX;
    this.y = centerY;
    this.n = Math.max(1, Math.min(width - 50, height - 50));

    let radius = (dist(this.x, this.y, this.x - this.n / 2, this.y - this.n / 2) - this.n / 2) / 2.5;
    this.themeIcon.resize(this.x - (this.n / 2 - radius), this.y - (this.n / 2 - radius), radius);
    this.calendarIcon.resize(this.x + (this.n / 2 - radius), this.y + (this.n / 2 - radius), radius);
  }

  drawHours() {
    ctx.save();
    ctx.strokeStyle = colorScheme[colorSchemeIndex].circularHoursColorTrack;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.n / 2 - this.circularHandWidth * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = colorScheme[colorSchemeIndex].circularHoursColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.n / 2 - this.circularHandWidth * 2,-Math.PI / 2 , -Math.PI / 2 + this.hours);
    ctx.stroke();
    ctx.restore();
  }

  drawMinutes() {
    ctx.save();
    ctx.strokeStyle = colorScheme[colorSchemeIndex].circularMinutesColorTrack;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.n / 2 - this.circularHandWidth * 3 - this.gap, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = colorScheme[colorSchemeIndex].circularMinutesColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.n / 2 - this.circularHandWidth * 3 - this.gap, -Math.PI / 2 , -Math.PI / 2 + this.minutes);
    ctx.stroke();
    ctx.restore();
  }

  drawSeconds() {
    ctx.save();
    ctx.strokeStyle = colorScheme[colorSchemeIndex].circularSecondsColorTrack;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.n / 2 - this.circularHandWidth * 4 - this.gap * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = colorScheme[colorSchemeIndex].circularSecondsColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.n / 2 - this.circularHandWidth * 4 - this.gap * 2, -Math.PI / 2 , -Math.PI / 2 + this.seconds);
    ctx.stroke();
    ctx.restore();
  }

  drawHoursHands() {
    ctx.save();
    ctx.shadowColor = colorScheme[colorSchemeIndex].shadowColor;
    ctx.shadowOffsetX = this.lineWidth / 16;
    ctx.shadowOffsetY = this.lineWidth / 16;
    ctx.shadowBlur = this.lineWidth / 32;
    ctx.fillStyle = colorScheme[colorSchemeIndex].clockHandsColor;
    ctx.strokeStyle = colorScheme[colorSchemeIndex].clockHandsColor;
    ctx.lineCap = "round";
    ctx.lineWidth = this.lineWidth * 3 / 4;
    ctx.translate(centerX, centerY);
    ctx.rotate(-Math.PI + this.hours);

    ctx.beginPath();
    ctx.arc(0, 0, this.lineWidth * 2 / 5, 0, Math.PI * 2);
    ctx.rect(-this.lineWidth / 8, 0, this.lineWidth / 4, this.lineWidth * 3 / 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, this.lineWidth * 3 / 2);
    ctx.lineTo(0, this.n * 2 / 9);
    ctx.stroke();
    ctx.restore();
  }

  drawMinutesHands() {
    ctx.save();
    ctx.shadowColor = colorScheme[colorSchemeIndex].shadowColor;
    ctx.shadowOffsetX = this.lineWidth / 16;
    ctx.shadowOffsetY = this.lineWidth / 16;
    ctx.shadowBlur = this.lineWidth / 32;
    ctx.fillStyle = colorScheme[colorSchemeIndex].clockHandsColor;
    ctx.strokeStyle = colorScheme[colorSchemeIndex].clockHandsColor;
    ctx.lineCap = "round";
    ctx.lineWidth = this.lineWidth * 3 / 4;
    ctx.translate(centerX, centerY);
    ctx.rotate(-Math.PI + this.minutes);

    ctx.beginPath();
    ctx.arc(0, 0, this.lineWidth * 2 / 5, 0, Math.PI * 2);
    ctx.rect(-this.lineWidth / 8, 0, this.lineWidth / 4, this.lineWidth * 3 / 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, this.lineWidth * 3 / 2);
    ctx.lineTo(0, this.n / 2 - this.lineWidth * 3 / 2);
    ctx.stroke();
    ctx.restore();
  }

  drawSecondsHands() {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(-Math.PI + this.seconds);

    ctx.lineCap = "round";
    ctx.lineWidth = this.lineWidth / 8;
    ctx.strokeStyle = colorScheme[colorSchemeIndex].secondsHandColor;
    ctx.beginPath();
    ctx.moveTo(0, -this.n / 12);
    ctx.lineTo(0, (this.n / 2) * 0.98);
    ctx.stroke();

    ctx.fillStyle = colorScheme[colorSchemeIndex].secondsHandColor;
    ctx.beginPath();
    ctx.arc(0, 0, this.lineWidth * 2 / 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colorScheme[colorSchemeIndex].capNutColor;
    ctx.beginPath();
    ctx.arc(0, 0, this.lineWidth * 2 / 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  draw() {

    ctx.strokeStyle = colorScheme[colorSchemeIndex].dialColor;
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.arc(this.x, this.y, (this.n - this.lineWidth) / 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(Math.PI);
    ctx.save();
    for(let i = 0; i < 60; i++) {
      ctx.rotate(Math.PI / 30);
      ctx.fillStyle = colorScheme[colorSchemeIndex].segmentColor;
      ctx.fillRect(-this.hourMarkWidth / 4, this.n / 2 - this.lineWidth + this.lineWidth / 2, this.hourMarkWidth / 2, this.lineWidth / 2);
    }
    ctx.restore();

    for(let i = 0; i < 12; i++) {
      ctx.rotate(Math.PI / 6);
      ctx.fillStyle = colorScheme[colorSchemeIndex].segmentColor;
      ctx.fillRect(-this.hourMarkWidth / 2, this.n / 2 - this.lineWidth, this.hourMarkWidth, this.lineWidth);


      ctx.save();
      ctx.translate(0, this.n / 2 - this.lineWidth * 1.7);
      ctx.rotate(-Math.PI / 6 * (i + 1) + Math.PI);
      if((i + 1) % 3 === 0) {
        ctx.font = `${this.lineWidth * 1}px Georgia`;
        ctx.fillStyle = colorScheme[colorSchemeIndex].specialNumbersColor;
      } else {
        ctx.font = `${this.lineWidth * 0.8}px Georgia`;
        ctx.fillStyle = colorScheme[colorSchemeIndex].numbersColor;
      }

      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText((i + 1), 0, 0);
      ctx.restore();
    }
    ctx.restore();

    ctx.save();
    ctx.lineWidth = this.circularHandWidth;
    ctx.lineCap = "round";

    this.drawHours();
    this.drawMinutes();
    this.drawSeconds();


    this.drawHoursHands();
    this.drawMinutesHands();
    this.drawSecondsHands();
    ctx.restore();
  }

  update() {
    this.seconds = map(date.getSeconds(), 0, 60, 0, Math.PI * 2);
    this.minutes = map(date.getMinutes() + date.getSeconds() / 60, 0, 60, 0, Math.PI * 2);
    this.hours = map(date.getHours() % 12 + date.getMinutes() / 60 + date.getSeconds() / 3600, 0, 12, 0, Math.PI * 2);
    this.themeIcon.update();
    this.calendarIcon.update();
    this.draw();
  }
}

function setTheme(index) {
  colorSchemeIndex = index;
  document.body.dataset.theme = index === 0 ? 'light' : 'dark';
  themeButton.setAttribute('aria-pressed', String(index === 0));
  try { localStorage.setItem('canvas-clock-theme', String(index)); } catch { /* Optional preference. */ }
  draw();
}

function draw() {
  date = new Date();
  const text = date.toLocaleTimeString();
  timeLabel.textContent = text;
  timeLabel.dateTime = date.toISOString();
  canvas.setAttribute('aria-label', `Analog clock showing ${text}`);
  if (!ctx) return;
  ctx.fillStyle = colorScheme[colorSchemeIndex].background;
  ctx.fillRect(0, 0, width, height);
  watch.update();
}

function resize() {
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  centerX = width / 2;
  centerY = height / 2;
  if (ctx) {
    const ratio = Math.min(devicePixelRatio || 1, 3);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    watch.resize();
  }
  draw();
}

function map(value, min, max, newMin, newMax) {
  return (value - min) / (max - min) * (newMax - newMin) + newMin;
}

function dist(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

watch = new Watch(centerX, centerY, Math.max(1, Math.min(width - 50, height - 50)));
try {
  const saved = localStorage.getItem('canvas-clock-theme');
  if (saved === '0' || saved === '1') colorSchemeIndex = Number(saved);
} catch { /* The clock also works when storage is unavailable. */ }
resize();
setTheme(colorSchemeIndex);

themeButton.addEventListener('click', () => setTheme(1 - colorSchemeIndex));
addEventListener('resize', resize);
canvas.addEventListener('pointermove', event => {
  const rect = canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;
  canvas.style.cursor = watch.themeIcon.isMouseIn() ? 'pointer' : 'default';
  draw();
});
canvas.addEventListener('pointerleave', () => { mouseX = -1; mouseY = -1; draw(); });
canvas.addEventListener('pointerdown', event => {
  const rect = canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;
  if (watch.themeIcon.isMouseIn()) setTheme(1 - colorSchemeIndex);
});
let timer;
function schedule() {
  clearInterval(timer);
  if (!document.hidden) { draw(); timer = setInterval(draw, 1000); }
}
document.addEventListener('visibilitychange', schedule);
schedule();
