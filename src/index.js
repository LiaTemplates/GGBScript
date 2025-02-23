'use strict'

/* ============================================================
   Globale Variablen & Initialisierung
   ============================================================ */
let objects = {} // Gemeinsames Dictionary für alle Objekte (Punkte, Linien, etc.)
let TITLE = '' // Diagrammtitel (optional)
let globalAxisLimits = {} // Globale Achsenlimits
// Globale Variable, die steuert, ob das Diagramm gezeichnet wird.
let diagrammAktiv = true

/**
 * Diagramm(aktiv)
 *
 * Schaltet das Zeichnen des Diagramms an oder aus.
 * @param {boolean} aktiv - true: Diagramm anzeigen, false: Diagramm nicht anzeigen.
 */
function Diagramm(aktiv) {
  diagrammAktiv = aktiv
}

// ------------------------------------------------------------
// Hilfsfunktion: Serialisierung (inkl. Funktionen)
// ------------------------------------------------------------
function toSource(obj) {
  if (obj == null) return String(obj)
  const t = typeof obj
  if (t === 'number' || t === 'boolean') return String(obj)
  if (t === 'string') return JSON.stringify(obj)
  if (t === 'function') return obj.toString()
  if (Array.isArray(obj)) {
    const elements = obj.map((el) => toSource(el)).join(', ')
    return `[${elements}]`
  }
  if (t === 'object') {
    let keys = Object.keys(obj)
    let props = keys.map(
      (key) => JSON.stringify(key) + ': ' + toSource(obj[key])
    )
    return `{ ${props.join(', ')} }`
  }
  return String(obj)
}

// ------------------------------------------------------------
// Funktion: GBScript_init
// Setzt das Objekt-Dictionary sowie alle globalen Variablen zurück.
// ------------------------------------------------------------
function GBScript_init() {
  objects = {}
  TITLE = ''
  globalAxisLimits = {}
  diagrammAktiv = true
}

// ------------------------------------------------------------
// Globale Funktion: UserAxisLimits
// Mit dieser Funktion können die Achsenlimits global gesetzt werden.
// ------------------------------------------------------------
function UserAxisLimits(minX, maxX, minY, maxY) {
  globalAxisLimits = { minX, maxX, minY, maxY }
}

/* ============================================================
   Hilfsfunktionen
   ============================================================ */

// Gibt zu einem Argument (String oder [x,y]) die Koordinaten zurück.
// Wird z. B. von Punkt, Linie, etc. benötigt.
function getCoord(arg) {
  if (typeof arg === 'string') {
    if (objects[arg] && objects[arg].type === 'point') return objects[arg].coord
    else {
      console.error(`getCoord: Punkt "${arg}" ist nicht definiert.`)
      return null
    }
  } else if (Array.isArray(arg) && arg.length === 2) {
    return arg
  } else {
    console.error(
      `getCoord: Ungültiges Argument "${arg}". Erwartet wird ein Punktname oder [x, y].`
    )
    return null
  }
}

/* ============================================================
   Funktionen zur Objekterzeugung
   ============================================================ */

// ------------------------------------------------------------
// Funktion: Punkt
// Erzeugt einen Punkt und speichert ihn im Dictionary.
// Argumente: Punkt(x, y, name?) oder Punkt([x,y], name?)
// ------------------------------------------------------------
function Punkt(x, y = null, name = null) {
  let coords, pointName
  if (Array.isArray(x) && x.length === 2) {
    coords = x
    if (typeof y === 'string') {
      name = y
    }
  } else if (typeof x === 'number' && typeof y === 'number') {
    coords = [x, y]
  } else {
    console.error(`Punkt: Ungültige Argumente (${x}, ${y})`)
    return null
  }
  if (!name) {
    let index = 1
    while (objects['P' + index]) index++
    pointName = 'P' + index
  } else {
    if (objects[name]) {
      console.error(`Punkt "${name}" existiert bereits.`)
      return name
    }
    pointName = name
  }
  objects[pointName] = { type: 'point', coord: coords, style: { color: 'red' } }
  return pointName
}

// ------------------------------------------------------------
// Funktion: Linie
// Zeichnet eine Linie zwischen zwei Punkten.
// ------------------------------------------------------------
function Linie(arg1, arg2, name = null) {
  const coord1 = getCoord(arg1)
  const coord2 = getCoord(arg2)
  if (!coord1 || !coord2) {
    console.error('Linie: Mindestens einer der beiden Punkte ist ungültig.')
    return null
  }
  let index = 1
  if (!name) {
    while (objects['Linie' + index]) index++
    name = 'Linie' + index
  } else if (objects[name]) {
    console.error(`Linie: Element "${name}" existiert bereits.`)
    return name
  }
  objects[name] = {
    type: 'line',
    data: [coord1, coord2],
    style: { lineColor: '#000', lineWidth: 2, lineType: 'solid' },
    tooltip: `<strong>${name}</strong><br>Start: (${coord1[0]}, ${coord1[1]})<br>Ende: (${coord2[0]}, ${coord2[1]})`,
  }
  return name
}
function Line(arg1, arg2, name = null) {
  return Linie(arg1, arg2, name)
}

// ------------------------------------------------------------
// Funktion: Strecke
// Zeichnet einen Streckenabschnitt zwischen zwei Punkten.
// ------------------------------------------------------------
function Strecke(arg1, arg2, name = null) {
  // Bestimme den Startpunkt
  const startCoord = getCoord(arg1)
  if (!startCoord) {
    console.error('Strecke: Startpunkt ist ungültig.')
    return null
  }

  // Falls der Startpunkt als Koordinate (Array) übergeben wurde, wird zusätzlich ein Anfangspunkt angelegt.
  if (typeof arg1 !== 'string') {
    // Generiere einen Namen für den Anfangspunkt: "P_start_" + <Streckenname> (falls vorhanden) oder mit Index.
    let startPointName = name ? 'P_start_' + name : null
    if (!startPointName) {
      let index = 1
      while (objects['P_start' + index]) index++
      startPointName = 'P_start' + index
    }
    objects[startPointName] = {
      type: 'point',
      coord: startCoord,
      style: { color: 'red' },
    }
  }

  let endCoord
  // Flag, ob ein zusätzlicher Endpunkt als Punkt gezeichnet werden soll (falls Länge angegeben wird)
  let appendEndPoint = false

  // Fall 1: arg2 ist ein bekannter Punkt (String oder Array)
  if (
    (typeof arg2 === 'string' &&
      objects[arg2] &&
      objects[arg2].type === 'point') ||
    (Array.isArray(arg2) && arg2.length === 2)
  ) {
    endCoord = getCoord(arg2)
    if (!endCoord) {
      console.error('Strecke: Endpunkt ist ungültig.')
      return null
    }
  }
  // Fall 2: arg2 ist eine Zahl (Länge) → Strecke wird horizontal (nach rechts) konstruiert
  else if (typeof arg2 === 'number') {
    endCoord = [startCoord[0] + arg2, startCoord[1]]
    appendEndPoint = true
  } else {
    console.error(
      'Strecke: Zweiter Parameter muss entweder ein bekannter Punkt oder eine Länge (Zahl) sein.'
    )
    return null
  }

  // Generiere einen Namen für die Strecke, falls keiner angegeben ist
  let index = 1
  if (!name) {
    while (objects['Strecke' + index]) index++
    name = 'Strecke' + index
  } else if (objects[name]) {
    console.error(`Strecke: Element "${name}" existiert bereits.`)
    return name
  }

  // Erzeuge die Strecke als "line" im gemeinsamen Dictionary
  objects[name] = {
    type: 'line',
    data: [startCoord, endCoord],
    style: { lineColor: '#F00', lineWidth: 2, lineType: 'solid' },
    tooltip: `<strong>${name}</strong><br>Start: (${startCoord[0]}, ${startCoord[1]})<br>Ende: (${endCoord[0]}, ${endCoord[1]})`,
  }

  // Falls der Endpunkt aus einer Längenangabe berechnet wurde, zeichne zusätzlich einen Endpunkt.
  if (appendEndPoint) {
    let endPointName = 'P_end_' + name
    objects[endPointName] = {
      type: 'point',
      coord: endCoord,
      style: { color: 'blue' }, // Beispiel: blaue Farbe für den Endpunkt
    }
  }

  return name
}

