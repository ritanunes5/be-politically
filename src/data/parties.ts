// Party logos imports
import logoPS from '@/assets/parties/ps.png';
import logoPSD from '@/assets/parties/psd.png';
import logoChega from '@/assets/parties/chega.webp';
import logoIL from '@/assets/parties/iniciativa-liberal.png';
import logoBE from '@/assets/parties/bloco-esquerda.png';
import logoPCP from '@/assets/parties/pcp.jpg';
import logoPAN from '@/assets/parties/pan.png';
import logoLivre from '@/assets/parties/livre.png';

export interface Party {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  color: string;
  ideology: string;
  logo: string;
}

export const partiesData: Party[] = [
  {
    id: 'ps',
    name: 'Partido Socialista',
    abbreviation: 'PS',
    description: 'Partido de centro-esquerda, social-democrata e europeísta.',
    color: '#FF66B2',
    ideology: 'Social-democracia',
    logo: logoPS,
  },
  {
    id: 'psd',
    name: 'Partido Social Democrata',
    abbreviation: 'PSD',
    description: 'Partido de centro-direita, liberal-conservador e europeísta.',
    color: '#FF6600',
    ideology: 'Liberalismo social',
    logo: logoPSD,
  },
  {
    id: 'chega',
    name: 'Chega',
    abbreviation: 'CH',
    description: 'Partido de direita populista e conservador.',
    color: '#1C1C1C',
    ideology: 'Conservadorismo nacional',
    logo: logoChega,
  },
  {
    id: 'il',
    name: 'Iniciativa Liberal',
    abbreviation: 'IL',
    description: 'Partido liberal clássico, defensor do mercado livre.',
    color: '#00AEEF',
    ideology: 'Liberalismo',
    logo: logoIL,
  },
  {
    id: 'be',
    name: 'Bloco de Esquerda',
    abbreviation: 'BE',
    description: 'Partido de esquerda socialista e ecologista.',
    color: '#E30613',
    ideology: 'Socialismo democrático',
    logo: logoBE,
  },
  {
    id: 'pcp',
    name: 'Partido Comunista Português',
    abbreviation: 'PCP',
    description: 'Partido comunista, defensor do socialismo científico.',
    color: '#CC0000',
    ideology: 'Comunismo',
    logo: logoPCP,
  },
  {
    id: 'pan',
    name: 'Pessoas-Animais-Natureza',
    abbreviation: 'PAN',
    description: 'Partido ecologista focado em direitos dos animais e sustentabilidade.',
    color: '#00AA55',
    ideology: 'Ambientalismo',
    logo: logoPAN,
  },
  {
    id: 'livre',
    name: 'LIVRE',
    abbreviation: 'L',
    description: 'Partido ecologista de esquerda, progressista e europeísta.',
    color: '#00B140',
    ideology: 'Ecossocialismo',
    logo: logoLivre,
  },
];

export const getPartyById = (id: string): Party | undefined => {
  return partiesData.find(party => party.id === id);
};

