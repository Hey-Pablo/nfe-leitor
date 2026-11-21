import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DOMParser } from '@xmldom/xmldom';
import { parsearNFe, ErroNFe } from '../js/parser.js';
import { validarChave, validarCnpj, validarSomas } from '../js/validador.js';
const ler = nome => readFileSync(new URL(`../exemplos/${nome}.xml`, import.meta.url), 'utf8');
const parse = xml => parsearNFe(xml, new DOMParser());

test('extrai dados e valida exemplo fictício', () => {
  const nota = parse(ler('valido'));
  assert.equal(nota.ide.mod, '55');
  assert.equal(nota.itens.length, 2);
  assert.equal(nota.itens[0].xProd, 'Produto fictício A');
  assert.equal(nota.protocolo.cStat, '100');
  assert.deepEqual(nota.avisos, []);
  assert.equal(validarChave(nota.chave), true);
  assert.equal(validarCnpj(nota.emit.CNPJ), true);
  assert.equal(validarCnpj(nota.dest.CNPJ), true);
  assert.deepEqual(validarSomas(nota.itens, nota.totais), []);
});
test('exemplos demonstram divergência e chave inválida', () => {
  const divergente = parse(ler('total-divergente'));
  assert.equal(validarSomas(divergente.itens, divergente.totais)[0].campo, 'vProd');
  assert.equal(validarChave(parse(ler('chave-invalida')).chave), false);
});
test('classifica XML malformado e outro documento', () => {
  assert.throws(() => parse('<NFe><infNFe></NFe>'), e => e instanceof ErroNFe && e.codigo === 'XML_INVALIDO');
  assert.throws(() => parse('<outro/>'), e => e instanceof ErroNFe && e.codigo === 'NAO_E_NFE');
  assert.throws(() => parse('texto'), e => e instanceof ErroNFe && e.codigo === 'XML_INVALIDO');
});
test('nota sem protocolo retorna aviso', () => {
  const nota = parse(ler('valido').replace(/<protNFe[\s\S]*?<\/protNFe>/, ''));
  assert.equal(nota.protocolo, null);
  assert.deepEqual(nota.avisos, ['Nota sem protocolo.']);
});
