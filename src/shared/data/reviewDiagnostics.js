/** Diagnósticos comuns às fontes; não modifica valores nem decide correções. */
export const reviewRules = [
  [
    'RV01',
    /erro.*excel|fórmula.*resultado/i,
    'Bloqueio do campo',
    ['Indicadores dependentes da célula'],
  ],
  ['RV02', /cabeçalho|layout/i, 'Estrutura a conferir', ['Leitura e seleção de colunas']],
  [
    'RV04',
    /pago em|pagamento ao técnico|status pago/i,
    'Conferência contextual',
    ['Coerência de status e datas'],
  ],
  [
    'RV03',
    /status.*(semelhante|escrita)/i,
    'Bloqueio do campo',
    ['Realizados e agenda por status'],
  ],
  [
    'RV05',
    /técnico.*\+.*km|divergência.*total/i,
    'Conferência contextual',
    ['Composição dos valores lançados'],
  ],
  [
    'RV07',
    /precisão|identificador.*(numérico|incompatível)|caracteres não numéricos/i,
    'Bloqueio do vínculo',
    ['Equipamento, chip e histórico'],
  ],
  ['RV06', /campo ausente/i, 'Conferência contextual', ['Cobertura do cadastro conforme situação']],
  [
    'RV14',
    /página|paginação|truncad|incomplet.*consulta/i,
    'Bloqueio da consulta',
    ['Completude da consulta'],
  ],
  ['RV08', /repetid|duplic/i, 'Vínculo a conferir', ['Identificação única e cruzamentos']],
  [
    'RV09',
    /data.*(inválida|incompatível)|fim.*(início|anterior)|cancelamento|cancelado sem data/i,
    'Bloqueio do campo',
    ['Recorte temporal e ciclos'],
  ],
  [
    'RV10',
    /acessório|retirada|instalação|troca|par.*(ambígu|data)/i,
    'Vínculo a conferir',
    ['Trocas e tempo acompanhado'],
  ],
  [
    'RV11',
    /correspondência|sem histórico|vínculo|ambígu/i,
    'Vínculo a conferir',
    ['Cobertura e cruzamentos'],
  ],
  [
    'RV12',
    /api.*operacional|referência.*api/i,
    'Vínculo a conferir',
    ['Conferência de cadastro atual'],
  ],
  [
    'RV13',
    /autoria|zoho|fechamento/i,
    'Bloqueio do campo',
    ['Indicador dependente da evidência Zoho'],
  ],
  ['RV15', /cobertura|categoria.*zero/i, 'Conferência contextual', ['Ausência, zero e catálogo']],
];
export function reviewDiagnostics(issues = [], { data } = {}) {
  const seen = new Set();
  const sourceRows = new Map((data?.rows || []).map((row) => [row.sourceRow, row]));
  const statusColumn = data?.columns?.findIndex((column) =>
    ['Situação', 'Status'].includes(column.label),
  );
  return issues.flatMap((issue) => {
    const reason = String(issue.reason || 'Conferir o conteúdo original.');
    const row = Number.isInteger(issue.row)
      ? issue.row
      : /^[A-Z]+[1-9]\d*$/.test(issue.address || '')
        ? Number(issue.address.match(/\d+$/)[0])
        : null;
    const category =
      issue.category ||
      (/cabeçalho/i.test(reason)
        ? 'Estrutura'
        : /formato|excel|inválid|incompatível/i.test(reason)
          ? 'Formato'
          : /repetid|duplic|ambígu/i.test(reason)
            ? 'Possível divergência'
            : 'Conferência');
    const key = JSON.stringify([row, issue.address, issue.column, issue.value, reason]);
    if (seen.has(key)) return [];
    seen.add(key);
    let action =
      'Localize a célula na planilha e confira o lançamento com a fonte original. Depois de ajustar, importe novamente para reavaliar.';
    let impact =
      'O apontamento exige conferência; sua presença não prova que todo o registro esteja incorreto.';
    if (category === 'Formato') {
      action =
        'Confira o tipo e o conteúdo da célula, incluindo fórmulas e datas. Identificadores longos devem ser preservados como texto. Não substitua informações desconhecidas por zero.';
      impact =
        'O campo pode ficar fora dos cálculos que exigem um valor válido. O registro original permanece disponível.';
    } else if (/repetid|duplic|ambígu/i.test(reason)) {
      action =
        'Compare as linhas indicadas, os identificadores e as datas antes de decidir se existe duplicidade. Não exclua uma movimentação legítima.';
      impact =
        'Vínculos ambíguos podem impedir a atribuição de histórico. Repetição, por si só, não confirma erro.';
    } else if (/status|pago/i.test(reason)) {
      action =
        'Confira o status e as datas com o registro de atendimento ou pagamento. Use a escrita esperada apenas quando a situação real estiver confirmada.';
      impact =
        'Status com escrita diferente pode alterar a participação nos indicadores. Pagamento ao técnico não confirma recebimento do cliente.';
    } else if (/custo|total|técnico.*km/i.test(reason)) {
      action =
        'Confira os componentes e o total lançado com o comprovante. Preserve valores ausentes até obter confirmação.';
      impact = 'O sistema preserva o total informado; valores ausentes não são tratados como zero.';
    }
    const rule = reviewRules.find(([, pattern]) => pattern.test(reason));
    const sourceRow = sourceRows.get(row);
    const status =
      statusColumn >= 0 ? String(sourceRow?.cells?.[statusColumn]?.raw || '').trim() : '';
    let applicability = 'Conferir conforme o contexto da linha; não há correção automática.';
    if (rule?.[0] === 'RV06') {
      applicability = ['Estoque', 'Em estoque', 'Retirado', 'Cancelado', 'Desativado'].includes(
        status,
      )
        ? `Situação ${status}: ausência pode ser legítima; conferir a exigência do campo antes de corrigir.`
        : 'Campo obrigatório depende da situação: confirmar se o equipamento está instalado/ativo, em estoque ou retirado.';
      action = `${applicability} Preserve o vazio se não existir informação aplicável; não invente placa, serial ou chip.`;
    }
    return [
      {
        ...issue,
        row,
        reason,
        category,
        action,
        impact,
        key,
        rule: rule?.[0] || 'RV00',
        severity: rule?.[2] || 'Conferência contextual',
        indicators: rule?.[3] || ['Dependem do campo apontado'],
        applicability,
        resolution:
          'Conferir a fonte, ajustar somente quando confirmado e reimportar. Reavaliar o mesmo diagnóstico após a atualização.',
      },
    ];
  });
}
