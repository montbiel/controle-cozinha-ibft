# Controle de Cozinha IBFT

Sistema simples para controle de estoque de comidas, funcionários, pratos do dia e check-in de refeições, integrado com Google Sheets.

## 🚀 Funcionalidades

- **Gestão de Estoque**: Adicionar, editar e remover itens do estoque
- **Gestão de Funcionários**: Cadastro de funcionários
- **Pratos do Dia**: Gerenciamento de pratos disponíveis
- **Check-in de Refeições**: Registro de quem comeu o quê e quando
- **Dashboard**: Visão geral com estatísticas
- **Interface Mobile**: Otimizada para celular
- **Google Sheets**: Dados armazenados em planilhas

## 🛠️ Tecnologias

- **Backend**: Python + FastAPI + Google Sheets API
- **Frontend**: React + TypeScript + Material-UI

## ⚙️ Configuração Rápida

### 1. Configurar Google Sheets

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto e habilite a Google Sheets API
3. Crie uma conta de serviço e baixe o arquivo JSON
4. Crie uma planilha no Google Sheets e compartilhe com o email da conta de serviço
5. Copie o ID da planilha da URL

### 2. Instalar e Configurar

```bash
# Instalar dependências Python
pip install -r requirements.txt

# Instalar dependências React
cd frontend
npm install

# Configurar variáveis de ambiente
cp env.example .env
```

Edite o arquivo `.env`:
```env
GOOGLE_SHEETS_CREDENTIALS_FILE=caminho/para/credentials.json
GOOGLE_SHEET_ID=seu_google_sheet_id
```

### 3. Executar

```bash
# Terminal 1 - Backend
python main.py

# Terminal 2 - Frontend
cd frontend
npm start
```

Acesse: http://localhost:3000

## 📱 Uso

O sistema é otimizado para celular:
- Menu lateral que vira drawer no mobile
- Botões grandes para touch
- Interface responsiva
- FAB para ações principais

## 📊 Estrutura das Planilhas

O sistema cria automaticamente 4 planilhas:
- **Estoque**: Itens e quantidades
- **Funcionarios**: Lista de funcionários
- **Pratos**: Pratos do dia
- **CheckIns**: Registros de refeições
