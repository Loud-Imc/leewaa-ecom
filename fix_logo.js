const fs = require('fs');
const filePath = 'c:\\Users\\kamar\\OneDrive\\Desktop\\Loud IMC projects\\WaterFilterProject\\leewaa-ecom\\admin\\app\\dashboard\\orders\\[id]\\page.tsx';
const logoPath = 'logo_base64.txt';

if (!fs.existsSync(logoPath)) {
    console.error('Error: logo_base64.txt not found');
    process.exit(1);
}

const fullBase64 = fs.readFileSync(logoPath, 'utf8').trim();
let fileContent = fs.readFileSync(filePath, 'utf8');

// Find the image tag within the print area
const searchStart = fileContent.indexOf('{/* PRINT AREA */}');
if (searchStart === -1) {
    console.error('Error: Could not find PRINT AREA marker');
    process.exit(1);
}

const startTag = '<img';
const endTag = '/>';
const startIndex = fileContent.indexOf(startTag, searchStart);
const endIndex = fileContent.indexOf(endTag, startIndex) + 2;

if (startIndex === -1 || endIndex === -1) {
    console.error('Error: Could not find img tag');
    process.exit(1);
}

const newLogoTag = `<img
                                src="${fullBase64}"
                                alt="LEEWA LOGO"
                                style={{ height: '55px', width: 'auto', display: 'block' }}
                            />`;

const updatedContent = fileContent.substring(0, startIndex) + newLogoTag + fileContent.substring(endIndex);
fs.writeFileSync(filePath, updatedContent);
console.log('Success: Logo fixed with full base64 string');
