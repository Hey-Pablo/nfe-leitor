/**
 * Script para capturar prints e GIF de demonstração do nfe-leitor
 * Uso: node tools/capture-demo.js
 *
 * Executa captura de screenshots e vídeo com Playwright
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { spawn } from 'child_process';

const REPO_DIR = '/paperclip/instances/default/isolated-workspaces/e33b41af-0507-40d6-a2db-89167b7d7c89/b1e90778-d104-48b2-bc34-46a74e0dd7db/nfe-leitor';
const EXEMPLOS_DIR = path.join(REPO_DIR, 'exemplos');
const DOCS_DIR = path.join(REPO_DIR, 'docs');
const IMG_DIR = path.join(DOCS_DIR, 'img');
const TMP_DIR = path.join(REPO_DIR, 'tmp-capture');

const HTTP_PORT = 18080;
const HTTP_URL = `http://localhost:${HTTP_PORT}`;

async function uploadFile(page, fileName) {
  const filePath = path.join(EXEMPLOS_DIR, fileName);
  const fileInput = page.locator('#fileInput');
  await fileInput.setInputFiles(filePath);
  await page.waitForTimeout(1000);
}

async function main() {
  // Setup
  if (!fs.existsSync(IMG_DIR)) {
    fs.mkdirSync(IMG_DIR, { recursive: true });
  }
  if (fs.existsSync(TMP_DIR)) {
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TMP_DIR, { recursive: true });

  console.log('📸 Capturando demo com Playwright...\n');

  const browser = await chromium.launch({ headless: true });

  // ===== DESKTOP SCREENSHOTS =====
  console.log('📷 Desktop screenshots (1440x900, deviceScaleFactor 2):');

  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });

  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto(HTTP_URL);
  await desktopPage.waitForLoadState('domcontentloaded');

  // 1. Initial screen
  await desktopPage.screenshot({ path: path.join(IMG_DIR, 'desktop-inicial.png'), fullPage: true });
  console.log('  ✓ desktop-inicial.png');

  // 2. Valid note - Identification (default tab)
  await uploadFile(desktopPage, 'valido.xml');
  await desktopPage.screenshot({ path: path.join(IMG_DIR, 'desktop-ide.png'), fullPage: true });
  console.log('  ✓ desktop-ide.png');

  // 3. Valid note - Emitente
  await desktopPage.click('#tab-emit');
  await desktopPage.waitForTimeout(300);
  await desktopPage.screenshot({ path: path.join(IMG_DIR, 'desktop-emit.png'), fullPage: true });
  console.log('  ✓ desktop-emit.png');

  // 4. Valid note - Destinatário
  await desktopPage.click('#tab-dest');
  await desktopPage.waitForTimeout(300);
  await desktopPage.screenshot({ path: path.join(IMG_DIR, 'desktop-dest.png'), fullPage: true });
  console.log('  ✓ desktop-dest.png');

  // 5. Valid note - Itens
  await desktopPage.click('#tab-itens');
  await desktopPage.waitForTimeout(300);
  await desktopPage.screenshot({ path: path.join(IMG_DIR, 'desktop-itens.png'), fullPage: true });
  console.log('  ✓ desktop-itens.png');

  // 6. Valid note - Totais
  await desktopPage.click('#tab-totais');
  await desktopPage.waitForTimeout(300);
  await desktopPage.screenshot({ path: path.join(IMG_DIR, 'desktop-totais.png'), fullPage: true });
  console.log('  ✓ desktop-totais.png');

  // 7. Valid note - Alertas (sem alertas)
  await desktopPage.click('#tab-alertas');
  await desktopPage.waitForTimeout(300);
  await desktopPage.screenshot({ path: path.join(IMG_DIR, 'desktop-alertas.png'), fullPage: true });
  console.log('  ✓ desktop-alertas.png');

  // 8. Total divergente - Alertas (com alerta)
  await uploadFile(desktopPage, 'total-divergente.xml');
  await desktopPage.waitForTimeout(300);
  await desktopPage.click('#tab-alertas');
  await desktopPage.waitForTimeout(300);
  await desktopPage.screenshot({ path: path.join(IMG_DIR, 'desktop-alertas-divergencia.png'), fullPage: true });
  console.log('  ✓ desktop-alertas-divergencia.png');

  // 9. Chave inválida
  await uploadFile(desktopPage, 'chave-invalida.xml');
  await desktopPage.waitForTimeout(300);
  await desktopPage.screenshot({ path: path.join(IMG_DIR, 'desktop-chave-invalida.png'), fullPage: true });
  console.log('  ✓ desktop-chave-invalida.png');

  await desktopContext.close();

  // ===== MOBILE SCREENSHOTS =====
  console.log('\n📱 Mobile screenshots (390x844, deviceScaleFactor 2):');

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(HTTP_URL);
  await mobilePage.waitForLoadState('domcontentloaded');

  await mobilePage.screenshot({ path: path.join(IMG_DIR, 'mobile-inicial.png'), fullPage: true });
  console.log('  ✓ mobile-inicial.png');

  await uploadFile(mobilePage, 'valido.xml');
  await mobilePage.screenshot({ path: path.join(IMG_DIR, 'mobile-ide.png'), fullPage: true });
  console.log('  ✓ mobile-ide.png');

  await mobilePage.click('#tab-emit');
  await mobilePage.waitForTimeout(300);
  await mobilePage.screenshot({ path: path.join(IMG_DIR, 'mobile-emit.png'), fullPage: true });
  console.log('  ✓ mobile-emit.png');

  await mobilePage.click('#tab-itens');
  await mobilePage.waitForTimeout(300);
  await mobilePage.screenshot({ path: path.join(IMG_DIR, 'mobile-itens.png'), fullPage: true });
  console.log('  ✓ mobile-itens.png');

  await mobileContext.close();

  // ===== GIF VIDEO =====
  console.log('\n🎬 Recording demo video (1280x800)...');

  const videoContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: TMP_DIR,
      size: { width: 1280, height: 800 }
    }
  });

  const videoPage = await videoContext.newPage();
  await videoPage.goto(HTTP_URL);
  await videoPage.waitForLoadState('domcontentloaded');

  // Fluxo de demonstração para o GIF
  // 1. Upload e navegação pelo fluxo principal
  await uploadFile(videoPage, 'valido.xml');
  await videoPage.waitForTimeout(600);

  await videoPage.click('#tab-emit');
  await videoPage.waitForTimeout(400);

  await videoPage.click('#tab-dest');
  await videoPage.waitForTimeout(400);

  await videoPage.click('#tab-itens');
  await videoPage.waitForTimeout(800);

  await videoPage.click('#tab-totais');
  await videoPage.waitForTimeout(400);

  await videoPage.click('#tab-alertas');
  await videoPage.waitForTimeout(600);

  // 2. Total divergente
  await uploadFile(videoPage, 'total-divergente.xml');
  await videoPage.waitForTimeout(500);
  await videoPage.click('#tab-alertas');
  await videoPage.waitForTimeout(800);

  // 3. Chave inválida
  await uploadFile(videoPage, 'chave-invalida.xml');
  await videoPage.waitForTimeout(600);

  // 4. Voltar ao inicial
  await videoPage.reload();
  await videoPage.waitForLoadState('domcontentloaded');
  await videoPage.waitForTimeout(500);

  await browser.close();

  // Convert video to GIF using ffmpeg
  const videoFiles = fs.readdirSync(TMP_DIR).filter(f => f.endsWith('.webm'));
  if (videoFiles.length > 0) {
    const videoPath = path.join(TMP_DIR, videoFiles[0]);
    const gifPath = path.join(DOCS_DIR, 'demo.gif');
    const palettePath = path.join(TMP_DIR, 'palette.png');

    console.log('\n🔄 Convertendo vídeo para GIF (palettegen)...');
    execSync(`ffmpeg -y -i "${videoPath}" -vf "fps=15,scale=1280:800:flags=lanczos,palettegen=stats_mode=diff" "${palettePath}"`, {
      timeout: 60000,
      stdio: 'pipe'
    });

    console.log('🔄 Convertendo vídeo para GIF (paletteuse)...');
    execSync(`ffmpeg -y -i "${videoPath}" -i "${palettePath}" -lavfi "fps=15,scale=1280:800:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5" "${gifPath}"`, {
      timeout: 60000,
      stdio: 'pipe'
    });

    // Check GIF size
    const stats = fs.statSync(gifPath);
    const sizeMB = stats.size / (1024 * 1024);
    console.log(`  ✅ GIF gerado: ${gifPath} (${sizeMB.toFixed(2)} MB)`);
    if (sizeMB > 8) {
      console.warn(`  ⚠️ GIF maior que 8 MB (${sizeMB.toFixed(2)} MB)`);
    }
  } else {
    console.log('\n⚠️ Nenhum arquivo de vídeo gerado pelo Playwright');
  }

  // Cleanup
  try {
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
  } catch (e) {}

  console.log('\n✨ Demonstração completa!');
  console.log(`   Prints em: ${IMG_DIR}`);
  console.log(`   GIF em: ${path.join(DOCS_DIR, 'demo.gif')}`);
}

main().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});