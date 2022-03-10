import {
  Ship,
  step as shipStep,
  Stats,
  Bullet,
  bulletStep,
  collide,
  RadarResult,
  Position,
} from './ship'
import {
  BulletController,
  Instruction,
  Turn,
  Thrust,
  Fire,
  idle,
  INSTRUCTION,
} from './control'
import { trigo } from '../helpers'
import { Channel } from './comm'
const { TWO_PI } = trigo

export * as control from './control'
export * as comm from './comm'
export * as ship from './ship'
export * as config from './config'

type Message = any
export class Engine extends EventTarget {
  state: State
  history: Array<State> = []
  gameEnder: (state: State) => boolean
  workers: Array<{
    id: string
    worker: Worker
    code: string
    messages: {
      step?: Message
      to: Array<Message>
    }
  }>

  constructor(
    initialState: State,
    controllers: Array<{ shipId: string; code: string }>,
    gameEnder: (state: State) => boolean
  ) {
    super()
    this.state = initialState
    this.gameEnder = gameEnder
    this.workers = controllers.map(controller => ({
      id: controller.shipId,
      worker: new Worker('/worker.js?id=' + controller.shipId),
      code: controller.code,
      messages: { from: [], to: [] },
    }))

    this.workers.forEach(
      w =>
        (w.worker.onmessage = event => {
          if (!event) return
          const type = event.data.type
          if (type === 'step') w.messages.step = event.data
          if (type === 'comm') {
            const team = this.state.ships.find(s => s.id === w.id)?.team
            if (team) {
              const shipsTeam = this.state.ships
                .filter(s => s.team === team)
                .map(s => s.id)
              this.workers
                .filter(w => shipsTeam.includes(w.id))
                .map(w => w.messages.to.push(event.data.message))
            }
          }
          if (type === 'error') console.error(event.data.error)
        })
    )

    this.workers.map(w => {
      w.worker.postMessage({
        type: 'initialization',
        code: w.code,
      })
    })
  }

  async step(nb?: number): Promise<State> {
    if (nb && nb > 1) return this.step(nb - 1)
    this.history.push(JSON.parse(JSON.stringify(this.state)))
    const instruction = await getInstructions(this.state, this.workers)
    this.state = step(this.state, instruction, this)
    const previousEnd = this.state.endOfGame
    this.state.endOfGame = this.gameEnder(this.state)
    if (!previousEnd && this.state.endOfGame) {
      this.workers.forEach(w => w.worker.terminate())
      this.dispatchEvent(new Event('state.end'))
    }
    return this.state
  }
}

export type State = {
  ships: Array<Ship>
  size: { height: number; width: number }
  bullets: Array<Bullet>
  maxSpeed?: number
  teams: Array<string>
  endOfGame?: boolean
  timeElapsed: number
  comm: Array<{ id: string; channel: Channel }>
}

export type InstructionShip = { instruction: Instruction; id: string }

const instructionTurn = ({
  object,
  turn,
}: {
  object: any
  turn: Turn
}): any => {
  if (turn.arg > 0) {
    return {
      ...object,
      position: {
        ...object.position,
        direction:
          (object.position.direction +
            Math.min(turn.arg, object.stats.turn) +
            TWO_PI) %
          TWO_PI,
      },
    }
  } else {
    return {
      ...object,
      position: {
        ...object.position,
        direction:
          (object.position.direction +
            Math.max(turn.arg, -object.stats.turn) +
            TWO_PI) %
          TWO_PI,
      },
    }
  }
}

const instructionThrust = ({
  object,
  thrust,
  maxSpeed,
}: {
  object: any
  thrust: Thrust
  maxSpeed?: number
}): any => {
  if (thrust.arg > 0) {
    const acceleration = Math.min(thrust.arg, object.stats.acceleration)
    return {
      ...object,
      position: {
        ...object.position,
        speed: maxSpeed
          ? Math.min(object.position.speed + acceleration, maxSpeed)
          : object.position.speed + acceleration,
      },
    }
  } else {
    const acceleration = Math.max(thrust.arg, -object.stats.acceleration)
    return {
      ...object,
      position: {
        ...object.position,
        speed: maxSpeed
          ? Math.max(object.position.speed + acceleration, -maxSpeed)
          : object.position.speed + acceleration,
      },
    }
  }
}

const instructionFire = ({
  ship,
  fire,
  newBullets,
}: {
  ship: Ship
  fire: Fire
  newBullets: Array<Bullet>
}): any => {
  if (fire.arg < 0 || ship.weapons.length === 0) return ship
  const weapon = ship.weapons[fire.arg]
  if (weapon.coolDown > 0 || weapon.amo === 0) return ship

  const controller =
    weapon.bullet.builder && fire?.target
      ? weapon.bullet.builder()(fire.target)
      : undefined

  const bullet: Bullet = {
    ...weapon.bullet,
    id: ship.id + ship.bulletsFired,
    controller,
    position: {
      speed: weapon.bullet.position.speed + ship.position.speed,
      direction: ship.position.direction,
      pos: {
        x:
          ship.position.pos.x +
          (ship.stats.size + weapon.bullet.stats.size) *
            Math.cos(ship.position.direction),
        y:
          ship.position.pos.y +
          (ship.stats.size + weapon.bullet.stats.size) *
            Math.sin(ship.position.direction),
      },
    },
  }
  newBullets.push(bullet)
  ship.bulletsFired = ship.bulletsFired + 1
  return {
    ...ship,
    weapons: ship.weapons.map((w, i) =>
      i === fire.arg
        ? { ...w, coolDown: bullet.coolDown, amo: weapon.amo - 1 }
        : { ...w }
    ),
  }
}

