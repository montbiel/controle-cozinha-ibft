import {
    Add as AddIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
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
import React, { useEffect, useState } from 'react';
import { estoqueAPI, EstoqueItem } from '../services/api';

const Estoque: React.FC = () => {
    const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingItem, setEditingItem] = useState<EstoqueItem | null>(null);
    const [formData, setFormData] = useState({
        nome: '',
        quantidade: 0,
        unidade: '',
        categoria: '',
    });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        loadEstoque();
    }, []);

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
                        {estoque.map((item) => (
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
                        ))}
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
