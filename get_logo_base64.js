const fs = require('fs');
const path = 'c:\\Users\\kamar\\OneDrive\\Desktop\\Loud IMC projects\\WaterFilterProject\\leewaa-ecom\\storefront\\public\\images\\Leewa_logo_web.png';
const image = fs.readFileSync(path);
console.log('data:image/png;base64,' + image.toString('base64'));
