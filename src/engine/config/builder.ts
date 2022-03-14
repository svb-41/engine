import { v4 as uuid } from 'uuid'
import {
  DESTROYER,
  FIGHTER,
  STEALTH,
  CRUISER,
  BOMBER,
  SCOUT,
  // BASE,
} from './ship'
import { Ship, dist2 } from '../ship'
import { BulletController, BulletContext } from '../control'
import { geometry } from '../../helpers'
import { nearestEnemy } from '../../helpers/radar'

export type BuildShipProps = {
  team?: string
  position?: {
    pos: { x: number; y: number }
    direction: number
  }
}

const buildShip = (blueprint: Ship) => {
  return (props: BuildShipProps): Ship => {
    const defaultPosition = { pos: { x: 0, y: 0 }, direction: 0 }
    const { position = defaultPosition, team = 'none' } = props
    return {
      ...blueprint,
      id: uuid(),
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

type Target = { x: number; y: number }
type HomingTarget = { target: Target; armedTime: number }

const navigateTo = ({ bullet, stats, memory }: BulletContext) => {
  if (stats.position.speed < 0.6) return bullet.thrust(0.1)
  return geometry.findDirection({
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
    const near = nearestEnemy(radar, stats.position)
    if (near) {
      return geometry.findDirection({
        ship: bullet,
        source: stats.position,
        target: {
          direction: 0,
          speed: 0,
          pos: near.enemy.position.pos,
        },
      })
    }
  }
  return geometry.findDirection({
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
    const near = nearestEnemy(radar, stats.position)
    if (near) {
      if (stats.position.speed < 0.2) return bullet.thrust()
      return geometry.findDirection({
        ship: bullet,
        source: stats.position,
        target: {
          direction: 0,
          speed: 0,
          pos: near.enemy.position.pos,
        },
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
  return geometry.findDirection({
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
