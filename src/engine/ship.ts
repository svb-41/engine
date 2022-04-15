import { BulletController } from './control'

/** A Ship is identified by an ID (an UUID), and has various stats. team is a color. */
export type Ship = {
  id: string
  position: Position
  stats: Stats
  destroyed: boolean
  team: string
  bulletsFired: number
  weapons: Array<{ bullet: Bullet; amo: number; coolDown: number }>
  shipClass: SHIP_CLASS
  stealth: number
  signature: string
}

/** All possible classes for a Ship. */
export enum SHIP_CLASS {
  DESTROYER = 'DESTROYER',
  FIGHTER = 'FIGHTER',
  STEALTH = 'STEALTH',
  CRUISER = 'CRUISER',
  BOMBER = 'BOMBER',
  SCOUT = 'SCOUT',
  BASE = 'BASE',
}

/** Position of an item in space.
 * It has two coordinates X and Y.
 * Direction is in radians.
 * Speed in number. */
export type Position = {
  pos: { x: number; y: number }
  direction: number
  speed: number
}

/** Stats of an item.
 * Acceleration is in speed/s.
 * Turn indicates of how much an item can turn by frame.
 * Size indicates the size of the item.
 * Stealth is the value of resistance of the item.
 * Direction is in radians. */
export type Stats = {
  acceleration: number
  turn: number
  size: number
  stealth?: boolean
  detection?: number
}

/** A Bullet is similar to a Ship, except you don’t have control over it. */
export type Bullet = {
  position: Position
  stats: Stats
  distance: number
  armed: boolean
  range: number
  id: string
  coolDown: number
  destroyed: boolean
  controller?: BulletController<any>
  builder?: () => (args: any) => BulletController<any>
}

/** The result of the radar doesn't contains the distance of the object.
 * You can have it with sqrt(dist2(self.position, radar.position)). */
export type RadarResult = {
  position: Position
  size: number
  team: string
  destroyed: boolean
  signature: string
}

/** Generates the next position of the position. */
export const position = (position: Position): Position => {
  const x = Math.cos(position.direction) * position.speed + position.pos.x
  const y = Math.sin(position.direction) * position.speed + position.pos.y
  return { ...position, pos: { x, y } }
}

/** Generates the next state of the ship.
 * Updates the position and updates weapons cool-down. */
export const step = (ship: Ship): Ship => {
  const weapons = ship.weapons.map(weapon => {
    const coolDown = weapon.coolDown > 0 ? weapon.coolDown - 1 : 0
    return { ...weapon, coolDown }
  })
  return { ...ship, weapons, position: position(ship.position) }
}

/** Generates the next state of the bullet.
 * Updates distance, destroyed and position. */
export const bulletStep = (bullet: Bullet): Bullet => ({
  ...bullet,
  distance: bullet.distance + bullet.position.speed,
  destroyed: bullet.distance > bullet.range,
  armed: true,
  position: position(bullet.position),
})

/** Computes the square of the distance between the two positions.
 * Useful when you need to compute quickly a distance to check collisions
 * for example. */
export const dist2 = (pos1: Position, pos2: Position) => {
  const x = Math.pow(pos1.pos.x - pos2.pos.x, 2)
  const y = Math.pow(pos1.pos.y - pos2.pos.y, 2)
  return x + y
}

/** Computes the distance between two positions.
 * Use it only if you really need something precise.
 * Because of geometry, dist requires a call to Math.sqrt, which is costly.
 * Use dist2 if you can handles squared values. */
export const dist = (pos1: Position, pos2: Position) => {
  const squared = dist2(pos1, pos2)
  return Math.sqrt(squared)
}

/** Checks if two objects are colliding. */
export type Collide = { position: Position; stats: Stats }
export const collide = (obj1: Collide) => (obj2: Collide) => {
  const sizeOfTwos = Math.pow(obj1.stats.size + obj2.stats.size, 2)
  return dist2(obj1.position, obj2.position) < sizeOfTwos
}
