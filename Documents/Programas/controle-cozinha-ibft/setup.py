#!/usr/bin/env python3
"""
Script de configuração simples para o sistema de Controle de Cozinha IBFT
"""

import subprocess
import sys
from pathlib import Path

def run_command(command, cwd=None):
    """Executa um comando e retorna o resultado"""
    try:
        result = subprocess.run(command, shell=True, check=True, cwd=cwd, capture_output=True, text=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def main():
    """Função principal de configuração"""
    print("🚀 Configurando Sistema de Controle de Cozinha IBFT")
    print("=" * 50)
    
    # Instalar dependências Python
    print("📦 Instalando dependências Python...")
    success, output = run_command("pip install -r requirements.txt")
    if not success:
        print(f"❌ Erro ao instalar dependências Python: {output}")
        return False
    print("✅ Dependências Python instaladas")
    
    # Instalar dependências Node.js
    print("📦 Instalando dependências Node.js...")
    frontend_path = Path("frontend")
    if not frontend_path.exists():
        print("❌ Pasta frontend não encontrada")
        return False
    
    success, output = run_command("npm install", cwd=frontend_path)
    if not success:
        print(f"❌ Erro ao instalar dependências Node.js: {output}")
        return False
    print("✅ Dependências Node.js instaladas")
    
    # Criar arquivos .env
    print("📝 Criando arquivos de configuração...")
    if Path("env.example").exists() and not Path(".env").exists():
        run_command("cp env.example .env")
        print("✅ Arquivo .env criado (backend)")
    
    if Path("frontend/env.example").exists() and not Path("frontend/.env").exists():
        run_command("cp frontend/env.example frontend/.env")
        print("✅ Arquivo .env criado (frontend)")
    
    print("\n" + "=" * 50)
    print("✅ Configuração concluída!")
    print("\n📋 Próximos passos:")
    print("1. Configure suas credenciais do Google Sheets no arquivo .env")
    print("2. Execute: python main.py")
    print("3. Execute: cd frontend && npm start")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
