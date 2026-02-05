const fs = require('fs');
const path = 'c:\\Users\\kamar\\OneDrive\\Desktop\\Loud IMC projects\\WaterFilterProject\\leewaa-ecom\\storefront\\public\\images\\Leewa_logo_web.png';
const image = fs.readFileSync(path);
const base64 = 'data:image/png;base64,' + image.toString('base64');
fs.writeFileSync('logo_base64.txt', base64);
console.log('Success: Full base64 string saved to logo_base64.txt');
