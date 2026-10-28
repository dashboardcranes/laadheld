# Laadheld — eigen GitHub en Cloudflare

Nederlandse laadkostenvergelijker, gemigreerd vanaf ChatGPT Sites versie 1.0 (broncommit 8061986002c6a6b9ff06c4518ddeafdf9870beca).

## Gebruik

- Cloudflare Worker: `laadheld`, account `90c60240a63503cadd817e6b7cf011c4`.
- Worker-adres: https://laadheld.onlineworker.workers.dev
- Broncode: https://github.com/dashboardcranes/laadheld (repository is door de eigenaar openbaar aangemaakt).
- Alle routes zijn privé: HTTP Basic-authenticatie uitsluitend via HTTPS. Gebruikersnaam `eduard`; wachtwoord als versleutelde Cloudflare-secret `LAADHELD_PASSWORD`, nergens in deze repository.
- Geen DNS-, domein-, betaal- of abonnementswijzigingen nodig. De bestaande Sites-versie blijft bestaan.
- Browseropslag verhuist niet automatisch tussen domeinen. Persoonlijke vergelijkingen blijven in de browser op het oorspronkelijke domein; de migratie kopieert geen browsergegevens.

## Ontwikkelen en publiceren

Node.js 22 of nieuwer:

```sh
npm ci
npm run build
npm test
npm run validate
npx wrangler deploy --dry-run
```

Eenmalig veilig aanmelden en het wachtwoord via de interactieve prompt instellen:

```sh
npx wrangler login
npx wrangler secret put LAADHELD_PASSWORD
```

Daarna publiceert `npm run deploy` naar de bestaande Worker. Geen secrets in commandoargumenten, Git of configuratie plakken. Bij een ontbrekend of te kort wachtwoord blijft de Worker gesloten (503). Cloudflare Access kan later de Basic-toegang vervangen nadat Zero Trust op het account is ingesteld; het staat nu niet aan.

GitHub Actions controleert de build, tests en dry-run. Cloudflare Workers Builds is door de eigenaar gekoppeld aan deze repository: wijzigingen op `main` publiceren automatisch via `npx wrangler deploy`. Het build-commando uit `wrangler.jsonc` genereert eerst de applicatie. Cloudflare beheert zelf het build-token; deze repository bevat geen API-tokens.

## Functies en dekking

Landelijk zoeken via PDOK naar plaats, postcode of adres; NDW-laadpunten binnen 1–10 km, kaart, netwerk- en AC/DC-filters. Puntgebonden prijscontrole voor ondersteunde InCharge-eigenpassen en Fastned-rechtstreekse/appbetalingen. Geen fictieve eindprijzen voor andere exploitanten, staffels, piek-/dalvensters of ontbrekende btw.

De officiële tariefregels zijn gecontroleerd op 25 oktober 2026 en vereisen hercontrole uiterlijk 24 november. Nieuwe bronopvraging verlengt deze controledatum niet. De landelijke kaart en zoekdekking zijn niet gelijk aan volledige prijsdekking voor alle Nederlandse laadpassen.

Bronnen en verplichte licentievermeldingen staan op de pagina Bronnen & verantwoording. Leaflet is gebundeld met zijn licentie. Tests gebruiken slechts tien echte gecontroleerde NDW-fixtures; de grote landelijke historische dump is niet meegenomen.

## Indeling

`web/`: interface, kaart en rekenmodel. `worker/runtime.mjs`: live bronroutes. `worker/national-data.mjs`: gevalideerde prijsregels. `worker/protected.mjs` en `worker/auth.mjs`: privétoegang. `scripts/embed.mjs`: genereert de gebundelde applicatie. `worker/index.js` is gegenereerd en niet ingecheckt. `wrangler.jsonc`: Cloudflare-configuratie.

## Privétoegang instellen

Zet in Cloudflare → Worker laadheld → Settings → Variables and Secrets een versleutelde secret `LAADHELD_PASSWORD` met minimaal 24 tekens. Gebruikersnaam is `eduard`. Zonder deze secret blijft iedere route gesloten (HTTP 503); er bestaat geen standaardwachtwoord. Bewaar de waarde uitsluitend in je wachtwoordmanager en Cloudflare Secrets, niet in GitHub of chat.

Persoonlijke vergelijkingen zijn browseropslag per domein en verhuizen niet automatisch mee vanaf de oude Sites-URL. De oude Sites-versie blijft beschikbaar.
