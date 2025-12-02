-- Estrutura do banco de dados EBD-IEAD no Supabase

-- Tabela de Igrejas
CREATE TABLE IF NOT EXISTS igrejas (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    endereco TEXT,
    cidade TEXT,
    uf TEXT,
    pastor TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    usuario TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    nome TEXT NOT NULL,
    email TEXT,
    celular TEXT,
    nivel INTEGER NOT NULL CHECK (nivel IN (1, 2, 3)),
    igreja_id INTEGER REFERENCES igrejas(id),
    ativo BOOLEAN DEFAULT TRUE,
    primeiro_acesso BOOLEAN DEFAULT TRUE,
    criado_via_convite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Lançamentos (presença e ofertas)
CREATE TABLE IF NOT EXISTS lancamentos (
    id SERIAL PRIMARY KEY,
    data DATE NOT NULL,
    licao TEXT,
    igreja_id INTEGER REFERENCES igrejas(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Grupos (presença por grupo)
CREATE TABLE IF NOT EXISTS grupos_presenca (
    id SERIAL PRIMARY KEY,
    lancamento_id INTEGER REFERENCES lancamentos(id) ON DELETE CASCADE,
    grupo_id TEXT NOT NULL,
    presente INTEGER DEFAULT 0,
    ausente INTEGER DEFAULT 0,
    visita INTEGER DEFAULT 0,
    UNIQUE(lancamento_id, grupo_id)
);

-- Tabela de Ofertas
CREATE TABLE IF NOT EXISTS ofertas (
    id SERIAL PRIMARY KEY,
    lancamento_id INTEGER REFERENCES lancamentos(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('geral', 'missoes', 'construcao', 'outra')),
    valor DECIMAL(10, 2) NOT NULL DEFAULT 0,
    observacao TEXT
);

-- Tabela de Lições
CREATE TABLE IF NOT EXISTS licoes (
    id SERIAL PRIMARY KEY,
    data DATE NOT NULL,
    licao INTEGER NOT NULL,
    tema TEXT NOT NULL,
    igreja_id INTEGER REFERENCES igrejas(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(data, igreja_id)
);

-- Tabela de Convites
CREATE TABLE IF NOT EXISTS convites (
    id TEXT PRIMARY KEY,
    nivel INTEGER NOT NULL CHECK (nivel IN (2, 3)),
    igreja_id INTEGER REFERENCES igrejas(id),
    expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    usado_em TIMESTAMP WITH TIME ZONE,
    usuario_criado_id INTEGER REFERENCES usuarios(id),
    criado_por INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE igrejas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupos_presenca ENABLE ROW LEVEL SECURITY;
ALTER TABLE ofertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE licoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE convites ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (temporariamente liberado para teste)
CREATE POLICY "Permitir tudo temporariamente" ON igrejas FOR ALL USING (true);
CREATE POLICY "Permitir tudo temporariamente" ON usuarios FOR ALL USING (true);
CREATE POLICY "Permitir tudo temporariamente" ON lancamentos FOR ALL USING (true);
CREATE POLICY "Permitir tudo temporariamente" ON grupos_presenca FOR ALL USING (true);
CREATE POLICY "Permitir tudo temporariamente" ON ofertas FOR ALL USING (true);
CREATE POLICY "Permitir tudo temporariamente" ON licoes FOR ALL USING (true);
CREATE POLICY "Permitir tudo temporariamente" ON convites FOR ALL USING (true);

-- Inserir igrejas padrão
INSERT INTO igrejas (nome, endereco, cidade, uf, pastor, ativo) VALUES
('IEAD - Sede', 'Rua Central, 100', 'Cidade', 'UF', 'Pastor Titular', true),
('IEAD - Coophmil', 'Av. Principal, 200', 'Cidade', 'UF', 'Pastor Auxiliar', true),
('IEAD - Cidade Alta', 'Rua das Flores, 300', 'Cidade', 'UF', 'Pastor Presidente', true),
('IEAD - Temp', 'Rua Temporária, 400', 'Cidade', 'UF', 'Pastor Evangelista', true)
ON CONFLICT DO NOTHING;

-- Inserir usuário admin padrão
INSERT INTO usuarios (usuario, senha, nome, email, nivel, igreja_id, ativo, primeiro_acesso) VALUES
('admin', 'admin123', 'Administrador', 'admin@iead.com', 1, NULL, true, false)
ON CONFLICT (usuario) DO NOTHING;
