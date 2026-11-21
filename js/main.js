/**
 * main.js — Ponto de entrada da interface.
 * Upload, drag-and-drop, FileReader, integração com parser e validador.
 */

import { parsearNFe, ErroNFe } from './parser.js';
import { validarChave, validarCnpj, validarSomas, extrairChaveDoId } from './validador.js';
import {
  renderizarChave,
  renderizarIdentificacao,
  renderizarEmitente,
  renderizarDestinatario,
  renderizarItens,
  renderizarTotais,
  renderizarAlertas,
  mostrarResultados,
  mostrarErro,
  resetarInterface,
} from './render.js';

window.validarChave = validarChave;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const copyChaveBtn = document.getElementById('copyChaveBtn');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const tabBtns = document.querySelectorAll('.tab-btn');

let chaveAtual = null;

function ativarAba(tabId) {
  for (const btn of tabBtns) {
    const painelId = btn.getAttribute('aria-controls');
    const painel = document.getElementById(painelId);
    const ativo = btn.id === tabId;
    btn.setAttribute('aria-selected', ativo);
    btn.classList.toggle('active', ativo);
    if (painel) painel.hidden = !ativo;
  }
}

function processarArquivo(arquivo) {
  if (!arquivo) return;

  if (!arquivo.name.toLowerCase().endsWith('.xml')) {
    mostrarErro('O arquivo deve ter extensão .xml');
    return;
  }

  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const xml = e.target.result;
      const nota = parsearNFe(xml);

      chaveAtual = nota.chave;

      renderizarChave(nota.chave);
      renderizarIdentificacao(nota.ide);
      renderizarEmitente(nota.emit);
      renderizarDestinatario(nota.dest);
      renderizarItens(nota.itens);
      renderizarTotais(nota.totais);

      const divergencias = validarSomas(nota.itens, nota.totais);
      renderizarAlertas(nota.avisos, divergencias);

      mostrarResultados();
      ativarAba('tab-ide');
    } catch (err) {
      if (err instanceof ErroNFe) {
        if (err.codigo === 'XML_INVALIDO') {
          mostrarErro('O arquivo não é um XML válido.');
        } else if (err.codigo === 'NAO_E_NFE') {
          mostrarErro('O XML não contém uma NF-e (modelo 55).');
        } else {
          mostrarErro(err.message);
        }
      } else {
        console.error(err);
        mostrarErro('Erro inesperado ao processar o arquivo.');
      }
    }
  };

  reader.onerror = () => {
    mostrarErro('Não foi possível ler o arquivo.');
  };

  reader.readAsText(arquivo);
}

uploadArea.addEventListener('click', (e) => {
  if (e.target === selectFileBtn || e.target === uploadArea || e.target.closest('.upload-content')) {
    fileInput.click();
  }
});

selectFileBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const arquivo = e.target.files[0];
  if (arquivo) processarArquivo(arquivo);
});

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
  uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (!uploadArea.contains(e.relatedTarget)) {
    uploadArea.classList.remove('drag-over');
  }
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  uploadArea.classList.remove('drag-over');

  const arquivo = e.dataTransfer.files[0];
  if (arquivo) {
    fileInput.files = e.dataTransfer.files;
    processarArquivo(arquivo);
  }
});

copyChaveBtn.addEventListener('click', async () => {
  if (!chaveAtual) return;

  try {
    await navigator.clipboard.writeText(chaveAtual);
    copyChaveBtn.textContent = 'Copiado!';
    copyChaveBtn.classList.add('copiado');
    setTimeout(() => {
      copyChaveBtn.textContent = 'Copiar';
      copyChaveBtn.classList.remove('copiado');
    }, 2000);
  } catch (err) {
    console.error('Erro ao copiar:', err);
    copyChaveBtn.textContent = 'Falha';
    setTimeout(() => {
      copyChaveBtn.textContent = 'Copiar';
    }, 2000);
  }
});

tryAgainBtn.addEventListener('click', () => {
  resetarInterface();
});

for (const btn of tabBtns) {
  btn.addEventListener('click', () => ativarAba(btn.id));
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-nav');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-nav');
});