import { Ship, RadarResult, Bullet } from './ship'
import { Channel } from './comm'

export type Comm<Data = any> = Channel<Data>

export type AI<Data = any> = (args: Context<Data>) => Instruction
export type Context<Data = any> = {
  stats: Ship
  radar: Array<RadarResult>
  memory: Data
  comm: Comm
  ship: ControlPanel
}

export type BulletContext<Data = any> = {
  stats: Bullet
  radar: Array<RadarResult>
  memory: Data
  bullet: BulletControlPanel
}

// prettier-ignore
export type BulletAI<Data = any> = (args: BulletContext<Data>) => Instruction
export class BulletController<Data = any> {
  #data: any
  #getInstruction: BulletAI<Data>

  constructor(getInstruction: BulletAI<Data>, initialData?: Data) {
    this.#data = initialData
    this.#getInstruction = getInstruction
  }

  next = (bullet: Bullet, radar: Array<RadarResult>) => {
    return this.#getInstruction({
      stats: bullet,
      radar,
      memory: this.#data,
      bullet: bulletControlPanel(bullet),
    })
  }
}

export enum INSTRUCTION {
  DEFAULT = 'DEFAULT',
  IDLE = 'IDLE',
  TURN = 'TURN',
  FIRE = 'FIRE',
  THRUST = 'THRUST',
}

export type Target = { target?: { x: number; y: number }; armedTime?: number }
export type Idle = { id: INSTRUCTION.IDLE }
export type Turn = { id: INSTRUCTION.TURN; arg: number }
export type Thrust = { id: INSTRUCTION.THRUST; arg: number }
export type Fire = { id: INSTRUCTION.FIRE; arg: number; target?: Target }
export type Instruction = Idle | Turn | Thrust | Fire

export const idle = (): Idle => ({ id: INSTRUCTION.IDLE })
export const turn = (arg: number): Turn => ({ id: INSTRUCTION.TURN, arg })
export const thrust = (arg: number): Thrust => ({ id: INSTRUCTION.THRUST, arg })
export const fire = (arg: number, target?: Target): Fire => {
  return { id: INSTRUCTION.FIRE, arg, target }
}

export type ControlPanel = {
  idle: () => Idle
  turn: (arg?: number) => Turn
  turnRight: (arg?: number) => Turn
  turnLeft: (arg?: number) => Turn
  fire: (arg?: number, target?: Target) => Fire
  thrust: (arg?: number) => Thrust
}

export const controlPanel = (ship: Ship): ControlPanel => ({
  idle: () => idle(),
  turn: arg => turn(arg ? arg : ship.stats.turn),
  turnRight: arg => turn(arg ? -arg : -ship.stats.turn),
  turnLeft: arg => turn(arg ? arg : ship.stats.turn),
  fire: (arg, target) => fire(arg ? arg : 0, target),
  thrust: arg => thrust(arg ? arg : ship.stats.acceleration),
})

export type BulletControlPanel = {
  idle: () => Idle
  turn: (arg?: number) => Turn
  turnRight: (arg?: number) => Turn
  turnLeft: (arg?: number) => Turn
  thrust: (arg?: number) => Thrust
}

export const bulletControlPanel = (bullet: Bullet): BulletControlPanel => ({
  idle: () => idle(),
  turn: arg => turn(arg ? arg : bullet.stats.turn),
  turnRight: arg => turn(arg ? -arg : -bullet.stats.turn),
  turnLeft: arg => turn(arg ? arg : bullet.stats.turn),
  thrust: arg => thrust(arg ? arg : bullet.stats.acceleration),
})
