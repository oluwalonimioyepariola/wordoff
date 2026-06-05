/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ANSWERS,
  dailyAnswer,
  dailyOpponent,
  dateForDayNumber,
  dayKey,
  dayNumber,
  formatCountdown,
  msUntilNextDay,
} from '../src/engine';
