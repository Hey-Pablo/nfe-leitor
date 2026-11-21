/** validarChave(chave: string): boolean — valida os 44 dígitos e o DV da chave. */
export function validarChave(chave) {
  if (typeof chave !== 'string' || !/^\d{44}$/.test(chave)) return false;
  let soma = 0;
  for (let i = 42, peso = 2; i >= 0; i--, peso = peso === 9 ? 2 : peso + 1) soma += Number(chave[i]) * peso;
  const resto = soma % 11;
  return Number(chave[43]) === (resto < 2 ? 0 : 11 - resto);
}

/** extrairChaveDoId(id: string): string|null — extrai a chave de um Id NF-e bem formado. */
export function extrairChaveDoId(id) {
  return typeof id === 'string' && /^NFe\d{44}$/.test(id) ? id.slice(3) : null;
}

/** validarCnpj(cnpj: string): boolean — valida os dois dígitos verificadores. */
export function validarCnpj(cnpj) {
  if (typeof cnpj !== 'string' || !/^\d{14}$/.test(cnpj) || /^(\d)\1{13}$/.test(cnpj)) return false;
  const dv = (base, pesos) => {
    const resto = [...base].reduce((soma, digito, i) => soma + Number(digito) * pesos[i], 0) % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return dv(cnpj.slice(0, 12), [5,4,3,2,9,8,7,6,5,4,3,2]) === Number(cnpj[12]) &&
    dv(cnpj.slice(0, 13), [6,5,4,3,2,9,8,7,6,5,4,3,2]) === Number(cnpj[13]);
}

/** validarSomas(itens: object[], totais: object, quantidadeItens?: number): {campo, esperado, encontrado}[] — compara centavos e contagem declarada opcional. */
export function validarSomas(itens, totais, quantidadeItens = itens.length) {
  const centavos = valor => Math.round(Number(valor) * 100);
  const soma = itens.reduce((total, item) => total + centavos(item.vProd), 0);
  const declarado = centavos(totais.vProd);
  const divergencias = [];
  if (!Number.isFinite(soma) || !Number.isFinite(declarado) || soma !== declarado) divergencias.push({ campo: 'vProd', esperado: Number.isFinite(soma) ? (soma / 100).toFixed(2) : null, encontrado: totais.vProd });
  if (itens.length !== quantidadeItens) divergencias.push({ campo: 'quantidadeItens', esperado: itens.length, encontrado: quantidadeItens });
  return divergencias;
}
