'use strict'

// ------------------------------------------------------------
// Globale Variablen
// ------------------------------------------------------------
let points = {} // Alle mittels Punkt() definierten Punkte: { name: [x,y], ... }
let pointStyles = {} // Zusätzliche Eigenschaften für Punkte, z.B. Farbe
let series = [] // Linienserien, die (auch) Platzhalterkoordinaten enthalten können
let TITLE = '' // Diagrammtitel (optional)
let globalAxisLimits = {} // Globale Achsenlimits, die per UserAxisLimits() gesetzt werden

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
// Initialisiert die globalen Variablen
// ------------------------------------------------------------
function GBScript_init() {
  points = {}
  pointStyles = {}
  series = []
  TITLE = ''
  globalAxisLimits = {}
}

// ------------------------------------------------------------
// Globale Funktion: UserAxisLimits
// Mit dieser Funktion können die Achsenlimits global gesetzt werden,
// ähnlich wie in GeoGebraScript. Die übergebenen Werte überschreiben
// die automatisch berechneten Achsenlimits.
// ------------------------------------------------------------
function UserAxisLimits(minX, maxX, minY, maxY) {
  globalAxisLimits = { minX, maxX, minY, maxY }
}

// ------------------------------------------------------------
// Funktion: Punkt
// Erstellt einen Punkt.
// Akzeptiert:
//    Punkt(x, y, name?) oder Punkt([x, y], name?)
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
  if (name) {
    if (points[name]) {
      console.error(`Punkt "${name}" existiert bereits.`)
      return name
    }
    pointName = name
  } else {
    let index = 1
    while (points['P' + index]) {
      index++
    }
    pointName = 'P' + index
  }
  points[pointName] = coords
  // Standardfarbe für Punkte (wird im Render dann einzeln berücksichtigt)
  pointStyles[pointName] = { color: 'red' }
  return pointName
}

