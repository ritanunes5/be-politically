import {
  Home,
  Heart as HeartIcon,
  Leaf,
  GraduationCap,
  Briefcase,
  Shield,
  Building,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react';

export interface TopicSource {
  source_name: string;
  source_url: string;
  last_verified_date: string; // ISO date
}

export interface TopicKeyFact {
  label: string;
  value: string;
  source: TopicSource;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
  color: string;
  parties: number;
  keyFacts: TopicKeyFact[];
  sources: TopicSource[];
}

// All descriptions and facts below are sourced from official Portuguese / EU
// public institutions. No partisan framing is used.
export const topicsData: Topic[] = [
  {
    id: 'housing',
    name: 'Habitação',
    description: 'Políticas de habitação, arrendamento e construção pública.',
    longDescription:
      'A política de habitação em Portugal abrange o arrendamento, a habitação pública e os apoios à compra de casa. O Instituto da Habitação e da Reabilitação Urbana (IHRU) é o organismo público responsável por programas como o 1.º Direito e o Porta de Entrada. O acesso à habitação é reconhecido como direito constitucional no artigo 65.º da Constituição da República Portuguesa.',
    icon: Home,
    color: 'from-orange-500 to-amber-400',
    parties: 8,
    keyFacts: [
      {
        label: 'Variação do preço da habitação (2024)',
        value: 'Aumento de 9,1% face a 2023',
        source: {
          source_name: 'INE — Índice de Preços da Habitação',
          source_url: 'https://www.ine.pt/',
          last_verified_date: '2025-05-22',
        },
      },
      {
        label: 'Programa público de referência',
        value: '1.º Direito — Programa de Apoio ao Acesso à Habitação',
        source: {
          source_name: 'IHRU',
          source_url: 'https://www.portaldahabitacao.pt/web/guest/1.-direito',
          last_verified_date: '2025-05-22',
        },
      },
    ],
    sources: [
      {
        source_name: 'Instituto Nacional de Estatística',
        source_url: 'https://www.ine.pt/',
        last_verified_date: '2025-05-22',
      },
      {
        source_name: 'Portal da Habitação (IHRU)',
        source_url: 'https://www.portaldahabitacao.pt/',
        last_verified_date: '2025-05-22',
      },
    ],
  },
  {
    id: 'health',
    name: 'Saúde',
    description: 'Sistema Nacional de Saúde, hospitais e cuidados primários.',
    longDescription:
      'O Serviço Nacional de Saúde (SNS) foi criado em 1979 e garante o acesso a cuidados de saúde a todos os residentes em Portugal, conforme o artigo 64.º da Constituição. Está organizado em cuidados de saúde primários, hospitalares e continuados, tutelados pelo Ministério da Saúde através da Direção-Geral da Saúde e das Administrações Regionais de Saúde.',
    icon: Stethoscope,
    color: 'from-red-500 to-rose-400',
    parties: 8,
    keyFacts: [
      {
        label: 'Despesa pública em saúde (2023)',
        value: 'Cerca de 6,9% do PIB',
        source: {
          source_name: 'OCDE — Health at a Glance',
          source_url: 'https://www.oecd.org/health/health-at-a-glance/',
          last_verified_date: '2025-05-22',
        },
      },
      {
        label: 'Utentes inscritos no SNS sem médico de família',
        value: 'Cerca de 1,6 milhões (2024)',
        source: {
          source_name: 'SNS — Transparência',
          source_url: 'https://transparencia.sns.gov.pt/',
          last_verified_date: '2025-05-22',
        },
      },
    ],
    sources: [
      {
        source_name: 'Serviço Nacional de Saúde',
        source_url: 'https://www.sns.gov.pt/',
        last_verified_date: '2025-05-22',
      },
      {
        source_name: 'Direção-Geral da Saúde',
        source_url: 'https://www.dgs.pt/',
        last_verified_date: '2025-05-22',
      },
    ],
  },
  {
    id: 'environment',
    name: 'Ambiente',
    description:
      'Transição energética, sustentabilidade e combate às alterações climáticas.',
    longDescription:
      'A política ambiental portuguesa está enquadrada pela Lei de Bases do Clima (Lei n.º 98/2021) e pelo Plano Nacional Energia e Clima (PNEC 2030). Portugal está comprometido com a neutralidade carbónica até 2050, em linha com o Pacto Ecológico Europeu. A Agência Portuguesa do Ambiente (APA) é o organismo público responsável pela execução da política ambiental.',
    icon: Leaf,
    color: 'from-green-500 to-emerald-400',
    parties: 8,
    keyFacts: [
      {
        label: 'Meta de redução de emissões até 2030',
        value: '-55% face a 2005',
        source: {
          source_name: 'Plano Nacional Energia e Clima 2030',
          source_url: 'https://www.apambiente.pt/clima/plano-nacional-energia-e-clima-pnec',
          last_verified_date: '2025-05-22',
        },
      },
      {
        label: 'Quota de renováveis no consumo final (2023)',
        value: 'Cerca de 35%',
        source: {
          source_name: 'DGEG — Direção-Geral de Energia e Geologia',
          source_url: 'https://www.dgeg.gov.pt/',
          last_verified_date: '2025-05-22',
        },
      },
    ],
    sources: [
      {
        source_name: 'Agência Portuguesa do Ambiente',
        source_url: 'https://www.apambiente.pt/',
        last_verified_date: '2025-05-22',
      },
      {
        source_name: 'Lei de Bases do Clima (Diário da República)',
        source_url: 'https://diariodarepublica.pt/dr/detalhe/lei/98-2021-176907481',
        last_verified_date: '2025-05-22',
      },
    ],
  },
  {
    id: 'education',
    name: 'Educação',
    description: 'Sistema educativo, ensino superior e formação profissional.',
    longDescription:
      'O sistema educativo português está regulado pela Lei de Bases do Sistema Educativo (Lei n.º 46/86). A escolaridade é obrigatória dos 6 aos 18 anos. O Ministério da Educação tutela o ensino básico e secundário, enquanto o Ministério da Ciência, Tecnologia e Ensino Superior tutela o ensino superior público e privado.',
    icon: GraduationCap,
    color: 'from-blue-500 to-cyan-400',
    parties: 8,
    keyFacts: [
      {
        label: 'Despesa pública em educação (2023)',
        value: 'Cerca de 4,7% do PIB',
        source: {
          source_name: 'Pordata',
          source_url: 'https://www.pordata.pt/',
          last_verified_date: '2025-05-22',
        },
      },
      {
        label: 'Taxa de abandono escolar precoce (2024)',
        value: '6,0% (entre 18-24 anos)',
        source: {
          source_name: 'Eurostat',
          source_url: 'https://ec.europa.eu/eurostat',
          last_verified_date: '2025-05-22',
        },
      },
    ],
    sources: [
      {
        source_name: 'Direção-Geral de Estatísticas da Educação e Ciência',
        source_url: 'https://www.dgeec.medu.pt/',
        last_verified_date: '2025-05-22',
      },
      {
        source_name: 'Lei de Bases do Sistema Educativo',
        source_url: 'https://diariodarepublica.pt/dr/legislacao-consolidada/lei/1986-34444975',
        last_verified_date: '2025-05-22',
      },
    ],
  },
  {
    id: 'economy',
    name: 'Economia',
    description: 'Políticas fiscais, emprego e desenvolvimento económico.',
    longDescription:
      'A política económica em Portugal é coordenada pelo Ministério das Finanças e pelo Ministério da Economia, no quadro das regras orçamentais da União Europeia. O Banco de Portugal acompanha a estabilidade financeira. O Orçamento do Estado é aprovado anualmente pela Assembleia da República.',
    icon: Briefcase,
    color: 'from-politic-600 to-politic-400',
    parties: 8,
    keyFacts: [
      {
        label: 'Salário mínimo nacional (2025)',
        value: '870 € mensais',
        source: {
          source_name: 'Decreto-Lei n.º 87/2024',
          source_url: 'https://diariodarepublica.pt/',
          last_verified_date: '2025-05-22',
        },
      },
      {
        label: 'Taxa de desemprego (2024)',
        value: 'Cerca de 6,4% (média anual)',
        source: {
          source_name: 'INE — Estatísticas do Emprego',
          source_url: 'https://www.ine.pt/',
          last_verified_date: '2025-05-22',
        },
      },
    ],
    sources: [
      {
        source_name: 'Banco de Portugal',
        source_url: 'https://www.bportugal.pt/',
        last_verified_date: '2025-05-22',
      },
      {
        source_name: 'Instituto Nacional de Estatística',
        source_url: 'https://www.ine.pt/',
        last_verified_date: '2025-05-22',
      },
    ],
  },
  {
    id: 'security',
    name: 'Segurança',
    description: 'Forças de segurança, justiça e combate à criminalidade.',
    longDescription:
      'A segurança interna em Portugal é assegurada pela GNR, PSP, PJ e SEF/AIMA, sob coordenação do Ministério da Administração Interna. A política criminal é definida pela Assembleia da República através de leis bienais de política criminal. O Relatório Anual de Segurança Interna (RASI) é publicado pelo Governo.',
    icon: Shield,
    color: 'from-slate-600 to-slate-400',
    parties: 8,
    keyFacts: [
      {
        label: 'Crimes participados em 2023',
        value: 'Cerca de 371 mil (RASI 2023)',
        source: {
          source_name: 'Relatório Anual de Segurança Interna 2023',
          source_url: 'https://www.portugal.gov.pt/',
          last_verified_date: '2025-05-22',
        },
      },
      {
        label: 'Efetivos das forças de segurança',
        value: 'GNR e PSP somam cerca de 41 mil efetivos',
        source: {
          source_name: 'Ministério da Administração Interna',
          source_url: 'https://www.portugal.gov.pt/pt/gc23/area-de-governo/administracao-interna',
          last_verified_date: '2025-05-22',
        },
      },
    ],
    sources: [
      {
        source_name: 'Sistema de Segurança Interna',
        source_url: 'https://www.portugal.gov.pt/',
        last_verified_date: '2025-05-22',
      },
    ],
  },
  {
    id: 'infrastructure',
    name: 'Infraestruturas',
    description: 'Transportes, obras públicas e ordenamento do território.',
    longDescription:
      'A política de infraestruturas é tutelada pelo Ministério das Infraestruturas e Habitação. Inclui a rede rodoviária e ferroviária nacional (Infraestruturas de Portugal), os portos, os aeroportos e o ordenamento do território. Investimentos relevantes incluem a expansão da rede ferroviária e o Plano de Recuperação e Resiliência (PRR).',
    icon: Building,
    color: 'from-indigo-500 to-violet-400',
    parties: 8,
    keyFacts: [
      {
        label: 'Dotação total do PRR',
        value: 'Cerca de 22,2 mil milhões €',
        source: {
          source_name: 'Recuperar Portugal — PRR',
          source_url: 'https://recuperarportugal.gov.pt/',
          last_verified_date: '2025-05-22',
        },
      },
      {
        label: 'Extensão da rede ferroviária nacional',
        value: 'Cerca de 2 500 km',
        source: {
          source_name: 'Infraestruturas de Portugal',
          source_url: 'https://www.infraestruturasdeportugal.pt/',
          last_verified_date: '2025-05-22',
        },
      },
    ],
    sources: [
      {
        source_name: 'Infraestruturas de Portugal',
        source_url: 'https://www.infraestruturasdeportugal.pt/',
        last_verified_date: '2025-05-22',
      },
      {
        source_name: 'Plano de Recuperação e Resiliência',
        source_url: 'https://recuperarportugal.gov.pt/',
        last_verified_date: '2025-05-22',
      },
    ],
  },
  {
    id: 'social',
    name: 'Proteção Social',
    description: 'Segurança social, apoios às famílias e combate à pobreza.',
    longDescription:
      'O sistema de proteção social português assenta na Segurança Social, regulada pela Lei de Bases da Segurança Social (Lei n.º 4/2007). Inclui prestações contributivas (pensões, subsídio de desemprego) e não contributivas (Rendimento Social de Inserção, Complemento Solidário para Idosos, abono de família).',
    icon: HeartIcon,
    color: 'from-pink-500 to-rose-400',
    parties: 8,
    keyFacts: [
      {
        label: 'Taxa de risco de pobreza (2023)',
        value: '17,0% da população',
        source: {
          source_name: 'INE — Rendimento e Condições de Vida',
          source_url: 'https://www.ine.pt/',
          last_verified_date: '2025-05-22',
        },
      },
      {
        label: 'Pensão social mínima (2025)',
        value: '231,87 € mensais',
        source: {
          source_name: 'Segurança Social',
          source_url: 'https://www.seg-social.pt/',
          last_verified_date: '2025-05-22',
        },
      },
    ],
    sources: [
      {
        source_name: 'Segurança Social',
        source_url: 'https://www.seg-social.pt/',
        last_verified_date: '2025-05-22',
      },
      {
        source_name: 'Lei de Bases da Segurança Social',
        source_url: 'https://diariodarepublica.pt/dr/detalhe/lei/4-2007-522781',
        last_verified_date: '2025-05-22',
      },
    ],
  },
];

export const getTopicById = (id: string): Topic | undefined =>
  topicsData.find((t) => t.id === id);
