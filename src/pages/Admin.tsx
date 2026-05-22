import { useEffect, useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, AlertTriangle, Save, Trash2, Plus, ExternalLink, CheckCircle2, ShieldOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { toast } from '@/hooks/use-toast';
import { checkNeutrality, type NeutralityIssue } from '@/lib/neutrality';
import { Navigate } from 'react-router-dom';
import type { DbParty } from '@/hooks/useParties';
import type { DbProposal } from '@/hooks/useProposals';

interface DbSource {
  id: string;
  proposal_id: string;
  source_type: string;
  url: string;
  source_document_name: string | null;
  original_excerpt: string | null;
}

const SOURCE_TYPES = [
  'programa_eleitoral',
  'projeto_lei',
  'declaracao_oficial',
  'site_oficial',
];

const NeutralityWarning = ({ issues }: { issues: NeutralityIssue[] }) => {
  if (issues.length === 0) return null;
  return (
    <Alert variant="destructive" className="mt-2">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Linguagem potencialmente enviesada</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-5 text-xs mt-1 space-y-1">
          {issues.map((i) => (
            <li key={i.term}>
              <strong>{i.term}</strong> — {i.suggestion}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};

const PartiesAdmin = ({ parties, reload }: { parties: DbParty[]; reload: () => void }) => {
  const [editing, setEditing] = useState<DbParty | null>(null);
  const issues = editing ? checkNeutrality(editing.short_neutral_description ?? '') : [];

  const save = async () => {
    if (!editing) return;
    const { error } = await supabase
      .from('parties')
      .update({
        name: editing.name,
        acronym: editing.acronym,
        short_neutral_description: editing.short_neutral_description,
        official_website: editing.official_website,
        logo_url: editing.logo_url,
        last_verified_date: editing.last_verified_date,
      })
      .eq('id', editing.id);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Partido atualizado' });
    setEditing(null);
    reload();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Partidos existentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            A criação e remoção de partidos está bloqueada. Apenas é permitida a edição dos {parties.length} partidos atuais.
          </p>
          <div className="space-y-2">
            {parties.map((p) => (
              <button
                key={p.id}
                onClick={() => setEditing(p)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  editing?.id === p.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary/50'
                }`}
              >
                <div className="font-medium">{p.name} <span className="text-muted-foreground">({p.acronym})</span></div>
                <div className="text-xs text-muted-foreground truncate">{p.short_neutral_description}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{editing ? `Editar: ${editing.name}` : 'Selecione um partido'}</CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-3">
              <div>
                <Label>Nome</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <Label>Acrónimo</Label>
                <Input value={editing.acronym} onChange={(e) => setEditing({ ...editing, acronym: e.target.value })} />
              </div>
              <div>
                <Label>Descrição neutra</Label>
                <Textarea
                  rows={3}
                  value={editing.short_neutral_description ?? ''}
                  onChange={(e) => setEditing({ ...editing, short_neutral_description: e.target.value })}
                />
                <NeutralityWarning issues={issues} />
              </div>
              <div>
                <Label>Site oficial</Label>
                <Input
                  value={editing.official_website ?? ''}
                  onChange={(e) => setEditing({ ...editing, official_website: e.target.value })}
                  placeholder="https://"
                />
              </div>
              <div>
                <Label>Logo URL (opcional)</Label>
                <Input
                  value={editing.logo_url ?? ''}
                  onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })}
                />
              </div>
              <div>
                <Label>Última verificação</Label>
                <Input
                  type="date"
                  value={editing.last_verified_date ?? ''}
                  onChange={(e) => setEditing({ ...editing, last_verified_date: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={save}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Escolha um partido na lista para editar.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface ProposalDraft {
  id?: string;
  party_id: string;
  category: string;
  title: string;
  neutral_summary: string;
  official_source_url: string;
  source_document_name: string;
  last_verified_date: string;
  is_validated: boolean;
}

const emptyDraft = (): ProposalDraft => ({
  party_id: '',
  category: '',
  title: '',
  neutral_summary: '',
  official_source_url: '',
  source_document_name: '',
  last_verified_date: new Date().toISOString().slice(0, 10),
  is_validated: false,
});

const ProposalsAdmin = ({ parties }: { parties: DbParty[] }) => {
  const [proposals, setProposals] = useState<DbProposal[]>([]);
  const [draft, setDraft] = useState<ProposalDraft>(emptyDraft());
  const [sources, setSources] = useState<DbSource[]>([]);
  const [newSource, setNewSource] = useState({ source_type: 'programa_eleitoral', url: '', source_document_name: '', original_excerpt: '' });

  const load = async () => {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else setProposals(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const loadSources = async (proposalId: string) => {
    const { data, error } = await supabase
      .from('proposal_sources')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('created_at');
    if (!error) setSources(data ?? []);
  };

  const selectProposal = (p: DbProposal) => {
    setDraft({
      id: p.id,
      party_id: p.party_id,
      category: p.category,
      title: p.title,
      neutral_summary: p.neutral_summary,
      official_source_url: p.official_source_url ?? '',
      source_document_name: p.source_document_name ?? '',
      last_verified_date: p.last_verified_date ?? '',
      is_validated: p.is_validated,
    });
    loadSources(p.id);
  };

  const titleIssues = useMemo(() => checkNeutrality(draft.title), [draft.title]);
  const summaryIssues = useMemo(() => checkNeutrality(draft.neutral_summary), [draft.neutral_summary]);
  const allIssues = [...titleIssues, ...summaryIssues];

  const canValidate = !!(draft.official_source_url && draft.source_document_name);

  const save = async (validate: boolean) => {
    if (!draft.party_id || !draft.category || !draft.title || !draft.neutral_summary) {
      toast({ title: 'Faltam campos obrigatórios', variant: 'destructive' });
      return;
    }
    if (validate && !canValidate) {
      toast({ title: 'Validação requer fonte', description: 'Adicione URL e nome do documento oficial antes de validar.', variant: 'destructive' });
      return;
    }
    const payload = {
      party_id: draft.party_id,
      category: draft.category,
      title: draft.title,
      neutral_summary: draft.neutral_summary,
      official_source_url: draft.official_source_url || null,
      source_document_name: draft.source_document_name || null,
      last_verified_date: draft.last_verified_date || null,
      is_validated: validate ? true : draft.is_validated,
    };

    let result;
    if (draft.id) {
      result = await supabase.from('proposals').update(payload).eq('id', draft.id);
    } else {
      result = await supabase.from('proposals').insert(payload);
    }
    if (result.error) {
      toast({ title: 'Erro', description: result.error.message, variant: 'destructive' });
      return;
    }
    toast({ title: draft.id ? 'Proposta atualizada' : 'Proposta criada' });
    setDraft(emptyDraft());
    setSources([]);
    load();
  };

  const remove = async () => {
    if (!draft.id) return;
    if (!confirm('Eliminar esta proposta?')) return;
    const { error } = await supabase.from('proposals').delete().eq('id', draft.id);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Proposta eliminada' });
    setDraft(emptyDraft());
    setSources([]);
    load();
  };

  const addSource = async () => {
    if (!draft.id || !newSource.url) return;
    const { error } = await supabase.from('proposal_sources').insert({
      proposal_id: draft.id,
      source_type: newSource.source_type,
      url: newSource.url,
      source_document_name: newSource.source_document_name || null,
      original_excerpt: newSource.original_excerpt || null,
    });
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }
    setNewSource({ source_type: 'programa_eleitoral', url: '', source_document_name: '', original_excerpt: '' });
    loadSources(draft.id);
  };

  const deleteSource = async (id: string) => {
    const { error } = await supabase.from('proposal_sources').delete().eq('id', id);
    if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    if (draft.id) loadSources(draft.id);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Propostas</CardTitle>
          <Button size="sm" variant="outline" onClick={() => { setDraft(emptyDraft()); setSources([]); }}>
            <Plus className="w-4 h-4 mr-1" /> Nova
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {proposals.map((p) => {
              const party = parties.find((pa) => pa.id === p.party_id);
              return (
                <button
                  key={p.id}
                  onClick={() => selectProposal(p)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    draft.id === p.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-sm">{p.title}</div>
                    {p.is_validated ? (
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <ShieldOff className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {party?.acronym} · {p.category}
                  </div>
                </button>
              );
            })}
            {proposals.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Sem propostas.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{draft.id ? 'Editar proposta' : 'Nova proposta'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Partido</Label>
            <Select value={draft.party_id} onValueChange={(v) => setDraft({ ...draft, party_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
              <SelectContent>
                {parties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name} ({p.acronym})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Categoria</Label>
            <Input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="Habitação, Saúde, Fiscalidade..." />
          </div>
          <div>
            <Label>Título</Label>
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div>
            <Label>Resumo neutro</Label>
            <Textarea rows={3} value={draft.neutral_summary} onChange={(e) => setDraft({ ...draft, neutral_summary: e.target.value })} />
          </div>
          <NeutralityWarning issues={allIssues} />
          <div>
            <Label>URL da fonte oficial *</Label>
            <Input value={draft.official_source_url} onChange={(e) => setDraft({ ...draft, official_source_url: e.target.value })} placeholder="https://" />
          </div>
          <div>
            <Label>Nome do documento *</Label>
            <Input value={draft.source_document_name} onChange={(e) => setDraft({ ...draft, source_document_name: e.target.value })} placeholder="Ex.: Programa Eleitoral 2024" />
          </div>
          <div>
            <Label>Última verificação</Label>
            <Input type="date" value={draft.last_verified_date} onChange={(e) => setDraft({ ...draft, last_verified_date: e.target.value })} />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={() => save(false)}>
              <Save className="w-4 h-4 mr-2" /> Guardar
            </Button>
            <Button
              variant="default"
              onClick={() => save(true)}
              disabled={!canValidate}
              title={!canValidate ? 'Adicione URL e nome do documento oficial primeiro.' : 'Validar e publicar'}
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              {draft.is_validated ? 'Validada' : 'Validar e publicar'}
            </Button>
            {draft.id && (
              <Button variant="destructive" onClick={remove}>
                <Trash2 className="w-4 h-4 mr-2" /> Eliminar
              </Button>
            )}
          </div>

          {draft.id && (
            <div className="pt-4 border-t mt-4 space-y-3">
              <h4 className="font-semibold text-sm">Fontes adicionais</h4>
              {sources.map((s) => (
                <div key={s.id} className="p-2 rounded border flex items-start justify-between gap-2">
                  <div className="text-xs flex-1 min-w-0">
                    <div className="font-medium">{s.source_type}</div>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary inline-flex items-center gap-1 truncate">
                      <ExternalLink className="w-3 h-3" /> {s.url}
                    </a>
                    {s.source_document_name && <div className="text-muted-foreground">{s.source_document_name}</div>}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deleteSource(s.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <div className="space-y-2 p-3 border rounded-lg">
                <Select value={newSource.source_type} onValueChange={(v) => setNewSource({ ...newSource, source_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SOURCE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="URL" value={newSource.url} onChange={(e) => setNewSource({ ...newSource, url: e.target.value })} />
                <Input placeholder="Nome do documento" value={newSource.source_document_name} onChange={(e) => setNewSource({ ...newSource, source_document_name: e.target.value })} />
                <Textarea rows={2} placeholder="Excerto original (opcional)" value={newSource.original_excerpt} onChange={(e) => setNewSource({ ...newSource, original_excerpt: e.target.value })} />
                <Button size="sm" onClick={addSource} disabled={!newSource.url}>
                  <Plus className="w-4 h-4 mr-1" /> Adicionar fonte
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Admin = () => {
  const { data: isAdmin, isLoading } = useIsAdmin();
  const [parties, setParties] = useState<DbParty[]>([]);

  const loadParties = async () => {
    const { data } = await supabase.from('parties').select('*').order('name');
    setParties(data ?? []);
  };

  useEffect(() => { loadParties(); }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">A carregar...</div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display mb-2 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary" />
            Administração
          </h1>
          <p className="text-muted-foreground">
            Gestão dos partidos existentes e das suas propostas validadas com fonte oficial.
          </p>
        </div>

        <Tabs defaultValue="parties">
          <TabsList>
            <TabsTrigger value="parties">Partidos</TabsTrigger>
            <TabsTrigger value="proposals">Propostas</TabsTrigger>
          </TabsList>
          <TabsContent value="parties" className="mt-6">
            <PartiesAdmin parties={parties} reload={loadParties} />
          </TabsContent>
          <TabsContent value="proposals" className="mt-6">
            <ProposalsAdmin parties={parties} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