// ------------------------------------------------------------
// Hilfsfunktion: getCoord
// Gibt zu einem Argument (String oder [x,y]) die Koordinaten zurück.
// Wird in den Funktionen Linie, Strecke, Gerade, Polygon und Mittelpunkt verwendet.
// Falls ein String übergeben wird, wird in der globalen Punkte-Sammlung
// nach einem entsprechenden Punkt gesucht.
// ------------------------------------------------------------
function getCoord(arg) {
  if (typeof arg === 'string') {
    if (points[arg]) return points[arg]
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
  let lineName = name || 'Linie' + (series.length + 1)
  series.push({
    name: lineName,
    type: 'line',
    coordinateSystem: 'cartesian2d',
    data: [coord1, coord2],
    triggerLineEvent: true,
    symbol: 'none',
    lineStyle: { color: '#000', width: 2, type: 'solid' },
    tooltip: {
      trigger: 'axis',
      formatter: `<strong>${lineName}</strong><br>Start: (${coord1[0]}, ${coord1[1]})<br>Ende: (${coord2[0]}, ${coord2[1]})`,
    },
  })
  return lineName
}
function Line(arg1, arg2, name = null) {
  return Linie(arg1, arg2, name)
}

// ------------------------------------------------------------
// Globale Funktion: Strecke
// Zeichnet einen Streckenabschnitt zwischen zwei Punkten.
// ------------------------------------------------------------
function Strecke(arg1, arg2, name = null) {
  const coord1 = getCoord(arg1),
    coord2 = getCoord(arg2)
  if (!coord1 || !coord2) {
    console.error('Strecke: Mindestens einer der beiden Punkte ist ungültig.')
    return null
  }
  let segName = name || 'Strecke' + (series.length + 1)
  series.push({
    name: segName,
    type: 'line',
    coordinateSystem: 'cartesian2d',
    data: [coord1, coord2],
    triggerLineEvent: true,
    symbol: 'none',
    lineStyle: { color: '#F00', width: 2, type: 'solid' },
    tooltip: {
      trigger: 'axis',
      formatter: `<strong>${segName}</strong><br>Start: (${coord1[0]}, ${coord1[1]})<br>Ende: (${coord2[0]}, ${coord2[1]})`,
    },
  })
  return segName
}

// ------------------------------------------------------------
// Globale Funktion: Gerade
// Zeichnet eine unendliche Gerade, die durch zwei Punkte definiert ist.
// ------------------------------------------------------------
function Gerade(arg1, arg2, name = null) {
  const pt1 = getCoord(arg1),
    pt2 = getCoord(arg2)
  if (!pt1 || !pt2) {
    console.error('Gerade: Mindestens einer der beiden Punkte ist ungültig.')
    return null
  }
  let axMinX =
    typeof globalAxisLimits.minX === 'number' ? globalAxisLimits.minX : -10
  let axMaxX =
    typeof globalAxisLimits.maxX === 'number' ? globalAxisLimits.maxX : 10
  let axMinY =
    typeof globalAxisLimits.minY === 'number' ? globalAxisLimits.minY : -10
  let axMaxY =
    typeof globalAxisLimits.maxY === 'number' ? globalAxisLimits.maxY : 10
  let endP1, endP2
  if (pt1[0] === pt2[0]) {
    endP1 = [pt1[0], axMinY]
    endP2 = [pt1[0], axMaxY]
  } else {
    let m = (pt2[1] - pt1[1]) / (pt2[0] - pt1[0])
    let b = pt1[1] - m * pt1[0]
    let candidates = []
    let yLeft = m * axMinX + b
    if (yLeft >= axMinY && yLeft <= axMaxY) candidates.push([axMinX, yLeft])
    let yRight = m * axMaxX + b
    if (yRight >= axMinY && yRight <= axMaxY) candidates.push([axMaxX, yRight])
    if (m !== 0) {
      let xBottom = (axMinY - b) / m
      if (xBottom >= axMinX && xBottom <= axMaxX)
        candidates.push([xBottom, axMinY])
      let xTop = (axMaxY - b) / m
      if (xTop >= axMinX && xTop <= axMaxX) candidates.push([xTop, axMaxY])
    }
    let uniqueCandidates = []
    candidates.forEach((pt) => {
      if (
        !uniqueCandidates.some(
          (u) => Math.abs(u[0] - pt[0]) < 1e-9 && Math.abs(u[1] - pt[1]) < 1e-9
        )
      )
        uniqueCandidates.push(pt)
    })
    if (uniqueCandidates.length < 2) {
      console.error(
        'Gerade: Es konnten nicht genügend Schnittpunkte mit den Achsen ermittelt werden.'
      )
      return null
    }
    uniqueCandidates.sort((a, b) => a[0] - b[0])
    endP1 = uniqueCandidates[0]
    endP2 = uniqueCandidates[uniqueCandidates.length - 1]
  }
  let lineName = name || 'Gerade' + (series.length + 1)
  series.push({
    name: lineName,
    type: 'line',
    coordinateSystem: 'cartesian2d',
    data: [endP1, endP2],
    triggerLineEvent: true,
    symbol: 'none',
    lineStyle: { color: '#00F', width: 2, type: 'dashed' },
    tooltip: {
      trigger: 'axis',
      formatter: `<strong>${lineName}</strong><br>Schnittpunkt 1: (${endP1[0]}, ${endP1[1]})<br>Schnittpunkt 2: (${endP2[0]}, ${endP2[1]})`,
    },
  })
  return lineName
}

// ------------------------------------------------------------
// Globale Funktion: Polygon
// Zeichnet ein Polygon, das durch eine beliebige Anzahl von Punkten definiert wird.
// Die Parameter können als Punktnamen (Strings) oder als [x, y]-Arrays übergeben werden.
// Das Polygon wird geschlossen (erster Punkt wird am Ende erneut angehängt) und mit einer Fläche gefüllt.
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
  let polyName = 'Polygon' + (series.length + 1)
  series.push({
    name: polyName,
    type: 'line',
    coordinateSystem: 'cartesian2d',
    data: polygonCoords,
    triggerLineEvent: true,
    symbol: 'none',
    lineStyle: { color: '#0A0', width: 2, type: 'solid' },
    areaStyle: { color: 'rgba(0, 170, 0, 0.3)' },
    tooltip: { trigger: 'item', formatter: `<strong>${polyName}</strong>` },
  })
  return polyName
}

