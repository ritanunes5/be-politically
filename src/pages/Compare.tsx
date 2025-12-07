import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitCompare, Building2, FileText, ArrowRight, Scale, Lightbulb, Target } from 'lucide-react';
import { useState } from 'react';
import { partiesData } from '@/data/parties';
import PartyLogo from '@/components/PartyLogo';

const proposalsForCompare = [
  { id: 'housing-ps', name: 'Habitação Pública - PS', party: 'PS' },
  { id: 'housing-psd', name: 'Incentivos Fiscais Habitação - PSD', party: 'PSD' },
  { id: 'tax-ps', name: 'Reforma Fiscal - PS', party: 'PS' },
  { id: 'tax-il', name: 'Taxa Única IRS - IL', party: 'IL' },
  { id: 'health-be', name: 'SNS Universal - BE', party: 'BE' },
  { id: 'health-psd', name: 'Parceria Público-Privada - PSD', party: 'PSD' },
];

const partyComparisonData: Record<string, { economy: string; health: string; environment: string; housing: string }> = {
  ps: {
    economy: 'Investimento público, impostos progressivos, apoio ao Estado Social.',
    health: 'Reforço do SNS, mais profissionais, redução de listas de espera.',
    environment: 'Meta carbono neutro 2050, investimento em renováveis.',
    housing: 'Construção pública, regulação de rendas, apoio a jovens.',
  },
  psd: {
    economy: 'Redução de impostos, menos burocracia, apoio a empresas.',
    health: 'Parcerias público-privadas, liberdade de escolha.',
    environment: 'Transição energética gradual, incentivos de mercado.',
    housing: 'Incentivos fiscais, liberalização do mercado.',
  },
  il: {
    economy: 'Taxa única de IRS, redução drástica de impostos.',
    health: 'Cheque-saúde, concorrência entre prestadores.',
    environment: 'Mercado de carbono, inovação tecnológica.',
    housing: 'Liberalização total do mercado de arrendamento.',
  },
  be: {
    economy: 'Aumento do salário mínimo, nacionalizações estratégicas.',
    health: 'SNS exclusivamente público e universal.',
    environment: 'Fim dos combustíveis fósseis até 2040.',
    housing: 'Controlo de rendas, requisição de casas devolutas.',
  },
  pcp: {
    economy: 'Nacionalização de setores estratégicos, salários dignos.',
    health: 'SNS público, gratuito e universal.',
    environment: 'Transição justa, soberania energética.',
    housing: 'Direito à habitação, construção pública massiva.',
  },
  chega: {
    economy: 'Redução do Estado, liberalização económica.',
    health: 'Eficiência na gestão pública, combate ao desperdício.',
    environment: 'Equilíbrio entre desenvolvimento e ambiente.',
    housing: 'Acesso à propriedade, combate à especulação.',
  },
  pan: {
    economy: 'Economia sustentável, economia circular.',
    health: 'Prevenção, saúde mental, bem-estar animal.',
    environment: 'Emergência climática, transição energética urgente.',
    housing: 'Habitação sustentável, reabilitação urbana.',
  },
  livre: {
    economy: 'Rendimento básico, economia verde.',
    health: 'SNS forte, saúde mental prioritária.',
    environment: 'Neutralidade carbónica 2040, biodiversidade.',
    housing: 'Direito à habitação, regulação de rendas.',
  },
};

