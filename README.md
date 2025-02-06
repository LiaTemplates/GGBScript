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

1. `Gerade( Punkt, Punkt )`

   Erzeugt eine Gerade durch zwei Punkte.

   ``` js @GGBScript
   Titel("Gerade g");

   // Definiere Punkte
   const A = Punkt(1, 2, "A");
   const B = Punkt(4, 6, "B");

   // Erzeuge eine Gerade
   const g = Gerade(A, B, "g");
   ```

2. `Gerade( Punkt, Gerade )`

   Erzeugt eine Gerade durch einen Punkt und eine Gerade.

   ``` js @GGBScript
   Titel("Gerade g1 & g2");

   // Definiere Punkte
   const A = Punkt(1, 2, "A");
   const B = Punkt(4, 6, "B");
   const C = Punkt(0, 5, "C");

   // Erzeuge zwei Geraden
   const g1 = Gerade(A, B, "g1");
   const g2 = Gerade(C, g1, "g2");
   ```

## Strecke

1. `Strecke( Punkt, Punkt )`

   Erzeugt eine Strecke zwischen zwei Punkten.

   ``` js @GGBScript
   Titel("Strecke S");

   // Definiere Punkte
   const A = Punkt(1, 2, "A");
   const B = Punkt(4, 6, "B");

   // Erzeuge eine Strecke
   const S = Strecke(A, B, "S");
   ```

2. `Strecke( Punkt, Länge )`

   Erzeugt eine Strecke mit einer bestimmten Länge.

   ``` js @GGBScript
   Titel("Strecke s1 & s2 & s3");

   // Definiere Punkte
   const A = Punkt(1, 2, "A");
   const B = Punkt(4, 6, "B");

   // Erzeuge zwei Strecken
   const s1 = Strecke(A, 2, "s1");
   const s2 = Strecke(B, 3, "s2");
   const s3 = Strecke([1,1], 3, "s3");
   ```

## Vektor 

1. `Vektor( Punkt )`

``` js @GGBScript

Titel("Vektor V1");

// Definiere einen Punkt
const A = Punkt(1, 2, "A");

// Erzeuge einen Vektor
const V1 = Vektor(A, "V1");
const V2 = Vektor([-1,2]);
```

2. `Vektor( Punkt, Punkt )`

``` js @GGBScript
Titel("Vektor V");

// Definiere Punkte
const A = Punkt(1, 2, "A");
const B = Punkt(4, 6, "B");

// Erzeuge einen Vektor
const V = Vektor(A, B, "V");
```

## Vieleck

``` js @GGBScript
Titel("Vieleck V");

// Definiere Punkte
const A = Punkt(1, 2, "A");
const B = Punkt(4, 6, "B");
const C = Punkt(2, 5, "C");

// Erzeuge ein Vieleck
const V = Vieleck(A, B, C);
```

``` js @GGBScript
Titel("Vieleck V2");

// Hier ist (1,1) der Mittelpunkt und (4,1) ein Punkt auf dem Umfang;
// 6 gibt die Anzahl der Ecken an.
Vieleck([1, 1], [4, 1], 8);
```

``` js @GGBScript
Vieleck([2,2], [5,2], 5, [0,1]);
```

``` js @GGBScript
Diagramm(false)
const V = Vieleck([1, 1], [3, 0], [3, 2], [0, 4]);

Rotation(V, [1, 1], 45);
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

1. Kreis mit festem Radius `Kreis("Mittelpunkt", 5)`

``` js @GGBScript
Titel("Kreis K")
UserAxisLimits(-2.5, 5, 0, 3)

// Definiere einen Punkt
const A = Punkt(1.5, 1.5, "A")

// Erzeuge einen Kreis
const K = Kreis(A, 1, "K")
```

2. Kreis mit Radius einer Strecke `Kreis("M", "Strecke1")`

``` js @GGBScript
Titel("Kreis K2")
UserAxisLimits(-2.5, 5, 0, 3)

