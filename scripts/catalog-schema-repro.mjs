import { validateMenuCatalog } from '../src/lib/cardapio/schema.ts';

const invalidCatalog = {
  cardapio: {
    categorias: [{ id: 'drinks', name: 'Drinks' }],
    itens: [
      {
        id: 'mojito',
        name: 'Mojito',
        categoryId: 'drinks',
        description: 'Drink refrescante',
        ingredients: ['limão', 'hortelã', 'água com gás'],
      },
      {
        id: 'caipirinha',
        name: 'Caipirinha',
        categoryId: 'drinks',
        description: '',
        ingredients: ['limão', 'açúcar', 'cachaça'],
      },
    ],
  },
};

const result = validateMenuCatalog(invalidCatalog);

if (result.valid) {
  console.error('Repro falhou: catálogo inválido foi aceito.');
  process.exit(1);
}

console.log('Erros detectados:', result.errors.length);
console.log(result.errors[0]);