// ------------------------------------------------------------
// Globale Funktion: Mittelpunkt
// Berechnet den Mittelpunkt. Je nach übergebener Parameterzahl gibt es zwei Fälle:
// 1. Wenn nur ein einzelnes Argument übergeben wird, so wird angenommen, dass
//    dieses der Name eines zuvor erzeugten Polygons ist. Der Schwerpunkt (Centroid)
//    dieses Polygons wird berechnet.
// 2. Bei zwei oder mehr Argumenten wird entweder der arithmetische Mittelwert zweier Punkte
//    (bei genau 2 Argumenten) oder der Schwerpunkt (Centroid) eines Polygons (bei ≥ 3 Argumenten)
//    anhand der übergebenen Punkte berechnet.
// Das Ergebnis wird als neuer Punkt in der globalen Punkte-Sammlung gespeichert.
// ------------------------------------------------------------
function Mittelpunkt(...args) {
  // Fall 1: Einzelnes Argument – es wird ein Polygon-Name erwartet.
  if (args.length === 1) {
    let polyName = args[0]
    // Suche in der Serie nach einem Objekt mit diesem Namen
    let polyObj = series.find((item) => item.name === polyName)
    if (!polyObj) {
      console.error(
        `Mittelpunkt: Kein Polygon mit dem Namen "${polyName}" gefunden.`
      )
      return null
    }
    // Nutze die in der Polygonserie gespeicherten Koordinaten
    let vertices = polyObj.data.slice()
    // Entferne das letzte Element, wenn es das gleiche wie das erste ist (doppelt)
    if (
      vertices.length > 1 &&
      vertices[0][0] === vertices[vertices.length - 1][0] &&
      vertices[0][1] === vertices[vertices.length - 1][1]
    ) {
      vertices.pop()
    }
    // Berechne den Schwerpunkt
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
    area = area / 2
    let centroid
    if (Math.abs(area) < 1e-9) {
      // Degenerierter Fall: Fallback auf arithmetisches Mittel
      let sumX = 0,
        sumY = 0
      for (let i = 0; i < vertices.length; i++) {
        sumX += vertices[i][0]
        sumY += vertices[i][1]
      }
      centroid = [sumX / vertices.length, sumY / vertices.length]
    } else {
      Cx = Cx / (6 * area)
      Cy = Cy / (6 * area)
      centroid = [Cx, Cy]
    }
    // Erzeuge einen Namen für den neuen Punkt
    let index = 1
    while (points['M' + index]) {
      index++
    }
    let midName = 'M' + index
    points[midName] = centroid
    pointStyles[midName] = { color: 'red' }
    return midName
  }
  // Fall 2: Zwei oder mehr Argumente – direkt anhand der übergebenen Punkte berechnen
  if (args.length === 2) {
    const p1 = getCoord(args[0]),
      p2 = getCoord(args[1])
    if (!p1 || !p2) {
      console.error(
        'Mittelpunkt: Mindestens einer der beiden Punkte ist ungültig.'
      )
      return null
    }
    let mx = (p1[0] + p2[0]) / 2,
      my = (p1[1] + p2[1]) / 2
    let index = 1
    while (points['M' + index]) {
      index++
    }
    let midName = 'M' + index
    points[midName] = [mx, my]
    pointStyles[midName] = { color: 'red' }
    return midName
  }
  // Bei drei oder mehr Argumenten: Berechne den Schwerpunkt (Centroid) eines Polygons.
  let vertices = []
  for (let i = 0; i < args.length; i++) {
    let coord = getCoord(args[i])
    if (!coord) {
      console.error(`Mittelpunkt: Ungültiger Parameter an Position ${i + 1}.`)
      return null
    }
    vertices.push(coord)
  }
  // Schließe das Polygon falls nötig
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
  area = area / 2
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
    Cx = Cx / (6 * area)
    Cy = Cy / (6 * area)
    centroid = [Cx, Cy]
  }
  let index = 1
  while (points['M' + index]) {
    index++
  }
  let midName = 'M' + index
  points[midName] = centroid
  pointStyles[midName] = { color: 'red' }
  return midName
}

