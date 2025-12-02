// Configuração do Supabase
const SUPABASE_URL = 'https://fwmlimudntlrkeukvyjg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3bWxpbXVkbnRscmtldWt2eWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTkyNTMsImV4cCI6MjA4MDI3NTI1M30.Okcp4xYzu5FHlcn1baGFiy5dCvX2-mg1PVr9IiBh7Ko';

// Cliente Supabase global
let supabaseClient = null;

// Função para obter o cliente Supabase
function getSupabase() {
    if (!supabaseClient && typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Cliente Supabase inicializado');
    }
    return supabaseClient;
}

console.log('📡 Supabase config carregado - aguardando inicialização...');