// ------------------------------------------------------------
// Funktion: Gerade
// Zeichnet eine unendliche Gerade (als Strecke in den Achsenbegrenzungen).
// ------------------------------------------------------------
function Gerade(arg1, arg2, name = null) {
  // Hole den Startpunkt (erster Parameter muss einen Punkt repräsentieren)
  const p = getCoord(arg1)
  if (!p) {
    console.error('Gerade: Ungültiger erster Parameter (Punkt).')
    return null
  }

  let secondPoint = null // Variante 1: zweiter Parameter als Punkt
  let directionVector = null // Variante 2/3: zweiter Parameter als Richtungsvektor

  // Unterscheide anhand des Typs des zweiten Parameters:
  if (typeof arg2 === 'string') {
    // arg2 als String: Es könnte sich um einen bekannten Punkt oder um eine bekannte Gerade handeln.
    if (objects[arg2]) {
      if (objects[arg2].type === 'point') {
        // Variante 1: Zwei Punkte
        secondPoint = getCoord(arg2)
      } else if (objects[arg2].type === 'line') {
        // Variante 2: Parallele Gerade – wir entnehmen den Richtungsvektor der bekannten Gerade.
        const lineData = objects[arg2].data
        if (!lineData || lineData.length < 2) {
          console.error(
            "Gerade: Die gegebene Gerade '" + arg2 + "' hat ungültige Daten."
          )
          return null
        }
        const lp1 = lineData[0],
          lp2 = lineData[1]
        directionVector = [lp2[0] - lp1[0], lp2[1] - lp1[1]]
      } else {
        console.error(
          'Gerade: Der zweite Parameter muss ein Punkt, eine Gerade oder ein Richtungsvektor sein.'
        )
        return null
      }
    } else {
      console.error("Gerade: Objekt '" + arg2 + "' nicht gefunden.")
      return null
    }
  } else if (Array.isArray(arg2) && arg2.length === 2) {
    // Variante 3: Zweiter Parameter als Richtungsvektor (direkt als Array)
    directionVector = arg2
  } else {
    console.error(
      'Gerade: Ungültiger zweiter Parameter. Erwarte einen Punkt, eine Gerade oder einen Richtungsvektor.'
    )
    return null
  }

  // Nun: Bestimme zwei Punkte (endP1 und endP2), die die Gerade innerhalb der Achsengrenzen definieren.
  const axMinX =
    typeof globalAxisLimits.minX === 'number' ? globalAxisLimits.minX : -10
  const axMaxX =
    typeof globalAxisLimits.maxX === 'number' ? globalAxisLimits.maxX : 10
  const axMinY =
    typeof globalAxisLimits.minY === 'number' ? globalAxisLimits.minY : -10
  const axMaxY =
    typeof globalAxisLimits.maxY === 'number' ? globalAxisLimits.maxY : 10

  let endP1, endP2
  if (secondPoint) {
    // Variante 1: Zwei Punkte
    // Erzeuge die Gerade durch p und secondPoint.
    if (Math.abs(p[0] - secondPoint[0]) < 1e-9) {
      // Vertikale Gerade
      endP1 = [p[0], axMinY]
      endP2 = [p[0], axMaxY]
    } else {
      const m = (secondPoint[1] - p[1]) / (secondPoint[0] - p[0])
      const b = p[1] - m * p[0]
      let candidates = []
      const yAtMinX = m * axMinX + b
      if (yAtMinX >= axMinY && yAtMinX <= axMaxY)
        candidates.push([axMinX, yAtMinX])
      const yAtMaxX = m * axMaxX + b
      if (yAtMaxX >= axMinY && yAtMaxX <= axMaxY)
        candidates.push([axMaxX, yAtMaxX])
      if (Math.abs(m) > 1e-9) {
        const xAtMinY = (axMinY - b) / m
        if (xAtMinY >= axMinX && xAtMinY <= axMaxX)
          candidates.push([xAtMinY, axMinY])
        const xAtMaxY = (axMaxY - b) / m
        if (xAtMaxY >= axMinX && xAtMaxY <= axMaxX)
          candidates.push([xAtMaxY, axMaxY])
      }
      // Entferne Duplikate
      let uniqueCandidates = []
      candidates.forEach((pt) => {
        if (
          !uniqueCandidates.some(
            (u) =>
              Math.abs(u[0] - pt[0]) < 1e-9 && Math.abs(u[1] - pt[1]) < 1e-9
          )
        ) {
          uniqueCandidates.push(pt)
        }
      })
      if (uniqueCandidates.length < 2) {
        console.error(
          'Gerade: Es konnten nicht genügend Schnittpunkte gefunden werden.'
        )
        return null
      }
      uniqueCandidates.sort((a, b) => a[0] - b[0])
      endP1 = uniqueCandidates[0]
      endP2 = uniqueCandidates[uniqueCandidates.length - 1]
    }
  } else if (directionVector) {
    // Variante 2/3: Die Gerade wird durch den Startpunkt p und einen Richtungsvektor definiert.
    const vx = directionVector[0],
      vy = directionVector[1]
    if (Math.abs(vx) < 1e-9 && Math.abs(vy) < 1e-9) {
      console.error(
        'Gerade: Der Richtungsvektor darf nicht der Nullvektor sein.'
      )
      return null
    }
    if (Math.abs(vx) < 1e-9) {
      // Vertikale Gerade
      endP1 = [p[0], axMinY]
      endP2 = [p[0], axMaxY]
    } else {
      const m = vy / vx
      const b = p[1] - m * p[0]
      let candidates = []
      const yAtMinX = m * axMinX + b
      if (yAtMinX >= axMinY && yAtMinX <= axMaxY)
        candidates.push([axMinX, yAtMinX])
      const yAtMaxX = m * axMaxX + b
      if (yAtMaxX >= axMinY && yAtMaxX <= axMaxY)
        candidates.push([axMaxX, yAtMaxX])
      if (Math.abs(m) > 1e-9) {
        const xAtMinY = (axMinY - b) / m
        if (xAtMinY >= axMinX && xAtMinY <= axMaxX)
          candidates.push([xAtMinY, axMinY])
        const xAtMaxY = (axMaxY - b) / m
        if (xAtMaxY >= axMinX && xAtMaxY <= axMaxX)
          candidates.push([xAtMaxY, axMaxY])
      }
      let uniqueCandidates = []
      candidates.forEach((pt) => {
        if (
          !uniqueCandidates.some(
            (u) =>
              Math.abs(u[0] - pt[0]) < 1e-9 && Math.abs(u[1] - pt[1]) < 1e-9
          )
        ) {
          uniqueCandidates.push(pt)
        }
      })
      if (uniqueCandidates.length < 2) {
        console.error(
          'Gerade: Es konnten nicht genügend Schnittpunkte gefunden werden.'
        )
        return null
      }
      uniqueCandidates.sort((a, b) => a[0] - b[0])
      endP1 = uniqueCandidates[0]
      endP2 = uniqueCandidates[uniqueCandidates.length - 1]
    }
  } else {
    console.error('Gerade: Unbekannter Fall.')
    return null
  }

  // Erzeuge einen Namen, falls keiner angegeben wurde.
  if (!name) {
    let index = 1
    while (objects['Gerade' + index]) index++
    name = 'Gerade' + index
  } else if (objects[name]) {
    console.error("Gerade: Element '" + name + "' existiert bereits.")
    return name
  }

  // Lege die Gerade im gemeinsamen Dictionary ab.
  objects[name] = {
    type: 'line',
    data: [endP1, endP2],
    style: { lineColor: '#00F', lineWidth: 2, lineType: 'dashed' },
    tooltip: `<strong>${name}</strong><br>Schnittpunkt 1: (${endP1[0]}, ${endP1[1]})<br>Schnittpunkt 2: (${endP2[0]}, ${endP2[1]})`,
  }

  return name
}

