const uploadInput = document.getElementById('upload');
const procImg = document.getElementById('proc-image');
const resultImg = document.getElementById('result-image');
const procImgCtx = procImg.getContext('2d');

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
        procImgCtx.drawImage(img, 0, 0);
        resultImg.src = procImg.toDataURL('image/jpeg');
        URL.revokeObjectURL(url);
    };

    img.onerror = () => {
        URL.revokeObjectURL(url);
        console.error('Failed to load image.');
    };

    img.src = url;
});
