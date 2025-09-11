from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EstoqueItem(BaseModel):
    id: int
    nome: str
    quantidade: int
    unidade: str
    categoria: str
    data_criacao: str
    data_atualizacao: str

class Funcionario(BaseModel):
    id: int
    nome: str
    cargo: str
    ativo: bool
    data_criacao: str
    data_atualizacao: str

class PratoDia(BaseModel):
    id: int
    nome: str
    descricao: str
    data: str
    ativo: bool
    data_criacao: str
    data_atualizacao: str

class CheckInRefeicao(BaseModel):
    id: int
    funcionario_id: int
    funcionario_nome: str
    prato_id: int
    prato_nome: str
    data: str
    horario: str
    data_criacao: str
