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
    FormControlLabel,
    IconButton,
    Paper,
    Switch,
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
import { Funcionario, funcionariosAPI } from '../services/api';

const Funcionarios: React.FC = () => {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
    const [formData, setFormData] = useState({
        nome: '',
        cargo: '',
        ativo: true,
    });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        loadFuncionarios();
    }, []);

    const loadFuncionarios = async () => {
        try {
            const response = await funcionariosAPI.getAll();
            setFuncionarios(response.data);
        } catch (error) {
            console.error('Erro ao carregar funcionários:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (funcionario?: Funcionario) => {
        if (funcionario) {
            setEditingFuncionario(funcionario);
            setFormData({
                nome: funcionario.nome,
                cargo: funcionario.cargo,
                ativo: funcionario.ativo,
            });
        } else {
            setEditingFuncionario(null);
            setFormData({
                nome: '',
                cargo: '',
                ativo: true,
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingFuncionario(null);
        setFormData({
            nome: '',
            cargo: '',
            ativo: true,
        });
    };

    const handleSubmit = async () => {
        try {
            if (editingFuncionario) {
                await funcionariosAPI.update(editingFuncionario.id, formData);
            } else {
                await funcionariosAPI.create(formData);
            }
            await loadFuncionarios();
            handleCloseDialog();
        } catch (error) {
            console.error('Erro ao salvar funcionário:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
            try {
                await funcionariosAPI.delete(id);
                await loadFuncionarios();
            } catch (error) {
                console.error('Erro ao excluir funcionário:', error);
            }
        }
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
                <Typography variant="h4">Funcionários</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    size={isMobile ? 'small' : 'medium'}
                >
                    Adicionar Funcionário
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nome</TableCell>
                            <TableCell align="center">Cargo</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {funcionarios.map((funcionario) => (
                            <TableRow key={funcionario.id}>
                                <TableCell>{funcionario.nome}</TableCell>
                                <TableCell align="center">{funcionario.cargo}</TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={funcionario.ativo ? 'Ativo' : 'Inativo'}
                                        color={funcionario.ativo ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDialog(funcionario)}
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(funcionario.id)}
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
                    {editingFuncionario ? 'Editar Funcionário' : 'Adicionar Funcionário'}
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
                            label="Nome do Funcionário"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Cargo"
                            value={formData.cargo}
                            onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                            margin="normal"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.ativo}
                                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                                />
                            }
                            label="Funcionário Ativo"
                            sx={{ mt: 2 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingFuncionario ? 'Atualizar' : 'Adicionar'}
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

export default Funcionarios;