function Vieleck(...args) {
  let vertices = []

  // Hilfsfunktion zur Berechnung des Abstands zwischen zwei Punkten
  function dist(p1, p2) {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2))
  }

  // Variante 1: Vieleck( <Liste von Punkten> )
  if (args.length === 1 && Array.isArray(args[0])) {
    vertices = args[0]
  }
  // Variante 2: Vieleck( <Punkt>, <Punkt>, <Anzahl der Ecken> )
  else if (args.length === 3 && typeof args[2] === 'number') {
    let center = getCoord(args[0])
    let vertex = getCoord(args[1])
    let n = args[2]
    if (!center || !vertex) {
      console.error('Vieleck: Ungültige Punkte für das regelmäßige Vieleck.')
      return null
    }
    let radius = dist(center, vertex)
    let startAngle = Math.atan2(vertex[1] - center[1], vertex[0] - center[0])
    vertices = []
    for (let i = 0; i < n; i++) {
      let angle = startAngle + (2 * Math.PI * i) / n
      vertices.push([
        center[0] + radius * Math.cos(angle),
        center[1] + radius * Math.sin(angle),
      ])
    }
  }
  // Variante 3: Vieleck( <Punkt>, <Punkt>, <Anzahl der Ecken n>, <Richtung> )
  else if (args.length === 4 && typeof args[2] === 'number') {
    let center = getCoord(args[0])
    let vertex = getCoord(args[1])
    let n = args[2]
    let direction = args[3] // Erwartet einen Vektor, z. B. [vx, vy]
    if (!center || !vertex) {
      console.error('Vieleck: Ungültige Punkte für das regelmäßige Vieleck.')
      return null
    }
    if (!Array.isArray(direction) || direction.length !== 2) {
      console.error(
        'Vieleck: Der Richtungsparameter muss ein Vektor [vx, vy] sein.'
      )
      return null
    }
    let radius = dist(center, vertex)
    // Bestimme den gewünschten Startwinkel aus dem Richtungsvektor
    let desiredAngle = Math.atan2(direction[1], direction[0])
    vertices = []
    for (let i = 0; i < n; i++) {
      let angle = desiredAngle + (2 * Math.PI * i) / n
      vertices.push([
        center[0] + radius * Math.cos(angle),
        center[1] + radius * Math.sin(angle),
      ])
    }
  }
  // Variante 4: Vieleck( <Punkt>, …, <Punkt> ) – alle Parameter sind Punkte
  else if (args.length >= 3 && typeof args[args.length - 1] !== 'number') {
    vertices = args
  } else {
    console.error('Vieleck: Ungültige Parameter.')
    return null
  }

  // Falls einzelne Punkte als String (Name) übergeben wurden, wandelt getCoord sie in Koordinaten um.
  vertices = vertices.map((pt) => getCoord(pt) || pt)

  // Schließe das Polygon, falls der erste und der letzte Punkt nicht identisch sind.
  if (vertices.length > 0) {
    let first = vertices[0]
    let last = vertices[vertices.length - 1]
    if (
      Math.abs(first[0] - last[0]) > 1e-9 ||
      Math.abs(first[1] - last[1]) > 1e-9
    ) {
      vertices.push(first)
    }
  }

  // Erzeuge einen eindeutigen Namen für das Vieleck
  let index = 1
  let polyName = 'Vieleck' + index
  while (objects[polyName]) {
    index++
    polyName = 'Vieleck' + index
  }

  objects[polyName] = {
    type: 'polygon',
    data: vertices,
    style: {
      lineColor: '#0A0',
      lineWidth: 2,
      lineType: 'solid',
      fillColor: 'rgba(0,170,0,0.3)',
    },
    tooltip: `<strong>${polyName}</strong>`,
  }

  return polyName
}

// ------------------------------------------------------------
// Funktion: Polygon
// Zeichnet ein Polygon (geschlossen) anhand beliebig vieler Punkte.
// ------------------------------------------------------------
function Polygon(...args) {
  if (args.length < 3) {
    console.error('Polygon: Es müssen mindestens drei Punkte definiert werden.')
    return null
  }
  let polygonCoords = []
  for (let i = 0; i < args.length; i++) {
    let coord = getCoord(args[i])
    if (!coord) {
      console.error(`Polygon: Ungültiger Parameter an Position ${i + 1}.`)
      return null
    }
    polygonCoords.push(coord)
  }
  // Schließe das Polygon, falls es nicht bereits geschlossen ist
  if (
    polygonCoords[0][0] !== polygonCoords[polygonCoords.length - 1][0] ||
    polygonCoords[0][1] !== polygonCoords[polygonCoords.length - 1][1]
  ) {
    polygonCoords.push(polygonCoords[0])
  }
  let index = 1
  while (objects['Polygon' + index]) index++
  let name = 'Polygon' + index
  objects[name] = {
    type: 'polygon',
    data: polygonCoords,
    style: {
      lineColor: '#0A0',
      lineWidth: 2,
      lineType: 'solid',
      fillColor: 'rgba(0,170,0,0.3)',
    },
    tooltip: `<strong>${name}</strong>`,
  }
  return name
}

