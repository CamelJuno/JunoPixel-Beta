
const NULL_VIEW_POINT = Object.freeze({
  x: 0,
  y: 0,
  untransformedX: 0,
  untransformedY: 0,
});

const NULL_BOUNDS = Object.freeze({
  canvasWidth: 0,
  canvasHeight: 0,
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  viewMin: NULL_VIEW_POINT,
  viewMax: NULL_VIEW_POINT,
});

export const IDENTITY = Object.freeze({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });

function valueOrDefault(value, defaultValue) {
  if (value === null || typeof value === "undefined") {
    return defaultValue;
  } else {
    return value;
  }
}

export default class CoordinateSystem {
  constructor({ scaleExtents, documentSize }) {
    this._scaleExtents = scaleExtents;
    this._documentSize = documentSize;
  }

  _scaleExtents;
  _documentSize;
  _canvas = null;
  _view = { scale: 1.0, x: 0, y: 0 };
  _viewChangeListeners = new Set();
  
  get canvas() {
    return this._canvas;
  }
  
  set canvas(canvas) {
    this._canvas = canvas;
    this.setView();
  }
  
  get scale() {
    return this._view.scale;
  }
  setScale = (scale) => {
    this.setView({ scale });
  };
  
  get x() {
    return this._view.x;
  }
  
  set x(x) {
    this.setView({ x });
  }
  
  get y() {
    return this._view.y;
  }
  
  set y(y) {
    this.setView({ y });
  }
  
  get view() {
    return { ...this._view };
  }

  get scaleExtents() {
    return { ...this._scaleExtents };
  }

  set scaleExtents({ min, max }) {
    this._scaleExtents = { min, max };
    this.setView();
  }

  get documentSize() {
    return { ...this._documentSize };
  }

  set documentSize({ width, height }) {
    this._documentSize = { width, height };
    this.setView();
  }

  get transformMatrix() {
    return {
      a: this._view.scale, // horizontal scaling
      b: 0, // vertical skewing
      c: 0, // horizontal skewing
      d: this._view.scale, // vertical scaling
      e: this._view.x,
      f: this._view.y,
    };
  }

  get canvasBounds() {
    if (this._canvas) {
      const { left, top, right, bottom } = this._canvas.getBoundingClientRect();
      return {
        viewMin: this.clientPointToViewPoint({ clientX: left, clientY: top }),
        viewMax: this.clientPointToViewPoint({
          clientX: right,
          clientY: bottom,
        }),
        left,
        top,
        right,
        bottom,
        canvasWidth: this._canvas.width,
        canvasHeight: this._canvas.height,
      };
    } else {
      return undefined;
    }
  }

  get canvasRect() {
    if (this.canvas) {
      return this.canvas.getBoundingClientRect();
    } else {
      return undefined;
    }
  }

  clampView = ({ scale, x, y }) => {
    const { min, max } = this.scaleExtents;
    const { width, height } = this.documentSize;
    const { left, top, right, bottom } = this.canvasRect || NULL_BOUNDS;

    const canvasWidth = right - left;
    const canvasHeight = bottom - top;

    const maxx = canvasWidth / 2;
    const minx = -(width * this._view.scale - canvasWidth / 2);
    const maxy = canvasHeight / 2;
    const miny = -(height * this._view.scale - canvasHeight / 2);
    return {
      scale: Math.min(Math.max(scale, min), max),
      x: Math.min(Math.max(x, minx), maxx),
      y: Math.min(Math.max(y, miny), maxy),
    };
  };

  resetView = () => {
    this.setView({ scale: 1.0, x: 0, y: 0 });
  };

  setView = (view) => {
    const newView = this.clampView({ ...this._view, ...(view || {}) });
    const { scale, x, y } = this._view;

    if (newView.scale !== scale || newView.x !== x || newView.y !== y) {
      this._view = newView;
      this._viewChangeListeners.forEach(
        (listener) => listener && listener(newView)
      );
    }

    return { ...this._view };
  };

  scaleAtClientPoint = (deltaScale, clientPoint) => {
    const viewPt = this.clientPointToViewPoint(clientPoint);
    const newView = this.clampView({
      ...this._view,
      scale: this._view.scale + deltaScale,
    });
    const clientPtPostScale = this.viewPointToClientPoint(viewPt, newView);

    newView.x =
      this._view.x - (clientPtPostScale.clientX - clientPoint.clientX);
    newView.y =
      this._view.y - (clientPtPostScale.clientY - clientPoint.clientY);

    return this.setView(newView);
  };

  clientPointToViewPoint = ({ clientX, clientY }, view = this._view) => {
    const { left, top } = this.canvasRect || NULL_BOUNDS;
    const relativeClientX = clientX - left;
    const relativeClientY = clientY - top;

    return {
      x: (relativeClientX - view.x) / view.scale,
      y: (relativeClientY - view.y) / view.scale,
      relativeClientX,
      relativeClientY,
    };
  };

  viewPointToClientPoint = ({ x, y }, view = this._view) => {
    const { left, top } = this.canvasRect || NULL_BOUNDS;
    const relativeX = x * view.scale + view.x;
    const relativeY = y * view.scale + view.y;
    const clientX = relativeX + left;
    const clientY = relativeY + top;

    return { clientX, clientY, relativeX, relativeY, x: clientX, y: clientY };
  };

  attachViewChangeListener = (listener) => {
    this._viewChangeListeners.add(listener);
  };
}
