import gspread
from oauth2client.service_account import ServiceAccountCredentials
import os
from typing import List, Optional
from datetime import datetime
import pandas as pd
from models import EstoqueItem, Funcionario, PratoDia, CheckInRefeicao

class GoogleSheetsService:
    def __init__(self):
        self.credentials_file = os.getenv("GOOGLE_SHEETS_CREDENTIALS_FILE")
        self.sheet_id = os.getenv("GOOGLE_SHEET_ID")
        self.client = None
        self.sheet = None
        
        if not self.credentials_file or not self.sheet_id:
            raise ValueError("GOOGLE_SHEETS_CREDENTIALS_FILE e GOOGLE_SHEET_ID devem estar definidos no .env")
    
    def _get_client(self):
        """Obtém o cliente do Google Sheets, conectando apenas quando necessário"""
        if self.client is None:
            # Configurar credenciais
            scope = [
                'https://spreadsheets.google.com/feeds',
                'https://www.googleapis.com/auth/drive'
            ]
            
            creds = ServiceAccountCredentials.from_json_keyfile_name(
                self.credentials_file, scope
            )
            
            self.client = gspread.authorize(creds)
            self.sheet = self.client.open_by_key(self.sheet_id)
            
            # Inicializar planilhas se não existirem
            self._initialize_sheets()
        
        return self.client, self.sheet
    
    def _initialize_sheets(self):
        """Inicializar planilhas com cabeçalhos se não existirem"""
        client, sheet = self._get_client()
        sheets_to_create = {
            'Estoque': ['ID', 'Nome', 'Quantidade', 'Unidade', 'Categoria', 'Data Criação', 'Data Atualização'],
            'Funcionarios': ['ID', 'Nome', 'Cargo', 'Ativo', 'Data Criação', 'Data Atualização'],
            'Pratos': ['ID', 'Nome', 'Descrição', 'Data', 'Ativo', 'Data Criação', 'Data Atualização'],
            'CheckIns': ['ID', 'Funcionario ID', 'Funcionario Nome', 'Prato ID', 'Prato Nome', 'Data', 'Horário', 'Data Criação']
        }
        
        for sheet_name, headers in sheets_to_create.items():
            try:
                worksheet = sheet.worksheet(sheet_name)
                # Verificar se já tem dados
                if not worksheet.get_all_values():
                    worksheet.append_row(headers)
            except gspread.WorksheetNotFound:
                worksheet = sheet.add_worksheet(title=sheet_name, rows=1000, cols=len(headers))
                worksheet.append_row(headers)
    
    def _get_next_id(self, worksheet_name: str) -> int:
        """Obter próximo ID disponível para uma planilha"""
        client, sheet = self._get_client()
        worksheet = sheet.worksheet(worksheet_name)
        records = worksheet.get_all_records()
        if not records:
            return 1
        return max(int(record['ID']) for record in records) + 1
    
    def _get_current_timestamp(self) -> str:
        """Obter timestamp atual formatado"""
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Métodos para Estoque
    async def get_estoque(self) -> List[EstoqueItem]:
        """Obter todos os itens do estoque"""
        client, sheet = self._get_client()

        worksheet = sheet.worksheet('Estoque')
        records = worksheet.get_all_records()
        
        estoque_items = []
        for record in records:
            if record.get('ID'):  # Pular linhas vazias
                estoque_items.append(EstoqueItem(
                    id=int(record['ID']),
                    nome=record['Nome'],
                    quantidade=int(record['Quantidade']),
                    unidade=record['Unidade'],
                    categoria=record['Categoria'],
                    data_criacao=record['Data Criação'],
                    data_atualizacao=record['Data Atualização']
                ))
        
        return estoque_items
    
    async def create_estoque_item(self, item_data) -> EstoqueItem:
        """Criar novo item no estoque"""
        client, sheet = self._get_client()

        worksheet = sheet.worksheet('Estoque')
        item_id = self._get_next_id('Estoque')
        timestamp = self._get_current_timestamp()
        
        new_item = EstoqueItem(
            id=item_id,
            nome=item_data.nome,
            quantidade=item_data.quantidade,
            unidade=item_data.unidade,
            categoria=item_data.categoria,
            data_criacao=timestamp,
            data_atualizacao=timestamp
        )
        
        worksheet.append_row([
            new_item.id,
            new_item.nome,
            new_item.quantidade,
            new_item.unidade,
            new_item.categoria,
            new_item.data_criacao,
            new_item.data_atualizacao
        ])
        
        return new_item
    
    async def update_estoque_item(self, item_id: int, item_data) -> EstoqueItem:
        """Atualizar item do estoque"""
        client, sheet = self._get_client()

        worksheet = sheet.worksheet('Estoque')
        records = worksheet.get_all_records()
        
        for i, record in enumerate(records, start=2):  # Começar da linha 2 (pular cabeçalho)
            if int(record['ID']) == item_id:
                # Atualizar apenas campos fornecidos
                if item_data.nome is not None:
                    worksheet.update_cell(i, 2, item_data.nome)
                if item_data.quantidade is not None:
                    worksheet.update_cell(i, 3, item_data.quantidade)
                if item_data.unidade is not None:
                    worksheet.update_cell(i, 4, item_data.unidade)
                if item_data.categoria is not None:
                    worksheet.update_cell(i, 5, item_data.categoria)
                
                worksheet.update_cell(i, 7, self._get_current_timestamp())
                
                # Retornar item atualizado
                updated_record = worksheet.row_values(i)
                return EstoqueItem(
                    id=int(updated_record[0]),
                    nome=updated_record[1],
                    quantidade=int(updated_record[2]),
                    unidade=updated_record[3],
                    categoria=updated_record[4],
                    data_criacao=updated_record[5],
                    data_atualizacao=updated_record[6]
                )
        
        raise ValueError(f"Item com ID {item_id} não encontrado")
    
    async def delete_estoque_item(self, item_id: int):
        """Deletar item do estoque"""
        client, sheet = self._get_client()

        worksheet = sheet.worksheet('Estoque')
        records = worksheet.get_all_records()
        
        for i, record in enumerate(records, start=2):
            if int(record['ID']) == item_id:
                worksheet.delete_rows(i)
                return
        
        raise ValueError(f"Item com ID {item_id} não encontrado")
    
    # Métodos para Funcionários
    async def get_funcionarios(self) -> List[Funcionario]:
        """Obter todos os funcionários"""
        client, sheet = self._get_client()

        worksheet = sheet.worksheet('Funcionarios')
        records = worksheet.get_all_records()
        
        funcionarios = []
        for record in records:
            if record.get('ID'):
                funcionarios.append(Funcionario(
                    id=int(record['ID']),
                    nome=record['Nome'],
                    cargo=record['Cargo'],
                    ativo=record['Ativo'].lower() == 'true',
                    data_criacao=record['Data Criação'],
                    data_atualizacao=record['Data Atualização']
                ))
        
        return funcionarios
    
    async def create_funcionario(self, funcionario_data) -> Funcionario:
        """Criar novo funcionário"""
        client, sheet = self._get_client()

        worksheet = sheet.worksheet('Funcionarios')
        funcionario_id = self._get_next_id('Funcionarios')
        timestamp = self._get_current_timestamp()
        
        new_funcionario = Funcionario(
            id=funcionario_id,
            nome=funcionario_data.nome,
            cargo=funcionario_data.cargo,
            ativo=funcionario_data.ativo,
            data_criacao=timestamp,
            data_atualizacao=timestamp
        )
        
        worksheet.append_row([
            new_funcionario.id,
            new_funcionario.nome,
            new_funcionario.cargo,
            str(new_funcionario.ativo),
            new_funcionario.data_criacao,
            new_funcionario.data_atualizacao
        ])
        
        return new_funcionario
    
    async def update_funcionario(self, funcionario_id: int, funcionario_data) -> Funcionario:
        """Atualizar funcionário"""
        client, sheet = self._get_client()

        worksheet = sheet.worksheet('Funcionarios')
        records = worksheet.get_all_records()
        
        for i, record in enumerate(records, start=2):
            if int(record['ID']) == funcionario_id:
                if funcionario_data.nome is not None:
                    worksheet.update_cell(i, 2, funcionario_data.nome)
                if funcionario_data.cargo is not None:
                    worksheet.update_cell(i, 3, funcionario_data.cargo)
                if funcionario_data.ativo is not None:
                    worksheet.update_cell(i, 4, str(funcionario_data.ativo))
                
                worksheet.update_cell(i, 6, self._get_current_timestamp())
                
                updated_record = worksheet.row_values(i)
                return Funcionario(
                    id=int(updated_record[0]),
                    nome=updated_record[1],
                    cargo=updated_record[2],
                    ativo=updated_record[3].lower() == 'true',
                    data_criacao=updated_record[4],
                    data_atualizacao=updated_record[5]
                )
        
        raise ValueError(f"Funcionário com ID {funcionario_id} não encontrado")
    
    async def delete_funcionario(self, funcionario_id: int):
        """Deletar funcionário"""
        client, sheet = self._get_client()

        worksheet = sheet.worksheet('Funcionarios')
        records = worksheet.get_all_records()
        
        for i, record in enumerate(records, start=2):
            if int(record['ID']) == funcionario_id:
                worksheet.delete_rows(i)
                return
        
        raise ValueError(f"Funcionário com ID {funcionario_id} não encontrado")
    
    # Métodos para Pratos do Dia
    async def get_pratos(self) -> List[PratoDia]:
        """Obter todos os pratos do dia"""
        client, sheet = self._get_client()

        worksheet = sheet.worksheet('Pratos')
        records = worksheet.get_all_records()
        
        pratos = []
        for record in records:
            if record.get('ID'):
                pratos.append(PratoDia(
                    id=int(record['ID']),
                    nome=record['Nome'],
                    descricao=record['Descrição'],
                    data=record['Data'],
                    ativo=record['Ativo'].lower() == 'true',
                    data_criacao=record['Data Criação'],
                    data_atualizacao=record['Data Atualização']
                ))
        
        return pratos
    
    async def create_prato(self, prato_data) -> PratoDia:
        """Criar novo prato do dia"""
        client, sheet = self._get_client()

        worksheet = sheet.worksheet('Pratos')
        prato_id = self._get_next_id('Pratos')
        timestamp = self._get_current_timestamp()
        
        new_prato = PratoDia(
            id=prato_id,
            nome=prato_data.nome,
            descricao=prato_data.descricao,
            data=prato_data.data,
            ativo=prato_data.ativo,
            data_criacao=timestamp,
            data_atualizacao=timestamp
        )
        
        worksheet.append_row([
            new_prato.id,
            new_prato.nome,
            new_prato.descricao,
            new_prato.data,
            str(new_prato.ativo),
            new_prato.data_criacao,
            new_prato.data_atualizacao
        ])
        
        return new_prato
    
    async def update_prato(self, prato_id: int, prato_data) -> PratoDia:
        """Atualizar prato do dia"""
        client, sheet = self._get_client()

        worksheet = sheet.worksheet('Pratos')
        records = worksheet.get_all_records()
        
        for i, record in enumerate(records, start=2):
            if int(record['ID']) == prato_id:
                if prato_data.nome is not None:
                    worksheet.update_cell(i, 2, prato_data.nome)
                if prato_data.descricao is not None:
                    worksheet.update_cell(i, 3, prato_data.descricao)
                if prato_data.data is not None:
                    worksheet.update_cell(i, 4, prato_data.data)
                if prato_data.ativo is not None:
                    worksheet.update_cell(i, 5, str(prato_data.ativo))
                
                worksheet.update_cell(i, 7, self._get_current_timestamp())
                
                updated_record = worksheet.row_values(i)
                return PratoDia(
                    id=int(updated_record[0]),
                    nome=updated_record[1],
                    descricao=updated_record[2],
                    data=updated_record[3],
                    ativo=updated_record[4].lower() == 'true',
                    data_criacao=updated_record[5],
                    data_atualizacao=updated_record[6]
                )
        
        raise ValueError(f"Prato com ID {prato_id} não encontrado")
    
    async def delete_prato(self, prato_id: int):
        """Deletar prato do dia"""
        client, sheet = self._get_client()

        worksheet = sheet.worksheet('Pratos')
        records = worksheet.get_all_records()
        
        for i, record in enumerate(records, start=2):
            if int(record['ID']) == prato_id:
                worksheet.delete_rows(i)
                return
        
        raise ValueError(f"Prato com ID {prato_id} não encontrado")
    
    # Métodos para Check-ins de Refeições
    async def get_checkins(self) -> List[CheckInRefeicao]:
        """Obter todos os check-ins de refeições"""
        client, sheet = self._get_client()

        worksheet = sheet.worksheet('CheckIns')
        records = worksheet.get_all_records()
        
        checkins = []
        for record in records:
            if record.get('ID'):
                checkins.append(CheckInRefeicao(
                    id=int(record['ID']),
                    funcionario_id=int(record['Funcionario ID']),
                    funcionario_nome=record['Funcionario Nome'],
                    prato_id=int(record['Prato ID']),
                    prato_nome=record['Prato Nome'],
                    data=record['Data'],
                    horario=record['Horário'],
                    data_criacao=record['Data Criação']
                ))
        
        return checkins
    
    async def create_checkin(self, checkin_data) -> CheckInRefeicao:
        """Criar novo check-in de refeição"""
        client, sheet = self._get_client()

        worksheet = sheet.worksheet('CheckIns')
        checkin_id = self._get_next_id('CheckIns')
        timestamp = self._get_current_timestamp()
        
        # Buscar dados do funcionário e prato
        funcionarios = await self.get_funcionarios()
        pratos = await self.get_pratos()
        
        funcionario = next((f for f in funcionarios if f.id == checkin_data.funcionario_id), None)
        prato = next((p for p in pratos if p.id == checkin_data.prato_id), None)
        
        if not funcionario:
            raise ValueError(f"Funcionário com ID {checkin_data.funcionario_id} não encontrado")
        if not prato:
            raise ValueError(f"Prato com ID {checkin_data.prato_id} não encontrado")
        
        new_checkin = CheckInRefeicao(
            id=checkin_id,
            funcionario_id=checkin_data.funcionario_id,
            funcionario_nome=funcionario.nome,
            prato_id=checkin_data.prato_id,
            prato_nome=prato.nome,
            data=checkin_data.data,
            horario=checkin_data.horario,
            data_criacao=timestamp
        )
        
        worksheet.append_row([
            new_checkin.id,
            new_checkin.funcionario_id,
            new_checkin.funcionario_nome,
            new_checkin.prato_id,
            new_checkin.prato_nome,
            new_checkin.data,
            new_checkin.horario,
            new_checkin.data_criacao
        ])
        
        return new_checkin
    
    async def get_checkins_por_data(self, data: str) -> List[CheckInRefeicao]:
        """Obter check-ins de uma data específica"""
        checkins = await self.get_checkins()
        return [checkin for checkin in checkins if checkin.data == data]
