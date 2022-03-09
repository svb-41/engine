import { Bullet } from '../ship'
import { buildTorpedo, buildHomingTorpedo, buildMine } from './builder'

export const BASIC_BULLET: Bullet = {
  id: 'bullet',
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0.8,
  },
  stats: { size: 4, acceleration: 0, turn: 0 },
  distance: 0,
  armed: false,
  range: 600,
  coolDown: 400,
  destroyed: false,
}

export const TORPEDO: Bullet = {
  id: 'bullet',
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: { size: 8, acceleration: 0.02, turn: Math.PI / 40 },
  distance: 0,
  armed: false,
  range: 6000,
  coolDown: 4000,
  destroyed: false,
  builder: () => buildTorpedo,
}

export const MINE: Bullet = {
  id: 'bullet',
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: { size: 8, acceleration: 0.01, turn: Math.PI / 400, detection: 32 },
  distance: 0,
  armed: false,
  range: 6000,
  coolDown: 1000,
  destroyed: false,
  builder: () => buildMine,
}

export const HOMING_TORPEDO: Bullet = {
  id: 'bullet',
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0,
  },
  stats: { size: 8, acceleration: 0.02, turn: Math.PI / 40, detection: 100 },
  distance: 0,
  armed: false,
  range: 6000,
  coolDown: 4000,
  destroyed: false,
  builder: () => buildHomingTorpedo,
}

export const FAST_BULLET: Bullet = {
  id: 'bullet',
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0.8,
  },
  stats: { size: 4, acceleration: 0, turn: 0 },
  distance: 0,
  armed: false,
  range: 300,
  coolDown: 50,
  destroyed: false,
}

export const LONG_BULLET: Bullet = {
  id: 'bullet',
  position: {
    pos: { x: 0, y: 0 },
    direction: 0,
    speed: 0.8,
  },
  stats: { size: 4, acceleration: 0, turn: 0 },
  distance: 0,
  armed: false,
  range: 3000,
  coolDown: 5000,
  destroyed: false,
}