// ------------------------------------------------------------
// Funktion: Mittelpunkt
// Berechnet den Schwerpunkt. Bei einem einzelnen Argument wird ein Polygon erwartet.
// Bei zwei oder mehr Argumenten werden Punkte direkt gemittelt.
// ------------------------------------------------------------
function Mittelpunkt(...args) {
  // Fall 1: Einzelnes Argument – Polygonname
  if (args.length === 1) {
    let polyName = args[0]
    if (!objects[polyName] || objects[polyName].type !== 'polygon') {
      console.error(
        `Mittelpunkt: Kein Polygon mit dem Namen "${polyName}" gefunden.`
      )
      return null
    }
    let vertices = objects[polyName].data.slice()
    if (
      vertices.length > 1 &&
      vertices[0][0] === vertices[vertices.length - 1][0] &&
      vertices[0][1] === vertices[vertices.length - 1][1]
    ) {
      vertices.pop()
    }
    let area = 0,
      Cx = 0,
      Cy = 0
    for (let i = 0; i < vertices.length; i++) {
      let x_i = vertices[i][0],
        y_i = vertices[i][1]
      let x_next = vertices[(i + 1) % vertices.length][0],
        y_next = vertices[(i + 1) % vertices.length][1]
      let factor = x_i * y_next - x_next * y_i
      area += factor
      Cx += (x_i + x_next) * factor
      Cy += (y_i + y_next) * factor
    }
    area /= 2
    let centroid
    if (Math.abs(area) < 1e-9) {
      let sumX = 0,
        sumY = 0
      for (let i = 0; i < vertices.length; i++) {
        sumX += vertices[i][0]
        sumY += vertices[i][1]
      }
      centroid = [sumX / vertices.length, sumY / vertices.length]
    } else {
      Cx /= 6 * area
      Cy /= 6 * area
      centroid = [Cx, Cy]
    }
    let index = 1
    while (objects['M' + index]) index++
    let midName = 'M' + index
    objects[midName] = {
      type: 'point',
      coord: centroid,
      style: { color: 'red' },
    }
    return midName
  }
  // Fall 2: Zwei Argumente – arithmetisches Mittel zweier Punkte
  if (args.length === 2) {
    const p1 = getCoord(args[0]),
      p2 = getCoord(args[1])
    if (!p1 || !p2) {
      console.error(
        'Mittelpunkt: Mindestens einer der beiden Punkte ist ungültig.'
      )
      return null
    }
    let mid = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2]
    let index = 1
    while (objects['M' + index]) index++
    let midName = 'M' + index
    objects[midName] = { type: 'point', coord: mid, style: { color: 'red' } }
    return midName
  }
  // Fall 3: Drei oder mehr Argumente – Schwerpunkt eines Polygons
  let vertices = []
  for (let i = 0; i < args.length; i++) {
    let coord = getCoord(args[i])
    if (!coord) {
      console.error(`Mittelpunkt: Ungültiger Parameter an Position ${i + 1}.`)
      return null
    }
    vertices.push(coord)
  }
  if (
    vertices[0][0] !== vertices[vertices.length - 1][0] ||
    vertices[0][1] !== vertices[vertices.length - 1][1]
  ) {
    vertices.push(vertices[0])
  }
  let area = 0,
    Cx = 0,
    Cy = 0
  for (let i = 0; i < vertices.length - 1; i++) {
    let x_i = vertices[i][0],
      y_i = vertices[i][1]
    let x_next = vertices[i + 1][0],
      y_next = vertices[i + 1][1]
    let factor = x_i * y_next - x_next * y_i
    area += factor
    Cx += (x_i + x_next) * factor
    Cy += (y_i + y_next) * factor
  }
  area /= 2
  let centroid
  if (Math.abs(area) < 1e-9) {
    let sumX = 0,
      sumY = 0
    for (let i = 0; i < vertices.length - 1; i++) {
      sumX += vertices[i][0]
      sumY += vertices[i][1]
    }
    let n = vertices.length - 1
    centroid = [sumX / n, sumY / n]
  } else {
    Cx /= 6 * area
    Cy /= 6 * area
    centroid = [Cx, Cy]
  }
  let index = 1
  while (objects['M' + index]) index++
  let midName = 'M' + index
  objects[midName] = { type: 'point', coord: centroid, style: { color: 'red' } }
  return midName
}

function Ellipse(...args) {
  let center,
    rx,
    ry,
    rotation = 0

  // Erwarte Parameter: Ellipse(Mittelpunkt, rx, ry) oder Ellipse(Mittelpunkt, rx, ry, rotation)
  if (args.length === 3 || args.length === 4) {
    center = getCoord(args[0])
    if (!center) {
      console.error('Ellipse: Ungültiger Mittelpunkt.')
      return null
    }
    if (typeof args[1] !== 'number' || typeof args[2] !== 'number') {
      console.error('Ellipse: rx und ry müssen Zahlen sein.')
      return null
    }
    rx = args[1]
    ry = args[2]
    if (args.length === 4) {
      if (typeof args[3] === 'number') {
        rotation = args[3]
      } else {
        console.error('Ellipse: Der Rotationswinkel muss eine Zahl sein.')
        return null
      }
    }
  } else {
    console.error(
      'Ellipse: Ungültige Parameter. Erwarte Ellipse(M, rx, ry, [rotation]).'
    )
    return null
  }

  if (rx <= 0 || ry <= 0) {
    console.error('Ellipse: rx und ry müssen positiv sein.')
    return null
  }

  // Generiere einen eindeutigen Namen für die Ellipse
  let index = 1
  while (objects['Ellipse' + index]) index++
  let name = 'Ellipse' + index

  // Erzeuge die Punkte, die die Ellipse approximieren
  const numPoints = 100
  const ellipseCoords = []
  const rotRad = (rotation * Math.PI) / 180 // Umrechnung des Rotationswinkels in Radianten
  for (let i = 0; i <= numPoints; i++) {
    let t = (i / numPoints) * 2 * Math.PI
    // Punkt auf der Ellipse ohne Rotation:
    let x = rx * Math.cos(t)
    let y = ry * Math.sin(t)
    // Rotation des Punktes:
    let xRot = x * Math.cos(rotRad) - y * Math.sin(rotRad)
    let yRot = x * Math.sin(rotRad) + y * Math.cos(rotRad)
    // Translation zum Mittelpunkt:
    ellipseCoords.push([center[0] + xRot, center[1] + yRot])
  }

  // Speichere die Ellipse als ein "line"-Objekt im globalen Dictionary
  objects[name] = {
    type: 'line',
    data: ellipseCoords,
    style: {
      lineColor: '#800080', // Beispiel: lila Farbe
      lineWidth: 2,
      lineType: 'solid',
      fillColor: 'rgba(128, 0, 128, 0.1)', // Transparente Füllung in lila
    },
    tooltip: `<strong>${name}</strong><br>Mittelpunkt: (${center[0]}, ${center[1]})<br>rx: ${rx}, ry: ${ry}<br>Rotation: ${rotation}°`,
  }

  return name
}

