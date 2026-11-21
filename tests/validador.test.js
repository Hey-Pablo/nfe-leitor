import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validarChave, extrairChaveDoId, validarCnpj, validarSomas } from '../js/validador.js';

test('valida chave e extrai somente Id no formato NF-e', () => {
  const chave = '35260112345678000195550010000000011000000012';
  assert.equal(validarChave(chave), true);
  assert.equal(validarChave(chave.slice(0, 43)), false);
  assert.equal(validarChave(chave.slice(0, 43) + 'a'), false);
  assert.equal(validarChave(chave.slice(0, 43) + '1'), false);
  assert.equal(extrairChaveDoId('NFe' + chave), chave);
  assert.equal(extrairChaveDoId('errado'), null);
});

test('valida dígitos do CNPJ e rejeita sequências repetidas', () => {
  assert.equal(validarCnpj('12345678000195'), true);
  assert.equal(validarCnpj('12345678000196'), false);
  assert.equal(validarCnpj('11111111111111'), false);
  assert.equal(validarCnpj('123'), false);
});

test('compara valores em centavos e identifica contagem divergente', () => {
  assert.deepEqual(validarSomas([{ vProd: '0.10' }, { vProd: '0.20' }], { vProd: '0.30' }, 2), []);
  assert.deepEqual(validarSomas([{ vProd: '0.10' }, { vProd: '0.20' }], { vProd: '0.31' }, 3), [
    { campo: 'vProd', esperado: '0.30', encontrado: '0.31' },
    { campo: 'quantidadeItens', esperado: 2, encontrado: 3 },
  ]);
});
