#!/usr/bin/env python3
"""
Script simples para iniciar o ambiente de desenvolvimento
"""

import subprocess
import sys
import time
import signal
from pathlib import Path

def start_backend():
    """Inicia o servidor backend"""
    print("🚀 Iniciando backend...")
    return subprocess.Popen([sys.executable, "main.py"])

def start_frontend():
    """Inicia o servidor frontend"""
    print("🚀 Iniciando frontend...")
    return subprocess.Popen(["npm", "start"], cwd="frontend")

def main():
    """Função principal"""
    print("🚀 Iniciando sistema...")
    print("=" * 40)
    
    # Verificar arquivos necessários
    if not Path("requirements.txt").exists():
        print("❌ requirements.txt não encontrado")
        return False
        
    if not Path("frontend/package.json").exists():
        print("❌ frontend/package.json não encontrado")
        return False
    
    # Iniciar servidores
    backend = start_backend()
    time.sleep(2)
    frontend = start_frontend()
    
    print("\n✅ Sistema rodando!")
    print("🌐 Frontend: http://localhost:3000")
    print("🌐 Backend: http://localhost:8000")
    print("\nPressione Ctrl+C para parar")
    
    try:
        # Aguardar interrupção
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Parando servidores...")
        backend.terminate()
        frontend.terminate()
        print("✅ Parado!")
    
    return True

if __name__ == "__main__":
    main()
