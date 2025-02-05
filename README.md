<!--
script:   src/index.js

@GGBScript
<script modify="//-XXXX-\n" run-once style="display: block; background: #f9f9f9; padding: 1rem; border: 1px solid #ddd; margin-top: 1rem">
function render () {
    console.log("GGBScript", window.GGBScript)
    if (!window.GGBScript) {
        setTimeout(render, 100);
        return
    }


    let code = `//-XXXX-
@0//-XXXX-
`

    send.lia(`HTML: <lia-chart style="margin-top: 2rem" option='${window.GGBScript(code)}'></lia-chart>`)
    send.lia("LIA: stop")
}

setTimeout(render, window.GGBScript ? 10 : 200)

"LIA: wait"
</script>
@end

-->

# GGBScript


## Punkt

``` js @GGBScript
Titel("Punkt A & B");

// Definiere einen Punkt
const A = Punkt(1, 2, "A");
const B = Punkt([4, 6], "B");
```

## Gerade

``` js @GGBScript
Titel("Gerade g1 & g2");

// Definiere Punkte
const A = Punkt(1, 2, "A");
const B = Punkt(4, 6, "B");
const C = Punkt(2, 5, "C");
const D = Punkt(6, 3, "D");

// Erzeuge zwei Geraden
const g1 = Gerade(A, B, "g1");
const g2 = Gerade(C, D, "g2");
```

## Strecke

``` js @GGBScript
Titel("Strecke s1 & s2");

// Definiere Punkte
const A = Punkt(1, 2, "A");
const B = Punkt(4, 6, "B");
const C = Punkt(2, 5, "C");
const D = Punkt(6, 3, "D");

// Erzeuge zwei Strecken
const s1 = Strecke(A, B, "s1");
const s2 = Strecke(C, D, "s2");
```

## Polygon

``` js @GGBScript
Titel("Polygon P");

// Definiere Punkte
const A = Punkt(1, 2, "A");
const B = Punkt(4, 6, "B");
const C = Punkt(2, 5, "C");

// Erzeuge ein Polygon
const P = Polygon(A, B, C);
```

## Kreis

``` js @GGBScript
Titel("Kreis K");
UserAxisLimits(-2.5, 5, 0, 3);

// Definiere einen Punkt
const A = Punkt(1.5, 1.5, "A");

// Erzeuge einen Kreis
const K = Kreis(A, 1, "K");
```

## Verschiebung

``` js @GGBScript
Titel("Verschiebung");

// Definiere einen Punkt
const A = Punkt(1, 2, "A");

// Verschiebe den Punkt
Verschiebung(A, 2, 3);
```

---

x = <script input="range" min="0" max="100" value="5" step="1" default="5" output="x">
@input
</script>\
y = <script input="range" min="-100" max="100" value="5" step="1" default="5" output="y">
@input
</script>


``` js @GGBScript
Titel("Verschiebung 2");

// Definiere Punkte
const A = Punkt(1, 2, "A");
const B = Punkt(4, 6, "B");
const C = Punkt(2, 5, "C");

// Erzeuge ein Polygon
const P = Polygon(A, B, C);

// Verschiebe das Polygon
const P2 = Verschiebung(P, @input(`x`), @input(`y`), "P2");

Farbe(P2, "lightblue");
```

## Mittelpunkt

A = (<script input="range" min="0" max="100" value="1" step="1" default="1" output="A0">
@input
</script>,
<script input="range" min="-100" max="100" value="2" step="1" default="2" output="A1">
@input
</script>
)

``` js @GGBScript
// Definiere Punkte
let A = Punkt(@input(`A0`), @input(`A1`), "A");
let B = Punkt(1, 6, "B");
let C = Punkt(2, 5, "C");


// Erzeuge ein Polygon
const P = Polygon(A, B, C);

Mittelpunkt(A, B, C);
```

## Abstand

``` js @GGBScript
// Definiere Punkte
let A = Punkt(1, 2, "A");
let B = Punkt(4, 6, "B");
let C = Punkt(2, 5, "C");
let D = Punkt(6, 3, "D");

Polygon(A, B, C);

let M = Mittelpunkt(A, B, C);

// Berechne den Abstand der Geraden
let d = Abstand(M, D);
```


## Schnittpunkt

``` js @GGBScript
// Definiere Punkte
let A = Punkt(1, 2, "A");
let B = Punkt(4, 6, "B");
let C = Punkt(2, 5, "C");
let D = Punkt(6, 3, "D");

// Erzeuge zwei Geraden
let g1 = Line(A, B, "g1");
let g2 = Strecke(C, D, "g2");

// Berechne den Schnittpunkt der Geraden
let S = Schnittpunkt(g1, g2);

Winkel(A, S, C);
```

## Winkel

``` js @GGBScript
// Definiere Punkte
let A = Punkt(1, 2, "A");
let B = Punkt(4, 6, "B");
let C = Punkt(2, 5, "C");

Strecke(A, B, "s1");
Strecke(B, C, "s2");

// Erzeuge ein Polygon
let w = Winkel(A, B, C);
```
## Lot

``` js @GGBScript
// Definiere Punkte
let A = Punkt(1, 2, "A");
let B = Punkt(4, 6, "B");
let C = Punkt(2, 5, "C");

// Erzeuge ein Gerade
let G = Gerade(A, B, "G");

// Erzeuge ein Lot
let L = Lot(C, G, "L");
```



# Rotation

A = (<script input="range" min="0" max="100" value="50" step="1" default="50" output="A0">
@input
</script>,
<script input="range" min="-100" max="100" value="50" step="1" default="50" output="A1">
@input
</script>
)

B = (<script input="range" min="0" max="100" value="96" step="1" default="96" output="B0">
@input
</script>,
<script input="range" min="-100" max="100" value="27" step="1" default="27" output="B1">
@input
</script>
)


C = (<script input="range" min="0" max="100" value="20" step="1" default="20" output="C0">
@input
</script>,
<script input="range" min="-100" max="100" value="20" step="1" default="20" output="C1">
@input
</script>
)

Rotation: 
<script input="range" min="0" max="360" value="0" step="1" default="0" output="rotation">
@input
</script>°


``` js @GGBScript
UserAxisLimits(0,150,0,60);

const A = Punkt(@input(`A0`), @input(`A1`), "A");
const B = Punkt(@input(`B0`), @input(`B1`), "B");
const C = Punkt(@input(`C0`), @input(`C1`), "C");

const P = Polygon("A", "B", "C");

Farbe(P, "red");

const M = Mittelpunkt(P);

const P2 = Rotation(P, M, @input(`rotation`));

Farbe(P2, "blue");

Kreis(M, 16, "Kreis");
```

## Vektor

``` js @GGBScript
// Erzeuge einen Vektor
let V = Vektor([1,2], [4,6], "V");
```