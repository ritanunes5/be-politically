import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { topicsData } from '@/data/topics';


const Topics = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTopics = topicsData.filter((topic) =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold font-display mb-2">Temas Políticos</h1>
          <p className="text-muted-foreground">
            Descobre as posições dos partidos sobre os principais temas da atualidade.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md animate-slide-up">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Pesquisar temas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {filteredTopics.map((topic) => {
            const Icon = topic.icon;
            return (
              <Link key={topic.id} to={`/topics/${topic.id}`}>
                <Card className="group cursor-pointer h-full hover:border-primary/50 transition-all overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${topic.color}`} />
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                          {topic.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {topic.description}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {topic.parties} partidos com posição
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end mt-4 text-sm text-primary font-medium">
                      Explorar
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum tema encontrado.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Topics;