// ------------------------------------------------------------
// Funktion: Kreis
// Zeichnet einen Kreis – intern als Polygon approximiert.
// ------------------------------------------------------------
function Kreis(...args) {
  let center,
    radius,
    direction = null
  if (args.length === 2 || args.length === 3) {
    if (typeof args[1] === 'number') {
      center = getCoord(args[0])
      radius = args[1]
    } else if (typeof args[1] === 'string') {
      center = getCoord(args[0])
      let strecke = objects[args[1]]
      if (!strecke || !strecke.data) {
        console.error(`Kreis: Strecke "${args[1]}" nicht gefunden.`)
        return null
      }
      // Hier kann man z. B. den Abstand der ersten beiden Koordinaten nehmen:
      let pt1 = strecke.data[0],
        pt2 = strecke.data[1]
      radius = Math.sqrt(
        Math.pow(pt2[0] - pt1[0], 2) + Math.pow(pt2[1] - pt1[1], 2)
      )
    } else if (Array.isArray(args[1])) {
      center = getCoord(args[0])
      let point = getCoord(args[1])
      radius = Math.sqrt(
        Math.pow(point[0] - center[0], 2) + Math.pow(point[1] - center[1], 2)
      )
    }
    if (args.length === 3) {
      direction = args[2]
    }
  } else if (args.length === 3) {
    // Kreis durch drei Punkte
    let A = getCoord(args[0]),
      B = getCoord(args[1]),
      C = getCoord(args[2])
    if (!A || !B || !C) {
      console.error('Kreis: Mindestens einer der drei Punkte ist ungültig.')
      return null
    }
    let D = Mittelpunkt(A, B)
    let E = Mittelpunkt(B, C)
    let lotD = Lot(D, Gerade(A, B))
    let lotE = Lot(E, Gerade(B, C))
    let centerName = Schnittpunkt(lotD, lotE)
    center = getCoord(centerName)
    radius = Math.sqrt(
      Math.pow(A[0] - center[0], 2) + Math.pow(A[1] - center[1], 2)
    )
  } else {
    console.error('Kreis: Ungültige Parameter.')
    return null
  }
  if (!center || radius <= 0) {
    console.error('Kreis: Ungültiger Mittelpunkt oder Radius.')
    return null
  }
  let index = 1
  while (objects['Kreis' + index]) index++
  let name = 'Kreis' + index
  const numPoints = 100
  const circleCoords = []
  for (let i = 0; i <= numPoints; i++) {
    let angle = (i / numPoints) * 2 * Math.PI
    let x = center[0] + radius * Math.cos(angle)
    let y = center[1] + radius * Math.sin(angle)
    circleCoords.push([x, y])
  }
  objects[name] = {
    type: 'line',
    data: circleCoords,
    style: {
      lineColor: '#00F',
      lineWidth: 2,
      lineType: 'solid',
      fillColor: 'rgba(0,0,255,0.1)',
    },
    tooltip: `<strong>${name}</strong><br>Mittelpunkt: (${center[0]}, ${center[1]})<br>Radius: ${radius}`,
  }
  return name
}

/* ============================================================
   Transformationsfunktionen (verschieben, rotieren, spiegeln)
   – Falls kein neuer Name angegeben wird, wird das Objekt im Dictionary
     direkt modifiziert (in-place). Wird ein neuer Name übergeben, so wird
     eine Kopie unter dem neuen Namen gespeichert.
   ============================================================ */

// ------------------------------------------------------------
// Funktion: Verschiebung
// Verschiebt ein Objekt um (verschiebungX, verschiebungY).
// ------------------------------------------------------------
function Verschiebung(element, verschiebungX, verschiebungY, name = null) {
  let obj = objects[element]
  if (!obj) {
    console.error('Verschiebung: Element nicht gefunden.')
    return null
  }
  const transformCoord = (coord) => [
    coord[0] + verschiebungX,
    coord[1] + verschiebungY,
  ]
  if (obj.type === 'point') {
    let newCoord = transformCoord(obj.coord)
    if (name) {
      if (objects[name]) {
        console.error('Verschiebung: Name existiert bereits.')
        return null
      }
      objects[name] = { ...obj, coord: newCoord }
      return name
    } else {
      obj.coord = newCoord
      return element
    }
  } else if (obj.data) {
    let newData = obj.data.map(transformCoord)
    if (name) {
      if (objects[name]) {
        console.error('Verschiebung: Name existiert bereits.')
        return null
      }
      objects[name] = { ...obj, data: newData }
      return name
    } else {
      obj.data = newData
      return element
    }
  }
  console.error('Verschiebung: Objekt hat keine transformierbaren Koordinaten.')
  return null
}

// ------------------------------------------------------------
// Funktion: Rotation
// Rotiert ein Objekt um einen gegebenen Drehpunkt (in Grad).
// ------------------------------------------------------------
function Rotation(element, drehpunkt, winkelGrad, name = null) {
  const zentrum = getCoord(drehpunkt)
  if (!zentrum) {
    console.error('Rotation: Ungültiger Drehpunkt.')
    return null
  }
  const winkelRad = (winkelGrad * Math.PI) / 180
  const rotateCoord = (coord) => {
    const relX = coord[0] - zentrum[0],
      relY = coord[1] - zentrum[1]
    const rotX = relX * Math.cos(winkelRad) - relY * Math.sin(winkelRad)
    const rotY = relX * Math.sin(winkelRad) + relY * Math.cos(winkelRad)
    return [rotX + zentrum[0], rotY + zentrum[1]]
  }
  let obj = objects[element]
  if (!obj) {
    console.error('Rotation: Element nicht gefunden.')
    return null
  }
  if (obj.type === 'point') {
    let newCoord = rotateCoord(obj.coord)
    if (name) {
      if (objects[name]) {
        console.error('Rotation: Name existiert bereits.')
        return null
      }
      objects[name] = { ...obj, coord: newCoord }
      return name
    } else {
      obj.coord = newCoord
      return element
    }
  } else if (obj.data) {
    let newData = obj.data.map(rotateCoord)
    if (name) {
      if (objects[name]) {
        console.error('Rotation: Name existiert bereits.')
        return null
      }
      objects[name] = { ...obj, data: newData }
      return name
    } else {
      obj.data = newData
      return element
    }
  }
  console.error('Rotation: Objekt hat keine transformierbaren Koordinaten.')
  return null
}

