const uploadInput = document.getElementById('upload');
const procImg = document.getElementById('proc-image');
const resultImg = document.getElementById('result-image');
const procImgCtx = procImg.getContext('2d');

const toolButtons = document.querySelectorAll('.tool-btn');
const subContent = document.getElementById('subContent');

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

// 各ツールが選択された際のサブ UI 定義 (.sub-option-btn クラスを適用)
const toolUI = {
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

// メインツールバーのタップ切替処理
toolButtons.forEach(button => {
  button.addEventListener('click', () => {
    // 1. アクティブ表示の更新
    toolButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // 2. ボタンを画面の中央へ自動スクロール
    button.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });

    // 3. 選択されたツールのサブUIを切り替えて描画
    const toolName = button.getAttribute('data-tool');
    if (toolUI[toolName]) {
      subContent.innerHTML = toolUI[toolName];
      // サブツールのスクロール位置を左端にリセット
      subContent.scrollLeft = 0;
    }
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

// 初期化（ページ読み込み時にフィルターのサブUIを表示しておく）
subContent.innerHTML = toolUI['effect'];