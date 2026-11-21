import { extrairChaveDoId } from './validador.js';

/** ErroNFe(codigo: string, mensagem: string): erro tipado de leitura XML ou documento não NF-e. */
export class ErroNFe extends Error {
  constructor(codigo, mensagem) { super(mensagem); this.name = 'ErroNFe'; this.codigo = codigo; }
}

const primeiro = (no, tag) => no?.getElementsByTagName(tag)[0] ?? null;
const campos = (no) => {
  const resultado = {};
  if (!no) return resultado;
  for (let filho = no.firstChild; filho; filho = filho.nextSibling) {
    if (filho.nodeType !== 1) continue;
    resultado[filho.tagName] = filho.textContent.trim();
  }
  return resultado;
};

/**
 * parsearNFe(xml: string, parser?: DOMParser): objeto da nota.
 * Retorna {ide, emit, dest, itens: [{...prod, nItem}], totais, protocolo: object|null,
 * chave: string|null, avisos: string[]}. Campos XML são strings; grupos ausentes são {}.
 * Lança ErroNFe com codigo XML_INVALIDO ou NAO_E_NFE.
 */
export function parsearNFe(xml, parser = new DOMParser()) {
  if (typeof xml !== 'string' || !xml.trim().startsWith('<')) throw new ErroNFe('XML_INVALIDO', 'O arquivo não é um XML válido.');
  let documento;
  try { documento = parser.parseFromString(xml, 'application/xml'); }
  catch { throw new ErroNFe('XML_INVALIDO', 'O arquivo não é um XML válido.'); }
  if (!documento?.documentElement || documento.getElementsByTagName('parsererror').length) throw new ErroNFe('XML_INVALIDO', 'O arquivo não é um XML válido.');
  const inf = primeiro(documento, 'infNFe');
  if (!inf) throw new ErroNFe('NAO_E_NFE', 'O XML não contém uma NF-e.');
  const protocolo = primeiro(documento, 'infProt');
  return {
    ide: campos(primeiro(inf, 'ide')),
    emit: campos(primeiro(inf, 'emit')),
    dest: campos(primeiro(inf, 'dest')),
    itens: Array.from(inf.getElementsByTagName('det'), det => ({ ...campos(primeiro(det, 'prod')), nItem: det.getAttribute('nItem') })),
    totais: campos(primeiro(inf, 'ICMSTot')),
    protocolo: protocolo ? campos(protocolo) : null,
    chave: extrairChaveDoId(inf.getAttribute('Id')),
    avisos: protocolo ? [] : ['Nota sem protocolo.'],
  };
}