// ------------------------------------------------------------
// Funktion: Spiegelung
// Spiegelt ein Objekt an einem gegebenen Spiegelpunkt.
// ------------------------------------------------------------
function Spiegelung(element, spiegelungsPunkt, name = null) {
  const spiegel = getCoord(spiegelungsPunkt)
  if (!spiegel) {
    console.error('Spiegelung: Ungültiger Spiegelpunkt.')
    return null
  }
  const reflectCoord = (coord) => [
    2 * spiegel[0] - coord[0],
    2 * spiegel[1] - coord[1],
  ]
  let obj = objects[element]
  if (!obj) {
    console.error('Spiegelung: Element nicht gefunden.')
    return null
  }
  if (obj.type === 'point') {
    let newCoord = reflectCoord(obj.coord)
    if (name) {
      if (objects[name]) {
        console.error('Spiegelung: Name existiert bereits.')
        return null
      }
      objects[name] = { ...obj, coord: newCoord }
      return name
    } else {
      obj.coord = newCoord
      return element
    }
  } else if (obj.data) {
    let newData = obj.data.map(reflectCoord)
    if (name) {
      if (objects[name]) {
        console.error('Spiegelung: Name existiert bereits.')
        return null
      }
      objects[name] = { ...obj, data: newData }
      return name
    } else {
      obj.data = newData
      return element
    }
  }
  console.error('Spiegelung: Objekt hat keine transformierbaren Koordinaten.')
  return null
}

// ------------------------------------------------------------
// Funktion: Schnittpunkt
// Berechnet den Schnittpunkt zweier Geraden und legt einen Punkt an.
// ------------------------------------------------------------
function Schnittpunkt(gerade1, gerade2, name = null) {
  let g1 = objects[gerade1],
    g2 = objects[gerade2]
  if (!g1 || !g2 || !g1.data || !g2.data) {
    console.error('Schnittpunkt: Mindestens eine Gerade nicht gefunden.')
    return null
  }
  const [[x1, y1], [x2, y2]] = g1.data
  const [[x3, y3], [x4, y4]] = g2.data
  const m1 = (y2 - y1) / (x2 - x1)
  const m2 = (y4 - y3) / (x4 - x3)
  const b1 = y1 - m1 * x1
  const b2 = y3 - m2 * x3
  if (Math.abs(m1 - m2) < 1e-9) {
    console.error('Schnittpunkt: Geraden sind parallel.')
    return null
  }
  const x = (b2 - b1) / (m1 - m2)
  const y = m1 * x + b1
  let index = 1
  if (!name) {
    while (objects['SP' + index]) index++
    name = 'SP' + index
  } else if (objects[name]) {
    console.error(`Schnittpunkt: Element "${name}" existiert bereits.`)
    return name
  }
  objects[name] = { type: 'point', coord: [x, y], style: { color: 'green' } }
  return name
}

// ------------------------------------------------------------
// Funktion: Abstand
// Berechnet den Abstand zwischen zwei Objekten (Punkten oder Geraden)
// und fügt zur Darstellung (als Hilfslinie und Text) zusätzliche Objekte hinzu.
// ------------------------------------------------------------
function Abstand(obj1, obj2) {
  const getDistance = (p1, p2) =>
    Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2)).toFixed(
      2
    )
  const p1 = getCoord(obj1)
  const p2 = getCoord(obj2)
  if (p1 && p2) {
    const dist = getDistance(p1, p2)
    // Erzeuge Hilfslinie:
    let lineName = `Lineal_${obj1}_${obj2}`
    objects[lineName] = {
      type: 'line',
      data: [p1, p2],
      style: { lineColor: '#000', lineWidth: 1, lineType: 'dashed' },
    }
    // Erzeuge Text (als separaten Scatterpunkt):
    let textName = `Abstand_${obj1}_${obj2}`
    let midPoint = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2]
    objects[textName] = {
      type: 'text',
      coord: midPoint,
      text: dist,
      style: { fontSize: 14, color: '#000' },
    }
    return dist
  }
  // Falls hier Geraden u.ä. übergeben wurden, kann die Berechnung analog erfolgen.
  console.error('Abstand: Ungültige Eingabe.')
  return null
}

// ------------------------------------------------------------
// Funktion: Vektor
// Zeichnet einen Vektor zwischen zwei Punkten.
// ------------------------------------------------------------
function Vektor(arg1, arg2, name = null) {
  let start, end

  // Variante 1: Nur ein Argument → Ortsvektor vom Ursprung [0,0] zum Punkt
  if (arguments.length === 1) {
    start = [0, 0]
    end = getCoord(arg1)
    if (!end) {
      console.error('Vektor: Ungültiger Punkt für den Ortsvektor.')
      return null
    }
    if (!name) {
      let index = 1
      while (objects['Vektor' + index]) index++
      name = 'Vektor' + index
    }
  }
  // Variante 2: Zwei Argumente
  else if (arguments.length === 2) {
    // Prüfe, ob der zweite Parameter als Punkt vorhanden ist:
    if (typeof arg2 === 'string' && !objects.hasOwnProperty(arg2)) {
      // Falls "arg2" (z. B. "V1") noch nicht existiert, wird es als Name interpretiert.
      start = [0, 0]
      end = getCoord(arg1)
      if (!end) {
        console.error('Vektor: Ungültiger Punkt für den Ortsvektor.')
        return null
      }
      name = arg2
    } else {
      // Sonst: Beide Parameter sind Punkte (bekannter Punkt oder Koordinate)
      start = getCoord(arg1)
      end = getCoord(arg2)
      if (!start || !end) {
        console.error('Vektor: Ungültige Punkte für Anfangs- oder Endpunkt.')
        return null
      }
      if (!name) {
        let index = 1
        while (objects['Vektor' + index]) index++
        name = 'Vektor' + index
      }
    }
  }
  // Variante 3: Drei Argumente (explizit Anfangs- und Endpunkt plus Name)
  else if (arguments.length === 3) {
    start = getCoord(arg1)
    end = getCoord(arg2)
    if (!start || !end) {
      console.error('Vektor: Ungültige Punkte für Anfangs- oder Endpunkt.')
      return null
    }
    // Der dritte Parameter wird als Name verwendet.
  }

  const dx = end[0] - start[0],
    dy = end[1] - start[1],
    length = Math.sqrt(dx * dx + dy * dy)

  objects[name] = {
    type: 'line',
    data: [start, end],
    style: { lineColor: '#FF4500', lineWidth: 2, lineType: 'solid' },
    tooltip: `<strong>${name}</strong><br>Start: (${start[0]}, ${
      start[1]
    })<br>Ende: (${end[0]}, ${end[1]})<br>Länge: ${length.toFixed(
      2
    )}<br>Richtung: (${dx.toFixed(2)}, ${dy.toFixed(2)})`,
  }

  return name
}

