// Configuração do Supabase
const SUPABASE_URL = 'https://fwmlimudntlrkeukvyjg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gx8_WdV2x6n9FoZooniJCQ_s0hWGsiW';

// Aguardar o carregamento do SDK do Supabase
let supabaseClient = null;

// Inicializar quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase conectado com sucesso!');
    } else {
        console.error('❌ SDK do Supabase não carregado');
    }
});

console.log('📡 Supabase configuração carregada...');
