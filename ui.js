const uploadInput = document.getElementById('upload');
const procImg = document.getElementById('proc-image');
const resultImg = document.getElementById('result-image');
const procImgCtx = procImg.getContext('2d');

const toolButtons = document.querySelectorAll('.tool-btn');
const subContent = document.getElementById('subContent');

let effectRegistry = {};

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
  const effects = Object.values(effectRegistry);

  subContent.innerHTML = effects.map(effect => {
    return `<button class="sub-option-btn" data-effect-id="${effect.id}">${effect.label}</button>`;
  }).join('');
}

export function renderPluginEffects(registry) {
  setPluginRegistry(registry);
  renderEffectButtons();
}

// 各ツールが選択された際のサブ UI 定義 (.sub-option-btn クラスを適用)
const toolUI = {
  filter: `
    <button class="sub-option-btn active">ノーマル</button>
    <button class="sub-option-btn">モノクロ</button>
    <button class="sub-option-btn">セピア</button>
    <button class="sub-option-btn">くっきり</button>
  `,
  effect: `
    <button class="sub-option-btn active">ノーマル</button>
    <button class="sub-option-btn">モノクロ</button>
    <button class="sub-option-btn">セピア</button>
    <button class="sub-option-btn">くっきり</button>
  `,
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

  console.log(`SubOption selected: ${btnElement.textContent.trim()}`);
});

// 初期化（ページ読み込み時にエフェクトタブの初期表示を保持する）
renderToolUI('effect');