function Kreis(mittelpunkt, radius, name = null) {
  const center = getCoord(mittelpunkt)
  if (!center || typeof radius !== 'number' || radius <= 0) {
    console.error('Kreis: Ungültige Parameter.')
    return null
  }
  let circleName = name || 'Kreis' + (series.length + 1)

  // Berechnung der Kreiskoordinaten direkt als zusammenhängende Polygon-Koordinaten
  const numPoints = 100
  const circleCoords = []
  for (let i = 0; i < numPoints + 1; i++) {
    let angle = (i / numPoints) * 2 * Math.PI
    let x = center[0] + radius * Math.cos(angle)
    let y = center[1] + radius * Math.sin(angle)
    circleCoords.push([x, y])
  }

  // Hinzufügen zur series als Polygon (nicht als Scatter-Punkte)
  series.push({
    name: circleName,
    type: 'line',
    coordinateSystem: 'cartesian2d',
    data: circleCoords,
    triggerLineEvent: true,
    symbol: 'none',
    lineStyle: { color: '#00F', width: 2, type: 'solid' },
    areaStyle: { color: 'rgba(0, 0, 255, 0.1)' }, // Transparente Füllung
    tooltip: {
      trigger: 'item',
      formatter: `<strong>${circleName}</strong><br>Mittelpunkt: (${center[0]}, ${center[1]})<br>Radius: ${radius}`,
    },
  })

  return circleName
}

// Modifizierte Transformationsfunktionen für mehrere Objekttypen
function Verschiebung(element, verschiebungX, verschiebungY, name = null) {
  // Suche in series nach dem Element
  const seriesElement = series.find((s) => s.name === element)

  if (points[element]) {
    // Punktverschiebung
    const p = points[element]
    const verschobenX = p[0] + verschiebungX
    const verschobenY = p[1] + verschiebungY

    let index = 1
    while (points['V' + index]) index++
    const verschobenName = name || 'V' + index
    points[verschobenName] = [verschobenX, verschobenY]
    pointStyles[verschobenName] = { color: 'blue' }
    return verschobenName
  } else if (seriesElement) {
    // Verschiebung von Linien, Polygonen, Kreisen
    const transformedData = seriesElement.data.map((coord) => {
      return [coord[0] + verschiebungX, coord[1] + verschiebungY]
    })

    let index = 1
    while (series.some((s) => s.name === `Verschoben${index}`)) index++
    const newName = name || `Verschoben${index}`

    const newSerie = {
      ...seriesElement,
      name: newName,
      data: transformedData,
      // Reset color to allow independent styling
      lineStyle: {
        ...seriesElement.lineStyle,
        color: seriesElement.lineStyle?.color || '#000',
      },
      areaStyle: seriesElement.areaStyle
        ? { ...seriesElement.areaStyle }
        : undefined,
    }
    series.push(newSerie)
    return newName
  }

  console.error('Verschiebung: Element nicht gefunden.')
  return null
}

function Rotation(element, drehpunkt, winkelGrad, name = null) {
  const zentrum = getCoord(drehpunkt)
  const winkelRadiant = (winkelGrad * Math.PI) / 180

  if (!zentrum) {
    console.error('Rotation: Ungültiger Drehpunkt.')
    return null
  }

  const rotateCoord = (coord) => {
    const relX = coord[0] - zentrum[0]
    const relY = coord[1] - zentrum[1]
    const rotX = relX * Math.cos(winkelRadiant) - relY * Math.sin(winkelRadiant)
    const rotY = relX * Math.sin(winkelRadiant) + relY * Math.cos(winkelRadiant)
    return [rotX + zentrum[0], rotY + zentrum[1]]
  }

  // Suche in series nach dem Element
  const seriesElement = series.find((s) => s.name === element)

  if (points[element]) {
    // Punktrotation
    const p = points[element]
    const gedrehtCoord = rotateCoord(p)

    let index = 1
    while (points['R' + index]) index++
    const gedrehtName = name || 'R' + index
    points[gedrehtName] = gedrehtCoord
    pointStyles[gedrehtName] = { color: 'purple' }
    return gedrehtName
  } else if (seriesElement) {
    // Rotation von Linien, Polygonen, Kreisen
    const transformedData = seriesElement.data.map(rotateCoord)

    let index = 1
    while (series.some((s) => s.name === `Gedreht${index}`)) index++
    const newName = name || `Gedreht${index}`

    const newSerie = {
      ...seriesElement,
      name: newName,
      data: transformedData,
      // Reset color to allow independent styling
      lineStyle: {
        ...seriesElement.lineStyle,
        color: seriesElement.lineStyle?.color || '#000',
      },
      areaStyle: seriesElement.areaStyle
        ? { ...seriesElement.areaStyle }
        : undefined,
    }
    series.push(newSerie)
    return newName
  }

  console.error('Rotation: Element nicht gefunden.')
  return null
}

