const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = 'C:/Users/yahya/.gemini/antigravity-ide/brain/587421ae-9b5b-4e2c-a582-56454ed0c05c/media__1790892840919.jpg';
const outputDir = path.join(__dirname, '../public/images/chart');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1024 x 682 image reference coordinates
const crops = [
  { name: 'logo-intro.png', left: 40, top: 40, width: 260, height: 160 },
  { name: 'hero-nails.png', left: 512, top: 35, width: 165, height: 185 },
  { name: 'about-nails.png', left: 900, top: 0, width: 124, height: 225 },
  { name: 'service-manucure.png', left: 16, top: 304, width: 70, height: 62 },
  { name: 'service-pose-de-gel.png', left: 93, top: 304, width: 70, height: 62 },
  { name: 'service-nail-art.png', left: 171, top: 304, width: 70, height: 62 },
  { name: 'service-extensions.png', left: 249, top: 304, width: 70, height: 62 },
  { name: 'gallery-1.png', left: 352, top: 302, width: 84, height: 64 },
  { name: 'gallery-2.png', left: 444, top: 302, width: 88, height: 64 },
  { name: 'gallery-3.png', left: 540, top: 302, width: 68, height: 64 },
  { name: 'gallery-4.png', left: 616, top: 302, width: 58, height: 64 },
  { name: 'gallery-5.png', left: 352, top: 388, width: 84, height: 64 },
  { name: 'gallery-6.png', left: 444, top: 388, width: 88, height: 64 },
  { name: 'gallery-7.png', left: 540, top: 388, width: 68, height: 64 },
  { name: 'gallery-8.png', left: 616, top: 388, width: 58, height: 64 },
  { name: 'booking-promo.png', left: 700, top: 255, width: 95, height: 170 },
];

async function run() {
  for (const c of crops) {
    await sharp(inputPath)
      .extract({ left: c.left, top: c.top, width: c.width, height: c.height })
      .resize({ width: c.width * 3, height: c.height * 3, kernel: sharp.kernel.lanczos3 })
      .toFile(path.join(outputDir, c.name));
    console.log(`Cropped: ${c.name}`);
  }
}

run().catch(console.error);
