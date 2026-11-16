<!-- Pokretanje aplikacije

Kako bi se aplikacija pokrenula nakon git pull-a, potrebno je prebaciti se u folder backend. -->

1. Pokretanje baze i backenda 

cd backend

<!-- Proveriti docker-compose.yml -->
docker compose up -d 

composer install

cp .env.example .env

php artisan migrate

php artisan db:seed

php artisan serve

2. Pokretanje frontenda

cd client-requests/frontend

npm install

npm run dev

<!-- Trebalo mi je oko 8-9 sati da odradim aplikaciju. Nisam uspeo sve da završim, ostala mi je optimizacija grešaka na frontu(ne prikazuju se kako bi trebalo). Backend je uradjen potpuno.

Indeks(client_id,status) nam pomaže kod optimizacije pretrage zahteva. Kada imamo veliki broj zahteva u bazi i želimo da pretražimo neki zahtev po klijentu ili klijentu i statusu, indeks će nam pomoći da pretraga bude brža.


SQL za summary: 

SELECT status, COUNT(*) as total
FROM requests
WHERE client_id = $client_id
GROUP BY status; 

-->