function Spiegelung(element, spiegelungsPunkt, name = null) {
  const spiegel = getCoord(spiegelungsPunkt)

  if (!spiegel) {
    console.error('Spiegelung: Ungültiger Spiegelpunkt.')
    return null
  }

  // Suche in series nach dem Element
  const seriesElement = series.find((s) => s.name === element)

  if (points[element]) {
    // Punktspiegelung
    const p = points[element]
    const gespiegeltX = 2 * spiegel[0] - p[0]
    const gespiegeltY = 2 * spiegel[1] - p[1]

    let index = 1
    while (points['S' + index]) index++
    const spiegelName = name || 'S' + index
    points[spiegelName] = [gespiegeltX, gespiegeltY]
    pointStyles[spiegelName] = { color: 'green' }
    return spiegelName
  } else if (seriesElement) {
    // Spiegelung von Linien, Polygonen, Kreisen
    const transformedData = seriesElement.data.map((coord) => {
      return [2 * spiegel[0] - coord[0], 2 * spiegel[1] - coord[1]]
    })

    let index = 1
    while (series.some((s) => s.name === `Gespiegelt${index}`)) index++
    const newName = name || `Gespiegelt${index}`

    const newSerie = {
      ...seriesElement,
      name: newName,
      data: transformedData,
      // Reset color to allow independent styling
      lineStyle: {
        ...seriesElement.lineStyle,
        color: seriesElement.lineStyle?.color || '#000',
      },
      areaStyle: seriesElement.areaStyle
        ? { ...seriesElement.areaStyle }
        : undefined,
    }
    series.push(newSerie)
    return newName
  }

  console.error('Spiegelung: Element nicht gefunden.')
  return null
}
// Schnittpunkt von zwei Geraden
function Schnittpunkt(gerade1, gerade2, name = null) {
  const g1 = series.find((s) => s.name === gerade1)
  const g2 = series.find((s) => s.name === gerade2)

  if (!g1 || !g2) {
    console.error('Schnittpunkt: Mindestens eine Gerade nicht gefunden.')
    return null
  }

  const [[x1, y1], [x2, y2]] = g1.data
  const [[x3, y3], [x4, y4]] = g2.data

  // Berechnungen für Steigung und Achsenabschnitt
  const m1 = (y2 - y1) / (x2 - x1)
  const m2 = (y4 - y3) / (x4 - x3)
  const b1 = y1 - m1 * x1
  const b2 = y3 - m2 * x3

  // Prüfe Parallelität
  if (Math.abs(m1 - m2) < 1e-9) {
    console.error('Schnittpunkt: Geraden sind parallel.')
    return null
  }

  // Berechne Schnittpunkt
  const x = (b2 - b1) / (m1 - m2)
  const y = m1 * x + b1

  // Erzeuge Punkt
  let index = 1
  while (points['SP' + index]) index++
  const schnittpunktName = name || 'SP' + index
  points[schnittpunktName] = [x, y]
  pointStyles[schnittpunktName] = { color: 'green' }

  return schnittpunktName
}

// Abstand zwischen zwei Punkten
function Abstand(punkt1, punkt2) {
  const p1 = getCoord(punkt1)
  const p2 = getCoord(punkt2)

  if (!p1 || !p2) {
    console.error('Abstand: Ungültige Punkte.')
    return null
  }

  return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2))
}

