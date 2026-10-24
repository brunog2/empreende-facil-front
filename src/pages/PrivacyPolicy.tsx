import { PublicArticle } from "@/components/PublicArticle";

export default function PrivacyPolicy() {
  return (
    <PublicArticle
      title="Política de privacidade"
      intro="Esta política explica quais dados o Gestão Pro trata, para que servem e quais escolhas você tem sobre eles."
      sections={[
        {
          title: "Quem trata os dados",
          paragraphs: [
            "O Gestão Pro é a plataforma de gestão para pequenos negócios. Os dados da sua conta e do seu negócio são tratados para prestar o serviço que você contratou.",
          ],
        },
        {
          title: "Dados que coletamos",
          paragraphs: ["Coletamos apenas o que é necessário para a conta funcionar e para a gestão do negócio."],
          items: [
            "Cadastro: nome, e-mail e senha.",
            "Perfil: nome do negócio e telefone, quando você informa.",
            "Operação: produtos, estoque, vendas, despesas, clientes, categorias e relatórios gerados a partir desses registros.",
            "Uso técnico: registros de acesso necessários para segurança e funcionamento da conta.",
          ],
        },
        {
          title: "Para que usamos",
          paragraphs: ["Usamos esses dados para entregar o serviço e mantê-lo seguro."],
          items: [
            "Criar e autenticar a sua conta.",
            "Registrar vendas, estoque, despesas e clientes.",
            "Calcular totais, CMV e lucro dos produtos.",
            "Enviar avisos sobre a conta, o plano e a segurança.",
            "Cumprir obrigações legais quando houver.",
          ],
        },
        {
          title: "Com quem compartilhamos",
          paragraphs: [
            "Não vendemos dados pessoais. O compartilhamento acontece só com quem ajuda a operar a plataforma, como hospedagem e meio de pagamento, ou quando a lei exigir.",
            "Os dados do seu negócio ficam vinculados à sua conta e não são misturados com os de outros clientes.",
          ],
        },
        {
          title: "Por quanto tempo guardamos",
          paragraphs: [
            "Mantemos os dados enquanto a conta existir e pelo período necessário para cumprir obrigações legais, resolver disputas e proteger o serviço. Quando a conta é encerrada, os dados são eliminados ou anonimizados, salvo o que a lei mandar conservar.",
          ],
        },
        {
          title: "Seus direitos",
          paragraphs: ["Você pode pedir, a qualquer momento:"],
          items: [
            "Confirmação e acesso aos dados da conta.",
            "Correção de informações incompletas ou desatualizadas.",
            "Exclusão dos dados, quando a lei permitir.",
            "Informação sobre com quem os dados foram compartilhados.",
          ],
        },
        {
          title: "Segurança",
          paragraphs: [
            "A senha é armazenada de forma protegida e o acesso à conta usa sessão autenticada. Nenhuma medida elimina todo risco: use uma senha forte e não compartilhe o acesso.",
          ],
        },
        {
          title: "Cookies",
          paragraphs: [
            "Usamos armazenamento local do navegador para manter a sessão autenticada e lembrar preferências da interface. Não usamos isso para vender publicidade.",
          ],
        },
        {
          title: "Atualizações e contato",
          paragraphs: [
            "Se esta política mudar de forma relevante, a nova versão passa a valer a partir da data publicada nesta página.",
            "Para exercer um direito ou tirar dúvida sobre privacidade, use os canais oficiais do Gestão Pro indicados na plataforma.",
          ],
        },
      ]}
    />
  );
}
