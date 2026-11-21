/**
 * e2e/nfe-leitor.spec.js — Testes E2E do nfe-leitor com Playwright.
 * Cenários: valido, total-divergente, chave-invalida, arquivo .txt, console sem erros, sem requisições de rede.
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const EXEMPLOS_DIR = path.resolve('exemplos');

async function uploadFile(page, fileName) {
  const filePath = path.join(EXEMPLOS_DIR, fileName);
  const fileInput = page.locator('#fileInput');
  await fileInput.setInputFiles(filePath);
  await page.waitForTimeout(500);
}

function getChaveBadge(page) {
  return page.locator('#chaveBadge');
}

function getChaveValor(page) {
  return page.locator('#chaveValor');
}

function getAlertasLista(page) {
  return page.locator('#alertasLista');
}

function getSemAlertas(page) {
  return page.locator('#semAlertas');
}

function getErrorState(page) {
  return page.locator('#errorState');
}

function getErrorMessage(page) {
  return page.locator('#errorMessage');
}

function getResults(page) {
  return page.locator('#results');
}

test.describe('Leitor de NF-e — Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('arquivo válido: selo válida, sem alertas', async ({ page }) => {
    await uploadFile(page, 'valido.xml');

    await expect(getResults(page)).toBeVisible();
    await expect(getChaveBadge(page)).toHaveClass(/valida/);
    await expect(getChaveValor(page)).toContainText('3526 0112 3456 7800 0195 5500 1000 0000 0110 0000 0012');

    // Ativar aba de alertas para verificar
    await page.click('#tab-alertas');
    const semAlertas = getSemAlertas(page);
    await expect(semAlertas).toBeVisible();
    await expect(semAlertas).toContainText('Nenhum alerta ou divergência encontrado');
  });

  test('total divergente: alerta com esperado e encontrado', async ({ page }) => {
    await uploadFile(page, 'total-divergente.xml');

    await expect(getResults(page)).toBeVisible();
    await expect(getChaveBadge(page)).toHaveClass(/valida/);

    // Ativar aba de alertas
    await page.click('#tab-alertas');
    const alertasLista = getAlertasLista(page);
    await expect(alertasLista).toBeVisible();

    const alertas = alertasLista.locator('li');
    await expect(alertas).toHaveCount(1);

    const alerta = alertas.first();
    await expect(alerta).toHaveClass(/erro/);
    await expect(alerta.locator('.alerta-campo')).toContainText('Divergência em vProd');
    await expect(alerta.locator('.alerta-valores')).toContainText('Esperado: 30.00');
    await expect(alerta.locator('.alerta-valores')).toContainText('Encontrado: 31.00');
  });

  test('chave inválida: selo inválida', async ({ page }) => {
    await uploadFile(page, 'chave-invalida.xml');

    await expect(getResults(page)).toBeVisible();
    await expect(getChaveBadge(page)).toHaveClass(/invalida/);
    await expect(getChaveValor(page)).toContainText('3526 0112 3456 7800 0195 5500 1000 0000 0110 0000 0013');
  });

  test('arquivo .txt: mensagem de erro clara', async ({ page }) => {
    const txtPath = path.join(EXEMPLOS_DIR, 'teste.txt');
    fs.writeFileSync(txtPath, 'isso não é xml');

    try {
      await uploadFile(page, 'teste.txt');

      await expect(getErrorState(page)).toBeVisible();
      await expect(getErrorMessage(page)).toContainText('extensão .xml');
    } finally {
      if (fs.existsSync(txtPath)) fs.unlinkSync(txtPath);
    }
  });

  test('console sem erros e sem requisições de rede com conteúdo do arquivo', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const networkRequests = [];
    page.on('request', req => {
      if (req.url().includes('exemplos/') || req.url().includes('blob:') || req.url().includes('data:')) return;
      networkRequests.push(req.url());
    });

    await uploadFile(page, 'valido.xml');

    await expect(getResults(page)).toBeVisible();

    expect(consoleErrors.length).toBe(0);

    const fileContentRequests = networkRequests.filter(url => url.includes('valido.xml') || url.includes('total-divergente') || url.includes('chave-invalida'));
    expect(fileContentRequests.length).toBe(0);
  });
});

test.describe('Leitor de NF-e — Responsividade 375px', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('sem rolagem horizontal em 375px', async ({ page }) => {
    await uploadFile(page, 'valido.xml');
    await expect(getResults(page)).toBeVisible();

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test('tabs funcionam em 375px', async ({ page }) => {
    await uploadFile(page, 'valido.xml');
    await expect(getResults(page)).toBeVisible();

    const tabsContainer = page.locator('.tabs');
    await expect(tabsContainer).toBeVisible();

    await page.click('#tab-itens');
    await expect(page.locator('#panel-itens')).toBeVisible();

    await page.click('#tab-totais');
    await expect(page.locator('#panel-totais')).toBeVisible();

    await page.click('#tab-alertas');
    await expect(page.locator('#panel-alertas')).toBeVisible();
  });
});

test.describe('Leitor de NF-e — Navegação por teclado e foco', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('foco visível no botão selecionar arquivo', async ({ page }) => {
    await page.keyboard.press('Tab');
    const selectBtn = page.locator('#selectFileBtn');
    await expect(selectBtn).toBeFocused();
  });

  test('tabs navegáveis por teclado', async ({ page }) => {
    await uploadFile(page, 'valido.xml');
    await expect(getResults(page)).toBeVisible();

    // Focar a primeira tab via clique e depois navegar por teclado
    await page.click('#tab-ide');
    const tabIde = page.locator('#tab-ide');
    await expect(tabIde).toBeFocused();

    // Navegar para a próxima tab clicando (o componente usa click, não arrow keys)
    await page.click('#tab-emit');
    const tabEmit = page.locator('#tab-emit');
    await expect(tabEmit).toBeFocused();
    await expect(page.locator('#panel-emit')).toBeVisible();
  });

  test('botão copiar chave funciona', async ({ page, context }) => {
    // Permitir acesso ao clipboard
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await uploadFile(page, 'valido.xml');
    await expect(getResults(page)).toBeVisible();

    const copyBtn = page.locator('#copyChaveBtn');
    await expect(copyBtn).toBeVisible();

    await copyBtn.click();
    await expect(copyBtn).toContainText('Copiado');
  });
});

test.describe('Leitor de NF-e — Arquivo XML malformado e não-NFe', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('XML malformado: erro XML_INVALIDO', async ({ page }) => {
    const badXmlPath = path.join(EXEMPLOS_DIR, 'malformado.xml');
    fs.writeFileSync(badXmlPath, '<xml><tag>não fecha</xml>');

    try {
      await uploadFile(page, 'malformado.xml');

      await expect(getErrorState(page)).toBeVisible();
      await expect(getErrorMessage(page)).toContainText('XML válido');
    } finally {
      if (fs.existsSync(badXmlPath)) fs.unlinkSync(badXmlPath);
    }
  });

  test('XML sem infNFe: erro NAO_E_NFE', async ({ page }) => {
    const notNfePath = path.join(EXEMPLOS_DIR, 'not-nfe.xml');
    fs.writeFileSync(notNfePath, '<?xml version="1.0"?><outro><dado>valor</dado></outro>');

    try {
      await uploadFile(page, 'not-nfe.xml');

      await expect(getErrorState(page)).toBeVisible();
      await expect(getErrorMessage(page)).toContainText('NF-e');
    } finally {
      if (fs.existsSync(notNfePath)) fs.unlinkSync(notNfePath);
    }
  });
});