function Winkel(A, B, C, name = null) {
  const a = getCoord(A)
  const b = getCoord(B)
  const c = getCoord(C)

  if (!a || !b || !c) {
    console.error('Winkel: Mindestens einer der Punkte ist ungültig.')
    return null
  }

  // Vektoren AB und BC
  const AB = [a[0] - b[0], a[1] - b[1]]
  const BC = [c[0] - b[0], c[1] - b[1]]

  // Skalarprodukt
  const dotProduct = AB[0] * BC[0] + AB[1] * BC[1]
  const normAB = Math.sqrt(AB[0] ** 2 + AB[1] ** 2)
  const normBC = Math.sqrt(BC[0] ** 2 + BC[1] ** 2)

  if (normAB === 0 || normBC === 0) {
    console.error('Winkel: Nullvektor erkannt.')
    return null
  }

  // Winkel in Grad berechnen
  let angleRad = Math.acos(dotProduct / (normAB * normBC))
  let angleDeg = (angleRad * 180) / Math.PI

  // Erzeuge Namen für den Winkel
  let index = 1
  while (series.some((s) => s.name === `Winkel${index}`)) index++
  const angleName = name || `Winkel${index}`

  // Bestimme die Drehrichtung
  const crossProduct = AB[0] * BC[1] - AB[1] * BC[0]
  const rotationDirection = crossProduct > 0 ? 1 : -1

  // Zeichne den Winkelbogen
  const angleRadius = 1
  const startAngle = Math.atan2(AB[1], AB[0])
  const endAngle = Math.atan2(BC[1], BC[0])

  const numSegments = 20
  const arcPoints = [[b[0], b[1]]]

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
  arcPoints.push([b[0], b[1]]) // Schließt das Segment

  series.push({
    name: angleName,
    type: 'line',
    coordinateSystem: 'cartesian2d',
    data: arcPoints,
    symbol: 'none',
    lineStyle: { color: '#FFA500', width: 2, type: 'solid' },
    areaStyle: { color: 'rgba(255, 165, 0, 0.3)' },
  })

  // Textlabel für den Winkel
  series.push({
    name: angleName,
    type: 'scatter',
    coordinateSystem: 'cartesian2d',
    data: [
      [
        b[0] +
          1.5 *
            angleRadius *
            Math.cos(startAngle + (sweepAngle / 2) * rotationDirection),
        b[1] +
          1.5 *
            angleRadius *
            Math.sin(startAngle + (sweepAngle / 2) * rotationDirection),
      ],
    ],
    symbolSize: 0,
    label: {
      show: true,
      formatter: `${angleDeg.toFixed(2)}°`,
      position: 'top',
      fontSize: 14,
    },
    tooltip: {
      trigger: 'item',
      formatter: `<strong>${angleName}</strong><br>Winkel: ${angleDeg.toFixed(
        2
      )}°`,
    },
  })

  return angleDeg.toFixed(2)
}

function Lot(punkt, gerade, name = null) {
  const p = getCoord(punkt)
  const g = series.find((s) => s.name === gerade)

  if (!p || !g) {
    console.error('Lot: Punkt oder Gerade nicht gefunden.')
    return null
  }

  const [[x1, y1], [x2, y2]] = g.data

  // Steigung der Ursprungsgerade
  const m = (y2 - y1) / (x2 - x1)

  // Lotrechte Steigung ist der negative Kehrwert
  const lotSteigung = -1 / m

  // Lotpunkt berechnen
  // Gleichung der Ursprungsgerade: y - y1 = m(x - x1)
  // Gleichung des Lots: y - p[1] = lotSteigung(x - p[0])
  // Schnittpunkt dieser Gleichungen
  const lotX = (lotSteigung * p[0] - m * x1 + y1 - p[1]) / (lotSteigung - m)
  const lotY = m * (lotX - x1) + y1

  let index = 1
  while (series.some((s) => s.name === `Lot${index}`)) index++
  const lotName = name || `Lot${index}`

  series.push({
    name: lotName,
    type: 'line',
    coordinateSystem: 'cartesian2d',
    data: [
      [p[0], p[1]],
      [lotX, lotY],
    ],
    lineStyle: { color: '#A0A', width: 2, type: 'dashed' },
  })

  return lotName
}

