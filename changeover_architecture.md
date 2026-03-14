# Arquitetura e Estrutura Lógica: Sistema de Gestão de Changeover

Este documento define a base técnica, modelos de dados e lógica funcional para uma aplicação industrial avançada de gestão de mudanças de fabrico (Changeover), conforme os requisitos especificados.

---

## 1. Especificação do Modelo de Dados (Backend) & RBAC

Para garantir a integridade relacional e escalabilidade, o modelo foi concebido para PostgreSQL utilizando o Prisma ORM. A estrutura reflete a hierarquia da fábrica.

### Esquema de Base de Dados (Prisma schema)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 1. Definição de Perfis de Acesso (RBAC)
enum Role {
  ENGINEER
  OPERATOR
}

model Utilizador {
  id    String @id @default(uuid())
  nome  String
  papel Role   @default(OPERATOR)
}

// 2. Entidade Principal: Fabrico
model Fabrico {
  id        String   @id @default(uuid())
  nome      String   // Ex: "Rolo de Cozinha 500m"
  data      DateTime @default(now())
  secoes    Secao[]
}

// 3. Entidade: Seção
model Secao {
  id             String   @id @default(uuid())
  nome           String   // "Casquilhos", "Embalagem", "Paletização"
  tempoPrevisto  Int      // Tempo estimado em minutos (Golden Time)
  fabricoId      String
  fabrico        Fabrico  @relation(fields: [fabricoId], references: [id])
  passos         Passo[]
}

// 4. Entidade: Passo
model Passo {
  id               String   @id @default(uuid())
  ordem            Int      // Sequência de execução
  descricao        String
  ferramentas      String[] // Ex: ["Chave 10mm", "Paquímetro"]
  episRequeridos   String[] // Ex: ["Luvas anti-corte", "Óculos"]
  concluido        Boolean  @default(false)
  epiConfirmado    Boolean  @default(false) // Interlock de Segurança
  tempoExecucao    Int?     // Registo em segundos para análise de gargalos
  tempoInicio      DateTime?
  secaoId          String
  secao            Secao    @relation(fields: [secaoId], references: [id])
}
```

### Lógica de Permissões (RBAC: Role-Based Access Control)
Apenas o perfil `ENGINEER` tem privilégios para criar e alterar métricas do produto.

```javascript
// middleware/authMiddleware.js
export const verificarPermissao = (papelExigido) => {
  return (req, res, next) => {
    const utilizador = req.user; // Injetado pelo JWT
    
    if (!utilizador || utilizador.papel !== papelExigido) {
      return res.status(403).json({ 
        erro: "ACESSO NEGADO: Apenas Engenheiros possuem permissão para CRUD nesta rota." 
      });
    }
    next();
  };
};

