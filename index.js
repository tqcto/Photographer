const uploadInput = document.getElementById('upload');
const procImg = document.getElementById('proc-image');
const resultImg = document.getElementById('result-image');
const procImg_ctx = procImg.getContext("2d");

uploadInput.addEventListener('change', (e) => {

    const file = e.target.files[0];
    if (!file) {
        console.log("can't load image.");
        return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {

        img.src = url;

        canvas.width = img.width;
        canvas.height = img.height;
        procImg_ctx.drawImage(img, 0, 0);
        resultImg.src = procImg.toDataURL('image/jpeg');
        url.revokeObjectURL(url);

    };

    resultImg.src = url;

    console.log(e);

});