// ------------------------------------------------------------
// Funktion: Winkel
// Berechnet einen Winkel und zeichnet einen Bogen sowie ein Textlabel.
// Hier werden zwei Objekte angelegt (für Bogen und Label).
// ------------------------------------------------------------
function Winkel(A, B, C, name = null) {
  const a = getCoord(A),
    b = getCoord(B),
    c = getCoord(C)
  if (!a || !b || !c) {
    console.error('Winkel: Mindestens einer der Punkte ist ungültig.')
    return null
  }
  const AB = [a[0] - b[0], a[1] - b[1]]
  const BC = [c[0] - b[0], c[1] - b[1]]
  const dotProduct = AB[0] * BC[0] + AB[1] * BC[1]
  const normAB = Math.sqrt(Math.pow(AB[0], 2) + Math.pow(AB[1], 2))
  const normBC = Math.sqrt(Math.pow(BC[0], 2) + Math.pow(BC[1], 2))
  if (normAB === 0 || normBC === 0) {
    console.error('Winkel: Nullvektor erkannt.')
    return null
  }
  let angleRad = Math.acos(dotProduct / (normAB * normBC))
  let angleDeg = (angleRad * 180) / Math.PI
  let index = 1
  if (!name) {
    while (objects['Winkel' + index]) index++
    name = 'Winkel' + index
  }
  // Bestimme Drehrichtung:
  const crossProduct = AB[0] * BC[1] - AB[1] * BC[0]
  const rotationDirection = crossProduct > 0 ? 1 : -1
  const angleRadius = 1
  const startAngle = Math.atan2(AB[1], AB[0])
  const endAngle = Math.atan2(BC[1], BC[0])
  const numSegments = 20
  let arcPoints = []
  const sweepAngle =
    rotationDirection > 0
      ? (endAngle - startAngle + 2 * Math.PI) % (2 * Math.PI)
      : (startAngle - endAngle + 2 * Math.PI) % (2 * Math.PI)
  const smallerAngle = Math.min(sweepAngle, 2 * Math.PI - sweepAngle)
  angleDeg = (smallerAngle * 180) / Math.PI
  for (let i = 0; i <= numSegments; i++) {
    let t = i / numSegments
    let angle = startAngle + t * sweepAngle * rotationDirection
    let x = b[0] + angleRadius * Math.cos(angle)
    let y = b[1] + angleRadius * Math.sin(angle)
    arcPoints.push([x, y])
  }
  // Bogen als eigenes Objekt:
  objects[name + '_arc'] = {
    type: 'line',
    data: arcPoints,
    style: { lineColor: '#FFA500', lineWidth: 2, lineType: 'solid' },
  }
  // Textlabel:
  const labelX =
    b[0] +
    1.5 *
      angleRadius *
      Math.cos(startAngle + (sweepAngle / 2) * rotationDirection)
  const labelY =
    b[1] +
    1.5 *
      angleRadius *
      Math.sin(startAngle + (sweepAngle / 2) * rotationDirection)
  objects[name + '_label'] = {
    type: 'text',
    coord: [labelX, labelY],
    text: angleDeg.toFixed(2) + '°',
    style: { fontSize: 14, color: '#000' },
  }
  return angleDeg.toFixed(2)
}

// ------------------------------------------------------------
// Funktion: Lot
// Zeichnet das Lot von einem Punkt auf eine Gerade.
// ------------------------------------------------------------
function Lot(punkt, gerade, name = null) {
  const p = getCoord(punkt)
  const g = objects[gerade]
  if (!p || !g || !g.data) {
    console.error('Lot: Punkt oder Gerade nicht gefunden.')
    return null
  }
  const [[x1, y1], [x2, y2]] = g.data
  const m = (y2 - y1) / (x2 - x1)
  const lotSteigung = -1 / m
  const lotX = (lotSteigung * p[0] - m * x1 + y1 - p[1]) / (lotSteigung - m)
  const lotY = m * (lotX - x1) + y1
  let index = 1
  if (!name) {
    while (objects['Lot' + index]) index++
    name = 'Lot' + index
  } else if (objects[name]) {
    console.error(`Lot: Element "${name}" existiert bereits.`)
    return name
  }
  objects[name] = {
    type: 'line',
    data: [p, [lotX, lotY]],
    style: { lineColor: '#A0A', lineWidth: 2, lineType: 'dashed' },
  }
  return name
}

// ------------------------------------------------------------
// Funktion: Text
// Fügt einen Text an einer bestimmten Position ein.
// ------------------------------------------------------------
function Text(position, textContent, name = null) {
  const coord = getCoord(position)
  if (!coord) {
    console.error(`Text: Ungültige Position "${position}".`)
    return null
  }
  let index = 1
  if (!name) {
    while (objects['Text' + index]) index++
    name = 'Text' + index
  } else if (objects[name]) {
    console.error(`Text: Element "${name}" existiert bereits.`)
    return name
  }
  objects[name] = {
    type: 'text',
    coord: coord,
    text: textContent,
    style: {
      fontSize: 14,
      color: '#000',
      backgroundColor: 'rgba(255,255,255,0.8)',
    },
  }
  return name
}

// ------------------------------------------------------------
// Funktion: Parallele
// Zeichnet eine Gerade parallel zu einer bestehenden durch einen Punkt.
// ------------------------------------------------------------
function Parallele(punkt, gerade, name = null) {
  const p = getCoord(punkt)
  const g = objects[gerade]
  if (!p || !g || !g.data) {
    console.error('Parallele: Punkt oder Gerade nicht gefunden.')
    return null
  }
  const [[x1, y1], [x2, y2]] = g.data
  let index = 1
  if (!name) {
    while (objects['Parallel' + index]) index++
    name = 'Parallel' + index
  } else if (objects[name]) {
    console.error(`Parallele: Element "${name}" existiert bereits.`)
    return name
  }
  objects[name] = {
    type: 'line',
    data: [p, [p[0] + (x2 - x1), p[1] + (y2 - y1)]],
    style: { lineColor: '#0AA', lineWidth: 2, lineType: 'dashed' },
  }
  return name
}

/* ============================================================
   Funktionen zur Modifikation bestehender Objekte
   ============================================================ */

// ------------------------------------------------------------
// Funktion: Farbe
// Ändert die Farbe eines existierenden Objekts.
// ------------------------------------------------------------
function Farbe(element, newColor) {
  let obj = objects[element]
  if (obj) {
    if (obj.type === 'point') {
      obj.style.color = newColor
    } else if (obj.style) {
      if (obj.style.lineColor) obj.style.lineColor = newColor
      if (obj.style.fillColor) obj.style.fillColor = newColor
    }
  } else {
    console.error("Farbe: Element '" + element + "' nicht gefunden.")
  }
}

// ------------------------------------------------------------
// Funktion: Name
// Ändert den Namen (Schlüssel) eines bestehenden Objekts.
// ------------------------------------------------------------
function Name(oldName, newName) {
  if (objects[newName]) {
    console.error("Name: Neuer Name '" + newName + "' ist bereits vergeben.")
    return
  }
  if (objects[oldName]) {
    objects[newName] = objects[oldName]
    delete objects[oldName]
  } else {
    console.error("Name: Element '" + oldName + "' nicht gefunden.")
  }
}

