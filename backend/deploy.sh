#!/bin/bash

echo "--- Iniciando Correção do Deploy ---"

# 1. Corrigir Senha do Banco de Dados
echo "1. Ajustando senha do PostgreSQL..."
sudo -u postgres psql -c "ALTER USER license_user WITH PASSWORD 'Licensing2024!';"

# 2. Instalar Dependências e Compilar
echo "2. Instalando dependências e compilando..."
npm install
npm run build

# 3. Rodar Migrações
echo "3. Rodando migrações do banco..."
npx prisma migrate deploy

# 4. Reiniciar PM2 com Configuração Atualizada
echo "4. Reiniciando PM2..."
pm2 delete all
pm2 start ecosystem.config.js --update-env
pm2 save

echo "--- Deploy Finalizado! ---"
pm2 status
