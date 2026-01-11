-- Schema para Calendário Colaborativo

-- Tabela de convites de calendário
CREATE TABLE IF NOT EXISTS calendario_convites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    igreja_id UUID REFERENCES igrejas(id),
    nome_calendario VARCHAR(200) NOT NULL,
    criado_por UUID REFERENCES usuarios(id),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de participantes do calendário
CREATE TABLE IF NOT EXISTS calendario_participantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    convite_id UUID REFERENCES calendario_convites(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id),
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    pode_editar BOOLEAN DEFAULT true,
    data_entrada TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tipos de eventos
CREATE TABLE IF NOT EXISTS calendario_tipos_evento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    cor VARCHAR(7) DEFAULT '#3B82F6', -- Cor em hexadecimal
    icone VARCHAR(50),
    convite_id UUID REFERENCES calendario_convites(id) ON DELETE CASCADE,
    padrao BOOLEAN DEFAULT false -- Tipos padrão do sistema
);

-- Inserir tipos de eventos padrão
INSERT INTO calendario_tipos_evento (nome, cor, icone, padrao) VALUES
    ('Ensaio', '#8B5CF6', '🎵', true),
    ('Aniversário', '#EC4899', '🎂', true),
    ('Consagração', '#10B981', '🙏', true),
    ('Evento Especial', '#F59E0B', '⭐', true),
    ('Reunião', '#3B82F6', '👥', true),
    ('Culto Especial', '#6366F1', '✝️', true);

-- Tabela de eventos do calendário
CREATE TABLE IF NOT EXISTS calendario_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    convite_id UUID REFERENCES calendario_convites(id) ON DELETE CASCADE,
    tipo_evento_id UUID REFERENCES calendario_tipos_evento(id),
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    data_evento DATE NOT NULL,
    hora_inicio TIME,
    hora_fim TIME,
    local VARCHAR(200),
    criado_por UUID REFERENCES calendario_participantes(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de comentários/anotações nos eventos
CREATE TABLE IF NOT EXISTS calendario_comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id UUID REFERENCES calendario_eventos(id) ON DELETE CASCADE,
    participante_id UUID REFERENCES calendario_participantes(id),
    comentario TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_calendario_eventos_data ON calendario_eventos(data_evento);
CREATE INDEX IF NOT EXISTS idx_calendario_eventos_convite ON calendario_eventos(convite_id);
CREATE INDEX IF NOT EXISTS idx_calendario_participantes_convite ON calendario_participantes(convite_id);

-- RLS Policies
ALTER TABLE calendario_convites ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendario_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendario_tipos_evento ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendario_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendario_comentarios ENABLE ROW LEVEL SECURITY;

-- Policies para convites (qualquer participante pode ver)
CREATE POLICY "Participantes podem ver convites" ON calendario_convites
    FOR SELECT USING (
        id IN (
            SELECT convite_id FROM calendario_participantes 
            WHERE usuario_id = auth.uid()
        )
    );

-- Policies para participantes
CREATE POLICY "Participantes podem ver outros participantes" ON calendario_participantes
    FOR SELECT USING (
        convite_id IN (
            SELECT convite_id FROM calendario_participantes 
            WHERE usuario_id = auth.uid()
        )
    );

CREATE POLICY "Participantes podem se cadastrar" ON calendario_participantes
    FOR INSERT WITH CHECK (true);

-- Policies para tipos de evento
CREATE POLICY "Todos podem ver tipos de evento" ON calendario_tipos_evento
    FOR SELECT USING (true);

-- Policies para eventos
CREATE POLICY "Participantes podem ver eventos" ON calendario_eventos
    FOR SELECT USING (
        convite_id IN (
            SELECT convite_id FROM calendario_participantes 
            WHERE usuario_id = auth.uid() OR usuario_id IS NULL
        )
    );

CREATE POLICY "Participantes podem criar eventos" ON calendario_eventos
    FOR INSERT WITH CHECK (
        convite_id IN (
            SELECT convite_id FROM calendario_participantes 
            WHERE usuario_id = auth.uid() OR usuario_id IS NULL
        )
    );

CREATE POLICY "Participantes podem editar eventos" ON calendario_eventos
    FOR UPDATE USING (
        convite_id IN (
            SELECT convite_id FROM calendario_participantes 
            WHERE usuario_id = auth.uid() OR usuario_id IS NULL
        )
    );

CREATE POLICY "Participantes podem deletar eventos" ON calendario_eventos
    FOR DELETE USING (
        convite_id IN (
            SELECT convite_id FROM calendario_participantes 
            WHERE usuario_id = auth.uid() OR usuario_id IS NULL
        )
    );

-- Policies para comentários
CREATE POLICY "Participantes podem ver comentários" ON calendario_comentarios
    FOR SELECT USING (
        evento_id IN (
            SELECT id FROM calendario_eventos WHERE convite_id IN (
                SELECT convite_id FROM calendario_participantes 
                WHERE usuario_id = auth.uid() OR usuario_id IS NULL
            )
        )
    );

CREATE POLICY "Participantes podem criar comentários" ON calendario_comentarios
    FOR INSERT WITH CHECK (
        evento_id IN (
            SELECT id FROM calendario_eventos WHERE convite_id IN (
                SELECT convite_id FROM calendario_participantes 
                WHERE usuario_id = auth.uid() OR usuario_id IS NULL
            )
        )
    );
