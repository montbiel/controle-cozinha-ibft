from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from google_sheets_service import GoogleSheetsService
from models import EstoqueItem, Funcionario, PratoDia, CheckInRefeicao

# Carregar variáveis de ambiente
load_dotenv()

app = FastAPI(title="Controle de Cozinha IBFT", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar domínios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar serviço do Google Sheets
google_sheets = GoogleSheetsService()

# Modelos Pydantic para validação
class EstoqueItemCreate(BaseModel):
    nome: str
    quantidade: int
    unidade: str
    categoria: str

class EstoqueItemUpdate(BaseModel):
    nome: Optional[str] = None
    quantidade: Optional[int] = None
    unidade: Optional[str] = None
    categoria: Optional[str] = None

class FuncionarioCreate(BaseModel):
    nome: str
    cargo: str
    ativo: bool = True

class FuncionarioUpdate(BaseModel):
    nome: Optional[str] = None
    cargo: Optional[str] = None
    ativo: Optional[bool] = None

class PratoDiaCreate(BaseModel):
    nome: str
    descricao: str
    data: str
    ativo: bool = True

class PratoDiaUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    data: Optional[str] = None
    ativo: Optional[bool] = None

class CheckInRefeicaoCreate(BaseModel):
    funcionario_id: int
    prato_id: int
    data: str
    horario: str

# Rotas para Estoque
@app.get("/api/estoque", response_model=List[EstoqueItem])
async def get_estoque():
    """Obter todos os itens do estoque"""
    try:
        return await google_sheets.get_estoque()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/estoque", response_model=EstoqueItem)
async def create_estoque_item(item: EstoqueItemCreate):
    """Adicionar novo item ao estoque"""
    try:
        return await google_sheets.create_estoque_item(item)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/estoque/{item_id}", response_model=EstoqueItem)
async def update_estoque_item(item_id: int, item: EstoqueItemUpdate):
    """Atualizar item do estoque"""
    try:
        return await google_sheets.update_estoque_item(item_id, item)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/estoque/{item_id}")
async def delete_estoque_item(item_id: int):
    """Remover item do estoque"""
    try:
        await google_sheets.delete_estoque_item(item_id)
        return {"message": "Item removido com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Rotas para Funcionários
@app.get("/api/funcionarios", response_model=List[Funcionario])
async def get_funcionarios():
    """Obter todos os funcionários"""
    try:
        return await google_sheets.get_funcionarios()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/funcionarios", response_model=Funcionario)
async def create_funcionario(funcionario: FuncionarioCreate):
    """Adicionar novo funcionário"""
    try:
        return await google_sheets.create_funcionario(funcionario)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/funcionarios/{funcionario_id}", response_model=Funcionario)
async def update_funcionario(funcionario_id: int, funcionario: FuncionarioUpdate):
    """Atualizar funcionário"""
    try:
        return await google_sheets.update_funcionario(funcionario_id, funcionario)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/funcionarios/{funcionario_id}")
async def delete_funcionario(funcionario_id: int):
    """Remover funcionário"""
    try:
        await google_sheets.delete_funcionario(funcionario_id)
        return {"message": "Funcionário removido com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Rotas para Pratos do Dia
@app.get("/api/pratos", response_model=List[PratoDia])
async def get_pratos():
    """Obter todos os pratos do dia"""
    try:
        return await google_sheets.get_pratos()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pratos", response_model=PratoDia)
async def create_prato(prato: PratoDiaCreate):
    """Adicionar novo prato do dia"""
    try:
        return await google_sheets.create_prato(prato)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/pratos/{prato_id}", response_model=PratoDia)
async def update_prato(prato_id: int, prato: PratoDiaUpdate):
    """Atualizar prato do dia"""
    try:
        return await google_sheets.update_prato(prato_id, prato)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/pratos/{prato_id}")
async def delete_prato(prato_id: int):
    """Remover prato do dia"""
    try:
        await google_sheets.delete_prato(prato_id)
        return {"message": "Prato removido com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Rotas para Check-in de Refeições
@app.get("/api/checkins", response_model=List[CheckInRefeicao])
async def get_checkins():
    """Obter todos os check-ins de refeições"""
    try:
        return await google_sheets.get_checkins()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/checkins", response_model=CheckInRefeicao)
async def create_checkin(checkin: CheckInRefeicaoCreate):
    """Registrar check-in de refeição"""
    try:
        return await google_sheets.create_checkin(checkin)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/checkins/hoje")
async def get_checkins_hoje():
    """Obter check-ins do dia atual"""
    try:
        from datetime import datetime
        hoje = datetime.now().strftime("%Y-%m-%d")
        return await google_sheets.get_checkins_por_data(hoje)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Rota de saúde
@app.get("/api/health")
async def health_check():
    """Verificar saúde da API"""
    return {"status": "ok", "message": "API funcionando corretamente"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=os.getenv("DEBUG", "True").lower() == "true"
    )
