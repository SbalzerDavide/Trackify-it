# Trackify-it — Documentazione Tecnica

## 1. Stack tecnologico

| Componente | Tecnologia | Versione |
|---|---|---|
| Framework | Angular (standalone components, signals, nuova control-flow `@if/@for`) | ^18.2 |
| UI kit | Angular Material (tema prebuilt `rose-red`) + Angular CDK | ^18.2 |
| State management | Angular Signals + `@ngrx/signals` (signalStore) | ^18.0 |
| Backend (BaaS) | Supabase (`@supabase/supabase-js`): PostgREST + Auth | ^2.45 |
| Grafici | ECharts via `ngx-echarts` | echarts ^5.5, ngx-echarts ^18 |
| Carosello | Swiper (web components, registrati in `main.ts`) | ^11.1 |
| Reactive | RxJS (usato a supporto dei signals: `Subject`, `toObservable`) | ~7.8 |
| Test | Karma + Jasmine (config standard CLI; nessuno spec presente) | — |
| Build | Angular CLI, builder `application` | ^18.2 |

Non esiste un backend proprietario: il frontend parla direttamente con Supabase usando la **anon key**.

## 2. Avvio e build

```bash
npm install
npm start          # ng serve → http://localhost:4200
npm run build      # ng build (default: production) → dist/healt
npm test           # ng test (Karma/Jasmine)
```

- `src/environments/environment.ts` contiene `supabaseUrl` e `supabaseKey` (anon key) **hardcoded e committati**; non esiste un file `environment.prod.ts` né file replacement in `angular.json` — lo stesso environment è usato in tutte le configurazioni.
- `src/_redirects` (`/* /index.html 200`) è copiato tra gli assets: il deploy previsto è su hosting statico tipo **Netlify** con fallback SPA.
- `src/manifest.json` fornisce metadati PWA minimi (icona, standalone); **non** è registrato alcun service worker.

## 3. Struttura del progetto

```
Trackify-it/
├── angular.json / package.json / tsconfig*.json
└── src/
    ├── main.ts                     # bootstrapApplication + registrazione Swiper
    ├── app/
    │   ├── app.component.*         # shell: solo <router-outlet/>
    │   ├── app.config.ts           # provideRouter + provideAnimationsAsync
    │   ├── app.routes.ts           # definizione rotte
    │   ├── layout/
    │   │   ├── header/             # toolbar (hamburger, link goal, share)
    │   │   └── footer/             # FAB "+" → apre FormActivityComponent
    │   ├── pages/                  # componenti di rotta
    │   │   ├── login/
    │   │   ├── personal-area/      # layout area autenticata (sidenav + outlet)
    │   │   ├── dashboard/
    │   │   ├── home/
    │   │   ├── basic-entities/     # wrapper di components/basic-activity-entity
    │   │   ├── entities-page/      # wrapper di components/entities
    │   │   ├── goal-page/          # wrapper di components/activity/goal
    │   │   ├── charts-page/
    │   │   └── not-found-component/
    │   ├── components/             # feature components + servizi di dominio
    │   │   ├── activity.model.ts / activity.service.ts / activity.store.ts (commentato)
    │   │   ├── basic-activity.model.ts / basic-entities.service.ts
    │   │   ├── entities.model.ts / entities.service.ts
    │   │   ├── goal.model.ts / goal.service.ts / goal.store.ts
    │   │   ├── chart.model.ts / format-data-chart.service.ts / range-bar.service.ts (vuoto)
    │   │   ├── activity/           # ActivityComponent + form-activity, goal, dialog-datepicker
    │   │   ├── basic-activity-entity/  # lista + form basic entities
    │   │   ├── entities/           # lista + form entities
    │   │   └── charts/form-save-chart/
    │   └── shared/
    │       ├── auth/               # auth.service.ts, auth.guard.ts
    │       ├── supabase/           # supabase.service.ts (client condiviso)
    │       └── lib/                # componenti riusabili: card, custom-card,
    │                               # chart, range-bar, swiper, menu, dialog (vuoto)
    │                               # + chart.model.ts, chart.service.ts
    └── environments/environment.ts
```

Convenzioni: tutti i componenti sono **standalone**; injection con `inject()`; stato locale con `signal()`/`computed()`; input/output con le nuove API `input()`/`output()`. Non ci sono NgModule.

Nota: esistono **due** `chart.model.ts` (`components/chart.model.ts` con `ChartFormattedData`, e `shared/lib/chart.model.ts` con `ChartInfo` e la costante tabella `CHART`).

## 4. Routing e autenticazione

