/* VitalPat Cemitério — endereço do banco (Supabase) desta cidade.
   Vazio = modo demonstração (dados fictícios, só no navegador).
   Preenchido = sistema de verdade, gravando no servidor.
   Use só a chave "anon / public" (Supabase → Project Settings → API). NUNCA a chave service_role. */
window.VP_SERVIDOR_CEMITERIO = {
  url: '',          // ex.: 'https://abcdefgh.supabase.co'
  chavePublica: '', // chave anon / public
  municipio: ''     // ex.: 'Rio do Sul/SC'
};
