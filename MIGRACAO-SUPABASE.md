# Plano de Migração para Supabase

## ✅ Concluído

1. **Supabase configurado**
   - URL: https://fwmlimudntlrkeukvyjg.supabase.co
   - Chave anon configurada
   - SDK carregado no index.html

2. **Banco de dados criado**
   - 7 tabelas: igrejas, usuarios, lancamentos, grupos_presenca, ofertas, licoes, convites
   - Dados iniciais: 4 igrejas e 1 admin
   - RLS habilitado (políticas temporárias liberadas)

3. **Arquivos criados**
   - `supabase-config.js` - Configuração e cliente
   - `supabase-schema.sql` - Estrutura do banco

## 🔄 Próximos Passos (Migração Completa)

### 1. Migrar Funções de Igrejas (auth.js)
- [ ] `getIgrejas()` - Buscar do Supabase em vez de localStorage
- [ ] `salvarIgrejas()` - Não necessário (Supabase salva automaticamente)
- [ ] `listarIgrejas()` - Buscar do Supabase
- [ ] `salvarIgreja()` - Inserir/Atualizar no Supabase
- [ ] `toggleAtivoIgreja()` - Atualizar no Supabase

### 2. Migrar Funções de Usuários (auth.js)
- [ ] `getUsuarios()` - Buscar do Supabase
- [ ] `salvarUsuarios()` - Não necessário
- [ ] `realizarLogin()` - Verificar credenciais no Supabase
- [ ] `listarUsuarios()` - Buscar do Supabase
- [ ] `salvarUsuario()` - Inserir/Atualizar no Supabase
- [ ] `resetarSenhaUsuario()` - Atualizar no Supabase
- [ ] `toggleAtivoUsuario()` - Atualizar no Supabase

### 3. Migrar Funções de Lançamentos (index.html)
- [ ] `salvarDados()` - Inserir lançamento + grupos + ofertas no Supabase
- [ ] `carregarDados()` - Buscar do Supabase
- [ ] `excluirRegistro()` - Deletar do Supabase
- [ ] Filtros e buscas - Adaptar queries

### 4. Migrar Funções de Lições (licoes.js)
- [ ] `salvarLicao()` - Inserir/Atualizar no Supabase
- [ ] `listarLicoes()` - Buscar do Supabase
- [ ] `excluirLicao()` - Deletar do Supabase

### 5. Migrar Sistema de Convites (auth.js)
- [ ] `gerarLinkConvite()` - Salvar no Supabase
- [ ] `processarConvite()` - Verificar no Supabase
- [ ] `finalizarCadastroConvite()` - Marcar como usado

### 6. Funções Auxiliares
- [ ] Criar funções helper para queries comuns
- [ ] Tratamento de erros do Supabase
- [ ] Loading states durante queries
- [ ] Cache local opcional (performance)

## 📝 Exemplo de Conversão

### Antes (localStorage):
```javascript
function getIgrejas() {
    const igrejas = localStorage.getItem('igrejasEBD');
    return igrejas ? JSON.parse(igrejas) : igrejaspadrao;
}
```

### Depois (Supabase):
```javascript
async function getIgrejas() {
    const sb = getSupabase();
    const { data, error } = await sb
        .from('igrejas')
        .select('*')
        .eq('ativo', true)
        .order('nome');
    
    if (error) {
        console.error('Erro ao buscar igrejas:', error);
        return [];
    }
    
    return data || [];
}
```

## ⚠️ Importantes

1. **Todas as funções viram async/await**
2. **Remover localStorage.setItem/getItem**
3. **Adicionar tratamento de erros**
4. **Testar cada função após migrar**
5. **Manter backup dos dados locais antes de começar**

## 🚀 Para Continuar

Em uma nova conversa com o Copilot, peça:

"Continue a migração do localStorage para Supabase seguindo o plano em MIGRACAO-SUPABASE.md. Comece pelas funções de Igrejas."

---

**Status Atual:** ✅ Supabase configurado e pronto | 🔄 Aguardando migração das funções
