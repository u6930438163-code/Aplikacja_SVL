import json
import sys
from kernel.svl_kernel_core import SVLStudioKernel

def main():
    print("Inicjalizacja Nowego Systemu...")
    kernel = SVLStudioKernel(sciezka_pliku="/Nowy_system/kernel/svl_kernel_core.py")
    print(f"System operacyjny: {kernel.sys_version}")
    print("Gotowy do pracy.")

if __name__ == "__main__":
    main()
