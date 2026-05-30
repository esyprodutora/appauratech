export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F8FAFC]">
      <div className="mx-auto max-w-3xl px-5 py-16">
        <div className="mb-10">
          <a href="/" className="text-[#6366F1] text-sm hover:underline">← Voltar</a>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Termos de Uso</h1>
        <p className="mt-2 text-[#94A3B8] text-sm">Última atualização: 29 de maio de 2026</p>

        <div className="mt-10 space-y-8 text-[#CBD5E1] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Aceitação</h2>
            <p>Ao criar uma conta no AURA, você concorda com estes Termos de Uso. O serviço é operado pela <strong className="text-white">ESY PRODUTORA LTDA</strong>, CNPJ 37.483.733/0001-34. Caso não concorde, não utilize o serviço.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. O serviço</h2>
            <p>O AURA é uma plataforma SaaS de qualificação de tráfego server-side que monitora o comportamento de visitantes, calcula um score de intenção e envia eventos qualificados às APIs de conversão de plataformas de anúncios (Meta, TikTok, Google, Kwai).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibent text-white mb-3">3. Planos e pagamento</h2>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Os planos são cobrados mensalmente via cartão de crédito processado pelo Stripe.</li>
              <li>Não há fidelidade mínima — você pode cancelar a qualquer momento.</li>
              <li>O cancelamento encerra a cobrança no próximo ciclo. Não há reembolso proporcional do período em curso.</li>
              <li>Em caso de inadimplência, o acesso será suspenso após 7 dias de atraso.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Uso aceitável</h2>
            <p>Você concorda em não utilizar o AURA para:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Violar políticas das plataformas de anúncios (Meta, TikTok, Google, Kwai).</li>
              <li>Coletar dados pessoais sem o consentimento dos titulares.</li>
              <li>Realizar cloaking ou qualquer prática proibida pelas plataformas.</li>
              <li>Revender ou sublicenciar o serviço sem autorização expressa.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Disponibilidade</h2>
            <p>Nos esforçamos para manter o serviço disponível 24/7, mas não garantimos disponibilidade ininterrupta. Manutenções programadas serão comunicadas com antecedência. Não nos responsabilizamos por perdas decorrentes de indisponibilidade temporária.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Propriedade intelectual</h2>
            <p>Todo o código, design e documentação do AURA são de propriedade da ESY PRODUTORA LTDA. O uso do serviço não transfere nenhum direito de propriedade intelectual ao usuário.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Limitação de responsabilidade</h2>
            <p>O AURA não se responsabiliza por resultados de campanhas publicitárias, decisões tomadas com base nos dados da plataforma, ou por alterações nas APIs das plataformas de anúncios que afetem o funcionamento do serviço.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Rescisão</h2>
            <p>Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos, sem aviso prévio em casos graves. Em situações comuns, notificaremos por e-mail com 7 dias de antecedência.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Foro e legislação</h2>
            <p>Estes termos são regidos pela legislação brasileira. Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer controvérsias.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Contato</h2>
            <p>Dúvidas sobre estes termos: <a href="mailto:contato.esyprodutora@gmail.com" className="text-[#6366F1] hover:underline">contato.esyprodutora@gmail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
