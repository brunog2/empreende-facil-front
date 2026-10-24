import { PublicArticle } from "@/components/PublicArticle";

export default function UsageGuide() {
  return (
    <PublicArticle
      title="Guia de uso"
      intro="Um caminho curto para começar a vender, controlar o estoque e enxergar o lucro do negócio no Gestão Pro."
      sections={[
        {
          title: "1. Crie a conta",
          paragraphs: [
            "Na tela de entrada, escolha Cadastrar, informe nome, e-mail e uma senha forte. O nome do negócio é opcional e pode ser completado depois no perfil.",
          ],
        },
        {
          title: "2. Cadastre os produtos",
          paragraphs: [
            "Em Produtos, crie cada item com preço de custo, preço de venda e quantidade em estoque. O preço de custo entra no CMV. Se a matéria-prima já foi lançada em Despesas, deixe esse custo de fora e registre só os outros custos do produto.",
          ],
        },
        {
          title: "3. Registre uma venda",
          paragraphs: [
            "Em Vendas, abra Nova Venda. A tela é uma página, sem janela por cima. Escolha o produto, a quantidade e o preço. O resumo no fim mostra o total, o CMV e o lucro dos produtos antes de finalizar.",
            "Se o produto ainda não existe, use Criar novo produto. A venda em andamento fica guardada e volta preenchida quando o cadastro termina.",
          ],
        },
        {
          title: "4. Lance as despesas",
          paragraphs: [
            "Em Despesas, registre o que o negócio gastou. Uma despesa recorrente passa a contar a partir da data em que foi cadastrada, sempre com o valor atual, nos filtros da dashboard e dos relatórios.",
          ],
        },
        {
          title: "5. Organize clientes e categorias",
          paragraphs: [
            "Clientes podem ser ligados a uma venda, mas a venda também pode ficar sem cliente. Categorias ajudam a agrupar os produtos.",
          ],
        },
        {
          title: "6. Acompanhe o resultado",
          paragraphs: [
            "A dashboard e os relatórios separam o lucro dos produtos (vendas menos CMV) do resultado da operação (vendas menos despesas e CMV). Use o filtro de datas para ver um período, inclusive as recorrências futuras.",
          ],
        },
      ]}
    />
  );
}