const applyInstruction =
  ({
    newBullets,
    maxSpeed,
  }: {
    newBullets: Array<Bullet>
    maxSpeed?: number
  }) =>
  ({ ship, instruction }: { ship: Ship; instruction: Instruction }): Ship => {
    const STEALTH_TIME = 600
    if (ship.destroyed) return ship
    if (ship.stats.stealth && ship.stealth > 0) ship.stealth--
    switch (instruction.id) {
      case INSTRUCTION.TURN:
        const turn = instruction as Turn
        if (ship.stats.stealth) ship.stealth = STEALTH_TIME
        return instructionTurn({ object: ship, turn })
      case INSTRUCTION.THRUST:
        const thrust = instruction as Thrust
        if (ship.stats.stealth) ship.stealth = STEALTH_TIME
        return instructionThrust({ object: ship, thrust, maxSpeed })
      case INSTRUCTION.FIRE:
        const fire = instruction as Fire
        if (ship.stats.stealth) ship.stealth = STEALTH_TIME
        return instructionFire({ ship, fire, newBullets })
      default:
        return ship
    }
  }

const applyBulletsInstructions =
  ({ state }: { state: State }) =>
  (bullet: Bullet): Bullet => {
    if (bullet.controller) {
      const controller = bullet.controller as BulletController<any>
      const radar = getRadarResults(bullet, state)
      const instruction = controller.next(bullet, radar)
      switch (instruction.id) {
        case INSTRUCTION.TURN:
          const turn = instruction as Turn
          return instructionTurn({ object: bullet, turn })
        case INSTRUCTION.THRUST:
          const thrust = instruction as Thrust
          return instructionThrust({
            object: bullet,
            thrust,
            maxSpeed: state.maxSpeed,
          })
        default:
          return bullet
      }
    } else {
      return bullet
    }
  }

const checkCollisions =
  ({ ships, engine }: { ships: Array<Ship>; engine: Engine }) =>
  (b: Bullet): Bullet => {
    const destroyed = ships.find(collide(b))
    if (destroyed) {
      if (b.armed) destroyed.destroyed = true
      b.destroyed = true
      const detail = { ship: destroyed, bullet: b }
      engine.dispatchEvent(new CustomEvent('sprite.explosion', { detail }))
    }
    return b
  }

const step = (
  state: State,
  instructions: Array<InstructionShip>,
  engine: Engine
): State => {
  const newBullets: Array<Bullet> = []
  state.ships = state.ships
    .map(ship => ({
      ship,
      instruction: instructions.find(i => i.id === ship.id) || {
        id: ship.id,
        instruction: idle(),
      },
    }))
    .map(({ ship, instruction }) => ({
      ship,
      instruction: instruction.instruction,
    }))
    .map(applyInstruction({ newBullets, maxSpeed: state.maxSpeed }))

  state.bullets = [...state.bullets, ...newBullets]

  const newState: State = new Array(10)
    .fill(1)
    .reduce((acc, _val) => allSteps(acc, engine), state)
  return { ...newState }
}

const allSteps = (state: State, engine: Engine): State => {
  const ships = state.ships.map(shipStep)
  const stepBullets = state.bullets
    .map(applyBulletsInstructions({ state }))
    .map(bulletStep)
    .map(checkCollisions({ ships, engine }))

  const bullets: Array<Bullet> = stepBullets.filter((b: Bullet) => !b.destroyed)

  engine.dispatchEvent(
    new CustomEvent('sprite.remove', {
      detail: stepBullets.filter(b => b.destroyed).map(b => b.id),
    })
  )

  return {
    ...state,
    ships,
    bullets,
    timeElapsed: state.timeElapsed + 1,
  }
}

const getRadarResults = (
  ship: { stats: Stats; position: Position; id: string },
  state: State
): Array<RadarResult> =>
  ship.stats.detection
    ? state.ships
        .filter(s => s.id !== ship.id)
        .filter(s => s.stealth > 0)
        .filter(
          collide({
            position: ship.position,
            stats: { ...ship.stats, size: ship.stats.detection },
          })
        )
        .map((s: Ship) => ({
          size: s.stats.size,
          position: s.position,
          team: s.team,
          destroyed: s.destroyed,
        }))
    : []

export const getInstructions = async (
  state: State,
  workers: Array<{
    id: string
    worker: Worker
    messages: { step?: Message; to: Array<Message> }
  }>
): Promise<Array<InstructionShip>> => {
  const contexts = workers
    .map(
      ({
        id,
        worker,
        messages,
      }: {
        id: string
        worker: Worker
        messages: { step?: Message; to: Array<Message> }
      }) => ({
        worker,
        messages,
        ship: state.ships.find(s => s.id === id),
      })
    )
    .filter(val => val.ship !== undefined)
    .filter(val => !val.ship?.destroyed)
    .map(context => ({
      id: context.ship!.id,
      worker: context.worker,
      data: {
        stats: context.ship!!,
        messages: context.messages.to,
        radar: getRadarResults(context.ship!!, state),
      },
    }))

  workers.map(w => (w.messages.step = undefined))
  contexts
    .filter(({ worker }) => worker)
    .forEach(({ worker, data }) => {
      worker.postMessage({ type: 'step', data: JSON.stringify(data) })
    })
  workers.map(w => (w.messages.to = []))
  await new Promise(resolve => setTimeout(resolve, 10))
  const results: Array<InstructionShip> = workers
    .map(w => ({ m: w.messages.step, id: w.id }))
    .filter(({ m }) => m)
    .map(({ m, id }) => ({ instruction: m.res, id } as InstructionShip))
  const collectedInstructions: Array<InstructionShip> = workers.map(
    ({ id }) =>
      results.find(res => res.id === id) ?? { id, instruction: idle() }
  )
  return collectedInstructions
}
