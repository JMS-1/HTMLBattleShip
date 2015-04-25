// Die einzelnen Zustände der Felder
var zelle = 'zelle';
var nichtGeprüft = zelle + ' unbenutzt';
var daneben = zelle + ' daneben';
var treffer = zelle + ' treffer';
var versenkt = zelle + ' versenkt';

// Diese Variablen werden nach dem Laden der Seite gefüllt.
var alleZellen, schiffe, spielzüge, tipp;

// Wird aufgerufen, sobald die Seite komplett geladen ist.
function initialisieren() {
    tipp = document.getElementById('tipp');

    // Wir suchen unser Spielfeld
    var spielfeld = document.getElementById('spielfeld');

    // Darin alle relevanten Zellen
    alleZellen = spielfeld.querySelectorAll('.' + zelle + ':not(.spaltennummer):not(.zeilennummer)');

    // Nur eine kleine Sicherheitsprüfung, ob wir das auch alles richtig gemacht haben
    if (alleZellen.length != 100) {
        alert('Komisches Schiffe versenken mit ' + alleZellen.length + ' Felder - da muss ich leider passen!');

        // Da brauchen wir erst gar nicht weiter zu machen
        return;
    }

    // Dann mal aufbauen
    verstecken();
}

// Füllt das Spielfeld neu aus.
function verstecken() {
    // Erst einmal alles Löschen
    for (var zs = 0; zs < alleZellen.length; zs++) {
        var zelle = alleZellen[zs];

        zelle.onclick = function (ev) { beschiessen(ev.srcElement); };
        zelle.zeilennummer = Math.floor(zs / 10);
        zelle.className = nichtGeprüft;
        zelle.spaltennummer = zs % 10;
        zelle.schiff = null;
    }

    // Die Größe der Schiffe
    var größen = [5, 4, 3, 3, 2];

    // Die Schiffe, die wir verstecken werden
    schiffe = [];

    // Schiffe anlegen
    for (var s = 0; s < größen.length; s++) {
        // Neues Schiff anlegen
        var schiff = {
            größe: größen[s],
            treffer: 0,
        };

        // Und für später merken
        schiffe.push(schiff);

        // Versuchen wir einmal, das Schiff auf dem Spielfeld zu verstecken
        for (; ;) {
            // In eine Richtung stehen und für die Position des Schiffes alle möglichen Zeilen oder Spalten zur Verfügung
            var querPosition = Math.floor(Math.random() * 10);

            // In die andere Position müssen wir uns aber die Größe berücksichtigen 
            var längsPosition = Math.floor(Math.random() * (11 - schiff.größe));

            // Die Orientierung des Schiffes
            schiff.horizontal = (Math.random() < 0.5);

            // Die Zellen, in denen das Schiff steht
            schiff.zellen = [];

            // Umgesetzt in die tatsächliche Position
            if (schiff.horizontal) {
                schiff.x = längsPosition;
                schiff.y = querPosition;

                // Zellen zuordnen
                for (var i = 0; i < schiff.größe; i++)
                    schiff.zellen.push(alleZellen[10 * schiff.y + (schiff.x + i)]);
            }
            else {
                schiff.x = querPosition;
                schiff.y = längsPosition;

                // Zellen zuordnen
                for (var i = 0; i < schiff.größe; i++)
                    schiff.zellen.push(alleZellen[10 * (schiff.y + i) + schiff.x]);
            }


            // Wir können das Schiff nur platzieren, wenn die ausgewählten Zellen noch nicht anderweitig belegt sind
            var zellenSindFrei = true;

            for (var z = 0; z < schiff.zellen.length; z++)
                if (schiff.zellen[z].schiff != null) {
                    zellenSindFrei = false;
                    break;
                }

            // Na super, das hat ja gepasst
            if (zellenSindFrei) {
                // Wir merken uns die Zuordnung
                for (var z = 0; z < schiff.zellen.length; z++)
                    schiff.zellen[z].schiff = schiff;

                break;
            }
        }

        // Zurück auf 0
        tipp.textContent = '0';
        spielzüge = 0;
    }
}

// Der Spieler hat eine Zelle angeklickt.
function beschiessen(zelle) {
    // Darauf haben wir schon geschossen
    if (zelle.className != nichtGeprüft)
        return;

    var drumherum = 0;

    // Treffer in der Umgebung zählen
    for (var z = Math.max(0, zelle.zeilennummer - 1), zm = Math.min(10, zelle.zeilennummer + 2) ; z < zm; z++)
        for (var s = Math.max(0, zelle.spaltennummer - 1), sm = Math.min(10, zelle.spaltennummer + 2) ; s < sm; s++)
            if ((z != zelle.zeilennummer) || (s != zelle.spaltennummer))
                if (alleZellen[10 * z + s].schiff != null)
                    drumherum += 1;

    // Anzeigen als Tipp
    tipp.textContent = drumherum;

    // Zählen wir die Versuche
    spielzüge += 1;

    // Schauen wir einmal nach, ob hier etwas ist
    var schiff = zelle.schiff;
    if (schiff == null) {
        zelle.className = daneben;
        return;
    }

    // Treffer anzeigen
    zelle.className = treffer;

    // Anzahl der Treffer zählen
    schiff.treffer = 0;

    for (var z = 0; z < schiff.zellen.length; z++)
        if (schiff.zellen[z].className == treffer)
            schiff.treffer += 1;

    // Wir leben noch
    if (schiff.treffer < schiff.größe)
        return;

    // Versenkt
    for (var z = 0; z < schiff.zellen.length; z++)
        schiff.zellen[z].className = versenkt;

    // Und nun schauen wir mal nach, ob wir vielleicht gewonnen haben
    for (var s = 0; s < schiffe.length; s++)
        if (schiffe[s].treffer < schiffe[s].größe)
            return;

    // Yipiie
    alert('Du hast mit ' + spielzüge + ' Schüssen alle Schiffe gefunden');
}

// Tipps anzeigen
function tippAn() {
    var tippAnzeige = document.querySelector('.keinTipp');
    if (tippAnzeige != null)
        tippAnzeige.className = 'tipp';
}