/**
 * Script para capturar screenshots desktop e 375px
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

test('capturar screenshots desktop', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await uploadFile(page, 'valido.xml');
  await page.click('#tab-alertas');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'docs/desktop.png', fullPage: true });
});

test('capturar screenshots 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await uploadFile(page, 'valido.xml');
  await page.click('#tab-alertas');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'docs/mobile-375px.png', fullPage: true });
});