const DEFAULT_STYLE_CONFIGS = {
  boxSize: 3,
  gap: 2,
}
const COLOR_SCHEME = {
  green: {
    600: '#217c02',
    400: '#30ab32',
    200: '#2F770560',
  },
  red: {
    600: '#a70000',
    400: '#ee3232',
    200: '#A7000060',
  },
  gray: {
    600: '#454343',
    400: '#adadad',
    200: '#00000052'
  }
}

function Grid({ matrix: { x, y }, css, patternLength, mountRoot }) {
  this.styleConfigs = css;
  this.patternLength = patternLength ? patternLength > x * y ? x * y : patternLength : x * y;
  this.x = x;
  this.y = y;
  this.mountRootNode = mountRoot;
  this.matrixEl = null;
  this.linesEl = null;
  this.rows = [];
  this.currentLine = null;
  const _coords = [];
  this.subcriber = null;
  this.coords = new Proxy(_coords, {
    deleteProperty: function (target, property) {
      delete target[property];
      return true;
    },
    set: (target, property, value, receiver) => {
      target[property] = value;
      this.drawActivePoints();
      this.subcriber?.([...target]);
      return true;
    }
  });
  this.isOvering = false;
}

Grid.prototype = {
  init() {
    this.constructHTML();
    this.resetState();
    this.setCssVars();
    this.draw();
    this.rows = Array.from(this.matrixEl.querySelectorAll('.row'));
    this.matrixEl.onmousemove = this.matrixMoves.bind(this);
    this.matrixEl.onmouseup = this.closeOvering.bind(this);

    // Add touch event listeners for mobile devices
    this.matrixEl.addEventListener('touchmove', this.matrixMoves.bind(this), { passive: false });
    this.matrixEl.addEventListener('touchend', this.closeOvering.bind(this), { passive: false });
  },

  constructHTML() {
    const mainContainer = document.createElement('DIV');
    mainContainer.innerHTML = `
        <div class="matrix">
        </div>
        <div class="line-wrapper">
            <svg width="100%" height="100%" id="lines">
            </svg>
        </div>
    `;
    mainContainer.classList.add('main-container');
    this.mountRootNode.appendChild(mainContainer);

    this.matrixEl = document.querySelector('.matrix');
    this.linesEl = document.querySelector('#lines');
  },

  setCssVars() {
    this.setHtmlFontSize(this.styleConfigs.vertex.size);
    document.documentElement.style.setProperty('--box-size', (this.styleConfigs.boxSize ?? DEFAULT_STYLE_CONFIGS.boxSize) + 'rem');
    document.documentElement.style.setProperty('--gaps', (this.styleConfigs.gap ?? DEFAULT_STYLE_CONFIGS.gap) + 'rem');

    if (!COLOR_SCHEME[this.styleConfigs.vertex.colorSchema]) {
      console.error('Not Supported colorScheme. Please choose one of these:', Object.keys(COLOR_SCHEME));
    } else {
      this.detectWrongPattern(false);
    }
  },

  subscribe(cb) {
    this.subcriber = cb;
  },

  setHtmlFontSize(size) {
    switch (size) {
      case 'sm':
        document.documentElement.style.fontSize = '10px';
        return;
      case 'md':
        document.documentElement.style.fontSize = '16px';
        return;
      default:
        document.documentElement.style.fontSize = '20px';
    }
  },

  draw() {
    this.matrixEl.innerHTML = '';
    const matrixFragment = document.createDocumentFragment();
    for (let i = 0; i < this.x; i++) {
      const colsFragment = document.createDocumentFragment();
      const row = document.createElement('DIV');
      row.classList.add('row');

      for (let j = 0; j < this.y; j++) {
        const vertex = this.createVertex(i, j);
        vertex.onmousedown = this.onStartPoint.bind(this, { x: i, y: j });

        vertex.addEventListener('touchstart', this.onStartPoint.bind(this, { x: i, y: j }), { passive: false });
        colsFragment.appendChild(vertex);
      }

      row.appendChild(colsFragment);
      matrixFragment.appendChild(row);
    }
    this.matrixEl.appendChild(matrixFragment);
  },

  matrixMoves(evt) {
    if (this.isOvering) {
      evt.preventDefault(); // Prevent scrolling on touch devices

      const { x, y } = this.matrixEl.getBoundingClientRect();
      const pageX = evt.touches ? evt.touches[0].pageX : evt.pageX;
      const pageY = evt.touches ? evt.touches[0].pageY : evt.pageY;
      this.setPositionToTheLine({ x: pageX - x, y: pageY - y });

      const elementUnderTouch = document.elementFromPoint(pageX, pageY);
      if (elementUnderTouch && elementUnderTouch.classList.contains('vertex-wrapper')) {
        const [x, y] = elementUnderTouch.getAttribute('data-point').split('-').map(e => Number(e));
        if (!this.pointIsTaken(x, y)) {
          const lastCoords = this.coords[this.coords.length - 1];
          const gaps = this.getGaps(lastCoords, { x, y });
          gaps.forEach(gap => {
            this.coords[this.coords.length] = gap;
          });
          this.coords[this.coords.length] = { x, y };
        }
      }
    }
  },

  pointIsTaken(x, y) {
    return this.coords.find(e => e.x === x && e.y === y)
  },

  drawActivePoints() {
    if (this.coords.length) {
      this.coords.forEach(({ x, y }) => {
        const colsElements = this.rows[x].querySelectorAll('.vertex-wrapper');
        if (colsElements[y]) {
          colsElements[y].classList.add('vertex--taken')
        }
      });
    } else {
      const takenVertexes = Array.from(this.matrixEl.querySelectorAll(('.vertex--taken')));
      takenVertexes.forEach(el => {
        el.classList.remove('vertex--taken');
      });
    }
    this.drawLine();
  },

  getGaps(start, end) {
    const gaps = [];

    const inSameDiagonal = Math.abs(start.x - end.x) === Math.abs(start.y - end.y);
    const inSameHorizontal = start.x === end.x && start.y !== end.y;
    const inSameVertical = start.y === end.y && start.x !== end.x;

    if (inSameDiagonal) {
      const xStep = start.x > end.x ? -1 : 1;
      const yStep = start.y > end.y ? -1 : 1;

      let x = start.x + xStep;
      let y = start.y + yStep;

      while (x !== end.x && y !== end.y) {
        gaps.push({ x: x, y: y });
        x += xStep;
        y += yStep;
      }
    } else if (inSameHorizontal) {
      const yStep = start.y > end.y ? -1 : 1;

      let y = start.y + yStep;

      while (y !== end.y) {
        gaps.push({ x: start.x, y: y });
        y += yStep;
      }
    } else if (inSameVertical) {
      const xStep = start.x > end.x ? -1 : 1;

      let x = start.x + xStep;

      while (x !== end.x) {
        gaps.push({ x: x, y: start.y });
        x += xStep;
      }
    }

    return gaps;
  },

  setPositionToTheLine({ x, y }) {
    this.currentLine.setAttribute('x2', x);
    this.currentLine.setAttribute('y2', y);
  },

  closeOvering() {
    if (this.currentLine) {
      this.currentLine.remove();
    }

    this.currentLine = null;
    if (this.patternLength !== this.coords.length && this.isOvering) {
      this.isOvering = false;
      this.detectWrongPattern(true);
      this.subcriber?.([...this.coords], true);
    } else {
      this.isOvering = false;
    }
  },

  findElementViaCoords({ x, y }) {
    const colsElements = this.rows[x].querySelectorAll('.vertex-wrapper');

    return colsElements[y];
  },

  drawLine() {
    const last = this.coords[this.coords.length - 1];
    if (last) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const appropriateVertex = this.findElementViaCoords(last);
      const { width, height } = appropriateVertex.getBoundingClientRect();

      if (this.currentLine) {
        const rectWrapper = this.matrixEl.getBoundingClientRect();
        const rectVertex = appropriateVertex.getBoundingClientRect();
        this.setPositionToTheLine({
          x: (rectVertex.x - rectWrapper.x) + rectVertex.width / 2,
          y: (rectVertex.y - rectWrapper.y) + rectVertex.height / 2
        });
      }

      const lineX = appropriateVertex.offsetLeft + (width / 2);
      const lineY = appropriateVertex.offsetTop + (height / 2);
      line.style.strokeWidth = '.3rem';
      line.setAttribute('x1', lineX);
      line.setAttribute('y1', lineY);
      line.setAttribute('x2', lineX);
      line.setAttribute('y2', lineY);
      line.setAttribute('id', `${last.x}-${last.y}`);
      this.currentLine = line;
      this.linesEl.appendChild(line);
    }
  },

  resetState() {
    this.detectWrongPattern(false);
    this.resetPrevDraws();
  },

  resetPrevDraws() {
    this.coords.splice(0, this.coords.length);
    this.linesEl.querySelectorAll('line').forEach(el => el.remove());
  },

  detectWrongPattern(isWrong) {
    document.documentElement.style.setProperty('--vertex-line', COLOR_SCHEME[isWrong ? 'red' : this.styleConfigs.vertex.colorSchema]['400']);
    document.documentElement.style.setProperty('--vertex-point', COLOR_SCHEME[isWrong ? 'red' : this.styleConfigs.vertex.colorSchema]['600']);
    document.documentElement.style.setProperty('--vertex-around-layer', COLOR_SCHEME[isWrong ? 'red' : this.styleConfigs.vertex.colorSchema]['200']);
  },

  onStartPoint({ x, y }) {
    this.isOvering = true;
    this.resetState();
    this.coords[this.coords.length] = { x, y };
  },

  createVertex(x, y) {
    const wrapper = document.createElement('DIV');
    wrapper.classList.add('vertex-wrapper');
    wrapper.setAttribute('data-point', `${x}-${y}`);
    const dot = document.createElement('span');
    dot.classList.add('vertex');
    wrapper.appendChild(dot);

    return wrapper;
  }
}

export default Grid;