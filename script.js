window.onload = function() {
  let canvas = document.getElementById('canvas');
  let ctx = canvas.getContext('2d');

  let tiles = [];
  let layers = [];

  const WIDTH = 40;
  const RADIUS = 50;
  const H = RADIUS * Math.sqrt(3);
  const h = H / 2;

  const x_c = window.innerWidth / 2;
  const y_c = window.innerHeight / 2;

  let addition = 1;

  let state = 'in';

  const my_gradient = ctx.createLinearGradient(
    20,
    20,
    window.innerWidth,
    window.innerHeight
  );
  my_gradient.addColorStop(0, '#84127a');
  my_gradient.addColorStop(1, '#76fdfd');

  function draw_squares() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    let shouldAdd = false;
    for (let i = 0; i < tiles.length; i++) {
      ctx.save();
      ctx.fillStyle = my_gradient;
      let t = tiles[i];

      if (t.s < 2 * WIDTH) {
        t.a += 0.2;
        t.s = t.s + t.a * 0.5;
        if (t.s >= 2 * WIDTH) {
          t.s = 2 * WIDTH;
        }

        if (t.s < WIDTH) {
          if (!t.c) {
            t.c = true;
            shouldAdd = true;
          }
          ctx.beginPath();
          ctx.moveTo(t.x, t.y);
          ctx.lineTo(t.x + 0, t.y + t.s);
          ctx.lineTo(t.x + t.s, t.y + 0);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(t.x, t.y);
          ctx.lineTo(t.x + 0, t.y + WIDTH);
          ctx.lineTo(t.x + t.s - WIDTH, t.y + WIDTH);
          ctx.lineTo(t.x + WIDTH, t.y + t.s - WIDTH);
          ctx.lineTo(t.x + WIDTH, t.y + 0);
          ctx.fill();
        }
      } else {
        ctx.fillRect(t.x, t.y, WIDTH, WIDTH);
      }

      ctx.restore();
    }
    if (shouldAdd) {
      addition++;
      for (let i = 0; i < addition; i++) {
        if (
          WIDTH * (addition - 1 - i) < window.innerWidth &&
          WIDTH * i < window.innerHeight
        ) {
          tiles.push({
            x: WIDTH * (addition - 1 - i),
            y: WIDTH * i,
            s: 0,
            a: 1,
            c: false
          });
        }
      }
    }

    window.requestAnimationFrame(draw_squares);
  }

  function draw_hexagons() {
    if (state == 'out') {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    let changed = false;
    if (state == 'out') drawHole(layers.length - 1);
    for (let no = 0; no < layers.length; no++) {
      const t = layers[no];

      if (t.r < RADIUS) {
        t.r = t.r * 1.02 + 4.5;
        if (t.r > RADIUS * 0.4 && no == layers.length - 1 && no < 20) {
          insertLayer(no + 1);
        }
        if (t.r >= RADIUS) {
          t.r = RADIUS;
        }
        changed = true;
      }

      for (let i = 0; i < t.h.length; i++) {
        ctx.save();

        const c_h = (t.r * Math.sqrt(3)) / 2;
        if (state == 'in') {
          ctx.beginPath();
          ctx.moveTo(t.h[i].x + t.r / 2, t.h[i].y - c_h);
          ctx.lineTo(t.h[i].x + t.r, t.h[i].y);
          ctx.lineTo(t.h[i].x + t.r / 2, t.h[i].y + c_h);
          ctx.lineTo(t.h[i].x - t.r / 2, t.h[i].y + c_h);
          ctx.lineTo(t.h[i].x - t.r, t.h[i].y);
          ctx.lineTo(t.h[i].x - t.r / 2, t.h[i].y - c_h);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(t.h[i].x + RADIUS / 2, t.h[i].y - h);
          ctx.lineTo(t.h[i].x + RADIUS, t.h[i].y);
          ctx.lineTo(t.h[i].x + RADIUS / 2, t.h[i].y + h);
          ctx.lineTo(t.h[i].x - RADIUS / 2, t.h[i].y + h);
          ctx.lineTo(t.h[i].x - RADIUS, t.h[i].y);
          ctx.lineTo(t.h[i].x - RADIUS / 2, t.h[i].y - h);
          ctx.closePath();

          ctx.moveTo(t.h[i].x - t.r / 2, t.h[i].y - c_h);
          ctx.lineTo(t.h[i].x - t.r, t.h[i].y);
          ctx.lineTo(t.h[i].x - t.r / 2, t.h[i].y + c_h);
          ctx.lineTo(t.h[i].x + t.r / 2, t.h[i].y + c_h);
          ctx.lineTo(t.h[i].x + t.r, t.h[i].y);
          ctx.lineTo(t.h[i].x + t.r / 2, t.h[i].y - c_h);
          ctx.closePath();

          ctx.fill();
        }

        ctx.restore();
      }
    }
    if (!changed) {
      if (state == 'in') {
        state = 'out';
      } else {
        state = 'in';
      }
      layers = [
        {
          r: 0,
          a: 1,
          h: [
            {
              x: window.innerWidth / 2,
              y: window.innerHeight / 2
            }
          ]
        }
      ];
    }
    window.requestAnimationFrame(draw_hexagons);
  }

  function insertLayer(no) {
    if (no < 1) return;
    let layer = { r: 0, a: 1, h: [] };
    for (let i = 0; i < no; i++) {
      layer.h.push({
        x: x_c + i * 1.5 * RADIUS,
        y: y_c - no * H + i * h
      });
    }
    for (let i = 0; i < no; i++) {
      layer.h.push({
        x: x_c + no * 1.5 * RADIUS,
        y: y_c - no * h + i * H
      });
    }
    for (let i = 0; i < no; i++) {
      layer.h.push({
        x: x_c + no * 1.5 * RADIUS - i * 1.5 * RADIUS,
        y: y_c + no * h + i * h
      });
    }
    for (let i = 0; i < no; i++) {
      layer.h.push({
        x: x_c - i * 1.5 * RADIUS,
        y: y_c + no * H - i * h
      });
    }
    for (let i = 0; i < no; i++) {
      layer.h.push({
        x: x_c - no * 1.5 * RADIUS,
        y: y_c + no * h - i * H
      });
    }
    for (let i = 0; i < no; i++) {
      layer.h.push({
        x: x_c - no * 1.5 * RADIUS + i * 1.5 * RADIUS,
        y: y_c - no * h - i * h
      });
    }
    layers.push(layer);
  }

  function draw() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    // ctx.fillStyle = my_gradient;

    // tiles.push({
    //   x: 0,
    //   y: 0,
    //   s: 0,
    //   a: 1,
    //   c: false
    // });
    // window.requestAnimationFrame(draw_squares);

    layers.push({
      r: 0,
      a: 1,
      h: [
        {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        }
      ]
    });
    window.requestAnimationFrame(draw_hexagons);
  }

  draw();

  function drawHole(layer) {
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;

    ctx.save();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(window.innerWidth, 0);
    ctx.lineTo(window.innerWidth, window.innerHeight);
    ctx.lineTo(0, window.innerHeight);
    ctx.closePath();

    let t = {};
    // 1
    t.x = x + RADIUS / 2;
    t.y = y - h - layer * H;
    ctx.moveTo(t.x, t.y);
    for (let i = 0; i < layer; i++) {
      t.x -= RADIUS;
      ctx.lineTo(t.x, t.y);
      t.x -= RADIUS / 2;
      t.y += h;
      ctx.lineTo(t.x, t.y);
    }
    // 2
    t.x = x - RADIUS / 2 - layer * RADIUS * 1.5;
    t.y = y - h - layer * h;
    ctx.lineTo(t.x, t.y);
    for (let i = 0; i < layer; i++) {
      t.x -= RADIUS / 2;
      t.y += h;
      ctx.lineTo(t.x, t.y);
      t.x += RADIUS / 2;
      t.y += h;
      ctx.lineTo(t.x, t.y);
    }
    // 3
    t.x = x - RADIUS - layer * 1.5 * RADIUS;
    t.y = y + layer * h;
    ctx.lineTo(t.x, t.y);
    for (let i = 0; i < layer; i++) {
      t.x += RADIUS / 2;
      t.y += h;
      ctx.lineTo(t.x, t.y);
      t.x += RADIUS;
      ctx.lineTo(t.x, t.y);
    }
    // 4
    t.x = x - RADIUS / 2;
    t.y = y + h + layer * H;
    ctx.lineTo(t.x, t.y);
    for (let i = 0; i < layer; i++) {
      t.x += RADIUS;
      ctx.lineTo(t.x, t.y);
      t.x += RADIUS / 2;
      t.y -= h;
      ctx.lineTo(t.x, t.y);
    }
    // 5
    t.x = x + RADIUS / 2 + layer * RADIUS * 1.5;
    t.y = y + h + layer * h;
    ctx.lineTo(t.x, t.y);
    for (let i = 0; i < layer; i++) {
      t.x += RADIUS / 2;
      t.y -= h;
      ctx.lineTo(t.x, t.y);
      t.x -= RADIUS / 2;
      t.y -= h;
      ctx.lineTo(t.x, t.y);
    }
    // 6
    t.x = x + RADIUS + layer * 1.5 * RADIUS;
    t.y = y - layer * h;
    ctx.lineTo(t.x, t.y);
    for (let i = 0; i < layer; i++) {
      t.x -= RADIUS / 2;
      t.y -= h;
      ctx.lineTo(t.x, t.y);
      t.x -= RADIUS;
      ctx.lineTo(t.x, t.y);
    }

    ctx.closePath();

    ctx.fill();
    ctx.restore();
  }
};