// ------------------------------------------------------------
// Funktion: Titel
// Setzt den Diagrammtitel.
// ------------------------------------------------------------
function Titel(title) {
  TITLE = title
}

/* ============================================================
   Render-Funktion
   ============================================================
   GBScript_render baut nun aus dem zentralen Dictionary (objects)
   die finale ECharts-Konfiguration (JSON) zusammen. Dabei werden
   alle im Dictionary enthaltenen Objekte (Punkte, Linien, etc.)
   anhand ihres Typs in entsprechende Series-Einträge überführt.
   Außerdem werden aus allen Koordinaten die Achsenlimits ermittelt.
   ============================================================ */
function GBScript_render(userAxisLimits = {}) {
  let series = []
  let allCoords = []
  for (let key in objects) {
    let obj = objects[key]
    if (obj.type === 'point') {
      series.push({
        name: key,
        type: 'scatter',
        coordinateSystem: 'cartesian2d',
        data: [
          {
            name: key,
            value: obj.coord,
            itemStyle: {
              color: obj.style && obj.style.color ? obj.style.color : 'red',
            },
          },
        ],
        symbolSize: 7,
        label: {
          show: true,
          position: 'right',
          formatter: function (params) {
            return params.data.name
          },
        },
        tooltip: {
          formatter: `<strong>${key}</strong><br>(${obj.coord[0]}, ${obj.coord[1]})`,
        },
        z: 10,
      })
      allCoords.push(obj.coord)
    } else if (obj.type === 'line') {
      series.push({
        name: key,
        type: 'line',
        coordinateSystem: 'cartesian2d',
        data: obj.data,
        symbol: 'none',
        lineStyle: {
          color:
            obj.style && obj.style.lineColor ? obj.style.lineColor : '#000',
          width: obj.style && obj.style.lineWidth ? obj.style.lineWidth : 2,
          type: obj.style && obj.style.lineType ? obj.style.lineType : 'solid',
        },
        tooltip: { formatter: obj.tooltip || key },
      })
      if (obj.data && Array.isArray(obj.data)) {
        obj.data.forEach((coord) => {
          allCoords.push(coord)
        })
      }
    } else if (obj.type === 'polygon') {
      series.push({
        name: key,
        type: 'line',
        coordinateSystem: 'cartesian2d',
        data: obj.data,
        symbol: 'none',
        lineStyle: {
          color:
            obj.style && obj.style.lineColor ? obj.style.lineColor : '#0A0',
          width: obj.style && obj.style.lineWidth ? obj.style.lineWidth : 2,
          type: obj.style && obj.style.lineType ? obj.style.lineType : 'solid',
        },
        areaStyle: {
          color:
            obj.style && obj.style.fillColor
              ? obj.style.fillColor
              : 'rgba(0,170,0,0.3)',
        },
        tooltip: { formatter: obj.tooltip || key },
      })
      if (obj.data && Array.isArray(obj.data)) {
        obj.data.forEach((coord) => {
          allCoords.push(coord)
        })
      }
    } else if (obj.type === 'text') {
      series.push({
        name: key,
        type: 'scatter',
        coordinateSystem: 'cartesian2d',
        data: [obj.coord],
        symbolSize: 0,
        label: {
          show: true,
          formatter: obj.text,
          position: 'top',
          fontSize: obj.style && obj.style.fontSize ? obj.style.fontSize : 14,
          color: obj.style && obj.style.color ? obj.style.color : '#000',
        },
        tooltip: { show: false },
      })
      allCoords.push(obj.coord)
    }
  }
  // Bestimme Achsenlimits anhand aller Koordinaten
  let minX = -10,
    maxX = 10,
    minY = -10,
    maxY = 10
  if (allCoords.length > 0) {
    let xs = allCoords.map((c) => c[0])
    let ys = allCoords.map((c) => c[1])
    minX = Math.min(...xs) - 1
    maxX = Math.max(...xs) + 1
    minY = Math.min(...ys) - 1
    maxY = Math.max(...ys) + 1
  }
  let xRange = maxX - minX,
    yRange = maxY - minY
  if (xRange > yRange) {
    let centerY = (minY + maxY) / 2
    let halfHeight = xRange / 2
    minY = centerY - halfHeight
    maxY = centerY + halfHeight
  } else {
    let centerX = (minX + maxX) / 2
    let halfWidth = yRange / 2
    minX = centerX - halfWidth
    maxX = centerX + halfWidth
  }
  if (typeof userAxisLimits.minX === 'number') minX = userAxisLimits.minX
  if (typeof userAxisLimits.maxX === 'number') maxX = userAxisLimits.maxX
  if (typeof userAxisLimits.minY === 'number') minY = userAxisLimits.minY
  if (typeof userAxisLimits.maxY === 'number') maxY = userAxisLimits.maxY
  if (typeof globalAxisLimits.minX === 'number') minX = globalAxisLimits.minX
  if (typeof globalAxisLimits.maxX === 'number') maxX = globalAxisLimits.maxX
  if (typeof globalAxisLimits.minY === 'number') minY = globalAxisLimits.minY
  if (typeof globalAxisLimits.maxY === 'number') maxY = globalAxisLimits.maxY
  let titleObj = TITLE ? { text: TITLE, left: 'center' } : undefined
  const option = {
    title: titleObj,
    tooltip: { trigger: 'item' },
    xAxis: {
      type: 'value',
      min: minX,
      max: maxX,
      splitLine: { show: false },
      show: diagrammAktiv,
    },
    yAxis: {
      type: 'value',
      min: minY,
      max: maxY,
      splitLine: { show: false },
      show: diagrammAktiv,
    },
    series: series,
  }
  return toSource(option)
}

/* ============================================================
   Ausführungsfunktion
   ============================================================
   GBScriptEval initialisiert zuerst die globalen Variablen,
   führt dann den übergebenen Code (z. B. Konstruktionsbefehle)
   aus und gibt schließlich die anhand des Dictionaries erzeugte
   ECharts-Konfiguration zurück.
   ============================================================ */
function GBScriptEval(code) {
  GBScript_init()
  try {
    eval(code)
    return GBScript_render()
  } catch (error) {
    console.error(error)
    return null
  }
}

// Exponiere die Funktionen als Teil des globalen Objekts
window.GGBScript = GBScriptEval

/* 
Beispielhafte Nutzung:

// Beispielskript: Zwei Punkte, eine Linie und anschließende Rotation
Punkt(1, 2, "A")
Punkt(4, 5, "B")
Linie("A", "B", "L1")
Rotation("L1", "A", 45)  // Rotiert die Linie um Punkt A (in-place, da kein neuer Name)
Titel("Beispiel-Diagramm")
const optionString = GGBScript(`
// Hier können weitere Befehle stehen
`)
console.log(optionString)
*/
