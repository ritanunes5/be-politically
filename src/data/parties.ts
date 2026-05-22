// Static UI metadata for the 8 existing parties (logo asset, brand color, key).
// All long-form content (history, proposals, sources, last verified date) lives in Supabase.
// Do not add or remove parties here.

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
  { id: 'ps',    name: 'Partido Socialista',          abbreviation: 'PS',  description: 'Partido português que se identifica com a social-democracia e o europeísmo.', color: '#FF66B2', ideology: 'Social-democracia',         logo: logoPS },
  { id: 'psd',   name: 'Partido Social Democrata',    abbreviation: 'PSD', description: 'Partido português que se identifica com o centro-direita, o liberalismo social e o europeísmo.', color: '#FF6600', ideology: 'Liberalismo social', logo: logoPSD },
  { id: 'chega', name: 'Chega',                       abbreviation: 'CH',  description: 'Partido português fundado em 2019, que se identifica com o conservadorismo e o populismo de direita.', color: '#1C1C1C', ideology: 'Conservadorismo nacional', logo: logoChega },
  { id: 'il',    name: 'Iniciativa Liberal',          abbreviation: 'IL',  description: 'Partido português fundado em 2017, que se identifica com o liberalismo clássico.', color: '#00AEEF', ideology: 'Liberalismo',           logo: logoIL },
  { id: 'be',    name: 'Bloco de Esquerda',           abbreviation: 'BE',  description: 'Partido português fundado em 1999, que se identifica com a esquerda socialista e o ecossocialismo.', color: '#E30613', ideology: 'Socialismo democrático', logo: logoBE },
  { id: 'pcp',   name: 'Partido Comunista Português', abbreviation: 'PCP', description: 'Partido português fundado em 1921, que se identifica com o comunismo e o marxismo-leninismo.', color: '#CC0000', ideology: 'Comunismo',                 logo: logoPCP },
  { id: 'pan',   name: 'Pessoas-Animais-Natureza',    abbreviation: 'PAN', description: 'Partido português fundado em 2009, focado em ambientalismo e direitos dos animais.', color: '#00AA55', ideology: 'Ambientalismo',          logo: logoPAN },
  { id: 'livre', name: 'LIVRE',                       abbreviation: 'L',   description: 'Partido português fundado em 2014, que se identifica com o ecossocialismo e o progressismo europeísta.', color: '#00B140', ideology: 'Ecossocialismo', logo: logoLivre },
];

export const getPartyById = (id: string): Party | undefined =>
  partiesData.find((party) => party.id === id);

export const getPartyLogoByKey = (key: string): string | undefined =>
  partiesData.find((p) => p.id === key)?.logo;
