import fs from 'fs';
import path from 'path';
import rawCardapio from '../src/data/cardapio.json' with { type: 'json' };

const dir = path.join(process.cwd(), 'public', 'images', 'cardapio');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Minimal valid JPEG binary (1x1 warm burgundy #44100D pixel)
const base64Jpg = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
const buffer = Buffer.from(base64Jpg, 'base64');

let count = 0;
for (const item of rawCardapio.cardapio.itens) {
  if (item.imagem) {
    const filename = path.basename(item.imagem);
    const targetPath = path.join(dir, filename);
    if (!fs.existsSync(targetPath)) {
      fs.writeFileSync(targetPath, buffer);
      count++;
    }
  }
}

console.log(`Gerados ${count} arquivos de imagem válidos em public/images/cardapio`);
