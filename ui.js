const uploadInput = document.getElementById('upload');
const procImg = document.getElementById('proc-image');
const resultImg = document.getElementById('result-image');
const procImgCtx = procImg.getContext('2d');

const toolButtons = document.querySelectorAll('.tool-btn');
const subContent = document.getElementById('subContent');
const pipelineContainer = document.getElementById('pipelineContainer');
const parameterPanel = document.getElementById('parameterPanel');

let effectRegistry = {};
let pipeline = [];

// 画像読み込み処理
uploadInput.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) {
    console.log("can't load image.");
    return;
  }

  const url = URL.createObjectURL(file);
  const img = new Image();

  img.onload = () => {
    procImg.width = img.width;
    procImg.height = img.height;
    procImgCtx.clearRect(0, 0, procImg.width, procImg.height);
    procImgCtx.drawImage(img, 0, 0, img.width, img.height);
    resultImg.src = procImg.toDataURL('image/png');
    URL.revokeObjectURL(url);
  };

  img.onerror = () => {
    URL.revokeObjectURL(url);
    console.error('Failed to load image.');
  };

  img.src = url;
});

export function setPluginRegistry(registry) {
  effectRegistry = registry || {};
}

function renderPipelineUI() {
  if (!pipeline.length) {
    pipelineContainer.innerHTML = '';
    return;
  }

  pipelineContainer.innerHTML = pipeline.map((item, index) => {
    const arrow = index < pipeline.length - 1 ? '<span class="pipeline-arrow">→</span>' : '';
    return `<span class="pipeline-step" data-pipeline-index="${index}">${item.label}</span>${arrow}`;
  }).join('');
}

function renderParameterUI() {
  if (!pipeline.length) {
    parameterPanel.innerHTML = '';
    return;
  }

  parameterPanel.innerHTML = pipeline.map((item, index) => {
    const controls = item.effect.controls || [];
    const controlMarkup = controls.map(control => {
      return `
        <div class="parameter-item">
          <label>${control.label}</label>
          <input type="range" data-index="${index}" data-control-key="${control.key}" min="${control.min}" max="${control.max}" step="${control.step}" value="${item.params[control.key] ?? control.default}">
        </div>
      `;
    }).join('');

    return `
      <div class="pipeline-parameter-group">
        <div class="pipeline-step">${item.label}</div>
        ${controlMarkup}
      </div>
    `;
  }).join('');
}

function renderStaticToolUI(toolName) {
  const uiMap = {
    adjust: `
      <button class="sub-option-btn active">明るさ</button>
      <button class="sub-option-btn">コントラスト</button>
      <button class="sub-option-btn">彩度</button>
    `,
    crop: `
      <button class="sub-option-btn active">フリー</button>
      <button class="sub-option-btn">1 : 1</button>
      <button class="sub-option-btn">4 : 3</button>
      <button class="sub-option-btn">16 : 9</button>
    `,
    stamp: `
      <button class="sub-option-btn">😊</button>
      <button class="sub-option-btn">❤️</button>
      <button class="sub-option-btn">★</button>
    `,
    rotate: `
      <button class="sub-option-btn">左90°</button>
      <button class="sub-option-btn">右90°</button>
      <button class="sub-option-btn">左右反転</button>
    `
  };

  return uiMap[toolName] || '';
}

function renderEffectButtons() {
  const effects = Object.values(effectRegistry || {});

  if (!effects.length) {
    subContent.innerHTML = '';
    return;
  }

  subContent.innerHTML = effects.map(effect => {
    return `<button class="sub-option-btn" data-effect-id="${effect.id}">${effect.label}</button>`;
  }).join('');
}

export function renderPluginEffects(registry) {
  setPluginRegistry(registry);
  renderEffectButtons();
}

