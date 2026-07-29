const uploadInput = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resultImg = document.getElementById('result-image');

uploadInput.addEventListener('change', (e) => {
const file = e.target.files[0];
if (!file) return;

const img = new Image();
const url = URL.createObjectURL(file);

img.onload = () => {

    // resize image
    const maxDimension = 1200;
    let width = img.width;
    let height = img.height;

    if (width > height && width > maxDimension) {
        
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
    
    } else if (height > maxDimension) {
    
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
    
    }

    canvas.width = width;
    canvas.height = height;

    // draw canvas
    ctx.drawImage(img, 0, 0, width, height);

    // image processing
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
    
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i]     = avg; // Red
        data[i + 1] = avg; // Green
        data[i + 2] = avg; // Blue
    
    }
    ctx.putImageData(imageData, 0, 0);

    // rendering image for save in phone
    resultImg.src = canvas.toDataURL('image/jpeg', 0.85);
    resultImg.style.display = 'block';

    // release
    URL.revokeObjectURL(url);

};

img.src = url;

});