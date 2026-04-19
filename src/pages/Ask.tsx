import { useEffect, useRef, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useSubscription, FREE_LIMITS } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import PremiumGate from '@/components/PremiumGate';
import { toast } from '@/hooks/use-toast';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const suggestions = [
  'O que é uma moção de censura?',
  'Como funciona o sistema eleitoral português?',
  'Diferenças entre os principais partidos sobre habitação',
  'O que é o Orçamento de Estado?',
];

const Ask = () => {
  const { isPremium, canUseAi, aiChatsToday, refresh } = useSubscription();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    if (!canUseAi) {
      setGateOpen(true);
      return;
    }

    const userMsg: Msg = { role: 'user', content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setStreaming(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: next }),
      });

      if (!resp.ok) {
        let payload: { error?: string; code?: string } = {};
        try {
          payload = await resp.json();
        } catch {
          // ignore
        }
        if (resp.status === 403 && payload.code === 'QUOTA_EXCEEDED') {
          setGateOpen(true);
        } else if (resp.status === 429) {
          toast({ title: 'Demasiados pedidos', description: 'Tenta daqui a pouco.', variant: 'destructive' });
        } else if (resp.status === 402) {
          toast({ title: 'Créditos esgotados', description: 'O serviço de IA está temporariamente indisponível.', variant: 'destructive' });
        } else {
          toast({ title: 'Erro', description: payload.error ?? 'Falha ao falar com a IA.', variant: 'destructive' });
        }
        setMessages(messages);
        setStreaming(false);
        return;
      }

      if (!resp.body) throw new Error('No body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantSoFar = '';
      let started = false;
      let done = false;

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          if (!started) {
            started = true;
            return [...prev, { role: 'assistant', content: assistantSoFar }];
          }
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        });
      };

      while (!done) {
        const { done: rDone, value } = await reader.read();
        if (rDone) break;
        textBuffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, nl);
          textBuffer = textBuffer.slice(nl + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (c) upsert(c);
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Falha de ligação.', variant: 'destructive' });
      setMessages(messages);
    } finally {
      setStreaming(false);
      refresh();
    }
  };

  return (
    <Layout>
      <PremiumGate
        open={gateOpen}
        onOpenChange={setGateOpen}
        title="Limite diário de IA atingido"
        description={`Já usaste a tua ${FREE_LIMITS.aiChatPerDay} pergunta gratuita de hoje. Faz upgrade para Premium e pergunta sem limites.`}
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl flex flex-col h-[calc(100vh-8rem)]">
        <div className="animate-fade-in mb-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold font-display mb-2 flex items-center gap-3">
              <Bot className="w-8 h-8 text-primary" />
              Pergunta ao Be+Politic
            </h1>
            <p className="text-muted-foreground text-sm">
              Faz qualquer pergunta sobre política portuguesa. Respostas imparciais e simples.
            </p>
          </div>
          {!isPremium && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>
                <span className="font-medium">{aiChatsToday}/{FREE_LIMITS.aiChatPerDay}</span> hoje
              </span>
            </div>
          )}
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden animate-slide-up">
          <CardContent ref={scrollRef as never} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg mb-2">Por onde queres começar?</h2>
                  <p className="text-sm text-muted-foreground mb-4">Sugestões para experimentar:</p>
                  <div className="grid sm:grid-cols-2 gap-2 max-w-xl">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        disabled={streaming}
                        className="text-left p-3 rounded-lg bg-secondary/50 hover:bg-secondary text-sm transition-colors disabled:opacity-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    }`}
                  >
                    {m.role === 'user' ? (
                      <UserIcon className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/50'
                    }`}
                  >
                    {m.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0">
                        <ReactMarkdown>{m.content || '...'}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}
            {streaming && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-secondary/50 rounded-2xl px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </CardContent>

          <div className="border-t border-border p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex gap-2 items-end"
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Escreve a tua pergunta..."
                disabled={streaming}
                className="resize-none min-h-[44px] max-h-32"
                rows={1}
              />
              <Button type="submit" size="icon" disabled={streaming || !input.trim()}>
                {streaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Ask;