// Exemplo de Rotas Protegidas na API (Node.js/Express)
app.post('/api/fabrico', verificarPermissao('ENGINEER'), criarFabrico);
app.put('/api/passo/:id', verificarPermissao('ENGINEER'), atualizarPasso);
app.delete('/api/secao/:id', verificarPermissao('ENGINEER'), apagarSecao);
```

---

## 2. Lógica Funcional e de Segurança

### Bloqueio de Segurança (EPI Interlock)
Impede a conclusão mecânica do passo se a validação humana de EPIs não for feita.

```javascript
// controllers/passoController.js
export const completarPassoSeguro = async (passoId, operacaoConfirmaEpi) => {
  const passo = await db.passo.findUnique({ where: { id: passoId } });

  // Lógica de Interlock: Rejeita a requisição se tiver EPIs e o check for falso
  if (passo.episRequeridos.length > 0 && !operacaoConfirmaEpi) {
    throw new Error("BLOQUEIO DE SEGURANÇA: É obrigatório confirmar fisicamente o uso dos Equipamentos de Proteção Individual listados.");
  }

  // Registo do momento da conclusão para cálculo de gargalos
  const tempoDecorrido = calcularDiferencaEmSegundos(passo.tempoInicio, new Date());

  return await db.passo.update({
    where: { id: passoId },
    data: { 
      concluido: true, 
      epiConfirmado: operacaoConfirmaEpi,
      tempoExecucao: tempoDecorrido
    }
  });
};
```

### Monitor de Gargalos (Bottleneck Monitor)
Garante a eficiência avaliando o tempo de execução e disparando alertas dinâmicos.

```javascript
// services/monitorGargalo.js
export const avaliarDesempenhoSecao = async (secaoId, tempoRealDecorridoMinutos) => {
  const secao = await db.secao.findUnique({ where: { id: secaoId } });
  
  // Limiar Crítico: +20% do tempo previsto estipulado
  const tempoToleranciaMaxima = secao.tempoPrevisto * 1.20; 

  if (tempoRealDecorridoMinutos > tempoToleranciaMaxima) {
    const desvio = Math.round(((tempoRealDecorridoMinutos / secao.tempoPrevisto) - 1) * 100);
    
    await dispararAlertaManutencao({
      severidade: "ALTA",
      setor: secao.nome,
      mensagem: `ALERTA DE GARGALO DETETADO: A seção excedeu o tempo ótimo em ${desvio}%. Previsão: ${secao.tempoPrevisto}m | Real: ${tempoRealDecorridoMinutos}m. Possível anomalia mecânica ou hesitação operacional.`
    });
  }
};
```

---

## 3. Interface de Utilizador (Frontend / React)

### Construtor de Passos (Acesso Exclusivo: Ingeniero)
Interface administrativa otimizada para a criação das "Receitas de Fabrico".

```jsx
// components/StepBuilder.jsx
export function ConstrutorInstrucoes({ secoesDisponiveis }) {
  return (
    <form className="admin-step-constructor bg-slate-900 text-white p-8 rounded-xl shadow-2xl border border-slate-700">
      <h2 className="text-3xl font-extrabold text-emerald-400 mb-6">Configurador de Receita (Engineer)</h2>
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        <select name="secaoId" className="p-4 bg-slate-800 rounded-lg text-lg outline-none focus:border-emerald-500 border border-slate-600">
          <option value="">Selecione a Seção-Alvo</option>
          {secoesDisponiveis.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
        
        <input type="number" name="ordem" placeholder="Ordem de Execução (ex: 1)" className="p-4 bg-slate-800 rounded-lg" />
      </div>

      <textarea 
        name="descricao" 
        placeholder="Descreva a instrução técnica detalhada..." 
        className="w-full p-4 bg-slate-800 rounded-lg mb-6 h-32"
        required
      />
      
      {/* Componentes Abstratos de Array Selection */}
      <MultiSelectBadge 
        label="Ferramentas Obrigatórias" 
        opcoes={['Chave Dinamométrica', 'Calibrador a Laser', 'Manómetro']} 
      />
      
      <MultiSelectBadge 
        label="EPIs Obrigatórios (Interlock)" 
        opcoes={['Luvas Anti-corte Nível 5', 'Proteção Ocular', 'Capacete']} 
      />
      
      <button type="submit" className="w-full mt-8 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-lg font-bold text-xl">
        Guardar Novo Passo de Fabrico
      </button>
    </form>
  );
}
```

### Visão do Operador (HUD de Chão de Fábrica)
Interface simplificada focada numa única seção por ecrã (ex: O operador da linha de Embalagem só vê embalagem).

```jsx
// components/OperatorHUD.jsx
export function VisaoOperador({ secaoAtual, passosDaSecao }) {
  const [epiVerificado, setEpiVerificado] = useState(false);

  return (
    <div className="operator-dashboard min-h-screen bg-black text-white p-8">
      <h1 className="text-5xl font-black text-cyan-400 mb-8">Posto: {secaoAtual.nome}</h1>
      
      {passosDaSecao.map((passo) => (
        <div key={passo.id} className="passo-card bg-slate-800 border-l-8 border-emerald-500 p-8 rounded-r-2xl mb-6">
          <h2 className="text-3xl font-bold mb-4">Passo {passo.ordem}: {passo.descricao}</h2>
          
          <div className="flex gap-4 mb-6">
            <span className="bg-slate-700 px-4 py-2 rounded text-slate-300">🛠️ {passo.ferramentas.join(', ')}</span>
          </div>

          {/* Bloqueio de Segurança Visual na Interface */}
          {passo.episRequeridos.length > 0 && (
            <div className="security-check bg-amber-500/20 border border-amber-500 p-6 rounded-xl mt-6">
              <label className="flex items-center gap-6 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-10 h-10 accent-amber-500"
                  onChange={(e) => setEpiVerificado(e.target.checked)} 
                />
                <span className="text-amber-500 text-2xl font-bold uppercase tracking-wide">
                  Confirmar uso obrigatório de: {passo.episRequeridos.join(', ')}
                </span>
              </label>
            </div>
          )}
          
          <button 
            disabled={passo.episRequeridos.length > 0 && !epiVerificado}
            onClick={() => API.completarPasso(passo.id, epiVerificado)}
            className="mt-8 w-full bg-emerald-600 disabled:bg-slate-700 p-6 rounded-xl text-3xl font-black transition-colors"
          >
            VALIDAR MONTAGEM COMPLETA
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 4. Traducciones y Explicaciones de la Arquitectura

### 🇪🇸 Guía de Lógica Técnica y Arquitectura (Español)

**1. Modelo de Base de Datos y Permisos (RBAC)**
*   **Jerarquía de Entidades:** El modelo de datos (Prisma ORM) respeta la física de la fábrica. Un _Fabrico_ es el producto final; contiene varias _Secciones_ (Casquillos, Empaque), y cada sección tiene un array de _Pasos_ secuenciales con herramientas y EPIs necesarios integrados algorítmicamente.
*   **Permiso de Ingeniero:** A través de un middleware de control de acceso basado en roles (RBAC), el servidor rechaza (HTTP 403 Forbidden) toda modificación de los pasos a menos que el JWT del usuario tenga inyectado el rol explícito de `ENGINEER`.

**2. Interlock Físico y Monitor de Cuellos de Botella**
*   **Interlock de EPIs:** Si se requieren gafas o guantes (`episRequeridos.length > 0`), se activa un bloqueo en la función `completarPassoSeguro`. Si un ataque intercepta el Frontend o el operador olvida el checkbox (`operacaoConfirmaEpi` es `false`), el sistema aborta la transacción, preservando la seguridad.
*   **Monitor de Desempeño:** Basado en un cálculo puro: `(Tempo Real > Tempo Ideal * 1.20)`. Si una sección tarda más de un 20% sobre el "Golden Time", una notificación asíncrona despacha una alerta (`ALTA`) indicando un "Cuello de botella" o posible avería en la máquina, previniendo micro-paradas prolongadas.

**3. Decisiones de UI (Diseño de Interfaces)**
*   **Vista de Ingeniero:** Formulario robusto de administración de datos con campos jerárquicos y selección múltiple para asegurar trazabilidad.
*   **Vista de Operador:** Diseñada en "Modo Oscuro Industrial Integrado" para dispositivos HMI. Filtra el ruido omitiendo todos los datos de otras secciones: el operador solo ve lo que tiene que ensamblar, y el botón verde "Validar" sufre de coerción visual para obligar la atención sobre la validación de seguridad (EPIs).

---

### 🇬🇧 Architectural Overview & Tech Logic (English)

**1. Data Blueprint & Role-Based Access Control**
*   **Database Schema:** Implemented using Prisma ORM (ideal for strict type-checking with SQL). The hierarchy cascades downwards: _Fabrico (Job)_ → _Section (Work Center)_ → _Step (Instruction)_. Arrays are uniquely leveraged to hold string-tied Tooling & PPE identifiers.
*   **RBAC Architecture:** API mutation endpoints implement a barrier middleware mapping HTTP requests. If the request context is not an `ENGINEER` role payload, direct CRUD access to the factory recipe is locked globally, avoiding unauthorized mid-process alterations.

**2. Safety Interlocks & Bottleneck Detection Algorithm**
*   **Safety Lock:** At the controller level (`completarPassoSeguro`), if the schema mandates PPE but the operator payload sends a `false` verification flag, an Error is forcefully thrown. The database rollback ensures operators cannot blind-click through dangerous steps.
*   **Bottleneck OEE Monitor:** The system uses conditional baseline scaling logic. If actual completion minutes cross a strict 120% margin relative to theoretical "Golden Time", it trips an asynchronous hardware webhook or log message flagging a deviation ("Gargalo").

**3. Frontend User Experience Constraints (UI)**
*   **Admin/Engineer Builder:** An expansive panel geared toward dense contextual inputs via unified multidropdown tags.
*   **Shop-Floor Dashboard:** Muted interface to guarantee HMI visibility, hiding all non-relevant section components. The monolithic validation button is tied reactively via React's `disabled` prop directly to the active `checkbox` listener matching the current step's safety requirement state.
