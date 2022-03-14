import { Position, position } from '../engine/ship'
import {
  Instruction,
  ControlPanel,
  BulletControlPanel,
} from '../engine/control'

export const PI = Math.PI
export const TWO_PI = Math.PI * 2

/** Returns the n-th position. */
export const nextPosition = (num: number) => {
  return (pos: Position): Position => {
    if (num > 0) return nextPosition(num - 1)(position(pos))
    return position(pos)
  }
}

/** Returns the angle between the source and the target, in radians.
 * The result is comprised between 0 and 2π. */
export const angle = ({
  source,
  target,
}: {
  source: Position
  target: Position
}): number => {
  const y = target.pos.y - source.pos.y
  const x = target.pos.x - source.pos.x
  const angle = Math.atan2(y, x)
  return angle < 0 ? angle + TWO_PI : angle
}

export type TurnToTarget = {
  ship: ControlPanel | BulletControlPanel
  source: Position
  target: Position
  delay?: number
}
/** Position the ship in direction of the target.
 * delay can be set to try to forecast the position of the target
 * and position at that place.
 * For instance, if an enemy ship is going straight, you can forecast the
 * future move and position the ship accordingly.
 * delay defaults to 1. */
export const turnToTarget = (params: TurnToTarget): Instruction => {
  const { delay = 1, source, ship } = params
  const target = nextPosition(delay)(params.target)
  const agl = angle({ source: params.source, target })
  const deltaAngle = (agl - source.direction + TWO_PI) % TWO_PI
  return ship.turn(-deltaAngle + Math.PI)
}

export type Aim = {
  ship: ControlPanel
  source: Position
  target: Position
  delay?: number
  threshold?: number
  weapon?: number
}
/** Position the ship in direction of the target, and shoot if the target is in
 * the fire range. The fire range is determined by the threshold. If
 * angle(ship, target) is below the threshold, the fire range is fulfilled.
 * threshold defaults to 0.1.
 * delay can be set to try to forecast the position of the target
 * and position at that place.
 * For instance, if an enemy ship is going straight, you can forecast the
 * future move and position the ship accordingly.
 * delay defaults to 1.
 * weapon can also be set to a number, corresponding to the index of the weapon
 * you want to use. */
export const aim = (params: Aim): Instruction => {
  const { delay = 1, threshold = 0.1, weapon = 0, source, ship } = params
  const target = nextPosition(delay)(params.target)
  const agl = angle({ source: params.source, target })
  const deltaAngle = (agl - source.direction + TWO_PI) % TWO_PI
  if (deltaAngle < threshold) return ship.fire(weapon)
  return ship.turn(-deltaAngle + PI)
}
