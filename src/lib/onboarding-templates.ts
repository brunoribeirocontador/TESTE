export type TarefaTemplate = { titulo: string; categoria: string };

const TAREFAS_COMUNS: TarefaTemplate[] = [
  { titulo: "Enviar contrato para assinatura (Asaas)", categoria: "Contrato" },
  { titulo: "Confirmar assinatura do contrato", categoria: "Contrato" },
  { titulo: "Cadastrar empresa no Domínio", categoria: "Cadastro em sistemas" },
  { titulo: "Cadastrar empresa no Asaas (financeiro)", categoria: "Cadastro em sistemas" },
  { titulo: "Cadastrar empresa no Sieg", categoria: "Cadastro em sistemas" },
];

const TAREFAS_ABERTURA_CNPJ: TarefaTemplate[] = [
  ...TAREFAS_COMUNS,
  { titulo: "Definir enquadramento e regime tributário", categoria: "Abertura" },
  { titulo: "Abrir CNPJ (Junta Comercial / Receita Federal)", categoria: "Abertura" },
  { titulo: "Emitir/instalar certificado digital", categoria: "Abertura" },
  { titulo: "Solicitar alvarás e inscrições necessárias", categoria: "Abertura" },
  { titulo: "Enviar boas-vindas e concluir implantação", categoria: "Implantação" },
];

const TAREFAS_MIGRACAO_CONTABILIDADE: TarefaTemplate[] = [
  ...TAREFAS_COMUNS,
  { titulo: "Solicitar documentos e senhas à contabilidade anterior", categoria: "Migração" },
  { titulo: "Formalizar termo de transferência com a contabilidade anterior", categoria: "Migração" },
  { titulo: "Migrar certificado digital e procurações", categoria: "Migração" },
  { titulo: "Conferir pendências fiscais e contábeis", categoria: "Migração" },
  { titulo: "Confirmar cliente 100% migrado para o escritório", categoria: "Implantação" },
];

export function getOnboardingTemplate(origem: "ABERTURA_CNPJ" | "MIGRACAO_CONTABILIDADE") {
  return origem === "ABERTURA_CNPJ" ? TAREFAS_ABERTURA_CNPJ : TAREFAS_MIGRACAO_CONTABILIDADE;
}
