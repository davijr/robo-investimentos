
# A ÚNICA COISA
[ ] Bug na linha 103 da classe OrderService


[ ] BUGs
  [ ] Dinheiro tá sumindo.
  [ ] Saldo da carteira ñ tá atualizando rápido.
  [ ] BUG: Robô não para quando pede pra parar.
[ ] Buscar informação da ORDER até que o status seja FILLED






# ÚLTIMAS MUDANÇAS

[x] Melhorar tela de oportunidades no front-end
[x] Criar validação de preço e quantidade antes de efetuar a transação.
  [x] Identificar local exato da validação
  [x] Implementar o método
[x] Persistir as ordens junto com a Oportunidade: order1, order2, order3
  [x] Criar campos no Schema
  [x] Fazer o executeStrategy receber via parâmetro
  [x] Persistir as ordens
  [x] Persistir o status de sucesso
  [x] Persistir os erros
[x] Carregar dados atualizados do servidor da Binance (exchangeinfo) e guardar/atualizar na base local. (No prazo de 1 hora, atualizar).


# BACKLOG
[ ] Separar o robô na parte que executa as operações
  [ ] O robô deve: aguardar uma requisição POST com os parâmetros da oportunidade
  [ ] Deve executar as 3 operações.
  [ ] Deve persistir ao final a oportunidade recebida, com seu respectivo status.
  [ ] Deve retornar com o status dele próprio.

[ ] Sanar todas as questões abaixo: Dúvidas que eu preciso resolver para avançar com o robô: 
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

