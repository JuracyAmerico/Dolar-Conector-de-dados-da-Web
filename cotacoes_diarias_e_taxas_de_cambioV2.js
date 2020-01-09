/*
 * Coleta dados de Dólar comercial (venda e compra) - cotações diárias e Taxas de Câmbio, direto do site do Banco central.
 * Para mais detalhes acesse aqui https://dadosabertos.bcb.gov.br/dataset/dolar-americano-usd-todos-os-boletins-diarios para mais detalhes da documentação da API
 * Mais detalhes sobre o Tableau Web Data Connector acesse aqui https://tableau.github.io/webdataconnector/docs/
 * 
 * @Autor Juracy Americo <jamerico@tableau.com>
 */


(function() {
    // Criando o objeto da conexão
    var myConnector = tableau.makeConnector();

    // Definição do esquema
    myConnector.getSchema = function(schemaCallback) {
        var cols = [
            {id:"cotacaoCompra", alias: "cotacaoCompra", dataType: tableau.dataTypeEnum.float},
            {id:"cotacaoVenda", alias: "cotacaoVenda", dataType: tableau.dataTypeEnum.float},
            {id:"dataHoraCotacao", alias: "dataHoraCotacao", dataType: tableau.dataTypeEnum.datetime}
        ];

        var tableSchema = {
            id: "cotacoes_diarias_e_taxas_de_cambio",
            alias: "Dólar comercial (venda e compra) - cotações diárias e Taxas de Câmbio",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    // Download dos dados
    myConnector.getData = function(table, doneCallback) {
        var dateObj = JSON.parse(tableau.connectionData),
            dateString = "?@dataInicial='" + dateObj.dataInicial + "'&@dataFinalCotacao='" + dateObj.dataFinalCotacao, // teste do texto resultante da variavel dateString - ?@dataInicial=01-01-2000&@dataFinalCotacao=01-29-2000
            chamarAPI = "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)" + dateString + "'&$top=10000&$format=json&$select=cotacaoCompra,cotacaoVenda,dataHoraCotacao";
            //chamarAPI = "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@dataInicial='01-01-2000'&@dataFinalCotacao='01-31-2000'&$top=10000&$format=json&$select=cotacaoCompra,cotacaoVenda,dataHoraCotacao"
            //ajudou a encontrar o erro --> alert(dateString)

        $.getJSON(chamarAPI, function(resp) {
             var feat = resp.value,
             tableData = [];
 
         // Interagindo no objeto JSON
         for (var i = 0, len = feat.length; i < len; i++) {
             tableData.push({
                 "cotacaoCompra": feat[i].cotacaoCompra,
                 "cotacaoVenda": feat[i].cotacaoVenda,
                 "dataHoraCotacao": feat[i].dataHoraCotacao
             });
         }
        table.appendRows(tableData);
        doneCallback();
    });
    };

    tableau.registerConnector(myConnector);

    // Criação do evento que fica escutando quando o usuário submete o formulário
    $(document).ready(function() {
        $("#submitButton").click(function() {
            var dateObj = {
                dataInicial: $('#dataInicial').val().trim(),
                dataFinalCotacao: $('#dataFinalCotacao').val().trim(),
            };

            // Validação simples da data: Chama a função getDate do objeto data criado
            function isValidDate(dateStr) {
                var d = new Date(dateStr);
                return !isNaN(d.getDate());
            }

            if (isValidDate(dateObj.dataInicial) && isValidDate(dateObj.dataFinalCotacao)) {
                tableau.connectionData = JSON.stringify(dateObj); // Usa essa variavel para passar a data para as funções getSchema e getData
                tableau.connectionName = "Dólar comercial (venda e compra) - cotações diárias e Taxas de Câmbio"; // Este texto vai ser o nome na fonte de dados no Tableau
                tableau.submit(); // Este comando envia o objeto conexão criado no inicio para o Tableau
            } else {
                $('#errorMsg').html("Digite uma data valida. Com por exemplo 01-31-2000 mm-dd-yyyy.");
            }
        });
    });
})();
