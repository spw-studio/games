import fs from 'node:fs';
import path from 'node:path';
import rawCardapio from '../src/data/cardapio.json' with { type: 'json' };

/**
 * Verificação da vitrine do cardápio (`/cardapio`).
 *
 * Reproduz, sobre o JSON bruto, as mesmas funções puras usadas pela página
 * (`src/lib/cardapio/pure.ts`) e valida tudo que os cartões precisam para renderizar.
 */

const categorias = rawCardapio.cardapio.categorias;
const itens = rawCardapio.cardapio.itens;

const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const haystackOf = (item) =>
  [
    item.nome,
    item.codigo ?? '',
    item.descricao,
    item.categoria,
    ...(item.ingredientes ?? []),
    ...(item.acompanhamentos ?? []),
  ]
    .map(normalize)
    .join(' ');

const filterBySearch = (list, term) => {
  const needle = normalize(term);
  return needle ? list.filter((item) => haystackOf(item).includes(needle)) : [...list];
};

const filterByCategory = (list, categoryId) =>
  !categoryId || categoryId === 'todas'
    ? [...list]
    : list.filter((item) => item.categoria === categoryId);

const excludeByTag = (list, tag) =>
  tag
    ? list.filter(
        (item) =>
          !(item.tags_alimentares ?? []).some((t) => normalize(t) === normalize(tag))
      )
    : [...list];

console.log('=== TESTE 1: VOLUME DA VITRINE ===');
console.log(`Categorias: ${categorias.length} | Itens: ${itens.length}`);
if (categorias.length === 0) throw new Error('Nenhuma categoria encontrada');
if (itens.length === 0) throw new Error('Nenhum item encontrado');

console.log('=== TESTE 2: PREÇOS RENDERIZÁVEIS EM TODOS OS CARTÕES ===');
for (const item of itens) {
  const variacoes = item.variacoes ?? [];
  if (variacoes.length > 0) {
    for (const variacao of variacoes) {
      if (!variacao.porcao || typeof variacao.preco !== 'number') {
        throw new Error(`Variação inválida em ${item.id}`);
      }
    }
  } else if (typeof item.preco !== 'number') {
    throw new Error(`Item ${item.id} sem preço e sem variações (não renderiza valor)`);
  }
}
console.log('OK: todo item possui variações com preço ou preço único.');

console.log('=== TESTE 3: IMAGENS DOS CARTÕES EXISTEM EM public/ ===');
let imagensVerificadas = 0;
for (const item of itens) {
  if (!item.imagem) continue;
  const arquivo = path.join(process.cwd(), 'public', item.imagem.replace(/^\//, ''));
  if (!fs.existsSync(arquivo)) {
    throw new Error(`Imagem ausente no build: ${item.imagem} (item ${item.id})`);
  }
  imagensVerificadas += 1;
}
console.log(`OK: ${imagensVerificadas} imagens de cartão encontradas em public/.`);

console.log('=== TESTE 4: BUSCA LIVRE IGNORA ACENTOS E CAIXA ===');
const comAcento = filterBySearch(itens, 'camarão');
const semAcento = filterBySearch(itens, 'camarao');
const caixaAlta = filterBySearch(itens, 'CAMARAO');
if (comAcento.length === 0) throw new Error('Busca por "camarão" não retornou itens');
if (comAcento.length !== semAcento.length || comAcento.length !== caixaAlta.length) {
  throw new Error('A busca deveria ignorar acentos e caixa');
}
console.log(`OK: "camarão" / "camarao" / "CAMARAO" retornam ${comAcento.length} itens.`);

console.log('=== TESTE 5: CONTAGENS POR CATEGORIA (chips da tela) ===');
let somatorio = 0;
const categoriasComItens = [];
const categoriasReservadas = [];
for (const categoria of categorias) {
  const total = filterByCategory(itens, categoria.id).length;
  somatorio += total;
  const linha = `${categoria.id} (${categoria.nome}): ${total}`;
  if (total > 0) {
    categoriasComItens.push(linha);
  } else {
    categoriasReservadas.push(linha);
  }
}
console.log(`Categorias com itens — exibidas como chips (${categoriasComItens.length}):`);
categoriasComItens.forEach((linha) => console.log(`  - ${linha}`));
console.log(
  `Categorias reservadas sem itens — ocultas na vitrine (${categoriasReservadas.length}): ` +
    categoriasReservadas.map((linha) => linha.split(' ')[0]).join(', ')
);
if (categoriasComItens.length === 0) {
  throw new Error('Nenhuma categoria possui itens: a vitrine ficaria sempre vazia');
}
if (somatorio !== itens.length) {
  throw new Error(
    `Somatório das categorias (${somatorio}) difere do total (${itens.length})`
  );
}
console.log(
  `OK: as ${categoriasComItens.length} categorias com itens somam exatamente ${itens.length} itens.`
);

console.log('=== TESTE 6: TAGS ALIMENTARES E RESTRIÇÕES ===');
const tags = Array.from(
  new Set(itens.flatMap((item) => item.tags_alimentares ?? []))
).sort((a, b) => a.localeCompare(b, 'pt-BR'));
console.log(`Tags disponíveis (${tags.length}): ${tags.join(', ')}`);
for (const tag of tags) {
  const comTag = itens.filter((item) => (item.tags_alimentares ?? []).includes(tag)).length;
  const restantes = excludeByTag(itens, tag).length;
  if (comTag + restantes !== itens.length) {
    throw new Error(`Restrição "sem ${tag}" inconsistente (${comTag} + ${restantes})`);
  }
}
console.log('OK: cada restrição remove exatamente os itens que possuem a tag.');

console.log('=== TESTE 7: COMBINAÇÃO BUSCA + CATEGORIA + RESTRIÇÃO ===');
const combinado = filterByCategory(
  excludeByTag(filterBySearch(itens, 'camarão'), 'Glúten'),
  'camaroes'
);
console.log(`"camarão" + categoria "camaroes" + sem "Glúten": ${combinado.length} item(ns)`);
if (combinado.length === 0) {
  throw new Error('A combinação de filtros deveria retornar ao menos 1 item');
}
const vazioEsperado = filterByCategory(filterBySearch(itens, 'zzzz-nao-existe'), 'todas');
if (vazioEsperado.length !== 0) {
  throw new Error('Busca sem correspondência deveria esvaziar a vitrine (estado vazio)');
}
console.log('OK: combinação retorna itens e busca inexistente gera o estado vazio.');

console.log('\n✅ Todos os testes da vitrine /cardapio passaram.');