const Compare = () => {
  const [party1, setParty1] = useState<string>('');
  const [party2, setParty2] = useState<string>('');
  const [proposal1, setProposal1] = useState<string>('');
  const [proposal2, setProposal2] = useState<string>('');
  const [showComparison, setShowComparison] = useState(false);

  const handleCompareParties = () => {
    if (party1 && party2) {
      setShowComparison(true);
    }
  };

  const party1Data = party1 ? partiesData.find(p => p.id === party1) : null;
  const party2Data = party2 ? partiesData.find(p => p.id === party2) : null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold font-display mb-2 flex items-center gap-3">
            <GitCompare className="w-8 h-8 text-primary" />
            Comparador
          </h1>
          <p className="text-muted-foreground">
            Compara partidos políticos ou propostas específicas lado a lado.
          </p>
        </div>

        {/* Tabs for comparison modes */}
        <Tabs defaultValue="parties" className="animate-slide-up">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="parties" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Comparar Partidos
            </TabsTrigger>
            <TabsTrigger value="proposals" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Comparar Propostas
            </TabsTrigger>
          </TabsList>

          {/* Compare Parties */}
          <TabsContent value="parties" className="space-y-6 mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-5 gap-4 items-end">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium">Partido 1</label>
                    <Select value={party1} onValueChange={(v) => { setParty1(v); setShowComparison(false); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar partido" />
                      </SelectTrigger>
                      <SelectContent>
                        {partiesData.map((party) => (
                          <SelectItem key={party.id} value={party.id} disabled={party.id === party2}>
                            <div className="flex items-center gap-2">
                              <PartyLogo 
                                src={party.logo} 
                                alt={party.abbreviation}
                                size="xs"
                              />
                              {party.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-center">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90 md:rotate-0" />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium">Partido 2</label>
                    <Select value={party2} onValueChange={(v) => { setParty2(v); setShowComparison(false); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar partido" />
                      </SelectTrigger>
                      <SelectContent>
                        {partiesData.map((party) => (
                          <SelectItem key={party.id} value={party.id} disabled={party.id === party1}>
                            <div className="flex items-center gap-2">
                              <PartyLogo 
                                src={party.logo} 
                                alt={party.abbreviation}
                                size="xs"
                              />
                              {party.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <Button 
                    size="lg" 
                    onClick={handleCompareParties}
                    disabled={!party1 || !party2}
                  >
                    <GitCompare className="w-4 h-4 mr-2" />
                    Comparar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Comparison Results */}
            {showComparison && party1Data && party2Data && (
              <div className="grid md:grid-cols-2 gap-6 animate-scale-in">
                {[
                  { key: 'economy', label: 'Economia', icon: Target },
                  { key: 'health', label: 'Saúde', icon: Scale },
                  { key: 'environment', label: 'Ambiente', icon: Lightbulb },
                  { key: 'housing', label: 'Habitação', icon: Building2 },
                ].map((topic) => (
                  <Card key={topic.key}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <topic.icon className="w-5 h-5 text-primary" />
                        {topic.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-secondary/50">
                          <div className="flex items-center gap-2 mb-2">
                            <PartyLogo 
                              src={party1Data.logo} 
                              alt={party1Data.abbreviation}
                              size="sm"
                            />
                            <span className="font-medium text-sm">{party1Data.abbreviation}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {partyComparisonData[party1]?.[topic.key as keyof typeof partyComparisonData['ps']] || 'Sem informação disponível.'}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-secondary/50">
                          <div className="flex items-center gap-2 mb-2">
                            <PartyLogo 
                              src={party2Data.logo} 
                              alt={party2Data.abbreviation}
                              size="sm"
                            />
                            <span className="font-medium text-sm">{party2Data.abbreviation}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {partyComparisonData[party2]?.[topic.key as keyof typeof partyComparisonData['ps']] || 'Sem informação disponível.'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Compare Proposals */}
          <TabsContent value="proposals" className="space-y-6 mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-5 gap-4 items-end">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium">Proposta 1</label>
                    <Select value={proposal1} onValueChange={setProposal1}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar proposta" />
                      </SelectTrigger>
                      <SelectContent>
                        {proposalsForCompare.map((proposal) => (
                          <SelectItem key={proposal.id} value={proposal.id} disabled={proposal.id === proposal2}>
                            {proposal.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-center">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90 md:rotate-0" />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium">Proposta 2</label>
                    <Select value={proposal2} onValueChange={setProposal2}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar proposta" />
                      </SelectTrigger>
                      <SelectContent>
                        {proposalsForCompare.map((proposal) => (
                          <SelectItem key={proposal.id} value={proposal.id} disabled={proposal.id === proposal1}>
                            {proposal.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <Button 
                    size="lg"
                    disabled={!proposal1 || !proposal2}
                  >
                    <GitCompare className="w-4 h-4 mr-2" />
                    Comparar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Selecione duas propostas para ver a comparação detalhada.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Compare;
