import {
    AddCircle as AddCircleIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    GetApp as DownloadIcon,
    ExpandMore as ExpandMoreIcon,
    ShoppingCart as ShoppingCartIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    FormControl,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import jsPDF from 'jspdf';
import React, { useEffect, useState } from 'react';
import { estoqueAPI, EstoqueItem } from '../services/api';

interface ShoppingListItem {
    id: string;
    nome: string;
    quantidade: number;
    unidade: string;
    categoria: string;
    comprado: boolean;
}

interface FixedShoppingList {
    id: string;
    nome: string;
    itens: ShoppingListItem[];
    dataCriacao: string;
}

const ListaCompras: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [fixedLists, setFixedLists] = useState<FixedShoppingList[]>([]);
    const [variableItems, setVariableItems] = useState<ShoppingListItem[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openAddItemDialog, setOpenAddItemDialog] = useState(false);
    const [selectedListId, setSelectedListId] = useState<string>('');
    const [newListName, setNewListName] = useState('');
    const [newItem, setNewItem] = useState({
        nome: '',
        quantidade: 1,
        unidade: '',
        categoria: '',
    });
    const [expandedSections, setExpandedSections] = useState({
        fixed: true,
        variable: true,
    });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Carregar estoque
            const response = await estoqueAPI.getAll();

            // Carregar listas fixas (simulado - em produção viria da API)
            const savedLists = localStorage.getItem('shoppingLists');
            if (savedLists) {
                setFixedLists(JSON.parse(savedLists));
            }

            // Gerar lista variável baseada em estoque baixo
            generateVariableList(response.data);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateVariableList = (estoqueData: EstoqueItem[]) => {
        const lowStockItems = estoqueData
            .filter(item => item.quantidade < 10)
            .map(item => ({
                id: `var_${item.id}`,
                nome: item.nome,
                quantidade: Math.max(1, 10 - item.quantidade), // Quantidade sugerida
                unidade: item.unidade,
                categoria: item.categoria,
                comprado: false,
            }));
        setVariableItems(lowStockItems);
    };

    const handleCreateFixedList = () => {
        if (!newListName.trim()) return;

        const newList: FixedShoppingList = {
            id: Date.now().toString(),
            nome: newListName,
            itens: [],
            dataCriacao: new Date().toISOString(),
        };

        const updatedLists = [...fixedLists, newList];
        setFixedLists(updatedLists);
        localStorage.setItem('shoppingLists', JSON.stringify(updatedLists));
        setNewListName('');
        setOpenDialog(false);
    };

    const handleOpenAddItemDialog = (listId: string) => {
        setSelectedListId(listId);
        setNewItem({
            nome: '',
            quantidade: 1,
            unidade: '',
            categoria: '',
        });
        setOpenAddItemDialog(true);
    };

    const handleCloseAddItemDialog = () => {
        setOpenAddItemDialog(false);
        setSelectedListId('');
        setNewItem({
            nome: '',
            quantidade: 1,
            unidade: '',
            categoria: '',
        });
    };

    const handleAddItemToList = () => {
        if (!newItem.nome.trim() || !selectedListId) return;

        const updatedLists = fixedLists.map(list => {
            if (list.id === selectedListId) {
                const newShoppingItem: ShoppingListItem = {
                    id: Date.now().toString(),
                    nome: newItem.nome,
                    quantidade: newItem.quantidade,
                    unidade: newItem.unidade,
                    categoria: newItem.categoria,
                    comprado: false,
                };
                return {
                    ...list,
                    itens: [...list.itens, newShoppingItem]
                };
            }
            return list;
        });
        setFixedLists(updatedLists);
        localStorage.setItem('shoppingLists', JSON.stringify(updatedLists));
        handleCloseAddItemDialog();
    };

    const handleDeleteFixedList = (listId: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta lista?')) {
            const updatedLists = fixedLists.filter(list => list.id !== listId);
            setFixedLists(updatedLists);
            localStorage.setItem('shoppingLists', JSON.stringify(updatedLists));
        }
    };


    const handleRemoveItemFromList = (listId: string, itemId: string) => {
        const updatedLists = fixedLists.map(list => {
            if (list.id === listId) {
                return {
                    ...list,
                    itens: list.itens.filter(item => item.id !== itemId)
                };
            }
            return list;
        });
        setFixedLists(updatedLists);
        localStorage.setItem('shoppingLists', JSON.stringify(updatedLists));
    };

    const handleToggleItemPurchased = (listId: string, itemId: string) => {
        const updatedLists = fixedLists.map(list => {
            if (list.id === listId) {
                return {
                    ...list,
                    itens: list.itens.map(item =>
                        item.id === itemId ? { ...item, comprado: !item.comprado } : item
                    )
                };
            }
            return list;
        });
        setFixedLists(updatedLists);
        localStorage.setItem('shoppingLists', JSON.stringify(updatedLists));
    };

    const generatePDF = (list: FixedShoppingList) => {
        const doc = new jsPDF();

        // Configurações do PDF
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let yPosition = 30;

        // Título
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('LISTA DE COMPRAS', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;

        // Nome da lista
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.text(`Lista: ${list.nome}`, margin, yPosition);
        yPosition += 10;

        // Data
        doc.setFontSize(12);
        doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
        yPosition += 20;

        // Linha separadora
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 15;

        // Itens da lista
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('ITENS:', margin, yPosition);
        yPosition += 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        if (list.itens.length === 0) {
            doc.text('Nenhum item na lista', margin, yPosition);
        } else {
            list.itens.forEach((item, index) => {
                // Verificar se precisa de nova página
                if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 30;
                }

                const itemText = `${index + 1}. ${item.nome} (${item.quantidade} ${item.unidade})`;
                const statusText = item.comprado ? ' ✓ COMPRADO' : '';

                doc.text(itemText, margin, yPosition);
                if (statusText) {
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(0, 128, 0); // Verde para comprado
                    doc.text(statusText, margin + doc.getTextWidth(itemText) + 5, yPosition);
                    doc.setTextColor(0, 0, 0); // Volta ao preto
                    doc.setFont('helvetica', 'normal');
                }
                yPosition += 8;
            });
        }

        // Rodapé
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, 290, { align: 'right' });
        }

        // Download do PDF
        doc.save(`lista-compras-${list.nome.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
    };

    const toggleSection = (section: 'fixed' | 'variable') => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
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
                <Typography variant="h4">Lista de Compras</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    size={isMobile ? 'small' : 'medium'}
                >
                    Nova Lista Fixa
                </Button>
            </Box>

            {/* Listas Fixas */}
            <Accordion
                expanded={expandedSections.fixed}
                onChange={() => toggleSection('fixed')}
                sx={{ mb: 2 }}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <ShoppingCartIcon />
                        <Typography variant="h6">Compras Fixas</Typography>
                        <Chip label={fixedLists.length} size="small" color="primary" />
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    {fixedLists.length === 0 ? (
                        <Typography color="text.secondary">
                            Nenhuma lista fixa criada ainda.
                        </Typography>
                    ) : (
                        <Box display="flex" flexDirection="column" gap={2}>
                            {fixedLists.map((list) => (
                                <Card key={list.id}>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                            <Typography variant="h6">{list.nome}</Typography>
                                            <Box display="flex" gap={1}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenAddItemDialog(list.id)}
                                                    color="success"
                                                    title="Adicionar item"
                                                >
                                                    <AddCircleIcon />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => generatePDF(list)}
                                                    color="primary"
                                                    title="Baixar PDF"
                                                >
                                                    <DownloadIcon />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteFixedList(list.id)}
                                                    color="error"
                                                    title="Excluir lista"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        <List dense>
                                            {list.itens.length === 0 ? (
                                                <ListItem>
                                                    <ListItemText
                                                        primary="Lista vazia"
                                                        secondary="Adicione itens do estoque"
                                                    />
                                                </ListItem>
                                            ) : (
                                                list.itens.map((item) => (
                                                    <ListItem key={item.id}>
                                                        <ListItemIcon>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleToggleItemPurchased(list.id, item.id)}
                                                            >
                                                                {item.comprado ? '✓' : '○'}
                                                            </IconButton>
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={`${item.nome} (${item.quantidade} ${item.unidade})`}
                                                            secondary={item.categoria}
                                                            sx={{
                                                                textDecoration: item.comprado ? 'line-through' : 'none',
                                                                opacity: item.comprado ? 0.6 : 1
                                                            }}
                                                        />
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleRemoveItemFromList(list.id, item.id)}
                                                            color="error"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </ListItem>
                                                ))
                                            )}
                                        </List>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    )}
                </AccordionDetails>
            </Accordion>

            {/* Lista Variável */}
            <Accordion
                expanded={expandedSections.variable}
                onChange={() => toggleSection('variable')}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <WarningIcon color="warning" />
                        <Typography variant="h6">Compras Variáveis</Typography>
                        <Chip label={variableItems.length} size="small" color="warning" />
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    {variableItems.length === 0 ? (
                        <Typography color="text.secondary">
                            Nenhum item com estoque baixo no momento.
                        </Typography>
                    ) : (
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Itens com estoque baixo (menos de 10 unidades):
                            </Typography>
                            <List>
                                {variableItems.map((item) => (
                                    <ListItem key={item.id}>
                                        <ListItemIcon>
                                            <WarningIcon color="warning" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`${item.nome} (${item.quantidade} ${item.unidade})`}
                                            secondary={`Categoria: ${item.categoria} - Quantidade sugerida: ${item.quantidade}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    )}
                </AccordionDetails>
            </Accordion>

            {/* Dialog para criar nova lista */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Criar Nova Lista Fixa</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Nome da Lista"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        margin="normal"
                        placeholder="Ex: Compras da Semana"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button onClick={handleCreateFixedList} variant="contained">
                        Criar Lista
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog para adicionar item */}
            <Dialog
                open={openAddItemDialog}
                onClose={handleCloseAddItemDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Adicionar Item à Lista</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Nome do Item"
                        value={newItem.nome}
                        onChange={(e) => setNewItem({ ...newItem, nome: e.target.value })}
                        margin="normal"
                        placeholder="Ex: Arroz"
                    />
                    <TextField
                        fullWidth
                        label="Quantidade"
                        type="number"
                        value={newItem.quantidade}
                        onChange={(e) => setNewItem({ ...newItem, quantidade: parseInt(e.target.value) || 1 })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Unidade"
                        value={newItem.unidade}
                        onChange={(e) => setNewItem({ ...newItem, unidade: e.target.value })}
                        margin="normal"
                        placeholder="Ex: kg, litros, unidades"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Categoria</InputLabel>
                        <Select
                            value={newItem.categoria}
                            onChange={(e) => setNewItem({ ...newItem, categoria: e.target.value })}
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
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddItemDialog}>Cancelar</Button>
                    <Button onClick={handleAddItemToList} variant="contained">
                        Adicionar Item
                    </Button>
                </DialogActions>
            </Dialog>

            {/* FAB para mobile */}
            {isMobile && (
                <Fab
                    color="primary"
                    aria-label="add"
                    sx={{ position: 'fixed', bottom: 16, right: 16 }}
                    onClick={() => setOpenDialog(true)}
                >
                    <AddIcon />
                </Fab>
            )}
        </Box>
    );
};

export default ListaCompras;
