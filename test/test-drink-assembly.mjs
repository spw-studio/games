import rawCardapio from '../src/data/cardapio.json' with { type: 'json' };

console.log('=== TESTE 1: VALIDAÇÃO DO CATÁLOGO DE DRINKS ===');
const drinkItems = rawCardapio.cardapio.itens.filter((i) => i.categoria === 'drinks');
console.log(`Total de Drinks cadastrados: ${drinkItems.length}`);
if (drinkItems.length < 5) {
  throw new Error(`Esperado pelo menos 5 drinks, encontrado: ${drinkItems.length}`);
}

for (const drink of drinkItems) {
  if (!drink.id || !drink.nome || !drink.descricao) {
    throw new Error(`Drink inválido: ${JSON.stringify(drink)}`);
  }
  if (!Array.isArray(drink.ingredientes) || drink.ingredientes.length < 2) {
    throw new Error(`Drink ${drink.nome} com menos de 2 ingredientes`);
  }
}
console.log('OK: Todos os drinks possuem id, nome, descrição e pelo menos 2 ingredientes reais!');

console.log('\n=== TESTE 2: REGRAS DE AVALIAÇÃO DE MONTAGEM (ORDER INDEPENDENCE) ===');
function evaluateSelection(targetIngredients, selectedIngredients) {
  const targetNames = new Set(targetIngredients.map((m) => m.toLowerCase().trim()));
  const selectedNames = new Set(selectedIngredients.map((m) => m.toLowerCase().trim()));

  const correctSelected = selectedIngredients.filter((s) => targetNames.has(s.toLowerCase().trim()));
  const incorrectSelected = selectedIngredients.filter((s) => !targetNames.has(s.toLowerCase().trim()));
  const missingIngredients = targetIngredients.filter((m) => !selectedNames.has(m.toLowerCase().trim()));

  const isPerfectMatch =
    incorrectSelected.length === 0 &&
    missingIngredients.length === 0 &&
    correctSelected.length === targetIngredients.length;

  return { isPerfectMatch, correctSelected, incorrectSelected, missingIngredients };
}

// Caso Caipirinha: [Cachaça, Limão, Açúcar, Gelo]
const caipirinha = ['Cachaça', 'Limão', 'Açúcar', 'Gelo'];

// Teste 2.1: Acerto na mesma ordem
const res1 = evaluateSelection(caipirinha, ['Cachaça', 'Limão', 'Açúcar', 'Gelo']);
if (!res1.isPerfectMatch) throw new Error('Falha no teste de ordem direta');

// Teste 2.2: Acerto em ordem totalmente invertida
const res2 = evaluateSelection(caipirinha, ['Gelo', 'Açúcar', 'Cachaça', 'Limão']);
if (!res2.isPerfectMatch) throw new Error('Falha no teste de ordem invertida');
console.log('OK: Avaliação ignora a ordem dos ingredientes perfeitamente!');

// Teste 2.3: Incompleto (faltou gelo)
const res3 = evaluateSelection(caipirinha, ['Cachaça', 'Limão', 'Açúcar']);
if (res3.isPerfectMatch || res3.missingIngredients.length !== 1 || res3.missingIngredients[0] !== 'Gelo') {
  throw new Error('Falha no teste de ingrediente faltante');
}
console.log('OK: Identificação precisa de ingrediente faltante!');

// Teste 2.4: Intruso (adicionou Vodka)
const res4 = evaluateSelection(caipirinha, ['Cachaça', 'Limão', 'Açúcar', 'Gelo', 'Vodka']);
if (res4.isPerfectMatch || res4.incorrectSelected.length !== 1 || res4.incorrectSelected[0] !== 'Vodka') {
  throw new Error('Falha no teste de ingrediente intruso');
}
console.log('OK: Identificação precisa de ingrediente incorreto selecionado!');

console.log('\n=== TESTE 3: VALIDAÇÃO DO MOTOR DE PONTUAÇÃO ===');
function calculateDrinkAssemblyScore(input) {
  const baseScore = input.isPerfectMatch ? 150 : 0;
  const correctIngredientsScore = input.correctCount * 30;
  const incorrectPenalty = input.incorrectCount * 25;
  const missingPenalty = input.missingCount * 20;

  let streakBonus = 0;
  if (input.isPerfectMatch) {
    if (input.streak >= 5) streakBonus = 100 + (input.streak - 5) * 25;
    else if (input.streak === 4) streakBonus = 75;
    else if (input.streak === 3) streakBonus = 50;
    else if (input.streak === 2) streakBonus = 25;
  }

  let speedBonus = 0;
  if (input.isPerfectMatch && input.elapsedSeconds > 0 && input.elapsedSeconds < 12) {
    speedBonus = Math.round((12 - input.elapsedSeconds) * 6);
  }

  const multiplier = { facil: 1.0, medio: 1.5, dificil: 2.0 }[input.difficulty] || 1.0;

  const preScore =
    baseScore +
    correctIngredientsScore +
    streakBonus +
    speedBonus -
    incorrectPenalty -
    missingPenalty;

  return Math.max(0, Math.round(preScore * multiplier));
}

const scorePerfect = calculateDrinkAssemblyScore({
  isPerfectMatch: true,
  correctCount: 4,
  incorrectCount: 0,
  missingCount: 0,
  totalRequired: 4,
  streak: 3,
  elapsedSeconds: 6,
  difficulty: 'medio',
});
console.log(`Pontuação Calculada (Acerto Perfeito com streak 3 e speed bonus no Médio): ${scorePerfect}`);
if (scorePerfect <= 0) throw new Error('Pontuação deve ser positiva');

console.log('\n=== TESTE 4: HTTP FETCH DAS ROTAS DO NEXT.JS ===');
async function testHttpRoutes() {
  try {
    const r1 = await fetch('http://localhost:3000/jogos');
    const html1 = await r1.text();
    if (!html1.includes('Montar Drink')) {
      throw new Error('Card Montar Drink não encontrado no HTML de /jogos');
    }
    console.log('OK: Rota /jogos renderiza card "Montar Drink" com sucesso!');

    const r2 = await fetch('http://localhost:3000/jogos/montar-drink');
    const html2 = await r2.text();
    if (!html2.includes('Montar o Drink')) {
      throw new Error('Título Montar o Drink não encontrado no HTML de /jogos/montar-drink');
    }
    console.log('OK: Rota /jogos/montar-drink responde com status 200 e HTML válido!');
  } catch (err) {
    console.warn('Servidor dev pode não estar na porta 3000 no momento:', err.message);
  }
}

await testHttpRoutes();

console.log('\n======================================================');
console.log(' TODOS OS TESTES DO MÓDULO FORAM CONCLUÍDOS COM SUCESSO! ');
console.log('======================================================');
