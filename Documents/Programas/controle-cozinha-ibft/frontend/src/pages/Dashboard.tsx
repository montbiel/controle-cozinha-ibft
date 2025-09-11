import {
    CheckCircle as CheckCircleIcon,
    Inventory as InventoryIcon,
    People as PeopleIcon,
    Restaurant as RestaurantIcon,
    TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import {
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { checkinAPI, CheckInRefeicao, estoqueAPI, EstoqueItem, Funcionario, funcionariosAPI, PratoDia, pratosAPI } from '../services/api';

const Dashboard: React.FC = () => {
    const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [pratos, setPratos] = useState<PratoDia[]>([]);
    const [checkinsHoje, setCheckinsHoje] = useState<CheckInRefeicao[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [estoqueRes, funcionariosRes, pratosRes, checkinsRes] = await Promise.all([
                    estoqueAPI.getAll(),
                    funcionariosAPI.getAll(),
                    pratosAPI.getAll(),
                    checkinAPI.getToday(),
                ]);

                setEstoque(estoqueRes.data);
                setFuncionarios(funcionariosRes.data);
                setPratos(pratosRes.data);
                setCheckinsHoje(checkinsRes.data);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const itensEstoqueBaixo = estoque.filter(item => item.quantidade < 10);
    const funcionariosAtivos = funcionarios.filter(f => f.ativo);
    const pratosAtivos = pratos.filter(p => p.ativo);
    const hoje = new Date().toLocaleDateString('pt-BR');

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <Typography>Carregando...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Dashboard - {hoje}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Cards de Resumo */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <InventoryIcon color="primary" sx={{ mr: 2 }} />
                                <Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        Itens no Estoque
                                    </Typography>
                                    <Typography variant="h4">
                                        {estoque.length}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <PeopleIcon color="primary" sx={{ mr: 2 }} />
                                <Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        Funcionários Ativos
                                    </Typography>
                                    <Typography variant="h4">
                                        {funcionariosAtivos.length}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <RestaurantIcon color="primary" sx={{ mr: 2 }} />
                                <Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        Pratos Ativos
                                    </Typography>
                                    <Typography variant="h4">
                                        {pratosAtivos.length}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <CheckCircleIcon color="primary" sx={{ mr: 2 }} />
                                <Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        Check-ins Hoje
                                    </Typography>
                                    <Typography variant="h4">
                                        {checkinsHoje.length}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Itens com Estoque Baixo */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            <TrendingDownIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Estoque Baixo
                        </Typography>
                        {itensEstoqueBaixo.length === 0 ? (
                            <Typography color="textSecondary">
                                Todos os itens estão com estoque adequado
                            </Typography>
                        ) : (
                            <List dense>
                                {itensEstoqueBaixo.map((item) => (
                                    <ListItem key={item.id}>
                                        <ListItemText
                                            primary={item.nome}
                                            secondary={`${item.quantidade} ${item.unidade}`}
                                        />
                                        <Chip
                                            label="Baixo"
                                            color="warning"
                                            size="small"
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </CardContent>
                </Card>

                {/* Check-ins de Hoje */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Check-ins de Hoje
                        </Typography>
                        {checkinsHoje.length === 0 ? (
                            <Typography color="textSecondary">
                                Nenhum check-in registrado hoje
                            </Typography>
                        ) : (
                            <List dense>
                                {checkinsHoje.map((checkin) => (
                                    <React.Fragment key={checkin.id}>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircleIcon color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={checkin.funcionario_nome}
                                                secondary={`${checkin.prato_nome} - ${checkin.horario}`}
                                            />
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default Dashboard;