async function applySelectedEffect(effectId) {
  const effect = effectRegistry[effectId];
  if (!effect || typeof effect.render !== 'function') {
    return;
  }

  try {
    await window.cvReady;
  } catch (error) {
    console.warn('OpenCV is not available, effect cannot be applied.', error);
    return;
  }

  const defaultParams = {};
  for (const control of effect.controls || []) {
    defaultParams[control.key] = control.default ?? 0;
  }

  const pipelineItem = {
    id: effect.id,
    label: effect.label,
    effect,
    params: { ...defaultParams }
  };

  pipeline.push(pipelineItem);

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = procImg.width;
  outputCanvas.height = procImg.height;

  const renderedCanvas = effect.render(procImg, outputCanvas, pipelineItem.params);
  if (renderedCanvas instanceof HTMLCanvasElement) {
    procImg.width = renderedCanvas.width;
    procImg.height = renderedCanvas.height;
    procImgCtx.clearRect(0, 0, procImg.width, procImg.height);
    procImgCtx.drawImage(renderedCanvas, 0, 0);
    resultImg.src = renderedCanvas.toDataURL('image/png');
  }

  renderPipelineUI();
  renderParameterUI();
}

// 各ツールが選択された際のサブ UI 定義 (.sub-option-btn クラスを適用)
const toolUI = {
  adjust: `
    <button class="sub-option-btn active">明るさ</button>
    <button class="sub-option-btn">コントラスト</button>
    <button class="sub-option-btn">彩度</button>
  `,
  crop: `
    <button class="sub-option-btn active">フリー</button>
    <button class="sub-option-btn">1 : 1</button>
    <button class="sub-option-btn">4 : 3</button>
    <button class="sub-option-btn">16 : 9</button>
  `,
  stamp: `
    <button class="sub-option-btn">😊</button>
    <button class="sub-option-btn">❤️</button>
    <button class="sub-option-btn">★</button>
  `,
  rotate: `
    <button class="sub-option-btn">左90°</button>
    <button class="sub-option-btn">右90°</button>
    <button class="sub-option-btn">左右反転</button>
  `
};

function renderToolUI(toolName) {
  if (toolName === 'effect') {
    renderEffectButtons();
    return;
  }

  subContent.innerHTML = toolUI[toolName] || renderStaticToolUI(toolName);
  subContent.scrollLeft = 0;
}

// メインツールバーのタップ切替処理
toolButtons.forEach(button => {
  button.addEventListener('click', () => {
    toolButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    button.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });

    const toolName = button.getAttribute('data-tool');
    renderToolUI(toolName);
  });
});

// サブツール選択肢のクリック処理（イベント委譲）
subContent.addEventListener('click', (event) => {
  const btnElement = event.target.closest('.sub-option-btn');
  if (!btnElement) {
    return;
  }

  const siblings = btnElement.parentElement.querySelectorAll('.sub-option-btn');
  siblings.forEach(btn => btn.classList.remove('active'));
  btnElement.classList.add('active');

  const effectId = btnElement.dataset.effectId;
  if (effectId) {
    applySelectedEffect(effectId);
  }

  console.log(`SubOption selected: ${btnElement.textContent.trim()}`);
});

parameterPanel.addEventListener('input', (event) => {
  const slider = event.target;
  if (!(slider instanceof HTMLInputElement) || !slider.dataset.index || !slider.dataset.controlKey) {
    return;
  }

  const index = Number(slider.dataset.index);
  const key = slider.dataset.controlKey;
  const item = pipeline[index];
  if (!item) {
    return;
  }

  item.params[key] = Number(slider.value);

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = procImg.width;
  outputCanvas.height = procImg.height;

  const renderedCanvas = item.effect.render(procImg, outputCanvas, item.params);
  if (renderedCanvas instanceof HTMLCanvasElement) {
    procImg.width = renderedCanvas.width;
    procImg.height = renderedCanvas.height;
    procImgCtx.clearRect(0, 0, procImg.width, procImg.height);
    procImgCtx.drawImage(renderedCanvas, 0, 0);
    resultImg.src = renderedCanvas.toDataURL('image/png');
  }
});

// 初期化時は空表示にして、プラグイン読み込み完了後に一覧を描画する
subContent.innerHTML = '';
pipelineContainer.innerHTML = '';
parameterPanel.innerHTML = '';