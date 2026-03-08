// Utility helpers for transforming between world and screen coordinates.
// Keeps all scale/offset math in a single place so callers can focus on intent.

const CoordinateUtils = {
  worldToScreen(point, scaleFactor, offset) {
    return {
      x: point.x * scaleFactor + offset.x,
      y: point.y * scaleFactor + offset.y,
    }
  },

  screenToWorld(point, scaleFactor, offset) {
    return {
      x: (point.x - offset.x) / scaleFactor,
      y: (point.y - offset.y) / scaleFactor,
    }
  },

  worldRectToScreen(rect, scaleFactor, offset) {
    return {
      x: rect.x * scaleFactor + offset.x,
      y: rect.y * scaleFactor + offset.y,
      width: rect.width * scaleFactor,
      height: rect.height * scaleFactor,
    }
  },

  pointInRect(point, rect) {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    )
  },

  pointInPolygon(point, polygon) {
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x
      const yi = polygon[i].y
      const xj = polygon[j].x
      const yj = polygon[j].y

      const intersect = ((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)
      if (intersect) inside = !inside
    }
    return inside
  },

  adjustOffsetForZoom(screenPoint, offset, prevScale, newScale) {
    return {
      x: screenPoint.x - ((screenPoint.x - offset.x) / prevScale) * newScale,
      y: screenPoint.y - ((screenPoint.y - offset.y) / prevScale) * newScale,
    }
  },
}