// Parallele Gerade durch einen Punkt
function Parallel(punkt, gerade, name = null) {
  const p = getCoord(punkt)
  const g = series.find((s) => s.name === gerade)

  if (!p || !g) {
    console.error('Parallel: Punkt oder Gerade nicht gefunden.')
    return null
  }

  const [[x1, y1], [x2, y2]] = g.data
  const m = (y2 - y1) / (x2 - x1)

  let index = 1
  while (series.some((s) => s.name === `Parallel${index}`)) index++
  const parallelName = name || `Parallel${index}`

  // Erzeugt eine Linie parallel zur ursprünglichen Gerade
  series.push({
    name: parallelName,
    type: 'line',
    coordinateSystem: 'cartesian2d',
    data: [
      [p[0], p[1]],
      [p[0] + (x2 - x1), p[1] + (y2 - y1)],
    ],
    lineStyle: { color: '#0AA', width: 2, type: 'dashed' },
  })

  return parallelName
}

// ------------------------------------------------------------
// Globale Funktion: Farbe
// Mit dieser Funktion kann die Farbe eines bereits erstellten Elements
// (sei es ein Punkt oder ein in series gespeichertes Objekt wie Linie, Polygon, etc.) nachträglich geändert werden.
// ------------------------------------------------------------
function Farbe(element, newColor) {
  let found = false
  // Zuerst: Suche in der series-Sammlung (Linie, Polygon, Gerade, etc.)
  for (let i = 0; i < series.length; i++) {
    if (series[i].name === element) {
      if (series[i].lineStyle) {
        series[i].lineStyle.color = newColor
      }
      if (series[i].areaStyle) {
        series[i].areaStyle.color = newColor
      }
      found = true
      break
    }
  }
  // Falls nicht in series gefunden, prüfen wir, ob es sich um einen Punkt handelt
  if (!found && points[element]) {
    if (!pointStyles[element]) {
      pointStyles[element] = {}
    }
    pointStyles[element].color = newColor
    found = true
  }
  if (!found) {
    console.error("Farbe: Element '" + element + "' nicht gefunden.")
  }
}

// ------------------------------------------------------------
// Globale Funktion: Name
// Mit dieser Funktion kann der Name (Anzeige-Label) eines bereits erstellten Elements
// (sei es ein Punkt oder ein in series gespeichertes Objekt wie Linie, Polygon, etc.) nachträglich geändert werden.
// Dabei wird auch – falls es sich um einen Punkt handelt – der Schlüssel in der globalen Punkte-Sammlung angepasst.
// Achtung: Es wird geprüft, ob der neue Name bereits vergeben ist.
// ------------------------------------------------------------
function Name(oldName, newName) {
  // Prüfe, ob der neue Name bereits verwendet wird
  const nameInSeries = series.some((s) => s.name === newName)
  const nameInPoints = points[newName] !== undefined
  if (nameInSeries || nameInPoints) {
    console.error("Name: Neuer Name '" + newName + "' ist bereits vergeben.")
    return
  }
  let found = false
  // Zuerst: Suche in der series-Sammlung (Linie, Polygon, Gerade, etc.)
  for (let i = 0; i < series.length; i++) {
    if (series[i].name === oldName) {
      series[i].name = newName
      // Falls im tooltip der alte Name vorkommt, kann man diesen (bei Stringformatierung) ersetzen.
      if (
        series[i].tooltip &&
        typeof series[i].tooltip.formatter === 'string'
      ) {
        series[i].tooltip.formatter = series[i].tooltip.formatter.replace(
          oldName,
          newName
        )
      }
      found = true
      break
    }
  }
  // Falls nicht in series gefunden, prüfen wir, ob es sich um einen Punkt handelt
  if (!found && points[oldName]) {
    // Neuen Eintrag in der Punkte-Sammlung anlegen und alten löschen
    points[newName] = points[oldName]
    delete points[oldName]
    // Auch in den pointStyles entsprechend umbenennen
    if (pointStyles[oldName]) {
      pointStyles[newName] = pointStyles[oldName]
      delete pointStyles[oldName]
    }
    found = true
  }
  if (!found) {
    console.error("Name: Element '" + oldName + "' nicht gefunden.")
  }
}

// ------------------------------------------------------------
// Funktion: Titel
// Setzt den Diagrammtitel
// ------------------------------------------------------------
function Titel(title) {
  TITLE = title
}

