# Trackify-it — Documentazione Funzionale

## 1. Scopo dell'applicazione

Trackify-it (nome interno del progetto: "Healt") è una web application per il **tracciamento di attività personali e allenamenti**. Permette all'utente di:

- definire le attività che vuole monitorare (es. flessioni, corsa, bicchieri d'acqua);
- registrare giorno per giorno le quantità svolte;
- fissare obiettivi (goal) giornalieri, settimanali, mensili o annuali;
- analizzare l'andamento nel tempo tramite grafici configurabili e salvabili in una dashboard personale.

L'app è pensata per l'uso da mobile (è presente un manifest PWA con descrizione "Analizza i dati dei tuoi allenamenti") ed è una Single Page Application accessibile previo login.

## 2. Concetti di dominio

Il modello dati ruota attorno a quattro concetti, in ordine di costruzione:

| Concetto | Descrizione | Esempio |
|---|---|---|
| **Basic Entity** (attività base) | Il tipo di attività elementare, con nome, descrizione e un valore unitario (etichettato "Calories" nel form di inserimento) | "Flessione", "Corsa 1 km" |
| **Entity** (entità) | Un'unità di tracciamento concreta. Può essere costruita su una Basic Entity con un moltiplicatore (`unit_value`, es. "10 x Flessioni") **oppure** essere un'entità autonoma con un nome proprio. Le due opzioni sono mutuamente esclusive | "10 x Flessioni", "Meditazione" |
| **Activity** (attività registrata) | La registrazione effettiva: in una certa data, per una certa Entity, una certa quantità | "il 10/06: 3 × (10 Flessioni)" |
| **Goal** (obiettivo) | Una quantità target per una Entity su un periodo: `daily`, `weekly`, `monthly` o `annual` | "5 al giorno di 10 x Flessioni" |

A questi si aggiunge il concetto di **Chart salvato**: una configurazione di grafico (entità + tipo di periodo + modalità di intervallo + nome) che l'utente può salvare e, opzionalmente, esporre nella dashboard.

## 3. Accesso e autenticazione

- L'applicazione si apre sulla pagina di **Login** (rotta `/login`), con form email + password (campo password con mostra/nascondi).
- L'autenticazione è gestita tramite **Supabase Auth**. Dopo il login i token di sessione vengono salvati nel browser (localStorage), quindi ai successivi accessi l'utente viene **riautenticato automaticamente** e rediretto all'area personale.
- Tutte le pagine dell'area personale (`/personal/...`) sono protette da un guard: senza sessione attiva si viene rimandati al login. Viceversa, un utente già loggato che visita `/login` viene rediretto a `/personal`.
- Esiste un profilo utente (username, sito web, avatar) letto dalla tabella `profiles`; lo username viene mostrato nella pagina Home ("Welcome {username}").
- **Non esiste una funzione di registrazione self-service** attiva (il codice di sign-up è presente ma commentato): gli utenti devono essere creati a monte su Supabase. Il logout è implementato nel servizio ma non è esposto da alcun pulsante nell'interfaccia.

## 4. Struttura di navigazione

Dopo il login si entra nell'**area personale**, composta da:

- **Header** (toolbar): pulsante hamburger che apre il menu laterale, titolo "Healt" (link alla dashboard), icona bandierina che porta alla pagina **Goal**, icona condivisione (al momento senza funzione).
- **Menu laterale** (sidenav a scomparsa): Dashboard, Basic Entities, Entities, Activity, Charts.
- **Footer**: pulsante flottante **"+"**, sempre visibile, che apre la finestra di **inserimento rapido di un'attività**.

Mappa delle rotte:

| Rotta | Pagina | Note |
|---|---|---|
| `/` | — | redirect a `/login` |
| `/login` | Login | accessibile solo se non loggati |
| `/personal` | Area personale | redirect a `/personal/dashboard` |
| `/personal/dashboard` | Dashboard | pagina principale |
| `/personal/home` | Home | pagina di benvenuto con elenco link (non raggiungibile dal menu) |
| `/personal/basic-entities` | Basic Entities | anagrafica attività base |
| `/personal/entities` | Entities | anagrafica entità |
| `/personal/activity` | Activity | consultazione/modifica attività per periodo |
| `/personal/goal` | Goal | gestione obiettivi (raggiungibile dall'icona bandierina) |
| `/personal/charts` | Charts | analisi grafica e salvataggio grafici |
| qualsiasi altra | Pagina 404 | placeholder minimale |

## 5. Funzionalità per pagina

### 5.1 Dashboard (`/personal/dashboard`)

È la vista principale, divisa in due sezioni:

**"Today's activities"** — le attività registrate **oggi**, raggruppate per entità, mostrate come card con:
- nome dell'entità;
- quantità del giorno;
- pulsanti **+ / −** per incrementare o decrementare la quantità direttamente dalla card. Se la quantità scende a 0 la registrazione viene **eliminata**.

Se non ci sono attività compare il messaggio "No activities here...".

**"Charts"** — un carosello (swipe orizzontale) con i grafici salvati che hanno l'opzione "Show in dashboard" attiva, ordinati dal più recente. Ogni card grafico mostra:
- nome del grafico e totale del periodo ("total: N");
- il grafico a barre del periodo corrente (calcolato in base al tipo di intervallo salvato);
- la linea dell'obiettivo, se per quell'entità esiste un goal coerente con il periodo (goal giornaliero per grafici settimanali/mensili, mensile per grafici annuali); le barre che raggiungono l'obiettivo sono evidenziate in verde;
- un'icona **ingranaggio** che apre la finestra di modifica del grafico (rinomina, cambio entità/periodo, visibilità in dashboard, **eliminazione**);
- cliccando sulla card si viene portati alla pagina **Charts** già configurata con la stessa entità e lo stesso periodo (deep-link tramite parametri in URL).

L'inserimento di una nuova attività (dal pulsante "+" del footer) aggiorna automaticamente sia le card del giorno sia i grafici.

### 5.2 Inserimento attività (dialog dal pulsante "+")

Finestra modale con tre campi:
- **Data** (datepicker, default oggi);
- **Entità** (selezione tra le entità definite);
- **Quantità** (default 1).

Alla conferma l'attività viene salvata e tutte le viste aperte si aggiornano.

### 5.3 Activity (`/personal/activity`)

Pagina di consultazione e modifica delle attività su un periodo, con:

- **Barra del periodo** in alto: selettore `1d / 1w / 1m / 1y` e frecce ◀ ▶ per scorrere ai periodi precedenti/successivi; in modalità giornaliera, toccando la data si apre un calendario per saltare a un giorno specifico.
- **Card delle attività** del periodo selezionato, raggruppate per entità, con quantità totale. In vista giornaliera le quantità sono modificabili con + / − (a 0 la registrazione si cancella); se per l'entità esiste un goal del periodo corrente, la card mostra una **barra di avanzamento** verso l'obiettivo.
- **Sezione grafico** (solo per periodi non giornalieri): si sceglie un'entità da una tendina e si visualizza il grafico a barre delle quantità nel periodo, con eventuale linea del goal. Un interruttore **"Absolute range"** alterna tra:
  - *intervallo assoluto*: il periodo di calendario corrente (la settimana corrente lun–dom, il mese di calendario, l'anno solare);
  - *intervallo relativo*: gli ultimi 7 giorni / l'ultimo mese / gli ultimi 12 mesi a partire da oggi.

### 5.4 Basic Entities (`/personal/basic-entities`)

Elenco a card delle attività base (nome + descrizione) e pulsante **"Add new"** che apre il form di creazione: nome (obbligatorio), descrizione, valore unitario "Calories" (obbligatorio). Non sono previste modifica ed eliminazione da interfaccia (le API esistono ma non sono esposte).

### 5.5 Entities (`/personal/entities`)

Elenco a card delle entità (valore unitario + nome dell'attività base o nome proprio) e pulsante **"Add new"**. Il form di creazione richiede:
- **o** un'attività base dalla tendina, **o** un nome libero (il form è valido solo se è compilato esattamente uno dei due);
- il **valore unitario** (obbligatorio, minimo 1).

Anche qui modifica ed eliminazione non sono esposte in interfaccia.

### 5.6 Goal (`/personal/goal`)

Per ogni entità è presente un pannello espandibile (intestazione "nome × valore unitario"). All'interno, per ciascun periodo (`daily`, `weekly`, `monthly`, `annual`):
- se l'obiettivo non esiste: pulsante **ADD**, che lo crea con quantità 1;
- se esiste: la quantità corrente con pulsanti **+ / −** (il "−" è disabilitato sotto quota 1).

Non è prevista l'eliminazione di un goal da interfaccia.

### 5.7 Charts (`/personal/charts`)

Pagina di analisi libera:
- barra del periodo (`1w / 1m / 1y` — la vista giornaliera non è disponibile qui) con navigazione ◀ ▶;
- interruttore "Absolute range" e selezione dell'entità;
- indicatore **TOTAL** (somma delle quantità del periodo);
- grafico a barre con eventuale linea del goal e barre verdi al raggiungimento dell'obiettivo;
- pulsante **Save** che apre la finestra di salvataggio del grafico: nome, entità, tipo periodo (weekly/monthly/annual), absolute range, "Show in dashboard". Se si sta modificando un grafico esistente (apertura dall'ingranaggio in dashboard) compare anche **Delete**.

Lo stato della pagina (entità, periodo, absolute range) è riflesso nei **parametri dell'URL** (`entity-id`, `range-type`, `is-range-absolute`): la pagina è quindi linkabile/riapribile in una configurazione precisa, ed è così che la dashboard apre il dettaglio di un grafico.

## 6. Logica di calcolo dei grafici

- I dati sono sempre **somme di quantità per giorno** (per i periodi settimanale e mensile) o **per mese** (per il periodo annuale); i giorni/mesi senza registrazioni valgono 0.
- L'asse X mostra solo la prima e l'ultima etichetta del periodo.
- Se esiste un goal applicabile, il grafico mostra una **linea orizzontale "Goal"** e colora di verde le barre che la raggiungono. Il goal applicato dipende dal periodo del grafico: grafici settimanali e mensili usano il goal **giornaliero**, grafici annuali usano il goal **mensile**.
- "Absolute range" cambia il significato del periodo: calendario (settimana lun–dom, mese solare, anno solare) se attivo, finestra mobile che termina oggi se disattivo.

## 7. Limitazioni note e funzioni incomplete

Allo stato attuale del codice:

- **Nessuna registrazione utente né recupero password** in interfaccia; il logout non è raggiungibile dalla UI.
- **Modifica/eliminazione di Basic Entities, Entities e Goal non esposte** (esistono solo le API lato servizio).
- Il pulsante **condivisione** nell'header non ha alcuna funzione.
- La pagina **Home** non è raggiungibile dalla navigazione standard.
- La pagina 404 è un semplice placeholder ("not-found-component works!").
- Nelle card senza quantità compaiono chip segnaposto ("charming", "graceful", "sassy") ereditati dal template di esempio.
- I messaggi di errore (login errato, errori di salvataggio) sono loggati in console ma **non mostrati all'utente**.
- La selezione del tipo di grafico (barre/linee) è predisposta ma disabilitata: i grafici sono sempre a barre.
