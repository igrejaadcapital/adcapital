#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

# Fase 1.3c: app legado não deve voltar ao INSTALLED_APPS
if grep -qE "['\"]adcapitalapp['\"]" adcapitalcore/settings.py 2>/dev/null; then
  echo "ERRO: adcapitalapp está em INSTALLED_APPS. Use apenas o app membros."
  exit 1
fi

python manage.py collectstatic --no-input
python manage.py createcachetable

# Retry migrate up to 3 times
echo "Running migrations..."
for i in {1..3}; do
  python manage.py migrate && python repair_db.py && break || {
    if [ $i -lt 3 ]; then
      echo "Migration failed. Retrying in 5 seconds... (Attempt $i/3)"
      sleep 5
    else
      echo "Migration failed after 3 attempts."
      exit 1
    fi
  }
done
