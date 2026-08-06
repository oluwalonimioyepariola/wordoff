import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  BestOf,
  createMatch,
  createStats,
  DuelState,
  isMatchOver,
  isSweep,
  MatchState,
  OpponentId,
  recordDuel,
  recordMatch,
  recordMatchDuel,
  RecordResult,
  Stats,
} from '../engine';
import { deviceStorage } from './storage';