// ------------------------------------------------------------
// Funktion: GBScript_render
// Erzeugt ein Objekt, das (mittels eval) wieder in ein JavaScript-Objekt umgewandelt werden kann.
// Punkte werden als Scatter-Punkte (mit individueller Farbe) und weitere geometrische Objekte als Linien dargestellt.
// ------------------------------------------------------------
function GBScript_render(userAxisLimits = {}) {
  let scatterData = []
  for (let key in points) {
    let item = { name: key, value: points[key] }
    // Falls für den Punkt eine Farbe in pointStyles definiert wurde, verwende diese; sonst Standard 'red'
    let color =
      pointStyles[key] && pointStyles[key].color
        ? pointStyles[key].color
        : 'red'
    item.itemStyle = { color: color }
    scatterData.push(item)
  }
  let titleObj = TITLE ? { text: TITLE, left: 'center' } : undefined
  if (scatterData.length > 0) {
    series.push({
      name: 'Punkt',
      type: 'scatter',
      coordinateSystem: 'cartesian2d',
      data: scatterData,
      symbolSize: 7,
      label: {
        show: true,
        position: 'right',
        formatter: function (params) {
          return params.data.name
        },
      },
      tooltip: {
        show: true,
        formatter: '<strong>Punkt</strong><br>{b}: ({c})',
      },
      // Die series-eigene Farbe wird hier nicht mehr gesetzt, da die einzelnen Datenpunkte ihr eigenes itemStyle besitzen
      emphasis: { focus: 'series' },
      z: 10,
    })
  }
  let allCoordinates = Object.values(points)
  series.forEach((serie) => {
    if (serie.type === 'line' && Array.isArray(serie.data)) {
      serie.data.forEach((coord) => {
        if (Array.isArray(coord) && coord.length === 2) {
          allCoordinates.push(coord)
        }
      })
    }
  })
  let minX = -10,
    maxX = 10,
    minY = -10,
    maxY = 10
  if (allCoordinates.length > 0) {
    let allXs = allCoordinates.map((p) => p[0])
    let allYs = allCoordinates.map((p) => p[1])
    minX = Math.min(...allXs) - 1
    maxX = Math.max(...allXs) + 1
    minY = Math.min(...allYs) - 1
    maxY = Math.max(...allYs) + 1
  }

  // Berechnung der Achsenbereiche
  let xRange = maxX - minX
  let yRange = maxY - minY

  // Gleichmäßige Skalierung
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

  // Überschreiben mit benutzerdefinierten Grenzen, falls angegeben
  if (typeof userAxisLimits.minX === 'number') minX = userAxisLimits.minX
  if (typeof userAxisLimits.maxX === 'number') maxX = userAxisLimits.maxX
  if (typeof userAxisLimits.minY === 'number') minY = userAxisLimits.minY
  if (typeof userAxisLimits.maxY === 'number') maxY = userAxisLimits.maxY
  if (typeof globalAxisLimits.minX === 'number') minX = globalAxisLimits.minX
  if (typeof globalAxisLimits.maxX === 'number') maxX = globalAxisLimits.maxX
  if (typeof globalAxisLimits.minY === 'number') minY = globalAxisLimits.minY
  if (typeof globalAxisLimits.maxY === 'number') maxY = globalAxisLimits.maxY
  const resultObj = {
    title: titleObj,
    tooltip: { trigger: 'item' },
    xAxis: { type: 'value', min: minX, max: maxX, splitLine: { show: false } },
    yAxis: { type: 'value', min: minY, max: maxY, splitLine: { show: false } },
    series: series,
  }
  return toSource(resultObj)
}

// ------------------------------------------------------------
// Funktion: GBScriptEval
// Führt einen Code-String aus (nachdem die globalen Variablen initialisiert wurden)
// und gibt das von GBScript_render erzeugte Objekt zurück.
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// Exponiere die Funktionen als Teil des globalen Objekts
// ------------------------------------------------------------
window.GGBScript = GBScriptEval

/* 
Beispielhafte Nutzung:

const P = Polygon("P1", "P2", "P3", "P4", A, B, C); 
Farbe(P, "lightblue");
Name(P, "Polygon ABC");

*/
