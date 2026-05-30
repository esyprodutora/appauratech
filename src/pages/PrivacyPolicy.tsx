export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F8FAFC]">
      <div className="mx-auto max-w-3xl px-5 py-16">
        <div className="mb-10">
          <a href="/" className="text-[#6366F1] text-sm hover:underline">← Voltar</a>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Política de Privacidade</h1>
        <p className="mt-2 text-[#94A3B8] text-sm">Última atualização: 29 de maio de 2026</p>

        <div className="mt-10 space-y-8 text-[#CBD5E1] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Quem somos</h2>
            <p>O AURA é um serviço de qualificação de tráfego server-side operado pela <strong className="text-white">ESY PRODUTORA LTDA</strong>, inscrita no CNPJ sob o nº 37.483.733/0001-34. Para dúvidas sobre esta política, entre em contato pelo e-mail <a href="mailto:contato.esyprodutora@gmail.com" className="text-[#6366F1] hover:underline">contato.esyprodutora@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Dados que coletamos</h2>
            <p>Coletamos apenas os dados necessários para a prestação do serviço:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><strong className="text-white">Dados de cadastro:</strong> nome e e-mail fornecidos no momento do registro.</li>
              <li><strong className="text-white">Dados de navegação dos visitantes dos seus sites:</strong> comportamento anônimo (scroll, tempo na página, cliques). Nunca coletamos nome, CPF ou dados pessoais dos visitantes sem consentimento explícito.</li>
              <li><strong className="text-white">Dados de pagamento:</strong> processados diretamente pelo Stripe. Não armazenamos dados de cartão.</li>
              <li><strong className="text-white">Hashes de e-mail e telefone:</strong> aplicamos SHA-256 irreversível antes de qualquer envio às plataformas de anúncios. Nenhum dado pessoal trafega em claro.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Como usamos os dados</h2>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Prestação do serviço de qualificação de tráfego e envio de eventos às plataformas de anúncios.</li>
              <li>Comunicações relacionadas à sua conta (confirmação de cadastro, avisos de cobrança).</li>
              <li>Melhoria contínua do produto.</li>
            </ul>
            <p className="mt-3">Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins publicitários.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Base legal (LGPD)</h2>
            <p>O tratamento de dados é realizado com base no <strong className="text-white">contrato</strong> firmado no momento da assinatura do plano e no <strong className="text-white">legítimo interesse</strong> para melhoria do serviço, nos termos da Lei nº 13.709/2018 (LGPD).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Retenção de dados</h2>
            <p>Sessões de visitantes são retidas por até 7 dias. Dados de conta são mantidos enquanto a assinatura estiver ativa e por até 30 dias após o cancelamento, para fins de recuperação.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Seus direitos</h2>
            <p>Conforme a LGPD, você tem direito a:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Acessar, corrigir ou excluir seus dados pessoais.</li>
              <li>Revogar consentimentos anteriormente concedidos.</li>
              <li>Portabilidade dos dados.</li>
            </ul>
            <p className="mt-3">Para exercer esses direitos, envie um e-mail para <a href="mailto:contato.esyprodutora@gmail.com" className="text-[#6366F1] hover:underline">contato.esyprodutora@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Cookies</h2>
            <p>O script do AURA utiliza cookies de sessão para identificar a origem do visitante (fbclid, ttclid, gclid) e calcular o score comportamental. Nenhum cookie de rastreamento pessoal é criado sem que o visitante já tenha interagido com um anúncio da plataforma correspondente.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Alterações</h2>
            <p>Esta política pode ser atualizada periodicamente. Notificaremos por e-mail em caso de alterações relevantes.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
