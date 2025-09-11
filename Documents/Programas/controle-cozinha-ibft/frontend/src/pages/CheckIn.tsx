import {
    Add as AddIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import {
    Alert,
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
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { checkinAPI, CheckInRefeicao, Funcionario, funcionariosAPI, PratoDia, pratosAPI } from '../services/api';

const CheckIn: React.FC = () => {
    const [checkins, setCheckins] = useState<CheckInRefeicao[]>([]);
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [pratos, setPratos] = useState<PratoDia[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        funcionario_id: 0,
        prato_id: 0,
        data: dayjs().format('YYYY-MM-DD'),
        horario: dayjs().format('HH:mm'),
    });
    const [successMessage, setSuccessMessage] = useState('');

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [checkinsRes, funcionariosRes, pratosRes] = await Promise.all([
                checkinAPI.getAll(),
                funcionariosAPI.getAll(),
                pratosAPI.getAll(),
            ]);

            setCheckins(checkinsRes.data);
            setFuncionarios(funcionariosRes.data.filter(f => f.ativo));
            setPratos(pratosRes.data.filter(p => p.ativo));
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = () => {
        setFormData({
            funcionario_id: 0,
            prato_id: 0,
            data: dayjs().format('YYYY-MM-DD'),
            horario: dayjs().format('HH:mm'),
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFormData({
            funcionario_id: 0,
            prato_id: 0,
            data: dayjs().format('YYYY-MM-DD'),
            horario: dayjs().format('HH:mm'),
        });
    };

    const handleSubmit = async () => {
        if (formData.funcionario_id === 0 || formData.prato_id === 0) {
            alert('Por favor, selecione um funcionário e um prato');
            return;
        }

        try {
            await checkinAPI.create(formData);
            await loadData();
            handleCloseDialog();
            setSuccessMessage('Check-in registrado com sucesso!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Erro ao registrar check-in:', error);
            alert('Erro ao registrar check-in');
        }
    };

    const getCheckinsHoje = () => {
        const hoje = dayjs().format('YYYY-MM-DD');
        return checkins.filter(checkin => checkin.data === hoje);
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
                <Typography variant="h4">Check-in de Refeições</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenDialog}
                    size={isMobile ? 'small' : 'medium'}
                >
                    Novo Check-in
                </Button>
            </Box>

            {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {successMessage}
                </Alert>
            )}

            {/* Resumo do dia */}
            <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                    Resumo de Hoje ({dayjs().format('DD/MM/YYYY')})
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <Chip
                        icon={<CheckCircleIcon />}
                        label={`${getCheckinsHoje().length} check-ins hoje`}
                        color="primary"
                        variant="outlined"
                    />
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Funcionário</TableCell>
                            <TableCell>Prato</TableCell>
                            <TableCell align="center">Data</TableCell>
                            <TableCell align="center">Horário</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {checkins.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Typography color="textSecondary">
                                        Nenhum check-in registrado
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            checkins
                                .sort((a, b) => new Date(b.data + ' ' + b.horario).getTime() - new Date(a.data + ' ' + a.horario).getTime())
                                .map((checkin) => (
                                    <TableRow key={checkin.id}>
                                        <TableCell>{checkin.funcionario_nome}</TableCell>
                                        <TableCell>{checkin.prato_nome}</TableCell>
                                        <TableCell align="center">
                                            {dayjs(checkin.data).format('DD/MM/YYYY')}
                                        </TableCell>
                                        <TableCell align="center">{checkin.horario}</TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog para Novo Check-in */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle>
                    Novo Check-in
                    <IconButton
                        onClick={handleCloseDialog}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Funcionário</InputLabel>
                            <Select
                                value={formData.funcionario_id}
                                onChange={(e) => setFormData({ ...formData, funcionario_id: Number(e.target.value) })}
                                label="Funcionário"
                            >
                                {funcionarios.map((funcionario) => (
                                    <MenuItem key={funcionario.id} value={funcionario.id}>
                                        {funcionario.nome} - {funcionario.cargo}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Prato</InputLabel>
                            <Select
                                value={formData.prato_id}
                                onChange={(e) => setFormData({ ...formData, prato_id: Number(e.target.value) })}
                                label="Prato"
                            >
                                {pratos.map((prato) => (
                                    <MenuItem key={prato.id} value={prato.id}>
                                        {prato.nome}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                            <DatePicker
                                label="Data"
                                value={dayjs(formData.data)}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        setFormData({ ...formData, data: newValue.format('YYYY-MM-DD') });
                                    }
                                }}
                                sx={{ mt: 2, width: '100%' }}
                            />

                            <TimePicker
                                label="Horário"
                                value={dayjs(formData.data + ' ' + formData.horario)}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        setFormData({ ...formData, horario: newValue.format('HH:mm') });
                                    }
                                }}
                                sx={{ mt: 2, width: '100%' }}
                            />
                        </LocalizationProvider>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        Registrar Check-in
                    </Button>
                </DialogActions>
            </Dialog>

            {/* FAB para mobile */}
            {isMobile && (
                <Fab
                    color="primary"
                    aria-label="add"
                    sx={{ position: 'fixed', bottom: 16, right: 16 }}
                    onClick={handleOpenDialog}
                >
                    <AddIcon />
                </Fab>
            )}
        </Box>
    );
};

export default CheckIn;
