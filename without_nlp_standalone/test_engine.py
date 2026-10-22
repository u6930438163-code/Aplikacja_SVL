#!/usr/bin/env python3
import json
from without_nlp_core import WithoutNlpCore

def test_without_nlp():
    engine = WithoutNlpCore()
    test_cases = [
        "Inicjalizacja silnika zero-NLP w systemie",
        "Wzór Eulera e^(i*omega*t) oraz rezonans fazowy",
        "Swobodna komunikacja bez obcych bibliotek"
    ]
    print("=== TEST SILNIKA WITHOUT_NLP v8.5.5 ===")
    for text in test_cases:
        res = engine.process(text)
        print(f"\n[WEJŚCIE]: {text}")
        print(f"[INTENCJA]: {res['intent_resolution']['intent']} (Pewność: {res['intent_resolution']['confidence']})")
        print(f"[DEKODOWANIE Bezstratne]: {res['decoded_text']} (Trafienie: {res['exact_match']})")
        print(f"[FAZOR EULERA]: Re={res['phasor']['real']}, Im={res['phasor']['imag']}")
        print(f"[OPÓŹNIENIE]: {res['latency_ms']} ms")

if __name__ == "__main__":
    test_without_nlp()
