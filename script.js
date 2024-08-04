const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let { width, height } = canvas.getBoundingClientRect();

const GRAD_STEPS = ["#2274A5", "#F75C03", "#F1C40F", "#D90368", "#00CC66"];
const VERT_SAMPLES = 30;
const GRAD_PROG = 1 / (GRAD_STEPS.length - 1);
const BASE_SIZE = 75;
const BASE_SPEED = 0.7;
const cAMOUNT = 100;
const circles = [];
const mouse = {
  x: width / 2,
  y: height / 2,
};

const lerp = (a, b, t) => {
  return a + (b - a) * t;
};

const movelerp = (a, b, t) => {
  a.x = lerp(a.x, b.x, t);
  a.y = lerp(a.y, b.y, t);
};

const getColorForCoord = (x, y, data) => {
  const red = Math.round(y) * (width * 4) + Math.round(x) * 4;
  return `rgb(${data[red]},${data[red + 1]},${data[red + 2]})`;
};

const initCircles = () => {
  for (let index = 0; index < cAMOUNT; index++) {
    circles[index] = {
      x: width / 2,
      y: height / 2,
      size: 100,
      color: [],
      speed: BASE_SPEED,
    };
  }
};

const getSamples = () => {
  const grad = ctx.createLinearGradient(0, 0, width, 0);
  for (let index = 0; index < GRAD_STEPS.length; index++) {
    grad.addColorStop(GRAD_PROG * index, GRAD_STEPS[index]);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const grad2 = ctx.createLinearGradient(0, 0, 0, height);
  grad2.addColorStop(0, "rgba(255,255,255,0)");
  grad2.addColorStop(1, "rgba(207,252,255,0.6)");
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);

  for (let x = 0; x < cAMOUNT; x++) {
    for (let y = 0; y < VERT_SAMPLES; y++) {
      circles[x].color[y] = getColorForCoord(
        Math.floor((width / cAMOUNT) * x),
        Math.floor((height / VERT_SAMPLES) * y),
        data
      );
    }
  }
};

const init = () => {
  canvas.width = width;
  canvas.height = height;
  canvas.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });
  canvas.addEventListener("click", split);
  initCircles();
  getSamples();
  console.log(circles);
  window.requestAnimationFrame(draw);
};

const split = () => {
  for (let index = 0; index < circles.length; index++) {
    const element = circles[index];
    element.x = Math.floor(Math.random() * width);
    element.y = Math.floor(Math.random() * height);
    element.speed = 0.0;
  }
};

const renderCircle = (circle, index) => {
  const vert_color_index = Math.floor(
    ((circle.size - BASE_SIZE) / BASE_SIZE) * VERT_SAMPLES
  );

  ctx.fillStyle = circle.color[vert_color_index];
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.size, 0, 2 * Math.PI);
  ctx.fill();
};

const drawCircles = (delta) => {
  for (let index = 0; index < circles.length; index++) {
    const element = circles[index];
    // pointer circle
    if (index === circles.length - 1) {
      const mod = Math.pow(0.5 + 0.5 * Math.sin(delta * 0.0014), 13) + 1;
      element.size = mod * BASE_SIZE;
      movelerp(element, mouse, 0.1);
    } else {
      const target = circles[index + 1];
      if (target.size !== BASE_SIZE) {
        element.size = lerp(element.size, target.size, 0.5);
      }
      if (element.speed !== BASE_SPEED) {
        element.speed = lerp(element.speed, BASE_SPEED, 0.007);
      }
      movelerp(element, target, element.speed);
    }
    renderCircle(element, index);
  }
};

const draw = (delta) => {
  ctx.fillStyle = "#FED99B";
  ctx.fillRect(0, 0, width, height);
  drawCircles(delta);
  window.requestAnimationFrame(draw);
};

init();
