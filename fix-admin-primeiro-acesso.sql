-- Fix: Forçar primeiro acesso para admin testar troca de senha

UPDATE usuarios 
SET primeiro_acesso = true 
WHERE usuario = 'admin';

-- Verificar resultado
SELECT id, usuario, nome, nivel, primeiro_acesso, ativo 
FROM usuarios 
WHERE usuario = 'admin';
