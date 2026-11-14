# Tariefkwaliteit en totale laadkosten — technische nulmeting (2026-11-14)

Status: **analyse; geen productie- of rekenwijzigingen**.

## Gecontroleerde bronbestanden
- `README.md`: landelijke NDW-dekking, dagelijkse index, onderscheid tussen CPO-tarief en betaalmethode, verificatiedatums en kostenbasis.
- `worker/runtime.mjs`: NDW-kaart, locaties, tariefindex en puntgebonden quote-API; de tariefindex wordt geweigerd na zeven dagen zonder vernieuwing.
- `worker/national-data.mjs`: beperkte onderbouwde betaalmethoden, gecontroleerde prijsregels en expliciete weigering van complexe of onvolledige tarieven.
- `web/index.html`: bestaande kWh-, sessie-, tijd- en parkeerinvoer; standaard snelle invoer 25 kWh.
- `web/app.js`: bestaande sessie-/maandmodus, abonnement, toeslagen, tariefbron en controledatum.
- `package.json`: build, tests en artifact-validatie beschikbaar.

## Belangrijkste bevindingen
1. NDW is al geïntegreerd. Een tweede generieke NDW-koppeling zou duplicatie opleveren. Onderzoek uitsluitend concrete gaten in de bestaande koppeling en meet de tariefdekking vanuit `dist/coverage.json`.
2. De landelijke zoekdekking is niet gelijk aan eindprijsdekking. Exploitanttarieven mogen nooit worden gepresenteerd als de eindprijs van een externe laadpas.
3. De officiële eigen-betaalmethode-regels in `worker/national-data.mjs` zijn inhoudelijk gecontroleerd op 2026-10-25 en moeten opnieuw gecontroleerd worden uiterlijk 2026-11-24. Een verse NDW-download verlengt deze inhoudelijke controle niet.
4. Totale kosten worden al berekend; de eerste vervolgstap is regressietests, niet een tweede calculator.
5. Het snelle formulier gebruikt 25 kWh als standaard. Een wijziging naar 40 kWh is een UX-keuze en moet niet worden verward met een ontbrekende berekeningsfunctie.

## Nog uit te voeren door Codex
1. Draai `npm ci && npm run build && npm test && npm run validate && npx wrangler deploy --dry-run`. Rapporteer resultaten en dekking (noemer, volledig berekenbare modellen, bevestigde eindprijzen, en ontbrekende gegevens).
2. Inspecteer de volledige rekenimplementatie en tests. Voeg zo nodig tests toe voor kWh, startkosten, aansluit-/blokkeerkosten, parkeren, sessie versus maand, abonnementen, nul/ontbrekende waarden, afronding, btw, ongeldige invoer en gelijke rangschikking. Bewaak dat pas- en verzendkosten volgens huidig beleid buiten de berekening blijven.
3. Vergelijk NDW-gegevens met de bestaande index op unieke laadpunt-ID, CPO en tarief-ID; toon geen kunstmatig percentage van 99%. Documenteer welke tariefcomponenten onberekenbaar zijn en waarom.
4. Controleer officiële InCharge- en Fastned-prijzen vóór 2026-11-24. Leg bronlinks, tariefvoorwaarden en controledatum vast. Verleng deze datum uitsluitend na inhoudelijke verificatie.
5. Onderzoek of de UI per getoonde prijs onderscheid maakt tussen bron-ophaaldatum, inhoudelijke controle, verouderd en onbekend. Voeg alleen ontbrekende informatie toe.
6. Controleer de snelle calculator en handmatige vergelijking op mobiel en desktop. Voeg geen tweede parallelle invoerstroom toe.
7. Lever eventuele codewijzigingen als aparte commits op deze featurebranch en houd de PR in draft tot build, tests en visuele controle zijn geslaagd. **Niet mergen of naar productie publiceren zonder expliciete goedkeuring.**

## Acceptatie
- Geen onbevestigde laadpas-eindprijzen.
- Alle getoonde kosten controleerbaar en zonder dubbeltellingen.
- Transparante bron-, datum- en onzekerheidsvermelding.
- Bestaande kaart, zoekfunctie, mobiele bediening en berekeningen blijven werken.
- Testresultaten en dekking aantoonbaar gerapporteerd.

## Grenzen van deze nulmeting
De bronbestanden zijn via GitHub gelezen, maar de Node-tests, Cloudflare dry-run en browsercontroles zijn **nog niet uitgevoerd**. Deze notitie is geen bevestiging dat de live website foutloos werkt.
