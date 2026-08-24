"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

type FormState = {
  nome: string; idade: string; cidade: string; objetivo: string; prazo: string; familia: string;
  familiarUe: string; parentescoUe: string; descendente: string; antepassado: string; documentosDescendencia: string;
  oferta: string; setor: string; grupoItaliano: string; mesesEmpresa: string; profissao: string; formacao: string;
  anosExperiencia: string; profissaoRegulamentada: string; italiano: string; salario: string;
  remoto: string; vinculoRemoto: string; rendaRemota: string; mesesRemoto: string; qualificacaoAlta: string;
  estudo: string; aceiteEstudo: string; empreender: string; startupInovadora: string; capital: string;
  rendaPassiva: string; observacoes: string;
};

type Route = {
  key: string;
  title: string;
  status: "Rota principal" | "Alternativa possível" | "Depende de requisito";
  score: number;
  reason: string;
  next: string[];
};

const initial: FormState = {
  nome: "", idade: "", cidade: "", objetivo: "Trabalhar e residir na Itália", prazo: "", familia: "nao",
  familiarUe: "nao", parentescoUe: "", descendente: "nao_sei", antepassado: "", documentosDescendencia: "nao_sei",
  oferta: "nao", setor: "", grupoItaliano: "nao", mesesEmpresa: "", profissao: "", formacao: "medio",
  anosExperiencia: "", profissaoRegulamentada: "nao_sei", italiano: "nenhum", salario: "",
  remoto: "nao", vinculoRemoto: "", rendaRemota: "", mesesRemoto: "", qualificacaoAlta: "nao_sei",
  estudo: "talvez", aceiteEstudo: "nao", empreender: "nao", startupInovadora: "nao", capital: "",
  rendaPassiva: "", observacoes: "",
};

const steps = ["Perfil", "Vínculos", "Trabalho", "Alternativas", "Relatório"];
const euro = (value: string) => Number(value.replace(/[^\d.,]/g, "").replace(".", "").replace(",", ".")) || 0;
const num = (value: string) => Number(value) || 0;

