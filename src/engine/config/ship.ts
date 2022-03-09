import { Ship, SHIP_CLASS } from '../ship'
import {
  FAST_BULLET,
  TORPEDO,
  HOMING_TORPEDO,
  BASIC_BULLET,
  LONG_BULLET,
  MINE,
} from './weapon'

export const FIGHTER: Ship = {
  id: 'fighter',
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
  id: 'scout',
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
  id: 'bomber',
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
  id: 'cruiser',
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
  id: 'stealth',
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
  id: 'destroyer',
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

export const BASIC_BASE: Ship = {
  id: 'base',
  shipClass: SHIP_CLASS.BASE,
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: { size: 32, acceleration: 0, turn: Math.PI / 30, detection: 10 },
  destroyed: false,
  team: 'none',
  bulletsFired: 0,
  stealth: 600,
  weapons: [],
}
