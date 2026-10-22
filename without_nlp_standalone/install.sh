#!/usr/bin/env bash
# ================================================================================
#  SKRYPT INSTALACYJNY SILNIKA WITHOUT_NLP v8.5.5
#  Autorzy: Astyria, Alex, Aurelius (SVL Kernel)
# ================================================================================

set -e

echo "================================================================================"
echo "    INSTALACJA LOKALNEGO UNIWERSALNEGO SILNIKA WITHOUT_NLP (v8.5.5)"
echo "================================================================================"

python3 -m pip install --upgrade pip
python3 setup.py build
python3 setup.py install --user

echo ""
echo "[OK] Instalacja zakończona sukcesem!"
echo "Uruchom test: python3 test_engine.py"
echo "================================================================================"