export const partiesDetails: Record<string, {
  name: string;
  abbreviation: string;
  color: string;
  logo: string;
  founded: string;
  ideology: string;
  history: string;
  values: string[];
  proposals: { title: string; description: string }[];
  recentActivity: { date: string; description: string }[];
}> = {
  ps: {
    name: 'Partido Socialista',
    abbreviation: 'PS',
    color: '#FF66B2',
    logo: logoPS,
    founded: '1973',
    ideology: 'Social-democracia, Europeísmo',
    history: 'O Partido Socialista foi fundado em 1973 na cidade alemã de Bad Münstereifel. É um partido de centro-esquerda que tem alternado no poder com o PSD desde a instauração da democracia em Portugal.',
    values: ['Justiça social', 'Igualdade de oportunidades', 'Estado social forte', 'Integração europeia', 'Solidariedade'],
    proposals: [
      { title: 'Habitação acessível', description: 'Construção de habitação pública e regulação do mercado de arrendamento.' },
      { title: 'Transição climática', description: 'Investimento em energias renováveis e mobilidade sustentável.' },
      { title: 'Reforço do SNS', description: 'Mais médicos e enfermeiros, redução das listas de espera.' },
    ],
    recentActivity: [
      { date: '5 Dez 2025', description: 'Apresentou proposta de alteração ao orçamento.' },
      { date: '1 Dez 2025', description: 'Reunião com sindicatos sobre revisão salarial.' },
    ],
  },
  psd: {
    name: 'Partido Social Democrata',
    abbreviation: 'PSD',
    color: '#FF6600',
    logo: logoPSD,
    founded: '1974',
    ideology: 'Liberalismo social, Centro-direita',
    history: 'O PSD foi fundado em 1974 como PPD (Partido Popular Democrático) e é um dos principais partidos do sistema político português, tendo liderado vários governos.',
    values: ['Liberdade individual', 'Economia de mercado social', 'Responsabilidade fiscal', 'Reforma do Estado', 'Competitividade'],
    proposals: [
      { title: 'Redução de impostos', description: 'Diminuição da carga fiscal sobre famílias e empresas.' },
      { title: 'Reforma da administração pública', description: 'Modernização e digitalização dos serviços públicos.' },
      { title: 'Apoio às empresas', description: 'Incentivos fiscais para investimento e inovação.' },
    ],
    recentActivity: [
      { date: '4 Dez 2025', description: 'Proposta de revisão do IRC aprovada em comissão.' },
      { date: '28 Nov 2025', description: 'Debate parlamentar sobre política económica.' },
    ],
  },
  chega: {
    name: 'Chega',
    abbreviation: 'CH',
    color: '#1C1C1C',
    logo: logoChega,
    founded: '2019',
    ideology: 'Conservadorismo nacional, Populismo de direita',
    history: 'O Chega foi fundado em 2019 por André Ventura. É um partido de direita que cresceu rapidamente nas eleições legislativas.',
    values: ['Segurança', 'Tradição', 'Família', 'Patriotismo', 'Lei e ordem'],
    proposals: [
      { title: 'Combate à corrupção', description: 'Medidas mais duras contra a corrupção política.' },
      { title: 'Redução do Estado', description: 'Diminuição da máquina estatal e liberalização económica.' },
      { title: 'Segurança pública', description: 'Reforço das forças de segurança e maior punição.' },
    ],
    recentActivity: [
      { date: '3 Dez 2025', description: 'Apresentou proposta sobre segurança nas escolas.' },
      { date: '25 Nov 2025', description: 'Debate sobre imigração no parlamento.' },
    ],
  },
  il: {
    name: 'Iniciativa Liberal',
    abbreviation: 'IL',
    color: '#00AEEF',
    logo: logoIL,
    founded: '2017',
    ideology: 'Liberalismo clássico',
    history: 'A Iniciativa Liberal foi fundada em 2017 e defende o liberalismo económico e político. Elegeu deputados pela primeira vez em 2019.',
    values: ['Liberdade individual', 'Livre mercado', 'Propriedade privada', 'Estado mínimo', 'Meritocracia'],
    proposals: [
      { title: 'Taxa única de IRS', description: 'Implementação de uma taxa fixa de imposto sobre rendimento.' },
      { title: 'Liberalização da economia', description: 'Redução da intervenção estatal na economia.' },
      { title: 'Cheque-ensino', description: 'Liberdade de escolha na educação.' },
    ],
    recentActivity: [
      { date: '2 Dez 2025', description: 'Apresentou proposta de reforma fiscal.' },
      { date: '20 Nov 2025', description: 'Conferência sobre liberdade económica.' },
    ],
  },
  be: {
    name: 'Bloco de Esquerda',
    abbreviation: 'BE',
    color: '#E30613',
    logo: logoBE,
    founded: '1999',
    ideology: 'Socialismo democrático, Ecossocialismo',
    history: 'O Bloco de Esquerda foi fundado em 1999 pela fusão de vários movimentos de esquerda. É um partido de esquerda socialista.',
    values: ['Igualdade', 'Direitos humanos', 'Ecologia', 'Feminismo', 'Anti-capitalismo'],
    proposals: [
      { title: 'Aumento do salário mínimo', description: 'Aumento significativo do salário mínimo nacional.' },
      { title: 'SNS público', description: 'Defesa de um sistema de saúde exclusivamente público.' },
      { title: 'Habitação', description: 'Controlo de rendas e construção pública.' },
    ],
    recentActivity: [
      { date: '1 Dez 2025', description: 'Proposta sobre direitos laborais.' },
      { date: '18 Nov 2025', description: 'Manifestação pelo direito à habitação.' },
    ],
  },
  pcp: {
    name: 'Partido Comunista Português',
    abbreviation: 'PCP',
    color: '#CC0000',
    logo: logoPCP,
    founded: '1921',
    ideology: 'Comunismo, Marxismo-Leninismo',
    history: 'O PCP foi fundado em 1921 e é um dos partidos mais antigos de Portugal. Teve um papel importante na resistência ao Estado Novo.',
    values: ['Socialismo', 'Internacionalismo', 'Direitos dos trabalhadores', 'Soberania nacional', 'Anti-imperialismo'],
    proposals: [
      { title: 'Nacionalizações', description: 'Nacionalização de setores estratégicos da economia.' },
      { title: 'Direitos laborais', description: 'Reforço dos direitos dos trabalhadores.' },
      { title: 'Soberania', description: 'Defesa da soberania nacional face à UE.' },
    ],
    recentActivity: [
      { date: '30 Nov 2025', description: 'Comício pela paz e contra a NATO.' },
      { date: '15 Nov 2025', description: 'Proposta sobre salários na função pública.' },
    ],
  },
  pan: {
    name: 'Pessoas-Animais-Natureza',
    abbreviation: 'PAN',
    color: '#00AA55',
    logo: logoPAN,
    founded: '2009',
    ideology: 'Ambientalismo, Direitos dos animais',
    history: 'O PAN foi fundado em 2009 e é um partido ecologista focado na defesa dos direitos dos animais e sustentabilidade ambiental.',
    values: ['Proteção animal', 'Sustentabilidade', 'Bem-estar', 'Não-violência', 'Ecologia'],
    proposals: [
      { title: 'Direitos dos animais', description: 'Fim das touradas e proteção animal.' },
      { title: 'Ambiente', description: 'Transição para energias renováveis.' },
      { title: 'Alimentação', description: 'Promoção de alimentação vegetariana nas escolas.' },
    ],
    recentActivity: [
      { date: '29 Nov 2025', description: 'Proposta sobre bem-estar animal.' },
      { date: '10 Nov 2025', description: 'Campanha contra o plástico.' },
    ],
  },
  livre: {
    name: 'LIVRE',
    abbreviation: 'L',
    color: '#00B140',
    logo: logoLivre,
    founded: '2014',
    ideology: 'Ecossocialismo, Progressismo',
    history: 'O LIVRE foi fundado em 2014 e é um partido ecologista de esquerda, progressista e europeísta.',
    values: ['Ecologia', 'Igualdade', 'Liberdade', 'Solidariedade', 'Europeísmo'],
    proposals: [
      { title: 'Rendimento básico', description: 'Estudo de implementação de rendimento básico universal.' },
      { title: 'Clima', description: 'Medidas urgentes contra as alterações climáticas.' },
      { title: 'Igualdade', description: 'Políticas de igualdade de género e antidiscriminação.' },
    ],
    recentActivity: [
      { date: '28 Nov 2025', description: 'Proposta sobre mobilidade sustentável.' },
      { date: '8 Nov 2025', description: 'Debate sobre políticas climáticas.' },
    ],
  },
};
