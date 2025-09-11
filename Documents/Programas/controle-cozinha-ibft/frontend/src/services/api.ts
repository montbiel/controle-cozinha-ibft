import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interfaces para tipagem
export interface EstoqueItem {
    id: number;
    nome: string;
    quantidade: number;
    unidade: string;
    categoria: string;
    data_criacao: string;
    data_atualizacao: string;
}

export interface Funcionario {
    id: number;
    nome: string;
    cargo: string;
    ativo: boolean;
    data_criacao: string;
    data_atualizacao: string;
}

export interface PratoDia {
    id: number;
    nome: string;
    descricao: string;
    data: string;
    ativo: boolean;
    data_criacao: string;
    data_atualizacao: string;
}

export interface CheckInRefeicao {
    id: number;
    funcionario_id: number;
    funcionario_nome: string;
    prato_id: number;
    prato_nome: string;
    data: string;
    horario: string;
    data_criacao: string;
}

// APIs para Estoque
export const estoqueAPI = {
    getAll: () => api.get<EstoqueItem[]>('/estoque'),
    create: (data: Omit<EstoqueItem, 'id' | 'data_criacao' | 'data_atualizacao'>) =>
        api.post<EstoqueItem>('/estoque', data),
    update: (id: number, data: Partial<Omit<EstoqueItem, 'id' | 'data_criacao' | 'data_atualizacao'>>) =>
        api.put<EstoqueItem>(`/estoque/${id}`, data),
    delete: (id: number) => api.delete(`/estoque/${id}`),
};

// APIs para Funcionários
export const funcionariosAPI = {
    getAll: () => api.get<Funcionario[]>('/funcionarios'),
    create: (data: Omit<Funcionario, 'id' | 'data_criacao' | 'data_atualizacao'>) =>
        api.post<Funcionario>('/funcionarios', data),
    update: (id: number, data: Partial<Omit<Funcionario, 'id' | 'data_criacao' | 'data_atualizacao'>>) =>
        api.put<Funcionario>(`/funcionarios/${id}`, data),
    delete: (id: number) => api.delete(`/funcionarios/${id}`),
};

// APIs para Pratos do Dia
export const pratosAPI = {
    getAll: () => api.get<PratoDia[]>('/pratos'),
    create: (data: Omit<PratoDia, 'id' | 'data_criacao' | 'data_atualizacao'>) =>
        api.post<PratoDia>('/pratos', data),
    update: (id: number, data: Partial<Omit<PratoDia, 'id' | 'data_criacao' | 'data_atualizacao'>>) =>
        api.put<PratoDia>(`/pratos/${id}`, data),
    delete: (id: number) => api.delete(`/pratos/${id}`),
};

// APIs para Check-ins
export const checkinAPI = {
    getAll: () => api.get<CheckInRefeicao[]>('/checkins'),
    create: (data: Omit<CheckInRefeicao, 'id' | 'funcionario_nome' | 'prato_nome' | 'data_criacao'>) =>
        api.post<CheckInRefeicao>('/checkins', data),
    getToday: () => api.get<CheckInRefeicao[]>('/checkins/hoje'),
};

export default api;
