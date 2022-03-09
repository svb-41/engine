import { Ship, RadarResult, Bullet } from './ship'
import { Message } from './comm'
export type GetInstruction<Data> = (
  ship: Ship,
  radar: Array<RadarResult>,
  data: Data
) => Instruction

export type Comm = {
  getNewMessages: () => Array<Message>
  sendMessage: (message: any) => void
}

export type ControllerArgs = {
  stats: Ship
  radar: Array<RadarResult>
  memory: any
  comm: Comm
  ship: ControlPanel
}

export class Controller<Data> {
  data: any
  shipId: string
  getInstruction: (args: ControllerArgs) => Instruction

  constructor(
    shipId: string,
    getInstruction: (args: ControllerArgs) => Instruction,
    initialData?: Data
  ) {
    this.data = initialData
    this.shipId = shipId
    this.getInstruction = getInstruction
  }

  next = (ship: Ship, comm: Comm, radar: Array<RadarResult>) =>
    this.getInstruction({
      stats: ship,
      radar,
      comm,
      memory: this.data,
      ship: controlPanel(ship),
    })
}

export type BulletControllerArgs = {
  stats: Bullet
  radar: Array<RadarResult>
  memory: any
  bullet: BulletControlPanel
}

export class BulletController<Data> {
  data: any
  getInstruction: (args: BulletControllerArgs) => Instruction

  constructor(
    getInstruction: (args: BulletControllerArgs) => Instruction,
    initialData?: Data
  ) {
    this.data = initialData
    this.getInstruction = getInstruction
  }

  next = (bullet: Bullet, radar: Array<RadarResult>) =>
    this.getInstruction({
      stats: bullet,
      radar,
      memory: this.data,
      bullet: bulletControlPanel(bullet),
    })
}

export enum INSTRUCTION {
  DEFAULT = 'DEFAULT',
  IDLE = 'IDLE',
  TURN = 'TURN',
  FIRE = 'FIRE',
  THRUST = 'THRUST',
}

export type Idle = {
  id: INSTRUCTION.IDLE
}
export type Turn = {
  id: INSTRUCTION.TURN
  arg: number
}
export type Thrust = {
  id: INSTRUCTION.THRUST
  arg: number
}
export type Fire = {
  id: INSTRUCTION.FIRE
  arg: number
  conf?: { target?: { x: number; y: number }; armedTime?: number }
}
export type Instruction = Idle | Turn | Thrust | Fire

export const idle = (): Idle => ({ id: INSTRUCTION.IDLE })
export const turn = (arg: number): Turn => ({ id: INSTRUCTION.TURN, arg })
export const thrust = (arg: number): Thrust => ({ id: INSTRUCTION.THRUST, arg })
export const fire = (
  arg: number,
  conf?: { target?: { x: number; y: number }; armedTime?: number }
): Fire => ({ id: INSTRUCTION.FIRE, arg, conf })

export type ControlPanel = {
  idle: () => Idle
  turn: (arg?: number) => Turn
  turnRight: (arg?: number) => Turn
  turnLeft: (arg?: number) => Turn
  fire: (
    arg?: number,
    target?: { target?: { x: number; y: number }; armedTime?: number }
  ) => Fire
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
