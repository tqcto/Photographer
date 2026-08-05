import * as core from './core.js';

const uploadInput = document.getElementById('upload');
const procImg = document.getElementById('proc-image');
const resultImg = document.getElementById('result-image');
const procImgCtx = procImg.getContext('2d');

const toolButtons = document.querySelectorAll('.tool-btn');
const subContent = document.getElementById('subContent');
const pipelineContainer = document.getElementById('pipelineContainer');
const parameterPanel = document.getElementById('parameterPanel');
const bottomControls = document.querySelector('.bottom-controls');
const viewerStage = document.getElementById('viewerStage');
const saveButton = document.getElementById('saveButton');
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

let selectedPipelineIndex = -1;
let previewScale = 1;
let viewerScale = 1;
let pinchStartDistance = null;
let pinchStartScale = 1;

function setControlsVisible(visible) {
  if (bottomControls) {
    bottomControls.classList.toggle('is-hidden', !visible);
  }

  if (pipelineContainer) {
    pipelineContainer.classList.toggle('is-hidden', !visible);
  }

  if (parameterPanel) {
    parameterPanel.classList.toggle('is-hidden', !visible);
  }
}

function cloneCanvas(source) {
  const clone = document.createElement('canvas');
  clone.width = source.width;
  clone.height = source.height;
  clone.getContext('2d').drawImage(source, 0, 0);
  return clone;
}

function renderPipelineToCanvas(inputCanvas) {
  let currentInput = cloneCanvas(inputCanvas);

  for (const item of core.state.pipeline) {
    if (!item.enabled) {
      continue;
    }

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = currentInput.width;
    outputCanvas.height = currentInput.height;

    const renderedCanvas = item.effect.render(currentInput, outputCanvas, item.params, core.details);
    if (renderedCanvas instanceof HTMLCanvasElement) {
      currentInput = renderedCanvas;
    }
  }

  return currentInput;
}

function rebuildPipelinePreview() {

  if (
    !core.state.processingSourceCanvas
     || !core.state.processingSourceCanvas.width
      || !core.state.processingSourceCanvas.height) {
    resultImg.src = procImg.toDataURL('image/png');
    return;
  }

  const previewCanvas = document.createElement('canvas');
  previewCanvas.width = core.details.previewWidth;
  previewCanvas.height = core.details.previewHeight;
  previewCanvas.getContext('2d').drawImage(
    core.state.processingSourceCanvas,
    0, 0,
    core.details.previewWidth, core.details.previewHeight
  );

  const renderedPreview = renderPipelineToCanvas(previewCanvas);
  procImg.width = renderedPreview.width;
  procImg.height = renderedPreview.height;
  procImgCtx.clearRect(0, 0, procImg.width, procImg.height);
  procImgCtx.drawImage(renderedPreview, 0, 0);

  resultImg.width = core.state.sourceCanvas.width;
  resultImg.height = core.state.sourceCanvas.height;
  resultImg.style.width = 'auto';
  resultImg.style.height = 'auto';
  resultImg.src = renderedPreview.toDataURL('image/png');

}

function saveCurrentImage() {
  if (!core.state.sourceCanvas || !core.state.sourceCanvas.width || !core.state.sourceCanvas.height) {
    return;
  }

  const finalCanvas = renderPipelineToCanvas(core.state.sourceCanvas);
  const saveBlob = (blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'output.png';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (finalCanvas.toBlob) {
    finalCanvas.toBlob(saveBlob, 'image/png');
    return;
  }

  saveBlob(dataURLToBlob(finalCanvas.toDataURL('image/png')));
}

function dataURLToBlob(dataURL) {
  const [header, base64] = dataURL.split(',');
  const mime = header.match(/data:(.*?);base64/)?.[1] || 'image/png';
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    array[i] = binary.charCodeAt(i);
  }

  return new Blob([array], { type: mime });
}

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
    console.log("procImg width: " + procImg.width);
    console.log("procImg height: " + procImg.height);

    procImgCtx.clearRect(0, 0, procImg.width, procImg.height);
    procImgCtx.drawImage(img, 0, 0, img.width, img.height);
    
    resultImg.style.transform = 'scale(1)';
    core.syncSourceCanvas(procImg);

    const scale = core.getPreviewScale(procImg.width, procImg.height);
    core.details.previewWidth = Math.max(
      1, Math.round(procImg.width * scale)
    );
    core.details.previewHeight = Math.max(
      1, Math.round(procImg.height * scale)
    );

    console.log("preview width:" + core.details.previewWidth);
    console.log("preview height:" + core.details.previewHeight);

    setControlsVisible(true);
    resultImg.src = procImg.toDataURL('image/png');
    URL.revokeObjectURL(url);

    rebuildPipelinePreview();

  };

  img.onerror = () => {
    URL.revokeObjectURL(url);
    console.error('Failed to load image.');
  };

  img.src = url;

});

