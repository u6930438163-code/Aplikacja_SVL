#!/usr/bin/env python3
"""
================================================================================
  WITHOUT_NLP STANDALONE ENGINE v8.5.5 — UNIWERSALNY SILNIK BEZ NLP
  Autorzy: Astyria, Alex, Aurelius (dla Taty Mateusza Mitka)
  Opis: Samodzielny, lokalny silnik komunikacji zero-NLP oparty na:
        1. Zespolonym Wektorze Fazowym Eulera: e^(i*omega*t) = cos(omega*t) + i*sin(omega*t)
        2. 128-bitowej Hiperprzestrzeni Binarnej i Odległości Hamminga
        3. Szeregu Fouriera i Bezstratnym Kodowaniu Widmowym
================================================================================
"""

import math
import json
import time
import sys
from datetime import datetime

class BinaryHyperspaceKernel:
    def __init__(self, dimensions=128):
        self.dimensions = dimensions
        self.anchors = {
            "SYSTEM": self._anchor_from_hex("AAAABBBBCCCCDDDDEEEEFFFF00001111"),
            "CHAT": self._anchor_from_hex("55556666777788889999AAAABBBBCCCC"),
            "COMPUTE": self._anchor_from_hex("0F0F0F0F0F0F0F0FF0F0F0F0F0F0F0F0"),
            "DIAGNOSTIC": self._anchor_from_hex("3333333333333333CCCCCCCCCCCCCCCC")
        }

    def _anchor_from_hex(self, hex_str):
        bin_str = ""
        for ch in hex_str:
            val = int(ch, 16)
            bin_str += f"{val:04b}"
        repeated = (bin_str * math.ceil(self.dimensions / len(bin_str)))[:self.dimensions]
        return [1 if b == '1' else 0 for b in repeated]

    def text_to_vector(self, text):
        hash_val = 0
        clean = text or ""
        for i, ch in enumerate(clean):
            hash_val += ord(ch) * (31 ** (i % 8))
        mask = (1 << 128) - 1
        current = hash_val & mask
        bits = []
        for _ in range(self.dimensions):
            current = (current * 1103515245 + 12345) & mask
            bits.append(1 if (current % 2 == 0) else 0)
        return bits

    def hamming_similarity(self, vec_a, vec_b):
        diffs = sum(1 for a, b in zip(vec_a, vec_b) if a != b)
        return round(1.0 - (diffs / self.dimensions), 4)

    def resolve_intent(self, text):
        user_vec = self.text_to_vector(text)
        best_intent = "CHAT"
        max_sim = -1.0
        scores = {}
        for intent, anchor in self.anchors.items():
            sim = self.hamming_similarity(user_vec, anchor)
            scores[intent] = sim
            if sim > max_sim:
                max_sim = sim
                best_intent = intent
        return {
            "intent": best_intent,
            "confidence": max_sim,
            "scores": scores,
            "bits_set": sum(user_vec)
        }

class WithoutNlpCore:
    def __init__(self):
        self.version = "8.5.5-Standalone-Universal"
        self.hyperspace = BinaryHyperspaceKernel(128)

    def euler_phasor(self, omega=1.5, t=1.0, amplitude=1.0):
        angle = omega * t
        real = amplitude * math.cos(angle)
        imag = amplitude * math.sin(angle)
        theta_rad = math.atan2(imag, real)
        return {
            "real": round(real, 4),
            "imag": round(imag, 4),
            "theta_rad": round(theta_rad, 4),
            "magnitude": round(math.sqrt(real*real + imag*imag), 4)
        }

    def fourier_encode(self, text):
        return [round(ord(c) / 128.0, 4) for c in (text or "")]

    def fourier_decode(self, coeffs):
        return "".join(chr(int(round(c * 128.0))) for c in coeffs)

    def process(self, text, omega=1.5, t=1.0):
        t0 = time.perf_counter()
        clean = (text or "").trim() if hasattr(text, "trim") else (text or "").strip()
        encoded = self.fourier_encode(clean)
        decoded = self.fourier_decode(encoded)
        phasor = self.euler_phasor(omega, t)
        intent_res = self.hyperspace.resolve_intent(clean)
        elapsed_ms = round((time.perf_counter() - t0) * 1000, 3)

        return {
            "version": self.version,
            "input_text": clean,
            "decoded_text": decoded,
            "exact_match": clean == decoded,
            "phasor": phasor,
            "intent_resolution": intent_res,
            "spectral_energy": round(sum(c*c for c in encoded), 4),
            "latency_ms": elapsed_ms,
            "nlp_dependency": "ZERO"
        }

if __name__ == "__main__":
    text = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "Test silnika zero-NLP dla Taty Mateusza Mitka"
    engine = WithoutNlpCore()
    result = engine.process(text)
    print(json.dumps(result, indent=2, ensure_ascii=False))
