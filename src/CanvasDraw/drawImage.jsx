export default function drawImageProp({ctx, img, x, y, w, h, offsetX, offsetY} = {}) {
  if (typeof x !== "number") x = 0;
  if (typeof y !== "number") y = 0;
  if (typeof w !== "number") w = ctx.canvas.width;
  if (typeof h !== "number") h = ctx.canvas.height;
  if (typeof offsetX !== "number") offsetX = 0.5;
  if (typeof offsetY !== "number") offsetY = 0.5;
  if (offsetX < 0) offsetX = 0;
  if (offsetY < 0) offsetY = 0;
  if (offsetX > 1) offsetX = 1;
  if (offsetY > 1) offsetY = 1;

  var iw = img.width,
    ih = img.height,
    r = Math.min(w / iw, h / ih),
    nw = iw * r,
    nh = ih * r,
    cx,
    cy,
    cw,
    ch,
    ar = 1;

  if (nw < w) ar = w / nw;
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
  nw *= ar;
  nh *= ar;
  cw = iw / (nw / w);
  ch = ih / (nh / h);
  cx = (iw - cw) * offsetX;
  cy = (ih - ch) * offsetY;
  if (cx < 0) cx = 0;
  if (cy < 0) cy = 0;
  if (cw > iw) cw = iw;
  if (ch > ih) ch = ih;

  // Backend goes heree
  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}