export function setPluginRegistry(registry) {
  core.state.effectRegistry = registry || {};
}

function renderPipelineUI() {
  if (!core.state.pipeline.length) {
    pipelineContainer.innerHTML = '';
    selectedPipelineIndex = -1;
    return;
  }

  pipelineContainer.innerHTML = core.state.pipeline.map((item, index) => {
    const arrow = index < core.state.pipeline.length - 1 ? '<span class="pipeline-arrow">→</span>' : '';
    const selectedClass = selectedPipelineIndex === index ? ' selected' : '';
    const enableLabel = item.enabled ? 'ON' : 'OFF';
    return `
      <button class="pipeline-step${selectedClass}" data-pipeline-index="${index}" type="button">
        <span>${item.label}</span>
        <span class="pipeline-state">${enableLabel}</span>
      </button>
    ` + arrow;
  }).join('');
}

function renderParameterUI() {
  if (!core.state.pipeline.length || selectedPipelineIndex < 0 || selectedPipelineIndex >= core.state.pipeline.length) {
    parameterPanel.innerHTML = '';
    return;
  }

  const item = core.state.pipeline[selectedPipelineIndex];
  const controls = item.effect.controls || [];
  const controlMarkup = controls.map(control => {
    const value = item.params[control.key] ?? control.default;
    return `
      <div class="parameter-item">
        <label>${control.label}</label>
        <div class="parameter-slider-wrap">
          <input type="range" data-index="${selectedPipelineIndex}" data-control-key="${control.key}" min="${control.min}" max="${control.max}" step="${control.step}" value="${value}">
          <span class="parameter-value" data-value-for="${control.key}">${Number(value).toFixed(control.step < 1 ? 1 : 0)}</span>
        </div>
      </div>
    `;
  }).join('');

  parameterPanel.innerHTML = `
    <div class="pipeline-parameter-group">
      <div class="pipeline-parameter-header">
        <div class="pipeline-step selected">${item.label}</div>
        <button class="mini-btn" data-action="toggle" data-index="${selectedPipelineIndex}" type="button">${item.enabled ? '無効化' : '有効化'}</button>
        <button class="mini-btn danger" data-action="delete" data-index="${selectedPipelineIndex}" type="button">削除</button>
      </div>
      ${controlMarkup}
    </div>
  `;
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
};

function renderStaticToolUI(toolName) {
  return toolUI[toolName] || '';
}

function renderEffectButtons() {
  const effects = Object.values(core.state.effectRegistry || {});

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
  const effect = core.state.effectRegistry[effectId];
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
    enabled: true,
    params: { ...defaultParams }
  };

  core.state.pipeline.push(pipelineItem);
  selectedPipelineIndex = core.state.pipeline.length - 1;
  rebuildPipelinePreview();
  renderPipelineUI();
  renderParameterUI();
}

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

pipelineContainer.addEventListener('click', (event) => {
  const stepButton = event.target.closest('[data-pipeline-index]');
  if (!stepButton) {
    return;
  }

  selectedPipelineIndex = Number(stepButton.dataset.pipelineIndex);
  renderPipelineUI();
  renderParameterUI();
});

parameterPanel.addEventListener('click', (event) => {
  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) {
    return;
  }

  const index = Number(actionButton.dataset.index);
  const item = core.state.pipeline[index];
  if (!item) {
    return;
  }

  if (actionButton.dataset.action === 'toggle') {
    item.enabled = !item.enabled;
    rebuildPipelinePreview();
    renderPipelineUI();
    renderParameterUI();
    return;
  }

  if (actionButton.dataset.action === 'delete') {
    core.state.pipeline.splice(index, 1);
    if (selectedPipelineIndex >= core.state.pipeline.length) {
      selectedPipelineIndex = core.state.pipeline.length - 1;
    }
    rebuildPipelinePreview();
    renderPipelineUI();
    renderParameterUI();
  }
});

parameterPanel.addEventListener('input', (event) => {
  const slider = event.target;
  if (!(slider instanceof HTMLInputElement) || !slider.dataset.index || !slider.dataset.controlKey) {
    return;
  }

  const index = Number(slider.dataset.index);
  const key = slider.dataset.controlKey;
  const item = core.state.pipeline[index];
  if (!item) {
    return;
  }

  const nextValue = Number(slider.value);
  item.params[key] = nextValue;
  const displayValue = slider.parentElement?.querySelector('.parameter-value');
  if (displayValue) {
    displayValue.textContent = Number(nextValue).toFixed(slider.step.includes('.') ? 1 : 0);
  }
  rebuildPipelinePreview();
});

saveButton.addEventListener('click', saveCurrentImage);

// 初期化時は空表示にして、プラグイン読み込み完了後に一覧を描画する
subContent.innerHTML = '';
pipelineContainer.innerHTML = '';
parameterPanel.innerHTML = '';