### 4.1 Rotte (`app.routes.ts`)

- `''` → redirect `login`
- `login` → `LoginComponent`, protetto da `canMatch: [isLoggedinMatch]`
- `personal` → `PersonalAreaComponent` (lazy `loadComponent`), protetto da `canActivate: [authGuard]`, con figli lazy: `dashboard` (default), `home`, `basic-entities`, `entities`, `activity`, `goal`, `charts`
- `**` → `NotFoundComponentComponent`

### 4.2 Flusso di autenticazione

`AuthService` (`shared/auth/auth.service.ts`) crea un **proprio** client Supabase (separato da quello di `SupabaseService`) e mantiene:
- `session: AuthSession | null` (proprietà semplice, non reattiva);
- `activeProfile` (signal readonly del profilo, letto dalla tabella `profiles`).

Flussi:
1. **Login** — `signInWithPassword`; al successo salva `access_token` e `refresh_token` in `localStorage` e carica il profilo. Il componente naviga a `/personal` **senza verificare l'esito** (gli errori sono solo loggati in console).
2. **Sessione persistente** — `LoginComponent.ngOnInit` e il matcher `isLoggedinMatch` rileggono i token da localStorage e chiamano `setSessionData` (= `supabase.auth.setSession`).
3. **Guard** — `authGuard` controlla in modo **sincrono** `authService.session` e in assenza redirige a `/login`. ⚠️ Poiché `setSessionData` è async e il matcher non la attende (`await` assente), un accesso diretto a un URL `/personal/...` a freddo può rimbalzare al login anche con token validi; il "rientro" funziona perché `LoginComponent` attende il ripristino e poi naviga.
4. **Logout** — `signOut()` esiste ma non è invocato da nessuna UI; i token in localStorage non vengono mai rimossi.

## 5. Accesso ai dati (Supabase)

### 5.1 Client

- `SupabaseService` (root) espone l'istanza `supabase` usata da tutti i servizi dati.
- `AuthService` istanzia un secondo client per l'auth. ⚠️ Due client separati significa che la sessione impostata sul client di `AuthService` non è condivisa esplicitamente con quello di `SupabaseService`; le query dati funzionano in quanto entrambi i client persistono la sessione nello storage di default di supabase-js.

### 5.2 Schema dati inferito (PostgreSQL via PostgREST)

```
profiles         id (= auth user id), username, website, avatar_url
basic_entities   id, name, description, unit (numero, "calorie"), [user_id]
entities         id, name (nullable), unit_value, basic_entity_id → basic_entities
activities       id, date (date), quantity, entity_id → entities
goal             id, quantity, range ('daily'|'weekly'|'monthly'|'annual'),
                 entity_id → entities
chart            id, name, entity_id → entities, is_range_absolute,
                 range_type ('weekly'|'monthly'|'annual'),
                 show_in_dashboard, created_at
```

I nomi tabella sono costanti esportate dai model (`ACTIVITIES`, `BASIC_ENTITIES`, `ENTITIES`, `GOAL`, `CHART`). Le select usano gli **embedded resources** di PostgREST, es.:

```ts
.from('activities').select(`date, id, quantity, entity_id,
  entities( unit_value, name, basic_entities( name, unit ))`)
```

⚠️ Non c'è filtro esplicito per `user_id` nelle query: l'isolamento dei dati per utente dipende dalle **RLS policy** configurate su Supabase.

### 5.3 Servizi dati

Tutti `providedIn: 'root'`, pattern comune: metodi async che incapsulano CRUD PostgREST, errori solo in `console.error`, nessuna propagazione alla UI.

| Servizio | Tabella | Note |
|---|---|---|
| `ActivityService` | `activities` | `fetchFilteredActivities(entityId, start, end)`, `fetchRangeActivities(start, end)`, `addActivity`, `updateActivity`, `deleteActivity`; `getGroupingActivity()` somma le quantità per `entity_id`; `pgFormatDate()` converte `Date` → `YYYY-MM-DD`; espone `updateActivities: Subject` come **event bus** per notificare le viste dopo un inserimento |
| `BasicEntitiesService` | `basic_entities` | CRUD + signal `loadedBasicActivities` |
| `EntitiesService` | `entities` | CRUD + signal `loadedEntities` |
| `GoalService` | `goal` | `getAll`, `addGoal` (quantity iniziale 1), `updateGoal`; niente delete |
| `ChartService` (`shared/lib`) | `chart` | `getDashboadCharts()` filtra `show_in_dashboard = true` ordinando per `created_at desc`; CRUD; `updateCharts: Subject` come event bus |

