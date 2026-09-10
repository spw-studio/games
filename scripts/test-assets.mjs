async function testAssets() {
  const res = await fetch('http://localhost:3000/');
  const html = await res.text();
  const scriptRegex = /src="(\/_next[^"]+)"/g;
  const linkRegex = /href="(\/_next[^"]+)"/g;
  const assets = new Set();
  let m;
  while ((m = scriptRegex.exec(html)) !== null) assets.add(m[1]);
  while ((m = linkRegex.exec(html)) !== null) assets.add(m[1]);

  console.log(`Encontrados ${assets.size} assets no HTML de /:`);
  let errors = 0;
  for (const asset of assets) {
    const assetRes = await fetch('http://localhost:3000' + asset);
    console.log(`${assetRes.status} -> ${asset}`);
    if (assetRes.status !== 200) {
      errors++;
    }
  }

  if (errors > 0) {
    console.error(`Falha: ${errors} assets com erro`);
    process.exit(1);
  } else {
    console.log('Sucesso: Todos os assets carregados com status 200 OK!');
  }
}

testAssets();
