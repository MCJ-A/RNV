# Documentação de Engenharia, Segurança e Operação: Gestão de Fabrico (Changeover)

Este documento atua como o principal guia estrutural para a implementação do módulo avançado de **Mudança de Fabrico** (Changeover) numa linha industrial de papel de grande escala.

---

## 1. Estrutura de Dados e Contexto (PT-PT)

**Objeto Principal:** Mudança de "Fabrico" (Changeover).

A arquitetura segmenta a linha de produção em três grandes **Secções** operacionais. Para cada "Fabrico", o Engenheiro define os passos específicos que devem ocorrer em cada uma:
1.  **Casquilhos / Mandris:** Área responsável pela preparação, corte e alinhamento dos núcleos de cartão.
2.  **Embalagem:** Configuração e ajuste paramétrico das máquinas de invólucro (wrappers) e selagem a quente de filme plástico.
3.  **Paletização:** Configuração da logística de fim de linha, robótica (braços paletizadores) e estiva.

---

## 2. Requisitos Obrigatórios e Matriz Operacional

Para assegurar a máxima proteção do trabalhador e precisão técnica, desenvolveu-se a seguinte matriz de conformidade. Cada secção possui requisitos indeclináveis e limiares de estrangulamento (bottleneck).

| Secção | Equipamento de Proteção Individual (EPI) | Ferramentas de Trabalho | Alerta de Gargalo (Bottleneck) |
| :--- | :--- | :--- | :--- |
| **Casquilhos** | Luvas anticorte, Óculos de segurança, Proteção auditiva | Paquímetro, Chave dinamométrica, X-Ato de segurança | T-Max: 15 min. Alerta emitido se o núcleo não estiver pronto antes da inserção da bobine principal. |
| **Embalagem** | Luvas térmicas (alta temperatura), Calçado de segurança | Fita métrica, Chaves Allen, Calibre de espessura | T-Max: 20 min. Alerta de dessincronização notificando o Engenheiro de fluxo interrompido. |
| **Paletização** | Capacete, Colete refletor alta visibilidade, Botas com biqueira | Tablet de configuração, Chave inglesa | T-Max: 10 min. Alerta crítico ao Engenheiro se a robótica gerar fila de espera estrutural. |

---

## 3. Arquitetura Técnica e Funcionalidades

### 3.1. Arquitetura de Base de Dados
O modelo de dados relacional (ex: PostgreSQL) baseia-se numa estrutura hierárquica e rigorosa para garantir a rastreabilidade:
*   A entidade central `Fabricos` possui uma relação **1:N** (um-para-muitos) com `Accoes_Seccao` (Casquilhos, Embalagem, Paletização).
*   Cada `Accoes_Seccao` tem uma relação **1:N** com `Passos`.
*   As entidades de catalogo `Catalogo_EPIs` e `Catalogo_Ferramentas` ligam-se aos `Passos` através de tabelas associativas (**N:M**) designadas `Passo_Requisito_EPI` e `Passo_Requisito_Ferramenta`. Estas tabelas contêm a flag de integridade `is_mandatory = true`.

### 3.2. Interface do Engenheiro (Editor Backoffice)
O Backoffice fornece um construtor de processos visual. Ao desenhar um novo `Passo` para uma Secção, o painel do Engenheiro exibe um bloco de "Requisitos de Segurança". O Engenheiro é forçado pelo sistema a selecionar, a partir de um *dropdown* multi-seleção, os EPIs e ferramentas do catálogo. **O botão de "Publicar Fabrico" permanece inativo (disabled) até que pelo menos um EPI/ferramenta seja mapeado ou o passo seja explicitamente isentado através de um supervisor.**

### 3.3. Visualização do Operador (Hard-Stop Lock)
No chão de fábrica (HMI), a segurança opera através de um bloqueio de estado (Hard-Stop). Ao selecionar o Fabrico, e antes que qualquer instrução técnica seja revelada pela interface, surge um modal de segurança que ocupa o ecrã inteiro.
O sistema exibe ícones grandes com os EPIs e Ferramentas exigidos no Passo 1. O botão primário "Iniciar Tarefa" encontra-se inativo. O operador é fisicamente obrigado a tocar nos *checkboxes* de confirmação visual ("Tenho os óculos", "Tenho o paquímetro") para desbloquear o ecrã. A assinatura biométrica/PIN deste ato é registada no log de auditoria.

### 3.4. Segurança e Conformidade
A conformidade visual é injetada dinamicamente com base na secção:
*   **Zona de Casquilhos:** *Banners* vermelhos pulsantes alertam para risco mecânico (entalamento) e objetos cortantes.
*   **Zona de Embalagem:** Alertas laranjas relativos a risco térmico nas áreas das seladoras a quente (jaw sealers).
*   **Zona de Paletização:** Alertas estritos recordando perímetros de segurança de robótica industrial pesada.

---
---

# Documentación de Ingeniería, Seguridad y Operación: Gestión de Fabrico (Changeover) - [ES]

## 1. Estructura de Datos y Contexto

**Objeto Principal:** Cambio de "Fabrico" (Changeover).

La arquitectura segmenta la línea de producción en tres grandes **Secciones** operativas. Para cada "Fabrico", el Ingeniero define los pasos que deben cumplirse en:
1.  **Casquillos / Mandriles:** Preparación, corte y alineación de núcleos de cartón.
2.  **Embalaje:** Configuración de máquinas de envuelto y película plástica.
3.  **Paletización:** Logística de fin de línea, robótica y estiba.

