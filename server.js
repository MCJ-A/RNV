import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --- MOCK RBAC MIDDLEWARE ---
// In a real app this would verify a JWT token.
// For the MVP, we expect a 'x-user-role' header.
const requireRole = (role) => (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    if (userRole !== role && userRole !== 'ADMIN') {
        return res.status(403).json({ error: `ACESSO NEGADO: Requer privilégios de ${role}` });
    }
    next();
};

// --- INITIALIZE DUMMY DATA ---
// Create a fake engineer user and some initial data if empty
app.get('/api/init', async (req, res) => {
    try {
        const userCount = await prisma.user.count();
        if (userCount === 0) {
            await prisma.user.create({ data: { nome: 'Engenheiro Chefe', papel: 'ENGINEER' } });
            await prisma.user.create({ data: { nome: 'Operador Linha 1', papel: 'OPERATOR' } });
            
            // Seed a basic fab object
            const fab = await prisma.fabrico.create({
                data: {
                    nome: 'Rolo de Cozinha 500m',
                    secoes: {
                        create: [
                            {
                                nome: 'Casquilhos',
                                tempoPrevisto: 10, // 10 minutes
                                passos: {
                                    create: [
                                        {
                                            ordem: 1,
                                            descricao: 'Desbloquear a tampa frontal e extrair o veio principal.',
                                            ferramentasStr: JSON.stringify(['Chave 10mm']),
                                            episRequeridosStr: JSON.stringify(['Luvas Anti-corte'])
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            });
            return res.json({ message: 'Database seeded successfully', fabricoId: fab.id });
        }
        res.json({ message: 'Database already initialized' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- API ROUTES ---

// GET All Fabricants (Public/Operator)
app.get('/api/fabrico', async (req, res) => {
    const fabricos = await prisma.fabrico.findMany({
        include: { secoes: { include: { passos: { orderBy: { ordem: 'asc' } } } } }
    });
    
    // Parse the JSON strings back to arrays for the frontend
    const parsedFabricos = fabricos.map(f => ({
        ...f,
        secoes: f.secoes.map(s => ({
            ...s,
            passos: s.passos.map(p => ({
                ...p,
                ferramentas: JSON.parse(p.ferramentasStr),
                episRequeridos: JSON.parse(p.episRequeridosStr)
            }))
        }))
    }));
    
    res.json(parsedFabricos);
});

// POST Create new Passo (Engineer Only)
app.post('/api/secao/:secaoId/passos', requireRole('ENGINEER'), async (req, res) => {
    const { secaoId } = req.params;
    const { ordem, descricao, ferramentas, episRequeridos } = req.body;
    
    try {
        const passo = await prisma.passo.create({
            data: {
                secaoId,
                ordem: parseInt(ordem),
                descricao,
                ferramentasStr: JSON.stringify(ferramentas || []),
                episRequeridosStr: JSON.stringify(episRequeridos || [])
            }
        });
        res.json(passo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST Start Passo (Timestamp)
app.post('/api/passo/:id/start', async (req, res) => {
    try {
        const passo = await prisma.passo.update({
            where: { id: req.params.id },
            data: { tempoInicio: new Date() }
        });
        res.json(passo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST Complete Passo (Interlock & Bottleneck check)
app.post('/api/passo/:id/complete', async (req, res) => {
    const { id } = req.params;
    const { epiConfirmado } = req.body;

    try {
        const passo = await prisma.passo.findUnique({ 
            where: { id },
            include: { secao: true } 
        });

        if (!passo) return res.status(404).json({ error: 'Passo não encontrado' });

        const epis = JSON.parse(passo.episRequeridosStr);

        // SAFETY INTERLOCK
        if (epis.length > 0 && !epiConfirmado) {
            return res.status(403).json({ 
                error: 'BLOQUEIO DE SEGURANÇA: É obrigatório confirmar o uso dos EPIs.' 
            });
        }

        // Calculate Execution Time
        let tempoExecucao = 0;
        if (passo.tempoInicio) {
            tempoExecucao = Math.floor((new Date() - new Date(passo.tempoInicio)) / 1000); // seconds
        }

        // BOTTLENECK MONITOR
        // Check if execution time (in minutes) exceeds predicted time by 20%
        let alertaGargalo = null;
        const tempoExecMinutos = tempoExecucao / 60;
        const tempoToleranciaMaxima = passo.secao.tempoPrevisto * 1.20;

        if (tempoExecMinutos > tempoToleranciaMaxima) {
            const desvio = Math.round(((tempoExecMinutos / passo.secao.tempoPrevisto) - 1) * 100);
            alertaGargalo = `ALERTA DE GARGALO DETETADO: A seção excedeu o tempo ótimo em ${desvio}%. Previsão: ${passo.secao.tempoPrevisto}m | Real: ${Math.round(tempoExecMinutos)}m.`;
            console.warn(`[GARGALO] ${alertaGargalo}`);
        }

        const updatedPasso = await prisma.passo.update({
            where: { id },
            data: { 
                concluido: true, 
                epiConfirmado: true,
                tempoExecucao
            }
        });

        res.json({ passo: updatedPasso, alerta: alertaGargalo });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`SetupMaster API running on http://localhost:${port}`);
});
