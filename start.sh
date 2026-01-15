#!/bin/sh

echo "Aguardando MySQL..."
until php artisan db:monitor > /dev/null 2>&1 || [ $? -eq 0 ]; do
  sleep 3
done
echo "MySQL conectado!"

echo "Removendo arquivo 'hot' para forçar produção..."
rm -f public/hot

if [ ! -d "node_modules" ]; then
    echo "📦 Instalando Node Modules..."
    npm install
fi

echo "Gerando Build do Frontend"
npm run build

if [ -z "$(grep APP_KEY .env | cut -d '=' -f2)" ]; then
  php artisan key:generate
fi

echo "Migrate"

php artisan migrate --force
echo "Rodando Seeds..."

php artisan db:seed --force
php artisan config:clear
php artisan cache:clear
php artisan view:clear

echo "Iniciando servidor..."
php artisan serve --host=0.0.0.0 --port=80
