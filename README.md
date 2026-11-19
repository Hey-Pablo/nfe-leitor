# Leitor e Validador de NF-e

> **Status: em desenvolvimento.** O código entra aos poucos; abaixo está o planejamento do projeto.

## O que é

Página que recebe o XML de uma NF-e (modelo 55) e mostra emitente, destinatário, itens, impostos e totais em formato legível. Valida a chave de acesso e aponta divergências entre itens e totais. Tudo roda no navegador: nenhum arquivo sai da máquina do usuário.

## O que prova

JavaScript sem framework (File API, DOMParser, manipulação do DOM), implementação de algoritmo (dígito verificador) e domínio fiscal.

## Stack

HTML5, CSS3 e JavaScript com módulos ES. Testes com o executor nativo do Node (`node --test`). Publicação no GitHub Pages.

## Estrutura

```
nfe-leitor/
├─ index.html
├─ css/estilo.css
├─ js/
│  ├─ main.js        # upload, arrastar e soltar, orquestração
│  ├─ parser.js      # XML → objeto (ide, emit, dest, itens, totais, protocolo)
│  ├─ validador.js   # chave de acesso, CNPJ, somas
│  └─ render.js      # monta cabeçalho, tabelas e alertas
├─ exemplos/         # XMLs fictícios: válido, total divergente, chave inválida
├─ tests/validador.test.js
└─ README.md
```

## Plano

1. Crie o repositório e três XMLs fictícios seguindo o leiaute público da NF-e (grupo `infNFe` com `ide`, `emit`, `dest`, `det` e `total`).
2. Leitura do arquivo com `input type="file"`, área de arrastar e soltar e `FileReader`.
3. Parser com `DOMParser` no modo `application/xml`. Use `getElementsByTagName`, que encontra as tags mesmo com o namespace padrão do XML da NF-e.
4. Validador da chave (44 dígitos, no atributo `Id` de `infNFe`, depois do prefixo `NFe`): módulo 11 com pesos de 2 a 9 da direita para a esquerda. Resto 0 ou 1 gera dígito 0; nos demais casos, o dígito é 11 menos o resto.
5. Validações de consistência: soma de `vProd` dos itens igual a `ICMSTot/vProd`, contagem de itens e CNPJ do emitente com dígitos válidos.
6. Testes do validador com casos certos e errados.
7. Renderização: cabeçalho da nota, partes, tabela de itens (código, descrição, NCM, CFOP, quantidade, valor), totais e impostos.
8. Estados de erro: arquivo que não é XML, XML que não é NF-e, nota sem protocolo.
9. Responsividade, contraste e navegação por teclado.
10. Publicação no GitHub Pages e README com GIF.

## Como deve funcionar

- O usuário arrasta um XML e vê a nota organizada em menos de 1 segundo.
- Um selo indica chave válida ou inválida, e um botão copia a chave.
- Divergências aparecem em lista de alertas com o valor esperado e o encontrado.
- Arquivo inválido gera mensagem clara, sem travar a página.
- Nenhuma requisição de rede leva o conteúdo do arquivo.

## Prazo

3 a 4 dias.

## Autor

Pablo Dilio · [Portfólio](https://hey-pablo.github.io/pablo-dilio-portfolio/) · [LinkedIn](https://www.linkedin.com/in/pablo-dilio-4063991b2)
