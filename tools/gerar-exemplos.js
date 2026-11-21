import { writeFileSync } from 'node:fs';
const dvCnpj = base => {
  const calcular = (s, pesos) => { const r = [...s].reduce((a, d, i) => a + Number(d) * pesos[i], 0) % 11; return r < 2 ? 0 : 11 - r; };
  const primeiro = calcular(base, [5,4,3,2,9,8,7,6,5,4,3,2]);
  return base + primeiro + calcular(base + primeiro, [6,5,4,3,2,9,8,7,6,5,4,3,2]);
};
const cnpj = dvCnpj('123456780001');
const destino = dvCnpj('987654320001');
const base = '352601' + cnpj + '55001000000001100000001';
let soma = 0;
for (let i = base.length - 1, peso = 2; i >= 0; i--, peso = peso === 9 ? 2 : peso + 1) soma += Number(base[i]) * peso;
const resto = soma % 11;
const chave = base + (resto < 2 ? 0 : 11 - resto);
for (const [arquivo, id, total] of [['valido', chave, '30.00'], ['total-divergente', chave, '31.00'], ['chave-invalida', chave.slice(0, 43) + ((Number(chave[43]) + 1) % 10), '30.00']]) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00"><NFe><infNFe Id="NFe${id}" versao="4.00">
<ide><cUF>35</cUF><mod>55</mod><serie>1</serie><nNF>1</nNF><dhEmi>2026-01-01T12:00:00-03:00</dhEmi></ide>
<emit><CNPJ>${cnpj}</CNPJ><xNome>Empresa Fictícia Exemplo</xNome></emit><dest><CNPJ>${destino}</CNPJ><xNome>Destinatário Fictício Exemplo</xNome></dest>
<det nItem="1"><prod><cProd>001</cProd><xProd>Produto fictício A</xProd><NCM>00000000</NCM><CFOP>5102</CFOP><qCom>1.0000</qCom><vUnCom>10.00</vUnCom><vProd>10.00</vProd></prod></det>
<det nItem="2"><prod><cProd>002</cProd><xProd>Produto fictício B</xProd><NCM>00000000</NCM><CFOP>5102</CFOP><qCom>1.0000</qCom><vUnCom>20.00</vUnCom><vProd>20.00</vProd></prod></det>
<total><ICMSTot><vProd>${total}</vProd><vNF>${total}</vNF></ICMSTot></total></infNFe></NFe><protNFe versao="4.00"><infProt><chNFe>${id}</chNFe><nProt>135260000000001</nProt><cStat>100</cStat></infProt></protNFe></nfeProc>\n`;
  writeFileSync(new URL(`../exemplos/${arquivo}.xml`, import.meta.url), xml);
}
console.log(chave);
