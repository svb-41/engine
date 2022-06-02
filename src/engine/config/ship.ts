import { Ship, Bullet, SHIP_CLASS } from '../ship'
import {
  FAST_BULLET,
  TORPEDO,
  HOMING_TORPEDO,
  BASIC_BULLET,
  LONG_BULLET,
  MINE,
} from './weapon'

const SIZE = 100 / 8
const ACCELERATION = 100
const TURN = 1000 / Math.PI
const DETECTION = 1 / 10
const STELTH = 2000
const COOLDOWN = 40000
const AMO = 0.01
const RANGE = 1
const BACCELERATION = 1
const BTURN = 100 / Math.PI
const BMINE = 2
const BHOMING_TORPEDO = 2

const mathWeapon = (b: Bullet) =>
  (COOLDOWN / b.coolDown +
    b.range * RANGE +
    b.stats.acceleration * BACCELERATION +
    b.stats.turn * BTURN) *
  (b.id == 'mine' ? BMINE : b.id == 'homing-torpedo' ? BHOMING_TORPEDO : 1)

const calc = (ship: Ship) => {
  const res =
    ship.stats.size * SIZE +
    ship.stats.acceleration * ACCELERATION +
    ship.stats.turn * TURN +
    (ship.stats.stealth ? 1 : 0) * STELTH +
    (ship.stats.detection ? ship.stats.detection : 0) * DETECTION +
    ship.weapons
      .map(w => mathWeapon(w.bullet) * w.amo * AMO)
      .reduce((acc, val) => acc + val, 0)
  const log = Math.floor(Math.log10(res))
  const pow = Math.pow(10, log)
  return Math.round(res / pow) * pow
}

export const FIGHTER: Ship = {
  signature: '',
  id: 'fighter',
  price: 500,
  shipClass: SHIP_CLASS.FIGHTER,
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: { size: 8, acceleration: 0.01, turn: Math.PI / 30, detection: 200 },
  destroyed: false,
  team: 'none',
  bulletsFired: 0,
  stealth: 600,
  weapons: [
    { bullet: FAST_BULLET, amo: 15, coolDown: 0 },
    { bullet: FAST_BULLET, amo: 15, coolDown: 0 },
  ],
}

export const SCOUT: Ship = {
  signature: '',
  id: 'scout',
  price: 300,
  shipClass: SHIP_CLASS.SCOUT,
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: { size: 8, acceleration: 0.05, turn: Math.PI / 10, detection: 600 },
  destroyed: false,
  team: 'none',
  bulletsFired: 0,
  stealth: 600,
  weapons: [],
}

export const BOMBER: Ship = {
  signature: '',
  id: 'bomber',
  price: 2000,
  shipClass: SHIP_CLASS.BOMBER,
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: { size: 16, acceleration: 0.001, turn: Math.PI / 30, detection: 400 },
  destroyed: false,
  team: 'none',
  bulletsFired: 0,
  stealth: 600,
  weapons: [
    { bullet: TORPEDO, amo: 10, coolDown: 0 },
    { bullet: HOMING_TORPEDO, amo: 8, coolDown: 0 },
    { bullet: MINE, amo: 4, coolDown: 0 },
  ],
}

export const CRUISER: Ship = {
  signature: '',
  id: 'cruiser',
  price: 400,
  shipClass: SHIP_CLASS.CRUISER,
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: { size: 16, acceleration: 0.001, turn: Math.PI / 80, detection: 400 },
  destroyed: false,
  team: 'none',
  bulletsFired: 0,
  stealth: 600,
  weapons: [
    { bullet: BASIC_BULLET, amo: 10, coolDown: 0 },
    { bullet: BASIC_BULLET, amo: 10, coolDown: 0 },
  ],
}

export const STEALTH: Ship = {
  signature: '',
  id: 'stealth',
  price: 2000,
  shipClass: SHIP_CLASS.STEALTH,
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: {
    size: 8,
    acceleration: 0.002,
    turn: Math.PI / 30,
    detection: 200,
    stealth: true,
  },
  destroyed: false,
  team: 'none',
  bulletsFired: 0,
  stealth: 0,
  weapons: [{ bullet: FAST_BULLET, amo: 5, coolDown: 0 }],
}

export const DESTROYER: Ship = {
  signature: '',
  id: 'destroyer',
  price: 1000,
  shipClass: SHIP_CLASS.DESTROYER,
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: {
    size: 16,
    acceleration: 0.001,
    turn: Math.PI / 120,
    detection: 400,
  },
  destroyed: false,
  team: 'none',
  bulletsFired: 0,
  stealth: 600,
  weapons: [
    { bullet: LONG_BULLET, amo: 10, coolDown: 0 },
    { bullet: TORPEDO, amo: 8, coolDown: 0 },
  ],
}

export const BASE: Ship = {
  signature: '',
  id: 'base',
  price: 5000,
  shipClass: SHIP_CLASS.BASE,
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: { size: 128, acceleration: 0, turn: Math.PI / 2000, detection: 10000 },
  destroyed: false,
  team: 'none',
  bulletsFired: 0,
  stealth: 600,
  weapons: [{ bullet: TORPEDO, amo: 800, coolDown: 0 }],
}