### 5.4 Stato

- **`GoalStore`** (`@ngrx/signals` signalStore, root): stato `{ goals, isLoading }` con metodo `loadAll()`. È l'unico store attivo; `activity.store.ts` è interamente commentato.
- Gli altri stati vivono in **signal privati dei servizi** (`loadedEntities`, `loadedBasicActivities`) o in signal locali dei componenti.
- Le invalidazioni cross-vista avvengono tramite i due `Subject` (`updateActivities`, `updateCharts`): i componenti vi si sottoscrivono in `ngOnInit` e fanno re-fetch; le sottoscrizioni sono pulite con `DestroyRef.onDestroy`.

## 6. Elaborazione dati per i grafici — `FormatDataChartService`

Servizio core della logica di visualizzazione:

- **`updateRange(rangeType, isRangeAbsolute, endRange)`** → `Range { startRange, endRange }`
  - assoluto: settimana lun–dom corrente / mese solare / anno solare (helper `getFirstWeekDay`, `getLastMonthDay`, ecc.);
  - relativo: `endRange − 6 giorni` (weekly), `− 1 mese` (monthly), `− 12 mesi` (annual).
- **`formatData(data, rangeType, startDate, endDate, activeGoal)`**:
  1. aggrega le attività per giorno+entità;
  2. genera l'asse X (`getOrderedDates`): solo prima e ultima etichetta valorizzate, celle vuote in mezzo (7 slot per weekly, n. giorni per monthly, 12 per annual);
  3. riempie la serie con le quantità, 0 per i giorni/mesi vuoti (`getDailyOrderedData` per weekly/monthly, `getMonthlyOrderedData` per annual);
  4. se `activeGoal` è definito, i punti ≥ goal diventano oggetti `{ value, itemStyle: { color: '#7FB685' } }` (barre verdi).
  - Output: `ChartFormattedData { xData: string[], data: any[] }`.

Regola di mappatura goal→grafico (replicata in `DashboardComponent`, `ActivityComponent`, `ChartsPageComponent`): range `weekly`/`monthly` → goal `daily`; range `annual` → goal `monthly`.

## 7. Componenti principali

### 7.1 Pagine

- **`LoginComponent`** — reactive form, spinner durante il ripristino sessione, auto-redirect se i token sono validi.
- **`PersonalAreaComponent`** — layout: `HeaderComponent` + `mat-sidenav` (con `MenuComponent`) + `router-outlet` + `FooterComponent`.
- **`DashboardComponent`** — al `ngOnInit`: `goalStore.loadAll()` → `fetchCharts()` → `fetchData()` (attività di oggi). `fetchCharts()` per ogni chart salvato calcola range (`updateRange`), scarica le attività filtrate, calcola totale e goal applicabile e produce `ChartInfo` completo di serie dati. `onUpdateQuantity` aggiorna/elimina la registrazione sottostante (delete a quantità 0). `goToChart` naviga a `/personal/charts` con queryParams.
- **`ActivityComponent`** — gestisce `rangeType`, `startRange`/`endRange`, `isRangeAbsolute` come signal; form reattivo per entità+toggle con subscription a `valueChanges`; al cambio range ricarica i dati e riformatta il grafico; le card mostrano la progress bar se esiste un goal (`getValue(rangeType, entityId)`).
- **`ChartsPageComponent`** — lo stato (entità, range type, absolute) è sincronizzato **bidirezionalmente con i queryParams** (`entity-id`, `range-type`, `is-range-absolute`); il flag `disableFormChangeNatigation` evita il loop form→URL→form. `openDialog()` apre `FormSaveChartComponent` passando la configurazione corrente via `MAT_DIALOG_DATA`.
- **`GoalComponent`** (usato da `GoalPageComponent`) — expansion panel per entità × 4 range type; add/update tramite `GoalService` con reload dello store dopo ogni operazione.

### 7.2 Dialog (Material Dialog)

| Dialog | Scopo | Note |
|---|---|---|
| `FormActivityComponent` | inserimento attività (data, entità, quantità) | al salvataggio emette `updateActivities.next()` |
| `FormBasicActivityComponent` | nuova basic entity | |
| `FormEntitiesComponent` | nuova entity | cross-field validator `oneFieldOnlyValidator`: esattamente uno tra `basicEntity` e `name` |
| `FormSaveChartComponent` | crea/aggiorna/elimina chart salvato | riceve la config via `MAT_DIALOG_DATA`; se `chartId` presente → update/delete, altrimenti insert; emette `updateCharts.next()` |
| `DialogDatepickerComponent` | scelta giorno in vista daily | chiude restituendo la data |

