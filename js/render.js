/**
 * render.js — Renderiza os dados da NF-e na interface.
 * Funções puras que recebem o objeto parseado e atualizam o DOM via textContent.
 */

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
const formatoNumero = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
const formatoInteiro = new Intl.NumberFormat('pt-BR');

function formatarChave(chave) {
  if (!chave || chave.length !== 44) return chave;
  return chave.match(/.{1,4}/g).join(' ');
}

function setText(id, texto) {
  const el = document.getElementById(id);
  if (el) el.textContent = texto ?? '—';
}

function limparGrid(id) {
  const grid = document.getElementById(id);
  if (grid) grid.innerHTML = '';
}

function adicionarLinhaGrid(gridId, label, valor) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  const dt = document.createElement('dt');
  dt.textContent = label;
  const dd = document.createElement('dd');
  dd.textContent = valor ?? '—';
  grid.appendChild(dt);
  grid.appendChild(dd);
}

function formatarValorMonetario(valor) {
  if (valor === undefined || valor === null || valor === '') return '—';
  const num = Number(valor);
  if (!Number.isFinite(num)) return '—';
  return formatoMoeda.format(num);
}

function formatarValorNumerico(valor) {
  if (valor === undefined || valor === null || valor === '') return '—';
  const num = Number(valor);
  if (!Number.isFinite(num)) return '—';
  return formatoNumero.format(num);
}

function formatarInteiro(valor) {
  if (valor === undefined || valor === null || valor === '') return '—';
  const num = Number(valor);
  if (!Number.isFinite(num)) return '—';
  return formatoInteiro.format(num);
}

export function renderizarChave(chave) {
  const badge = document.getElementById('chaveBadge');
  const valor = document.getElementById('chaveValor');
  const copyBtn = document.getElementById('copyChaveBtn');

  if (!chave) {
    if (valor) valor.textContent = '—';
    if (badge) {
      badge.classList.remove('valida', 'invalida');
    }
    if (copyBtn) copyBtn.hidden = true;
    return;
  }

  const formatada = formatarChave(chave);
  if (valor) valor.textContent = formatada;
  if (copyBtn) copyBtn.hidden = false;

  const valida = window.validarChave ? window.validarChave(chave) : false;
  if (badge) {
    badge.classList.remove('valida', 'invalida');
    badge.classList.add(valida ? 'valida' : 'invalida');
  }
}

export function renderizarIdentificacao(ide) {
  limparGrid('ideGrid');
  if (!ide) return;

  const campos = [
    ['cUF', 'Código UF'],
    ['cNF', 'Código numérico'],
    ['natOp', 'Natureza da operação'],
    ['mod', 'Modelo'],
    ['serie', 'Série'],
    ['nNF', 'Número'],
    ['dhEmi', 'Data/hora emissão'],
    ['dhSaiEnt', 'Data/hora saída/entrada'],
    ['tpNF', 'Tipo (0=entrada, 1=saída)'],
    ['idDest', 'Destino (1=interna, 2=interestadual, 3=exterior)'],
    ['cMunFG', 'Código município'],
    ['tpImp', 'Formato impressão'],
    ['tpEmis', 'Forma emissão'],
    ['cDV', 'Dígito verificador'],
    ['tpAmb', 'Ambiente (1=produção, 2=homologação)'],
    ['finNFe', 'Finalidade'],
    ['indFinal', 'Consumidor final (0=não, 1=sim)'],
    ['indPres', 'Presença comprador'],
    ['procEmi', 'Processo emissão'],
    ['verProc', 'Versão processo'],
  ];

  for (const [chave, label] of campos) {
    adicionarLinhaGrid('ideGrid', label, ide[chave]);
  }
}

export function renderizarEmitente(emit) {
  limparGrid('emitGrid');
  if (!emit) return;

  const campos = [
    ['CNPJ', 'CNPJ'],
    ['xNome', 'Razão social'],
    ['xFant', 'Nome fantasia'],
    ['IE', 'Inscrição Estadual'],
    ['IEST', 'Inscrição Estadual ST'],
    ['IM', 'Inscrição Municipal'],
    ['CNAE', 'CNAE'],
    ['CRT', 'Regime tributário (1=Simples, 2=Simples excesso, 3=Normal)'],
  ];

  for (const [chave, label] of campos) {
    let valor = emit[chave];
    if (chave === 'CNPJ' && valor) {
      valor = valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }
    adicionarLinhaGrid('emitGrid', label, valor);
  }
}

export function renderizarDestinatario(dest) {
  limparGrid('destGrid');
  if (!dest) return;

  const campos = [
    ['CNPJ', 'CNPJ'],
    ['CPF', 'CPF'],
    ['xNome', 'Nome/Razão social'],
    ['IE', 'Inscrição Estadual'],
    ['ISUF', 'Inscrição Suframa'],
    ['IM', 'Inscrição Municipal'],
    ['email', 'E-mail'],
  ];

  for (const [chave, label] of campos) {
    let valor = dest[chave];
    if (chave === 'CNPJ' && valor) {
      valor = valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    } else if (chave === 'CPF' && valor) {
      valor = valor.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    }
    adicionarLinhaGrid('destGrid', label, valor);
  }
}

