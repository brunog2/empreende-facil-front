import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold">Política de Privacidade</h1>
        <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Informações Coletadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Coletamos as seguintes informações:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Dados de cadastro (nome, email, senha)</li>
            <li>Informações do perfil (nome completo, nome do negócio, telefone)</li>
            <li>Dados de negócio (produtos, vendas, despesas, clientes)</li>
            <li>Informações de uso da plataforma</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Como Usamos Suas Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Utilizamos suas informações para:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Fornecer e melhorar nossos serviços</li>
            <li>Processar transações e gerenciar sua conta</li>
            <li>Enviar notificações importantes sobre o serviço</li>
            <li>Garantir a segurança da plataforma</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Proteção de Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Compartilhamento de Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Não vendemos, trocamos ou transferimos suas informações pessoais para terceiros, exceto quando necessário para fornecer nossos serviços ou quando exigido por lei.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Seus Direitos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Você tem o direito de:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir informações incorretas</li>
            <li>Solicitar a exclusão de seus dados</li>
            <li>Exportar seus dados</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Cookies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso da plataforma e personalizar conteúdo.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Alterações nesta Política</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas através da plataforma ou por email.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Para questões sobre privacidade ou para exercer seus direitos, entre em contato através dos canais de suporte disponíveis na plataforma.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