// Definiere Punkte
const A = Punkt(1, 1, "A")
const B = Punkt(3, 2, "B")

// Erzeuge eine Strecke
const S = Strecke(A, B, "Strecke1")

// Erzeuge einen Kreis
const K2 = Kreis(A, S, "K2")
```

3. Kreis mit Radius aus Abstand zweier Punkte `Kreis("M", "P2")`

``` js @GGBScript
Titel("Kreis K3")
UserAxisLimits(-2.5, 5, 0, 3)

// Definiere Punkte
const A = Punkt(1, 1, "A")
const B = Punkt(3, 2, "B")

// Erzeuge einen Kreis
const K3 = Kreis(A, B, "K3")
```

4. Kreis durch drei Punkte `Kreis("A", "B", "C")`

``` js @GGBScript
Titel("Kreis K4")
UserAxisLimits(-2.5, 5, 0, 3)

// Definiere Punkte
const A = Punkt(1, 1, "A")
const B = Punkt(3, 2, "B")
const C = Punkt(2, 3, "C")

// Erzeuge einen Kreis
Kreis("A", "B", "C");
```


5. Kreis mit Richtung einer Geraden `Kreis("M", 5, "Gerade1")`

``` js @GGBScript
Titel("Kreis K5")
UserAxisLimits(-2.5, 5, 0, 3)

// Definiere Punkte
const A = Punkt(1, 1, "A")
const B = Punkt(3, 2, "B")

// Erzeuge eine Gerade
const G = Gerade(A, B, "Gerade1")

// Erzeuge einen Kreis
Kreis("A", 1, "Gerade1");
```

6. Kreis mit Richtung eines Vektors `Kreis("M", 5, "Vektor1")`

   ``` js @GGBScript
   Titel("Kreis K6")
   UserAxisLimits(-2.5, 5, 0, 3)

   // Definiere Punkte
   const A = Punkt(1, 1, "A")
   const B = Punkt(3, 2, "B")

   // Erzeuge einen Vektor
   const V = Vektor(A, B, "Vektor1")

   // Erzeuge einen Kreis
   Kreis("A", 1, "Vektor1");
   ```

## Ellipse

1. Ellipse mit festem Radius `Ellipse("Mittelpunkt", 5, 3)`

``` js @GGBScript
Titel("Ellipse E")
// UserAxisLimits(-2.5, 5, 0, 3)
// Definiert einen Mittelpunkt "M1"
Punkt(0, 0, "M1");
// Erzeugt eine Ellipse mit Mittelpunkt "M1", horizontaler Halbachse 5, vertikaler Halbachse 3 und Rotation 30°:
Ellipse("M1", 5, 3);
```


## Verschiebung

``` js @GGBScript
Titel("Verschiebung");

// Definiere einen Punkt
const A = Punkt(1, 2, "A");

// Verschiebe den Punkt
const B = Verschiebung(A, 2, 3, "B");
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

## Parallele

``` js @GGBScript
// Definiere Punkte
let A = Punkt(1, 2, "A");
let B = Punkt(4, 6, "B");
let C = Punkt(2, 5, "C");

// Erzeuge eine Gerade
let g = Gerade(A, B, "g");

// Erzeuge eine Parallele
let p = Parallele(C, g, "p");
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

---

``` js @GGBScript
// Definiere Punkte
let A = Punkt(1, 2, "A");
let B = Punkt(4, 6, "B");
let C = Punkt(2, 5, "C");
let D = Punkt(6, 3, "D");

// Erzeuge zwei Geraden
let g1 = Line(A, B, "g1");
let g2 = Strecke(C, D, "g2");

// Berechne den Abstand der Geraden
let d = Abstand(g1, g2);
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

## Text

``` js @GGBScript
// Definiere einen Punkt
let A = Punkt(1, 2, "A");

// Erzeuge einen Text
let T = Text([1,2.3], "Text");
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