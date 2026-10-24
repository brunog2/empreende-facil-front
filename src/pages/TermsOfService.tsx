import { PublicArticle } from "@/components/PublicArticle";

export default function TermsOfService() {
  return (
    <PublicArticle
      title="Termos de uso"
      intro="Estes termos descrevem as regras para usar o Gestão Pro. Ao criar uma conta ou entrar na plataforma, você concorda com eles."
      sections={[
        {
          title: "A conta é sua",
          paragraphs: [
            "Você informa dados verdadeiros no cadastro e mantém a senha em sigilo. Tudo o que acontecer com o seu acesso é de sua responsabilidade, inclusive registros feitos por quem usar a sua conta.",
          ],
        },
        {
          title: "O que a plataforma faz",
          paragraphs: [
            "O Gestão Pro ajuda a organizar produtos, estoque, vendas, despesas, clientes e relatórios. Os números de lucro e CMV usam os preços e as quantidades que você lança.",
            "A plataforma não substitui contador, nota fiscal nem obrigação fiscal. Confira os resultados antes de usá-los em decisões ou declarações.",
          ],
        },
        {
          title: "Uso permitido",
          paragraphs: ["Use o serviço para a gestão do seu negócio. Não é permitido:"],
          items: [
            "Acessar a conta de outra pessoa sem autorização.",
            "Tentar quebrar, sobrecarregar ou contornar a segurança.",
            "Publicar conteúdo ilegal ou usar o serviço para fraude.",
          ],
        },
        {
          title: "Planos",
          paragraphs: [
            "Há um plano gratuito e planos pagos, com os limites exibidos na página de planos. Recursos de um plano pago ficam disponíveis enquanto a assinatura estiver ativa.",
          ],
        },
        {
          title: "Seus dados de negócio",
          paragraphs: [
            "Produtos, vendas, clientes e despesas que você cadastra continuam sendo seus. O Gestão Pro os trata para prestar o serviço, conforme a política de privacidade.",
          ],
        },
        {
          title: "Disponibilidade",
          paragraphs: [
            "O serviço é oferecido como está, com esforço razoável de mantê-lo no ar. Pode haver interrupção para manutenção ou por falha de terceiros. Não respondemos por lucro cessante nem por decisão tomada só com base nos relatórios.",
          ],
        },
        {
          title: "Encerramento",
          paragraphs: [
            "Você pode deixar de usar a plataforma quando quiser. Podemos suspender uma conta que viole estes termos ou coloque outras pessoas em risco.",
          ],
        },
        {
          title: "Mudanças nestes termos",
          paragraphs: [
            "Estes termos podem ser atualizados. A versão publicada nesta página é a que vale, a partir da data indicada no topo.",
          ],
        },
      ]}
    />
  );
}
