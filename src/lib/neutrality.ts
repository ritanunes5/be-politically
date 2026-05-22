// Shared biased-language linter for the admin dashboard.
// Returns the list of biased terms found in a text and a neutral rewrite suggestion.

const BIASED_TERMS: { term: string; suggestion: string }[] = [
  { term: 'extremista',   suggestion: 'remover ou substituir por descrição factual da posição' },
  { term: 'radical',      suggestion: 'remover ou substituir por descrição factual da posição' },
  { term: 'perigoso',     suggestion: 'remover; descrever apenas o conteúdo da proposta' },
  { term: 'perigosa',     suggestion: 'remover; descrever apenas o conteúdo da proposta' },
  { term: 'perfeito',     suggestion: 'remover; usar linguagem neutra' },
  { term: 'perfeita',     suggestion: 'remover; usar linguagem neutra' },
  { term: 'terrível',     suggestion: 'remover; usar linguagem neutra' },
  { term: 'corrupto',     suggestion: 'só usar se sustentado por fonte oficial citada' },
  { term: 'corrupta',     suggestion: 'só usar se sustentado por fonte oficial citada' },
  { term: 'patriótico',   suggestion: 'remover; descrever apenas o conteúdo da proposta' },
  { term: 'patriótica',   suggestion: 'remover; descrever apenas o conteúdo da proposta' },
  { term: 'anti-povo',    suggestion: 'remover; descrever apenas o conteúdo da proposta' },
  { term: 'demagogo',     suggestion: 'remover; descrever apenas o conteúdo da proposta' },
  { term: 'demagógico',   suggestion: 'remover; descrever apenas o conteúdo da proposta' },
  { term: 'populista',    suggestion: 'apenas se for a auto-identificação do partido' },
  { term: 'melhor',       suggestion: 'evitar comparações de valor' },
  { term: 'pior',         suggestion: 'evitar comparações de valor' },
];

export interface NeutralityIssue {
  term: string;
  suggestion: string;
}

export function checkNeutrality(text: string): NeutralityIssue[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  return BIASED_TERMS.filter(({ term }) =>
    new RegExp(`\\b${term}\\b`, 'i').test(lower)
  ).map(({ term, suggestion }) => ({ term, suggestion }));
}
