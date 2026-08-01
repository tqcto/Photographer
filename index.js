const uploadInput = document.getElementById('upload');
const procImg = document.getElementById('proc-image');
const resultImg = document.getElementById('result-image');
const procImgCtx = procImg.getContext('2d');

const toolButtons = document.querySelectorAll('.tool-btn');
const subContent = document.getElementById('subContent');

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

const toolUI = {
  filter: `
    <button onclick="applyFilter('none')">ノーマル</button>
    <button onclick="applyFilter('grayscale')">モノクロ</button>
    <button onclick="applyFilter('sepia')">セピア</button>
  `,
  adjust: `
    <label>明るさ: </label>
    <input type="range" id="brightness" min="0" max="200" value="100">
  `,
  crop: `
    <button>1:1</button>
    <button>4:3</button>
    <button>16:9</button>
  `,
  stamp: `
    <span>😊</span> <span>❤️</span> <span>★</span> (タップして配置)
  `
};

// ツールバーの切り替え処理
toolButtons.forEach(button => {
  button.addEventListener('click', () => {
    // アクティブなボタンのスタイルの変更
    toolButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // 選択されたツールに応じたサブメニューの表示
    const toolName = button.getAttribute('data-tool');
    subContent.innerHTML = toolUI[toolName] || '';
  });
});

// 初期状態としてフィルターを表示
subContent.innerHTML = toolUI['filter'];
