import {
    Add as AddIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    FilterList as FilterIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { estoqueAPI, EstoqueItem } from '../services/api';

const Estoque: React.FC = () => {
    const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
    const [filteredEstoque, setFilteredEstoque] = useState<EstoqueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingItem, setEditingItem] = useState<EstoqueItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [formData, setFormData] = useState({
        nome: '',
        quantidade: 0,
        unidade: '',
        categoria: '',
    });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Função para remover acentos e normalizar texto para busca
    const normalizeText = (text: string): string => {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    };

    // Função para aplicar filtros
    const applyFilters = useCallback(() => {
        let filtered = [...estoque];

        // Filtro por categoria
        if (selectedCategory) {
            filtered = filtered.filter(item => item.categoria === selectedCategory);
        }

        // Filtro por busca
        if (searchTerm) {
            const normalizedSearchTerm = normalizeText(searchTerm);
            filtered = filtered.filter(item =>
                normalizeText(item.nome).includes(normalizedSearchTerm)
            );
        }

        setFilteredEstoque(filtered);
    }, [estoque, searchTerm, selectedCategory]);

    const loadEstoque = async () => {
        try {
            const response = await estoqueAPI.getAll();
            setEstoque(response.data);
        } catch (error) {
            console.error('Erro ao carregar estoque:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEstoque();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    // Função para obter categorias únicas
    const getUniqueCategories = (): string[] => {
        const categories = estoque.map(item => item.categoria);
        return Array.from(new Set(categories)).sort();
    };

    const handleOpenDialog = (item?: EstoqueItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                nome: item.nome,
                quantidade: item.quantidade,
                unidade: item.unidade,
                categoria: item.categoria,
            });
        } else {
            setEditingItem(null);
            setFormData({
                nome: '',
                quantidade: 0,
                unidade: '',
                categoria: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingItem(null);
        setFormData({
            nome: '',
            quantidade: 0,
            unidade: '',
            categoria: '',
        });
    };

    const handleSubmit = async () => {
        try {
            if (editingItem) {
                await estoqueAPI.update(editingItem.id, formData);
            } else {
                await estoqueAPI.create(formData);
            }
            await loadEstoque();
            handleCloseDialog();
        } catch (error) {
            console.error('Erro ao salvar item:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este item?')) {
            try {
                await estoqueAPI.delete(id);
                await loadEstoque();
            } catch (error) {
                console.error('Erro ao excluir item:', error);
            }
        }
    };

    const getStatusColor = (quantidade: number) => {
        if (quantidade < 5) return 'error';
        if (quantidade < 10) return 'warning';
        return 'success';
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <Typography>Carregando...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Estoque</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    size={isMobile ? 'small' : 'medium'}
                >
                    Adicionar Item
                </Button>
            </Box>

            {/* Filtros e Busca */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box
                    display="flex"
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    gap={2}
                    alignItems="center"
                >
                    <Box flex={1} width="100%">
                        <TextField
                            fullWidth
                            label=""
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            placeholder="Digite o nome do item..."
                        />
                    </Box>
                    <Box flex={1} width="100%">
                        <FormControl fullWidth>
                            <Select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                displayEmpty
                                startAdornment={
                                    <InputAdornment position="start">
                                        <FilterIcon />
                                    </InputAdornment>
                                }
                                renderValue={(selected) => {
                                    if (!selected) {
                                        return <span style={{ color: '#9e9e9e' }}>Filtrar por categoria</span>;
                                    }
                                    return selected;
                                }}
                            >
                                <MenuItem value="">Todas as categorias</MenuItem>
                                {getUniqueCategories().map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <Box>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('');
                            }}
                            size="small"
                        >
                            Limpar Filtros
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nome</TableCell>
                            <TableCell align="center">Quantidade</TableCell>
                            <TableCell align="center">Unidade</TableCell>
                            <TableCell align="center">Categoria</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredEstoque.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography variant="body2" color="text.secondary">
                                        {searchTerm || selectedCategory
                                            ? 'Nenhum item encontrado com os filtros aplicados'
                                            : 'Nenhum item no estoque'
                                        }
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEstoque.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.nome}</TableCell>
                                    <TableCell align="center">{item.quantidade}</TableCell>
                                    <TableCell align="center">{item.unidade}</TableCell>
                                    <TableCell align="center">{item.categoria}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={item.quantidade < 10 ? 'Baixo' : 'Normal'}
                                            color={getStatusColor(item.quantidade)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDialog(item)}
                                            color="primary"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(item.id)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog para Adicionar/Editar */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle>
                    {editingItem ? 'Editar Item' : 'Adicionar Item'}
                    <IconButton
                        onClick={handleCloseDialog}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Nome do Item"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Quantidade"
                            type="number"
                            value={formData.quantidade}
                            onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 0 })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Unidade"
                            value={formData.unidade}
                            onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                            margin="normal"
                            placeholder="Ex: kg, litros, unidades"
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Categoria</InputLabel>
                            <Select
                                value={formData.categoria}
                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                label="Categoria"
                            >
                                <MenuItem value="Carnes">Carnes</MenuItem>
                                <MenuItem value="Verduras">Verduras</MenuItem>
                                <MenuItem value="Legumes">Legumes</MenuItem>
                                <MenuItem value="Grãos">Grãos</MenuItem>
                                <MenuItem value="Laticínios">Laticínios</MenuItem>
                                <MenuItem value="Temperos">Temperos</MenuItem>
                                <MenuItem value="Outros">Outros</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingItem ? 'Atualizar' : 'Adicionar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* FAB para mobile */}
            {isMobile && (
                <Fab
                    color="primary"
                    aria-label="add"
                    sx={{ position: 'fixed', bottom: 16, right: 16 }}
                    onClick={() => handleOpenDialog()}
                >
                    <AddIcon />
                </Fab>
            )}
        </Box>
    );
};

export default Estoque;
