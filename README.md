# Laadheld — eigen GitHub en Cloudflare

Nederlandse laadkostenvergelijker, gemigreerd vanaf ChatGPT Sites versie 1.0 (broncommit 8061986002c6a6b9ff06c4518ddeafdf9870beca).

## Gebruik

- Cloudflare Worker: `laadheld`, account `90c60240a63503cadd817e6b7cf011c4`.
- Worker-adres: https://laadheld.onlineworker.workers.dev
- Broncode: https://github.com/dashboardcranes/laadheld (repository is door de eigenaar openbaar aangemaakt).
- De website en bronroutes zijn openbaar bereikbaar; er is geen wachtwoord of inlogaccount nodig.
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

Publiceren vanuit de gekoppelde GitHub-repository verloopt automatisch. Handmatig publiceren kan na `npx wrangler login` met `npm run deploy`. Er zijn geen runtime-secrets nodig voor de huidige openbare bronnen. Zet nooit tokens of wachtwoorden in Git.

GitHub Actions controleert de build, tests en dry-run. Cloudflare Workers Builds is door de eigenaar gekoppeld aan deze repository: wijzigingen op `main` publiceren automatisch via `npx wrangler deploy`. Het build-commando uit `wrangler.jsonc` genereert eerst de applicatie. Cloudflare beheert zelf het build-token; deze repository bevat geen API-tokens.

## Functies en dekking

Landelijk zoeken via PDOK naar plaats, postcode of adres; NDW-laadpunten binnen 1–10 km, kaart, netwerk- en AC/DC-filters. Puntgebonden prijscontrole voor ondersteunde InCharge-eigenpassen en Fastned-rechtstreekse/appbetalingen. Geen fictieve eindprijzen voor andere exploitanten, staffels, piek-/dalvensters of ontbrekende btw.

De officiële tariefregels zijn gecontroleerd op 25 oktober 2026 en vereisen hercontrole uiterlijk 24 november. Nieuwe bronopvraging verlengt deze controledatum niet. De landelijke kaart en zoekdekking zijn niet gelijk aan volledige prijsdekking voor alle Nederlandse laadpassen.

Bronnen en verplichte licentievermeldingen staan op de pagina Bronnen & verantwoording. Leaflet is gebundeld met zijn licentie. Tests gebruiken slechts tien echte gecontroleerde NDW-fixtures; de grote landelijke historische dump is niet meegenomen.

## Indeling

`web/`: interface, kaart en rekenmodel. `worker/runtime.mjs`: live bronroutes. `worker/national-data.mjs`: gevalideerde prijsregels. `worker/public.mjs`: openbare Cloudflare-entrypoint en verwijdering van ongebruikte Authorization-headers. `scripts/embed.mjs`: genereert de gebundelde applicatie. `worker/index.js` is gegenereerd en niet ingecheckt. `wrangler.jsonc`: Cloudflare-configuratie.

## Openbare testversie

De eigenaar heeft op 28 oktober 2026 opdracht gegeven de wachtwoordbeveiliging te verwijderen. De Cloudflare-entrypoint is `worker/public.mjs`; de website en bronroutes vragen geen aanmelding. Gebruikersgegevens en opgeslagen vergelijkingen blijven lokaal in de browser.

Persoonlijke vergelijkingen verhuizen niet automatisch mee vanaf de oude Sites-URL. De oude Sites-versie blijft beschikbaar.

## Nachtelijke verversing

GitHub Actions (`nightly-refresh.yml`) valideert dagelijks om 02:37 UTC de NDW-tariefbron en commit alleen een klein verversingsverzoek. De bestaande Cloudflare Git-koppeling bouwt en publiceert vervolgens een nieuwe tariefindex. Nederland: 03:37 wintertijd / 04:37 zomertijd. Een fout bij downloaden of bouwen laat de bestaande productieversie intact; na zeven dagen zonder geslaagde indexverversing worden nieuwe prijsbevestigingen geblokkeerd. Een nieuwe ophaaldatum verandert de tariefwijzigingsdatum of officiële controle van laadpasvoorwaarden niet.

De workflow kan ook handmatig worden gestart. De eerste wijziging aan workflow of refreshscript start een verificatierun. De status en eventuele fouten zijn terug te vinden in GitHub Actions en Cloudflare Builds. Geen extra API-token of betaalde dienst vereist.