### 7.3 Componenti condivisi (`shared/lib`)

- **`CardComponent`** — card generica: `title`, `description`, `quantity`, `editQuantity` (mostra + / − ed emette `updateQuantity` con 1/0), `goal` (progress bar percentuale). Contiene chip e testo placeholder ("Chihuahua") residui dell'esempio Material.
- **`CustomCardComponent`** — card con avatar icona, titolo, sottotitolo, icona settings opzionale (`openSettings`) e `ng-content` per il contenuto (usata in dashboard per i grafici).
- **`ChartComponent`** — wrapper `ngx-echarts`; input: `type` (default `bar`), `xData`, `data`, `goal`. Configura `markLine` per il goal e calcola il max dell'asse Y (max tra dati e goal). Gli aggiornamenti reattivi avvengono convertendo gli input in observable (`toObservable`) e chiamando `setOption` sull'istanza ECharts. ⚠️ nel ramo di aggiornamento la serie è forzata a `type: 'bar'`.
- **`RangeBarComponent`** — toggle `1d/1w/1m/1y` (emette `changeRange`) e navigazione ◀ ▶ (emette `changeRangeVal` con il nuovo `Range`, calcolato internamente per tipo di periodo e modalità assoluta/relativa); in daily apre `DialogDatepickerComponent`.
- **`SwiperComponent`** — wrapper minimale dei web components Swiper (richiede `CUSTOM_ELEMENTS_SCHEMA` nei consumer).
- **`MenuComponent`** — lista link di navigazione, emette `toggleSideNav`.
- **`DialogComponent`**, **`RangeBarService`** — vuoti/non usati.

## 8. Flussi dati principali

### Inserimento attività
```
FAB "+" (Footer) → MatDialog(FormActivityComponent)
  → ActivityService.addActivity() [INSERT activities]
  → updateActivities.next()
       ├─ Dashboard: fetchCharts() + fetchData()
       ├─ ActivityComponent: fetchData() → formatDataForChart()
       └─ ChartsPage: setDataForChart()
```

### Rendering grafico dashboard
```
ChartService.getDashboadCharts() [chart where show_in_dashboard]
  per ogni chart:
    FormatDataChartService.updateRange()        → Range effettivo
    ActivityService.fetchFilteredActivities()   → attività del range
    GoalStore.goals() + mapping range→goal      → goal applicabile
    FormatDataChartService.formatData()         → { xData, data }
  → ChartInfo[] → <app-swiper> → <app-custom-card> → <app-chart>
```

### Deep-link dashboard → charts
```
click card → router.navigate(['/personal','charts'],
              queryParams: { entity-id, is-range-absolute, range-type })
→ ChartsPage osserva route.queryParams → set signals + form → setDataForChart()
```

## 9. Debito tecnico e punti di attenzione

Rilevati dall'analisi del codice (utili a chi subentra):

1. **Sicurezza/config**: anon key Supabase committata in `environment.ts`; nessun environment di produzione separato; l'isolamento dati per utente si regge interamente sulle RLS lato Supabase (nessun filtro `user_id` client-side).
2. **Race condition nel guard**: `isLoggedinMatch`/`authGuard` valutano `session` in modo sincrono mentre il ripristino è async (vedi §4.2).
3. **Doppio client Supabase** (`AuthService` + `SupabaseService`).
4. **Tipizzazione debole**: molti `signal<any[]>` e parametri `any`; l'interfaccia `Activity` è commentata; due `chart.model.ts` distinti con responsabilità sovrapposte.
5. **Gestione errori assente in UI**: ogni errore termina in `console.error`; il login naviga anche su credenziali errate.
6. **Codice morto/placeholder**: `activity.store.ts` commentato, `RangeBarService` e `DialogComponent` vuoti, chip "Chihuahua" in `CardComponent`, pulsante share non funzionante, pagina 404 scheletro, `console.log` sparsi.
7. **Logica duplicata**: `pgFormatDate` (in `ActivityService` e `FormatDataChartService`), mapping range→goal (in 3 componenti), helper date (in `RangeBarComponent` e `FormatDataChartService`).
8. **Refresh per re-fetch completo**: ogni mutazione ricarica i dati dal server (gli aggiornamenti ottimistici locali sono commentati); accettabile a questa scala, costoso al crescere dei dati.
9. **Test**: nessuno spec presente nonostante il setup Karma/Jasmine.
10. **Naming**: il progetto npm si chiama `healt` (refuso di "health"); convivono i termini "basic activity" e "basic entity" per lo stesso concetto.