function evaluate(f: FormState): Route[] {
  const routes: Route[] = [];
  const exp = num(f.anosExperiencia);
  const high = f.qualificacaoAlta === "sim" || f.formacao === "superior" || f.formacao === "pos" || exp >= 5;

  if (f.familiarUe === "sim") routes.push({
    key: "familia", title: "Residência como familiar de cidadão italiano/UE", status: "Rota principal", score: 100,
    reason: `Há vínculo familiar com cidadão italiano ou europeu${f.parentescoUe ? ` (${f.parentescoUe})` : ""}. Essa via pode permitir residência e trabalho sem disputar quotas do Decreto Flussi.`,
    next: ["Confirmar o parentesco abrangido e eventual dependência econômica", "Reunir certidões civis, passaportes e prova de residência do cidadão europeu", "Definir se será entrada conjunta ou reunião familiar"],
  });

  if (f.descendente === "sim" && f.oferta === "sim") routes.push({
    key: "desc", title: "Trabalho subordinado fora das quotas por descendência italiana", status: "Rota principal", score: 96,
    reason: "O cliente informou descendência italiana e oferta de trabalho. Brasileiros descendentes de cidadão italiano podem utilizar o canal de trabalho subordinado fora das quotas, mediante comprovação documental e procedimento do empregador.",
    next: ["Montar a linha de descendência completa", "Auditar certidões e divergências de nomes, datas e locais", "Validar a oferta e orientar o empregador sobre o nulla osta fora das quotas"],
  });

  if (f.descendente === "sim" && f.oferta !== "sim") routes.push({
    key: "desc-potential", title: "Canal fora das quotas por descendência — falta empregador", status: "Depende de requisito", score: 74,
    reason: "A descendência italiana pode facilitar uma futura contratação fora das quotas, mas o procedimento laboral ainda exige uma oferta real e a participação de um empregador na Itália.",
    next: ["Confirmar documentalmente a linha de descendência", "Organizar certidões para comprovação do vínculo italiano", "Buscar uma oferta formal e orientar o empregador sobre o canal específico"],
  });

  if (f.grupoItaliano === "sim" && num(f.mesesEmpresa) >= 12) routes.push({
    key: "ict", title: "Transferência empresarial / ICT", status: f.oferta === "sim" ? "Rota principal" : "Alternativa possível", score: 91,
    reason: "O cliente trabalha há pelo menos 12 meses em empresa italiana ou integrante de grupo com operação italiana, indicando possível transferência fora das quotas.",
    next: ["Confirmar a estrutura societária entre as empresas", "Identificar se a função é de dirigente, especialista ou treinamento", "Solicitar à empresa italiana a documentação do procedimento ICT/art. 27"],
  });

  if (f.remoto === "sim") {
    const income = euro(f.rendaRemota);
    const months = num(f.mesesRemoto);
    const ready = income >= 28500 && months >= 6 && high;
    const missing = [income < 28500 && "renda anual mínima", months < 6 && "experiência mínima de seis meses", !high && "atividade altamente qualificada"].filter(Boolean).join(", ");
    routes.push({
      key: "nomad", title: f.vinculoRemoto === "empregado" ? "Visto de trabalhador remoto" : "Visto de nômade digital",
      status: ready ? "Rota principal" : "Depende de requisito", score: ready ? 94 : 68,
      reason: ready ? "O perfil informado reúne os elementos centrais: trabalho remoto, renda indicativa suficiente, experiência mínima e qualificação profissional." : `A atividade remota pode gerar uma rota, mas ainda precisa comprovar: ${missing}.`,
      next: ["Validar a qualificação profissional e a atividade exercida", "Conferir renda, contrato/clientes, seguro-saúde e alojamento", "Planejar tributação, previdência e eventual Partita IVA na Itália"],
    });
  }

  if (f.oferta === "sim" && high && euro(f.salario) >= 36300) routes.push({
    key: "blue", title: "Carta Blu UE", status: "Rota principal", score: 92,
    reason: "Há oferta de trabalho, qualificação elevada e remuneração indicativa compatível com a Carta Blu. A remuneração oficial aplicável deverá ser confirmada na data do protocolo.",
    next: ["Validar diploma ou experiência profissional qualificada", "Conferir duração, função e remuneração da oferta", "Orientar o empregador a solicitar o nulla osta no modelo Carta Blu"],
  });

  if (f.oferta === "sim" && ["agricultura", "turismo"].includes(f.setor)) routes.push({
    key: "seasonal", title: "Trabalho sazonal pelo Decreto Flussi", status: "Alternativa possível", score: 82,
    reason: `A oferta está no setor de ${f.setor === "agricultura" ? "agricultura" : "turismo/hotelaria"}, normalmente contemplado pelo fluxo sazonal. Depende de quota, empregador habilitado e nulla osta.`,
    next: ["Confirmar duração e natureza sazonal do contrato", "Verificar disponibilidade da quota e situação do pedido", "Preparar a etapa consular somente após o nulla osta"],
  });

  if (f.oferta === "sim" && f.setor === "assistencia") routes.push({
    key: "care", title: "Assistência familiar ou sociossanitária", status: "Alternativa possível", score: 81,
    reason: "A oferta está no setor de assistência. Pode haver enquadramento nas quotas ordinárias ou no canal adicional fora das quotas para cuidado de pessoas com mais de 80 anos, pessoas com deficiência ou crianças de até seis anos.",
    next: ["Identificar quem receberá a assistência e sua condição", "Confirmar se a contratação será apresentada por agência ou associação patronal habilitada", "Verificar disponibilidade do canal e os requisitos econômicos do contratante"],
  });

  if (f.oferta === "sim" && !routes.some((r) => ["desc", "ict", "blue", "seasonal", "care"].includes(r.key))) routes.push({
    key: "flussi", title: "Trabalho subordinado pelo Decreto Flussi", status: "Depende de requisito", score: 72,
    reason: "Existe oferta de trabalho, porém a contratação ordinária depende da categoria admitida, da quota disponível e do nulla osta solicitado pelo empregador italiano.",
    next: ["Validar o empregador e a proposta contratual", "Identificar a categoria e o setor do Decreto Flussi", "Verificar quota e preparar o pedido de nulla osta"],
  });

  if (f.startupInovadora === "sim") routes.push({
    key: "startup", title: "Italia Startup Visa", status: euro(f.capital) >= 50000 ? "Alternativa possível" : "Depende de requisito", score: euro(f.capital) >= 50000 ? 80 : 57,
    reason: euro(f.capital) >= 50000 ? "O projeto foi indicado como inovador e há capital inicial informado de pelo menos €50 mil." : "O projeto pode ser inovador, mas o capital informado ainda não alcança o parâmetro inicial de €50 mil.",
    next: ["Validar se o negócio atende aos critérios legais de startup inovadora", "Preparar apresentação, plano empresarial e prova dos recursos", "Submeter o projeto ao comitê técnico competente"],
  });

  if (euro(f.capital) >= 250000) routes.push({
    key: "investor", title: "Investor Visa", status: "Alternativa possível", score: 79,
    reason: "O capital informado pode alcançar uma das modalidades do Investor Visa, dependendo do destino do investimento.",
    next: ["Definir o ativo: startup, sociedade, títulos públicos ou filantropia", "Comprovar origem e disponibilidade dos recursos", "Validar o investimento antes da solicitação do nulla osta"],
  });

  if (f.estudo !== "nao") routes.push({
    key: "study", title: "Estudo com futura conversão para trabalho", status: f.aceiteEstudo === "sim" ? "Alternativa possível" : "Depende de requisito", score: f.aceiteEstudo === "sim" ? 76 : 58,
    reason: f.aceiteEstudo === "sim" ? "Já existe aceite de instituição de ensino. O permesso de estudo pode permitir trabalho limitado e posterior conversão, se cumpridos os requisitos." : "A via de estudo pode ser planejada, mas exige curso adequado, aceite da instituição, recursos, alojamento e propósito acadêmico coerente.",
    next: ["Escolher curso e instituição compatíveis com o objetivo", "Verificar Universitaly, Declaração de Valor/CIMEA e requisitos consulares", "Planejar trabalho de até 20 horas semanais e futura conversão"],
  });

  if (euro(f.rendaPassiva) > 0 && f.remoto === "nao") routes.push({
    key: "elective", title: "Residência eletiva", status: "Depende de requisito", score: 52,
    reason: "Há renda passiva informada. Essa modalidade é apenas para residência e não autoriza atividade profissional.",
    next: ["Separar renda passiva de renda proveniente de trabalho", "Avaliar patrimônio, alojamento e estabilidade financeira", "Confirmar que o cliente não pretende exercer atividade laboral"],
  });

  if (!routes.length) routes.push({
    key: "none", title: "Sem rota imediata confirmada", status: "Depende de requisito", score: 20,
    reason: "Com as informações fornecidas, ainda não há emprego, vínculo familiar, trabalho remoto qualificado ou projeto de estudo/empreendedorismo suficiente para indicar uma via migratória.",
    next: ["Investigar eventual descendência italiana", "Buscar oferta formal de trabalho ou estruturar atividade remota", "Avaliar estudo ou formação profissional como estratégia de médio prazo"],
  });
  return routes.sort((a, b) => b.score - a.score);
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>;
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [copied, setCopied] = useState(false);
  const update = (key: keyof FormState, value: string) => setForm((old) => ({ ...old, [key]: value }));
  const routes = useMemo(() => evaluate(form), [form]);
  const principal = routes[0];
  const progress = (step / (steps.length - 1)) * 100;

  const reportText = () => {
    const lines = [
      "TRIAGEM MIGRATÓRIA — VELLOSO CIDADANIA",
      `Cliente: ${form.nome || "Não informado"}`,
      `Perfil: ${form.idade ? `${form.idade} anos, ` : ""}${form.profissao || "profissão não informada"}`,
      `Objetivo: ${form.objetivo}`, "", "CAMINHO PRIORITÁRIO", principal.title, principal.reason, "", "PRÓXIMOS PASSOS",
      ...principal.next.map((n, i) => `${i + 1}. ${n}`),
    ];
    if (routes.length > 1) lines.push("", "ROTAS ALTERNATIVAS", ...routes.slice(1, 4).map((r) => `• ${r.title}: ${r.reason}`));
    lines.push("", "PONTOS PARA VALIDAÇÃO", `• Italiano: ${form.italiano}`, `• Oferta de emprego: ${form.oferta === "sim" ? "Sim" : "Não"}`, `• Descendência italiana: ${form.descendente === "sim" ? "Sim" : form.descendente === "nao" ? "Não" : "A confirmar"}`);
    if (form.observacoes) lines.push(`• Observações: ${form.observacoes}`);
    lines.push("", "Relatório informativo preliminar. O enquadramento definitivo depende da análise dos documentos, das regras vigentes e da autoridade italiana competente.");
    return lines.join("\n");
  };

  const copyReport = async () => {
    await navigator.clipboard.writeText(reportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <Image src="/logo-velloso.png" alt="Velloso Cidadania" width={349} height={323} priority />
        </div>
        <div className="internal-badge">USO INTERNO</div>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <p className="eyebrow">ASSESSORIA MIGRATÓRIA</p>
          <h1>Triagem para viver e trabalhar na Itália</h1>
          <p className="intro">Preencha durante a conversa com o cliente. As perguntas mudam conforme o perfil e geram uma orientação preliminar personalizada.</p>
          <div className="progress"><div style={{ width: `${progress}%` }} /></div>
          <nav aria-label="Etapas da triagem">
            {steps.map((s, i) => <button key={s} className={i === step ? "active" : i < step ? "done" : ""} onClick={() => i <= step && setStep(i)}><b>{i < step ? "✓" : i + 1}</b><span>{s}</span></button>)}
          </nav>
          <div className="privacy-note"><b>Privacidade</b><span>Esta versão não salva dados. As informações permanecem somente neste navegador durante a triagem.</span></div>
        </aside>

        <section className="panel">
          {step === 0 && <div className="step-content">
            <div className="section-head"><span>ETAPA 1 DE 4</span><h2>Quem é o cliente?</h2><p>Comece pelo objetivo, prazo e composição familiar.</p></div>
            <div className="form-grid">
              <Field label="Nome completo"><input value={form.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Ex.: Mariana Ferreira" /></Field>
              <Field label="Idade"><input type="number" value={form.idade} onChange={(e) => update("idade", e.target.value)} placeholder="Ex.: 34" /></Field>
              <Field label="Cidade e país onde reside"><input value={form.cidade} onChange={(e) => update("cidade", e.target.value)} placeholder="Ex.: Campinas, Brasil" /></Field>
              <Field label="Quando pretende mudar?"><input value={form.prazo} onChange={(e) => update("prazo", e.target.value)} placeholder="Ex.: Em até 12 meses" /></Field>
              <Field label="Objetivo principal"><Select value={form.objetivo} onChange={(v) => update("objetivo", v)}><option>Trabalhar e residir na Itália</option><option>Trabalhar por uma temporada</option><option>Continuar trabalhando remotamente</option><option>Estudar e depois trabalhar</option><option>Abrir ou investir em um negócio</option><option>Acompanhar familiar</option></Select></Field>
              <Field label="Pretende levar familiares?"><Select value={form.familia} onChange={(v) => update("familia", v)}><option value="nao">Não</option><option value="sim">Sim</option><option value="talvez">Talvez</option></Select></Field>
            </div>
          </div>}

          {step === 1 && <div className="step-content">
            <div className="section-head"><span>ETAPA 2 DE 4</span><h2>Família e descendência</h2><p>Esses vínculos podem abrir caminhos fora das quotas comuns.</p></div>
            <div className="form-grid">
              <Field label="É familiar de cidadão italiano ou europeu?"><Select value={form.familiarUe} onChange={(v) => update("familiarUe", v)}><option value="nao">Não</option><option value="sim">Sim</option><option value="nao_sei">Não sabe</option></Select></Field>
              {form.familiarUe === "sim" && <Field label="Qual é o parentesco?"><input value={form.parentescoUe} onChange={(e) => update("parentescoUe", e.target.value)} placeholder="Ex.: cônjuge, mãe, filho" /></Field>}
              <Field label="É descendente de italiano?"><Select value={form.descendente} onChange={(v) => update("descendente", v)}><option value="nao_sei">Não sabe</option><option value="sim">Sim</option><option value="nao">Não</option></Select></Field>
              {form.descendente === "sim" && <><Field label="Quem é o antepassado italiano?"><input value={form.antepassado} onChange={(e) => update("antepassado", e.target.value)} placeholder="Ex.: bisavô materno" /></Field><Field label="Possui certidões que comprovam a linha?"><Select value={form.documentosDescendencia} onChange={(v) => update("documentosDescendencia", v)}><option value="nao_sei">Não sabe</option><option value="completos">Sim, completas</option><option value="parciais">Apenas algumas</option><option value="nao">Não possui</option></Select></Field></>}
            </div>
            {form.descendente === "sim" && <div className="callout"><b>Oportunidade Velloso</b><p>A descendência pode ser útil mesmo antes do reconhecimento da cidadania: com oferta de trabalho, existe canal fora das quotas para brasileiros descendentes de italianos.</p></div>}
          </div>}

          {step === 2 && <div className="step-content">
            <div className="section-head"><span>ETAPA 3 DE 4</span><h2>Trabalho e qualificação</h2><p>Verifique se existe empregador, qualificação elevada ou atividade remota.</p></div>
            <div className="form-grid">
              <Field label="Já possui oferta formal de trabalho na Itália?"><Select value={form.oferta} onChange={(v) => update("oferta", v)}><option value="nao">Não</option><option value="sim">Sim</option><option value="conversa">Apenas conversa inicial</option></Select></Field>
              {form.oferta === "sim" && <><Field label="Setor da vaga"><Select value={form.setor} onChange={(v) => update("setor", v)}><option value="">Selecione</option><option value="agricultura">Agricultura</option><option value="turismo">Turismo e hotelaria</option><option value="assistencia">Assistência familiar</option><option value="construcao">Construção</option><option value="tecnologia">Tecnologia</option><option value="saude">Saúde</option><option value="outro">Outro</option></Select></Field><Field label="Salário bruto anual estimado (€)"><input inputMode="decimal" value={form.salario} onChange={(e) => update("salario", e.target.value)} placeholder="Ex.: 40.000" /></Field></>}
              <Field label="Profissão atual"><input value={form.profissao} onChange={(e) => update("profissao", e.target.value)} placeholder="Ex.: Desenvolvedora de software" /></Field>
              <Field label="Escolaridade/formação"><Select value={form.formacao} onChange={(v) => update("formacao", v)}><option value="fundamental">Ensino fundamental</option><option value="medio">Ensino médio/técnico</option><option value="superior">Ensino superior (3+ anos)</option><option value="pos">Pós-graduação/mestrado/doutorado</option></Select></Field>
              <Field label="Anos de experiência na área"><input type="number" value={form.anosExperiencia} onChange={(e) => update("anosExperiencia", e.target.value)} placeholder="Ex.: 6" /></Field>
              <Field label="Atividade altamente qualificada?"><Select value={form.qualificacaoAlta} onChange={(v) => update("qualificacaoAlta", v)}><option value="nao_sei">Não sabe</option><option value="sim">Sim</option><option value="nao">Não</option></Select></Field>
              <Field label="Profissão regulamentada?" hint="Ex.: medicina, enfermagem, psicologia ou odontologia."><Select value={form.profissaoRegulamentada} onChange={(v) => update("profissaoRegulamentada", v)}><option value="nao_sei">Não sabe</option><option value="sim">Sim</option><option value="nao">Não</option></Select></Field>
              <Field label="Nível de italiano"><Select value={form.italiano} onChange={(v) => update("italiano", v)}><option value="nenhum">Nenhum</option><option value="basico">Básico (A1/A2)</option><option value="intermediario">Intermediário (B1/B2)</option><option value="avancado">Avançado (C1/C2)</option></Select></Field>
              <Field label="Trabalha remotamente hoje?"><Select value={form.remoto} onChange={(v) => update("remoto", v)}><option value="nao">Não</option><option value="sim">Sim</option></Select></Field>
              {form.remoto === "sim" && <><Field label="Tipo de vínculo"><Select value={form.vinculoRemoto} onChange={(v) => update("vinculoRemoto", v)}><option value="">Selecione</option><option value="empregado">Empregado</option><option value="autonomo">Autônomo/freelancer</option><option value="socio">Sócio/empresário</option></Select></Field><Field label="Renda bruta anual remota (€)"><input value={form.rendaRemota} onChange={(e) => update("rendaRemota", e.target.value)} placeholder="Ex.: 32.000" /></Field><Field label="Meses de experiência nessa atividade"><input type="number" value={form.mesesRemoto} onChange={(e) => update("mesesRemoto", e.target.value)} placeholder="Ex.: 18" /></Field></>}
              <Field label="Trabalha em empresa italiana ou do mesmo grupo?"><Select value={form.grupoItaliano} onChange={(v) => update("grupoItaliano", v)}><option value="nao">Não</option><option value="sim">Sim</option><option value="nao_sei">Não sabe</option></Select></Field>
              {form.grupoItaliano === "sim" && <Field label="Há quantos meses nessa empresa?"><input type="number" value={form.mesesEmpresa} onChange={(e) => update("mesesEmpresa", e.target.value)} placeholder="Ex.: 24" /></Field>}
            </div>
          </div>}

          {step === 3 && <div className="step-content">
            <div className="section-head"><span>ETAPA 4 DE 4</span><h2>Rotas alternativas</h2><p>Estudo, empreendedorismo e renda própria podem criar outros caminhos.</p></div>
            <div className="form-grid">
              <Field label="Aceitaria estudar na Itália antes de trabalhar?"><Select value={form.estudo} onChange={(v) => update("estudo", v)}><option value="talvez">Talvez</option><option value="sim">Sim</option><option value="nao">Não</option></Select></Field>
              {form.estudo !== "nao" && <Field label="Já possui aceite de uma instituição?"><Select value={form.aceiteEstudo} onChange={(v) => update("aceiteEstudo", v)}><option value="nao">Não</option><option value="sim">Sim</option><option value="processo">Em processo</option></Select></Field>}
              <Field label="Pretende empreender ou investir?"><Select value={form.empreender} onChange={(v) => update("empreender", v)}><option value="nao">Não</option><option value="sim">Sim</option><option value="talvez">Talvez</option></Select></Field>
              {form.empreender !== "nao" && <><Field label="O projeto envolve inovação ou tecnologia?"><Select value={form.startupInovadora} onChange={(v) => update("startupInovadora", v)}><option value="nao">Não</option><option value="sim">Sim</option><option value="nao_sei">Não sabe</option></Select></Field><Field label="Capital disponível para o projeto (€)"><input value={form.capital} onChange={(e) => update("capital", e.target.value)} placeholder="Ex.: 60.000" /></Field></>}
              <Field label="Possui renda passiva anual? (€)" hint="Aluguéis, dividendos, pensões ou patrimônio; não inclua salário."><input value={form.rendaPassiva} onChange={(e) => update("rendaPassiva", e.target.value)} placeholder="Ex.: 45.000" /></Field>
              <Field label="Observações do atendimento"><textarea value={form.observacoes} onChange={(e) => update("observacoes", e.target.value)} placeholder="Inclua informações relevantes, dúvidas ou documentos já apresentados." rows={5} /></Field>
            </div>
          </div>}

          {step === 4 && <div className="report-wrap">
            <div className="report-actions"><div><span>RELATÓRIO PRELIMINAR</span><h2>{form.nome || "Cliente não identificado"}</h2></div><div><button className="secondary" onClick={copyReport}>{copied ? "Copiado ✓" : "Copiar relatório"}</button><button className="secondary" onClick={() => window.print()}>Imprimir / PDF</button></div></div>
            <div className="report-hero"><span className="route-status">{principal.status}</span><p>Caminho prioritário</p><h3>{principal.title}</h3><p>{principal.reason}</p></div>
            <div className="report-grid">
              <article><h4>Próximos passos recomendados</h4><ol>{principal.next.map((n) => <li key={n}>{n}</li>)}</ol></article>
              <article><h4>Resumo do perfil</h4><dl><div><dt>Objetivo</dt><dd>{form.objetivo}</dd></div><div><dt>Profissão</dt><dd>{form.profissao || "Não informada"}</dd></div><div><dt>Italiano</dt><dd>{form.italiano}</dd></div><div><dt>Oferta</dt><dd>{form.oferta === "sim" ? "Confirmada" : form.oferta === "conversa" ? "Conversa inicial" : "Não possui"}</dd></div><div><dt>Descendência</dt><dd>{form.descendente === "sim" ? "Confirmada pelo cliente" : form.descendente === "nao" ? "Não" : "A confirmar"}</dd></div></dl></article>
            </div>
            {routes.length > 1 && <section className="alternatives"><h4>Outras rotas identificadas</h4>{routes.slice(1, 5).map((r) => <article key={r.key}><div><span>{r.status}</span><h5>{r.title}</h5></div><p>{r.reason}</p></article>)}</section>}
            {form.profissaoRegulamentada === "sim" && <div className="warning"><b>Atenção ao diploma profissional</b><p>A profissão foi indicada como regulamentada. Visto e reconhecimento profissional são etapas diferentes; será necessário identificar a autoridade italiana responsável.</p></div>}
            <div className="disclaimer"><b>Nota técnica</b><p>Este relatório é informativo e preliminar. Não representa garantia de visto, emprego, quota ou aprovação. O enquadramento definitivo depende da análise documental, da legislação vigente, da autoridade consular e dos órgãos italianos competentes.</p></div>
          </div>}

          <footer className="panel-footer">
            <button className="back" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>← Voltar</button>
            {step < 4 ? <button className="primary" onClick={() => setStep((s) => Math.min(4, s + 1))}>{step === 3 ? "Gerar relatório" : "Continuar"} →</button> : <button className="primary" onClick={() => { setForm(initial); setStep(0); }}>Nova triagem</button>}
          </footer>
        </section>
      </section>
    </main>
  );
}
