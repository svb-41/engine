import { RadarResult, Position, dist2 } from '../engine/ship'

export type Enemy = { enemy: RadarResult; dist2: number }

export type Options = { all: boolean }

/** Get the enemies detected by the radar.
 * Removes the allies detected by the radar.
 * If options.all is set to true, it will also keep the destroyed ships.
 * options.all is false by default. */
export function closeEnemies(
  radar: RadarResult[],
  position: Position,
  options?: Options
) {
  const keep = options?.all ?? false
  const alive = keep ? radar : radar.filter(r => !r.destroyed)
  return alive.map(enemy => {
    const d = dist2(enemy.position, position)
    return { enemy, dist2: d }
  }) as Enemy[]
}

const enemyByDist = (enemies: Enemy[]) => {
  if (enemies.length === 0) return
  return enemies.reduce((acc, val) => (acc.dist2 > val.dist2 ? val : acc))
}

/** Get the nearest enemy detected by the radar.
 * If no enemy is found, returns undefined.
 * In case of options, if options.all it can indicates a destroyed ship.
 * options.all is false by default. */
export function nearestEnemy(enemies: Enemy[]): Enemy | undefined
export function nearestEnemy(
  radar: RadarResult[],
  position: Position,
  options?: Options
): Enemy | undefined
export function nearestEnemy(
  array: any[],
  position?: Position,
  options?: Options
) {
  if (array.length === 0) return
  if (array[0].enemy) {
    const enemies: Enemy[] = array
    return enemyByDist(enemies)
  } else {
    if (!position) return
    const radar: RadarResult[] = array
    const enemies = closeEnemies(radar, position, options)
    return enemyByDist(enemies)
  }
}
