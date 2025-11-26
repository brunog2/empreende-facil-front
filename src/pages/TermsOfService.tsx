import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold">Termos de Uso</h1>
        <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Aceitação dos Termos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Ao acessar e usar esta plataforma, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Uso da Plataforma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            A plataforma é destinada ao gerenciamento de negócios, incluindo controle de produtos, vendas, despesas e clientes.
          </p>
          <p className="text-muted-foreground">
            Você é responsável por manter a confidencialidade de sua conta e senha, e por todas as atividades que ocorrem sob sua conta.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Dados e Privacidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Todos os dados fornecidos são de sua responsabilidade. A plataforma se compromete a proteger suas informações conforme nossa Política de Privacidade.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Responsabilidades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Você é responsável por:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Fornecer informações precisas e atualizadas</li>
            <li>Manter a segurança de sua conta</li>
            <li>Usar a plataforma de forma legal e ética</li>
            <li>Não compartilhar suas credenciais de acesso</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Limitação de Responsabilidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            A plataforma é fornecida "como está", sem garantias de qualquer tipo. Não nos responsabilizamos por perdas ou danos decorrentes do uso da plataforma.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Modificações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Para questões sobre estes termos, entre em contato através dos canais de suporte disponíveis na plataforma.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


