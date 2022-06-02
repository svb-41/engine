import { v4 as uuid } from 'uuid'
import {
  DESTROYER,
  FIGHTER,
  STEALTH,
  CRUISER,
  BOMBER,
  SCOUT,
  BASE,
} from './ship'
import { Ship, dist2 } from '../ship'
import { BulletController, BulletContext } from '../control'
import { geometry } from '../../helpers'

export type BuildShipProps = {
  team?: string
  position?: {
    pos: { x: number; y: number }
    direction: number
  }
}

const digestMessage = async (message: string) => {
  const msgUint8 = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

const buildShip = (blueprint: Ship) => {
  return async (props: BuildShipProps): Promise<Ship> => {
    const defaultPosition = { pos: { x: 0, y: 0 }, direction: 0 }
    const { position = defaultPosition, team = 'none' } = props
    const id = uuid()
    return {
      ...blueprint,
      signature: await digestMessage(id),
      id,
      weapons: blueprint.weapons.map(w => ({ ...w })),
      position: { ...blueprint.position, ...position },
      team,
    }
  }
}

export const buildFighter = buildShip(FIGHTER)
export const buildStealth = buildShip(STEALTH)
export const buildDestroyer = buildShip(DESTROYER)
export const buildCruiser = buildShip(CRUISER)
export const buildBomber = buildShip(BOMBER)
export const buildScout = buildShip(SCOUT)
export const buildBase = buildShip(BASE)

type Target = { x: number; y: number }
type HomingTarget = { target: Target; armedTime: number }

const navigateTo = ({ bullet, stats, memory }: BulletContext) => {
  if (stats.position.speed < 0.6) return bullet.thrust(0.1)
  return geometry.turnToTarget({
    ship: bullet,
    source: stats.position,
    target: { direction: 0, speed: 0, pos: memory.target },
  })
}

export const buildTorpedo = (target: HomingTarget) =>
  new BulletController<HomingTarget>(navigateTo, target)

const homeTo = ({ bullet, stats, memory, radar }: BulletContext) => {
  if (stats.position.speed < 0.6) return bullet.thrust(0.1)
  memory.armedTime--
  if (memory.armedTime < 0) {
    const closeEnemy = radar
      .filter(r => !r.destroyed)
      .map(res => ({ res, dist: dist2(res.position, stats.position) }))
    if (closeEnemy.length > 0) {
      const nearestEnemy = closeEnemy.reduce((acc, val) =>
        acc.dist > val.dist ? val : acc
      )
      return geometry.turnToTarget({
        ship: bullet,
        source: stats.position,
        target: { direction: 0, speed: 0, pos: nearestEnemy.res.position.pos },
      })
    }
  }
  return geometry.turnToTarget({
    ship: bullet,
    source: stats.position,
    target: {
      direction: 0,
      speed: 0,
      pos: memory.target,
    },
  })
}

export const buildHomingTorpedo = (target: HomingTarget) =>
  new BulletController<HomingTarget>(homeTo, target)

const mineTo = ({ bullet, stats, memory, radar }: BulletContext) => {
  memory.armedTime--
  if (memory.armedTime < 0) {
    const closeEnemy = radar
      .filter(r => !r.destroyed)
      .map(res => ({ res, dist: dist2(res.position, stats.position) }))
    if (closeEnemy.length > 0) {
      const nearestEnemy = closeEnemy.reduce((acc, val) =>
        acc.dist > val.dist ? val : acc
      )
      if (stats.position.speed < 0.2) return bullet.thrust()

      return geometry.turnToTarget({
        ship: bullet,
        source: stats.position,
        target: { direction: 0, speed: 0, pos: nearestEnemy.res.position.pos },
      })
    }
  }

  const pos = memory.target
  const d = dist2(stats.position, { direction: 0, speed: 0, pos })
  if (d < 1) {
    if (stats.position.speed === 0) return bullet.idle()
    return bullet.thrust(-stats.position.speed)
  } else {
    if (stats.position.speed < 0.1) return bullet.thrust(0.1)
  }
  return geometry.turnToTarget({
    ship: bullet,
    source: stats.position,
    target: {
      direction: 0,
      speed: 0,
      pos: memory.target,
    },
  })
}

export const buildMine = (target: HomingTarget) =>
  new BulletController<HomingTarget>(mineTo, target)