export function renderizarItens(itens) {
  const tbody = document.getElementById('itensBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!itens || itens.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 9;
    td.style.textAlign = 'center';
    td.style.padding = '24px';
    td.textContent = 'Nenhum item encontrado';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  for (const item of itens) {
    const tr = document.createElement('tr');

    const campos = [
      item.nItem,
      item.cProd,
      item.xProd,
      item.NCM,
      item.CFOP,
      item.uCom,
      item.qCom ? formatarValorNumerico(item.qCom) : '—',
      item.vUnCom ? formatarValorMonetario(item.vUnCom) : '—',
      item.vProd ? formatarValorMonetario(item.vProd) : '—',
    ];

    for (let i = 0; i < campos.length; i++) {
      const td = document.createElement('td');
      td.textContent = campos[i];
      if (i >= 6) td.style.textAlign = 'right';
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  }
}

export function renderizarTotais(totais) {
  limparGrid('totaisGrid');
  if (!totais) return;

  const campos = [
    ['vBC', 'BC ICMS'],
    ['vICMS', 'Valor ICMS'],
    ['vBCST', 'BC ICMS ST'],
    ['vST', 'Valor ICMS ST'],
    ['vProd', 'Valor total dos produtos'],
    ['vFrete', 'Valor do frete'],
    ['vSeg', 'Valor do seguro'],
    ['vDesc', 'Valor do desconto'],
    ['vII', 'Valor II'],
    ['vIPI', 'Valor IPI'],
    ['vPIS', 'Valor PIS'],
    ['vCOFINS', 'Valor COFINS'],
    ['vOutro', 'Outras despesas'],
    ['vNF', 'Valor total da NF-e'],
    ['vTotTrib', 'Valor total aproximado de tributos'],
  ];

  for (const [chave, label] of campos) {
    adicionarLinhaGrid('totaisGrid', label, formatarValorMonetario(totais[chave]));
  }
}

export function renderizarAlertas(alertas, divergencias) {
  const lista = document.getElementById('alertasLista');
  const semAlertas = document.getElementById('semAlertas');
  const tabAlertas = document.getElementById('tab-alertas');

  if (!lista) return;

  lista.innerHTML = '';

  const todosAlertas = [];

  if (alertas && alertas.length > 0) {
    for (const aviso of alertas) {
      todosAlertas.push({ tipo: 'aviso', mensagem: aviso });
    }
  }

  if (divergencias && divergencias.length > 0) {
    for (const div of divergencias) {
      todosAlertas.push({
        tipo: 'erro',
        campo: div.campo,
        esperado: div.esperado,
        encontrado: div.encontrado,
      });
    }
  }

  if (todosAlertas.length === 0) {
    if (semAlertas) semAlertas.hidden = false;
    if (tabAlertas) tabAlertas.classList.remove('tem-alertas');
    return;
  }

  if (semAlertas) semAlertas.hidden = true;
  if (tabAlertas) tabAlertas.classList.add('tem-alertas');

  for (const alerta of todosAlertas) {
    const li = document.createElement('li');
    li.className = `alerta ${alerta.tipo}`;

    if (alerta.tipo === 'aviso') {
      const span = document.createElement('span');
      span.className = 'alerta-campo';
      span.textContent = alerta.mensagem;
      li.appendChild(span);
    } else {
      const campo = document.createElement('span');
      campo.className = 'alerta-campo';
      campo.textContent = `Divergência em ${alerta.campo}`;
      li.appendChild(campo);

      const valores = document.createElement('span');
      valores.className = 'alerta-valores';
      const esp = alerta.esperado !== null && alerta.esperado !== undefined ? `Esperado: ${alerta.esperado}` : 'Esperado: —';
      const enc = alerta.encontrado !== null && alerta.encontrado !== undefined ? `Encontrado: ${alerta.encontrado}` : 'Encontrado: —';
      valores.textContent = `${esp} | ${enc}`;
      li.appendChild(valores);
    }

    lista.appendChild(li);
  }
}

export function mostrarResultados() {
  document.getElementById('results').hidden = false;
  document.getElementById('errorState').hidden = true;
  document.getElementById('uploadArea').style.display = 'none';
}

export function mostrarErro(mensagem) {
  document.getElementById('results').hidden = true;
  document.getElementById('uploadArea').style.display = 'block';
  const errorState = document.getElementById('errorState');
  errorState.hidden = false;
  document.getElementById('errorMessage').textContent = mensagem;
}

export function resetarInterface() {
  document.getElementById('results').hidden = true;
  document.getElementById('errorState').hidden = true;
  document.getElementById('uploadArea').style.display = 'block';
  document.getElementById('fileInput').value = '';
}