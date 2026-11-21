# Leitor e Validador de NF-e

> **Status: em desenvolvimento.** O núcleo de leitura e validação está disponível; a interface e a publicação ainda serão implementadas.

## Problema e solução

XMLs de NF-e são difíceis de conferir manualmente. O projeto transforma os dados da nota em objetos e verifica chave de acesso, CNPJ e soma dos produtos. A interface planejada executará a leitura no navegador, sem enviar arquivos a um servidor. Os exemplos são fictícios e não representam notas fiscais reais.

## Como executar os testes

Requisitos: Node.js e npm. Na raiz do projeto:

```sh
npm ci
npm test
```

Para recriar os três exemplos fictícios e calcular seus dígitos verificadores:

```sh
node tools/gerar-exemplos.js
```

O núcleo usa módulos ES e `DOMParser` do navegador. Nos testes, `@xmldom/xmldom` fornece o parser por injeção; não é dependência de execução no navegador.

## Estrutura

- `js/parser.js`: leitura XML e extração de dados, com erros tipados e aviso de protocolo ausente.
- `js/validador.js`: funções puras para chave, CNPJ, soma em centavos e contagem opcional de itens.
- `exemplos/`: notas fictícias válida, com total divergente e com chave inválida.
- `tools/gerar-exemplos.js`: gera os exemplos e seus dígitos verificadores.
- `tests/`: testes com o executor nativo do Node.

## Decisões e limitações

O parser retorna valores do XML como strings, preservando a representação original. A validação de soma compara valores arredondados para centavos; a contagem compara o número de itens com um valor informado pelo chamador, quando disponível. Erros de XML e de documento sem `infNFe` têm códigos distintos; ausência de protocolo é aviso. O núcleo não valida assinatura digital, esquema XSD, autorização fiscal nem todos os campos ou regras tributárias. CNPJs com dígitos válidos não comprovam existência ou situação cadastral. Os exemplos ilustram os grupos usados pelo núcleo e não são documentos aptos à transmissão fiscal.

A interface, acessibilidade, demonstração e publicação no GitHub Pages são próximos passos. O desenvolvimento usa IA como apoio à programação e revisão; o código e os testes devem ser compreendidos e revisados pelo autor.

## Autor

Pablo Dilio · [Portfólio](https://hey-pablo.github.io/pablo-dilio-portfolio/) · [LinkedIn](https://www.linkedin.com/in/pablo-dilio-4063991b2)
