
A ÚNICA COISA:
1. Carregar dados atualizados do servidor da Binance (exchangeinfo) e guardar/atualizar na base local. (No prazo de 1 hora, atualizar). - OK
2. 



Dúvidas que eu preciso resolver para avançar com o robô: 
1. Como não ser bloqueado? 
  a. Evitar chamar api via REST: https://testnet.binance.vision/api/v3/exchangeInfo
  b. Pesquisar se tem algum web service pra isso.
  c. Caso não tenha, guardar uma vez esses dados e usar local.
2. Quais os serviços que eu posso usar o web socket da Binance?
3. Quais serviços eu devo consultar sempre?
4. Quais consultas eu devo guardar em cache? << ExchangeInfo >>
5. Quais dados eu preciso persistir?
6. O algoritmo da triangulação já está pronto?
    1. Pegar os pares >> OK
    2. 
7. Onde eu devo implementar as regras de negociação?
8. Existe uma forma de garantir a unicidade e atomicidade da negociação tripla?
9. Quais são todas as regras que eu preciso conhecer e aplicar? 
10. Como faço para ligar e desligar o robô?
11. Preciso de um painel completão?! NÃO! 
12. É possível testar tudo no ambiente de teste da Binance?
13. Qual serviço vou usar para manter meu robô ativo e online? Com opção liga/desliga. Nuvem? Dica de Gabriel?
14. A latência é importante?

