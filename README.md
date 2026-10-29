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

## Kostenbasis

Op verzoek van de eigenaar tellen eenmalige pas- en verzendkosten niet mee in sessie-, maand-, jaarberekeningen, rangschikking, omslagpunten en CSV-export. Het oude gecombineerde veld `once` blijft voor compatibiliteit bewaard, maar beïnvloedt de uitkomst niet en ontbrekende waarden blokkeren geen vergelijking. Abonnementen en alle toepasselijke laadkosten blijven vereist.

## Dekking en prijszekerheid

Iedere build koppelt unieke Nederlandse NDW-GeoJSON-records (`country=NLD`) aan de landelijke OCPI-tarieven via landcode, CPO-id en tarief-id. `dist/coverage.json` telt complete definities, berekenbare exploitantmodellen, een benoemde betaalmethode en meerdere betaalmethoden afzonderlijk. Records zonder koppeling blijven in de noemer staan. Een record kan meerdere aansluitingen bevatten. De doelstelling van 99% geldt niet als behaald zolang de meting dat niet aantoont.

De modellen voor gepubliceerde exploitantkosten ondersteunen vaste kWh-, sessie-, aansluit- en parkeertijdkosten met bekende btw en expliciete afrekenstappen. Voorwaardelijke tijdvensters, staffels, onbekende btw of ontbrekende componenten worden niet ingevuld. Een exploitantmodel wordt nooit als eindprijs voor een externe laadpas geïmporteerd.

Oudere handmatig bevestigde tarieven blijven als indicatie berekenbaar; een expliciete vervaldatum of bekende wijziging blokkeert ze. Bij historische opties wordt geen actuele winnaar geclaimd. Vrijwel gelijk geprijsde bekende opties vereisen maximaal € 0,50 verschil per bezoek en € 2 per maand. De laatst geopende bron, tariefwijzigingsdatum en inhoudelijke aanbiedercontrole blijven afzonderlijke begrippen.

## SEO

Het bestaande eigen domein https://laadheld.nl is de canonieke host; www verwijst daar al naartoe. Homepage en drie oorspronkelijke uitlegpagina’s bevatten servergeleverde HTML, unieke titels en beschrijvingen, canonieke URLs en passende WebSite/WebApplication/WebPage-gegevens zonder verzonnen beoordelingen. `/robots.txt` verwijst naar `/sitemap.xml`; de sitemap bevat alleen indexeerbare canonieke pagina’s en geen kunstmatig dagelijks vernieuwde lastmod-datums. API- en JSON-responses krijgen een noindex-header zonder het renderen van de app te blokkeren. Bestandsaliases verwijzen permanent naar de gekozen pagina-URLs. De bestaande Worker-testhost blijft bruikbaar met canonieke verwijzingen naar het eigen domein.

Er zijn geen advertentiekosten, betaalde SEO-diensten of backlinks aangekocht. Search Console-verificatie en indexeringsverzoeken zijn niet uitgevoerd zonder gekoppelde accounttoegang. Indexering en posities in Google zijn geen gegarandeerd resultaat.
