/**
 * Electrical-buzz oscillator stack helpers.
 *
 * Extracted from destruction-audio-faz45.ts in Sprint 8 Phase 2B Lane A M2
 * to keep the parent file under the 400-line max-lines ESLint cap after the
 * audio voice counter integration grew the source.
 *
 * Owner decree (TH-S6-04): consumed by faz5-disk-format audio path only.
 */

import { FAZ5_ELECTRICAL_BUZZ_HZ } from '../../../shared/scene-destruction-constants.js';

/** Harmonic amplitude relative to fundamental — -12dB ≈ 0.25 linear. */
const ELECTRICAL_BUZZ_HARMONIC_GAIN_RATIO = 0.25;

export interface ElectricalBuzzNodes {
  fundamental: OscillatorNode;
  harmonic2x: OscillatorNode;
  harmonic3x: OscillatorNode;
  fundamentalGain: GainNode;
  harmonic2xGain: GainNode;
  harmonic3xGain: GainNode;
  masterGain: GainNode;
}

export function buildElectricalBuzzNodes(
  context: AudioContext,
  destination: GainNode,
): ElectricalBuzzNodes {
  const masterGain = context.createGain();
  masterGain.gain.value = 0;
  masterGain.connect(destination);
  const fundamental = buildBuzzOsc(context, FAZ5_ELECTRICAL_BUZZ_HZ, 1.0, masterGain);
  const harmonic2x = buildBuzzOsc(
    context,
    FAZ5_ELECTRICAL_BUZZ_HZ * 2,
    ELECTRICAL_BUZZ_HARMONIC_GAIN_RATIO,
    masterGain,
  );
  const harmonic3x = buildBuzzOsc(
    context,
    FAZ5_ELECTRICAL_BUZZ_HZ * 3,
    ELECTRICAL_BUZZ_HARMONIC_GAIN_RATIO,
    masterGain,
  );
  return {
    fundamental: fundamental.osc,
    harmonic2x: harmonic2x.osc,
    harmonic3x: harmonic3x.osc,
    fundamentalGain: fundamental.gain,
    harmonic2xGain: harmonic2x.gain,
    harmonic3xGain: harmonic3x.gain,
    masterGain,
  };
}

function buildBuzzOsc(
  context: AudioContext,
  hz: number,
  gainValue: number,
  master: GainNode,
): { osc: OscillatorNode; gain: GainNode } {
  const osc = context.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = hz;
  const gain = context.createGain();
  gain.gain.value = gainValue;
  osc.connect(gain).connect(master);
  return { osc, gain };
}
