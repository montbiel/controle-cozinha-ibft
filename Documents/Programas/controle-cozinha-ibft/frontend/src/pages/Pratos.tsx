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
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { PratoDia, pratosAPI } from '../services/api';

const Pratos: React.FC = () => {
    const [pratos, setPratos] = useState<PratoDia[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingPrato, setEditingPrato] = useState<PratoDia | null>(null);
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        data: dayjs().format('YYYY-MM-DD'),
        ativo: true,
    });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        loadPratos();
    }, []);

    const loadPratos = async () => {
        try {
            const response = await pratosAPI.getAll();
            setPratos(response.data);
        } catch (error) {
            console.error('Erro ao carregar pratos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (prato?: PratoDia) => {
        if (prato) {
            setEditingPrato(prato);
            setFormData({
                nome: prato.nome,
                descricao: prato.descricao,
                data: prato.data,
                ativo: prato.ativo,
            });
        } else {
            setEditingPrato(null);
            setFormData({
                nome: '',
                descricao: '',
                data: dayjs().format('YYYY-MM-DD'),
                ativo: true,
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingPrato(null);
        setFormData({
            nome: '',
            descricao: '',
            data: dayjs().format('YYYY-MM-DD'),
            ativo: true,
        });
    };

    const handleSubmit = async () => {
        try {
            if (editingPrato) {
                await pratosAPI.update(editingPrato.id, formData);
            } else {
                await pratosAPI.create(formData);
            }
            await loadPratos();
            handleCloseDialog();
        } catch (error) {
            console.error('Erro ao salvar prato:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este prato?')) {
            try {
                await pratosAPI.delete(id);
                await loadPratos();
            } catch (error) {
                console.error('Erro ao excluir prato:', error);
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
                <Typography variant="h4">Pratos do Dia</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    size={isMobile ? 'small' : 'medium'}
                >
                    Adicionar Prato
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nome</TableCell>
                            <TableCell>Descrição</TableCell>
                            <TableCell align="center">Data</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pratos.map((prato) => (
                            <TableRow key={prato.id}>
                                <TableCell>{prato.nome}</TableCell>
                                <TableCell>
                                    {prato.descricao.length > 50
                                        ? `${prato.descricao.substring(0, 50)}...`
                                        : prato.descricao
                                    }
                                </TableCell>
                                <TableCell align="center">
                                    {dayjs(prato.data).format('DD/MM/YYYY')}
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={prato.ativo ? 'Ativo' : 'Inativo'}
                                        color={prato.ativo ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDialog(prato)}
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(prato.id)}
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
                    {editingPrato ? 'Editar Prato' : 'Adicionar Prato'}
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
                            label="Nome do Prato"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Descrição"
                            multiline
                            rows={3}
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                            margin="normal"
                        />
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                            <DatePicker
                                label="Data do Prato"
                                value={dayjs(formData.data)}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        setFormData({ ...formData, data: newValue.format('YYYY-MM-DD') });
                                    }
                                }}
                                sx={{ mt: 2, width: '100%' }}
                            />
                        </LocalizationProvider>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.ativo}
                                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                                />
                            }
                            label="Prato Ativo"
                            sx={{ mt: 2 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingPrato ? 'Atualizar' : 'Adicionar'}
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

export default Pratos;