## 2. Requisitos Obligatorios y Matriz Operativa

| Sección | Equipos de Protección Individual (EPIs) | Herramientas de Trabajo | Alerta de Cuello de Botella |
| :--- | :--- | :--- | :--- |
| **Casquillos** | Guantes anticorte, Gafas de seguridad, Protección auditiva | Calibre (Pie de rey), Llave dinamométrica, Cutter de seguridad | T-Max: 15 min. Alerta si el núcleo no está listo antes del rollo matriz. |
| **Embalaje** | Guantes térmicos, Calzado de seguridad | Cinta métrica, Llaves Allen, Calibrador de espesor | T-Max: 20 min. Alerta de desincronización en el flujo principal. |
| **Paletización** | Casco, Chaleco reflectante, Botas con punta de acero | Tablet de configuración, Llave inglesa | T-Max: 10 min. Alerta crítica si hay retraso en los brazos robóticos. |

## 3. Arquitectura Técnica y Funcionalidades

### 3.1. Arquitectura de Base de Datos
Jerarquía estricta: `Fabricos` -> `Secciones` -> `Pasos`. Los catálogos de `EPIs` y `Herramientas` están vinculados a los `Pasos` a través de relaciones **N:M** con flags de obligatoriedad en la base de datos para impedir omisiones.

### 3.2. Interfaz del Ingeniero (Editor)
Durante la creación de un nuevo Paso o tarea, el Ingeniero dispone de un creador visual. El sistema le obliga a seleccionar desde un menú desplegable multi-selección los EPIs y herramientas requeridas. Si no selecciona ninguno, el software bloquea lógicamente la exportación o validación del "Fabrico" a la línea.

### 3.3. Visualización del Operador (Bloqueo de Interfaz)
La aplicación cuenta con un "Hard-Stop" preventivo para el Operador. Antes de poder visualizar las variables mecánicas de la tarea, se despliega una pantalla de Seguridad. El Operador debe marcar casillas de verificación (Checkboxes) confirmando que dispone del EPI respectivo. El botón de "Comenzar" permanece inhabilitado hasta alcanzar el 100% de cumplimiento. El sistema audita la hora y el operador exacto que validó los EPIs.

### 3.4. Seguridad y Cumplimiento
Integración visual de advertencias mediante insignias de colores: Riesgos de Atrapamiento/Mecánicos (Casquillos), Riesgos Térmicos por temperaturas extremas (Embalaje) y Riesgos de Aplastamiento/Eléctricos en robótica (Paletización).

---
---

# Engineering, Safety, and Operations Documentation: Changeover Management - [EN]

## 1. Data Structure and Context

**Main Object:** "Fabrico" Changeover.

The industrial software architecture segments the production line into three core operational **Sections**. The Production Engineer allocates specific steps across:
1.  **Cores / Mandrels (Casquilhos):** Preparation, cutting, and alignment of cardboard cores.
2.  **Packaging (Embalagem):** Parametric setup of wrappers, poly-film stretching, and heat sealers.
3.  **Palletizing (Paletização):** End-of-line logistics, heavy robotics, and load stacking configurations.

## 2. Mandatory Requirements & Operational Matrix

| Section | Personal Protective Equipment (PPE) | Work Tools | Bottleneck Alert Protocol |
| :--- | :--- | :--- | :--- |
| **Cores** | Cut-resistant gloves, Safety goggles, Hearing protection | Caliper, Torque wrench, Safety utility knife | T-Max: 15 min. Alert broadcasts if the core isn't ready before the parent roll feeds. |
| **Packaging** | Heat-resistant gloves, Safety footwear | Measuring tape, Allen keys, Thickness gauge | T-Max: 20 min. De-sync alert notifying the Engineer of a hindered production flow. |
| **Palletizing** | Hard hat, High-visibility vest, Steel-toed boots | Configuration tablet, Adjustable wrench | T-Max: 10 min. Critical alarm if the robotic stackers cause a bottleneck queue. |

## 3. Technical Architecture & Features

### 3.1. Database Architecture
The relational database utilizes a hierarchical logic tracer tree: `Changeover (Fabrico)` -> `Sections` -> `Steps`. 
Independent tables for `PPE_Catalog` and `Tools_Catalog` connect to `Steps` using a Many-to-Many (**N:M**) join table containing a non-null `is_mandatory` boolean flag, enabling native schema validation.

### 3.2. Engineer Interface (Editor)
The Backend management dashboard features a visual process builder. When configuring a Step, an un-skippable "Safety Requirements" pane appears. The Engineer must select the required tools and PPEs from a dropdown catalogue. The "Deploy Fabrico" action button maintains a disabled state preventing the rollout of unsafe configurations without explicit tool and PPE mapping.

### 3.3. Operator View (Hard-Stop Lock)
At the HMI level on the factory floor, the application mandates an interaction gatekeeper. Before revealing the technical schematics for a selected Changeover, an uncloseable full-screen Safety Gate triggers. Operators are presented with large visual icons denoting the required PPE and tools. The actual "Start Task" call-to-action button is inert. The Operator must manually click checkboxes verifying their physical compliance. The explicit digital signature is saved to the IIoT audit log.

### 3.4. Safety and Compliance Alerts
Dynamic hazard indicators map localized risks automatically based on the active section:
Machine Entanglement and Blade warnings in the Cores (Casquilhos) area, Heat/Burn alerts corresponding to the Packaging heat sealers, and Crash/Electric hazard indicators triggered dynamically within the Palletizing robotic perimeter.
