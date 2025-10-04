/*
 bitte beachte die Regeln in README-AI.md.

bookmarklet-paperclip.js

das Bookmarklet erzeugt bei Aufruf ein Overlay mit einer Büroklammer als SVG Grafik. Diese Büroklammer kann einen Text speichern. Default: "Ich kann Dir einen Text speichern."

Der Text wird im local storage gespeichert, und beim Start geladen.


Die Position der Büroklammer lässt sich verschieben.das funktioniert per Cursor oder Touch. 

Die Büroklammer lässt sich in ein Textfeld oder Input ziehen: Der Text wird dann dort hinein kopiert. Die Klammer springt zurück an ihre Position 

Bei Klick auf die Klammer fragt ein confirm, ob der  Text in die Zwischenablage kopiert werden soll. Der Text wird in der console ausgegeben.

Um neuen Text zu speichern, muss Mann die Klammer 1 sekunde gedrückt halten. Wenn im Document ein Text markiert ist, wird dieser gespeichert. Wenn keiner markiert ist erscheint ein Prompt zum Bearbeiten des aktuellen Texts.


Die SVG-Büroklammer hat Augen, die dorthin gucken wo Klicks oder Touch stattfindet. Bei Interaktion oder verschieben, zeigt eine Sprechblase die Grösse des Speichertextes an.

Etwaige Fehler werden abgefangen und per alert erklärt. 

Wenn bei Aufruf bereits eine Büroklammer vorhanden ist, wird das als Ausschalten interpretiert, alles aus dem document entfernen. Der nächste Aufruf des Bookmarklet startet dann frisch.

*/