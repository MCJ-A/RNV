# Documentação Técnica: SetupMaster (Master Version)

Este documento detalha a arquitetura, a proposta de valor e o roteiro tecnológico do **SetupMaster**, uma solução de vanguarda para a indústria de conversão de papel tissue.

---

## 1. Visão Geral e Objetivo (PT-PT)

**SetupMaster** é uma Solução Industrial Digital concebida para transformar o processo crítico de "Setup" (mudança de formato) em linhas de produção de alta velocidade. O objetivo principal é a **eliminação do erro humano** e a **maximização da segurança operacional** através de um sistema interativo que atua como uma interface direta entre o operador e a máquina.

A aplicação resolve problemas crónicos como a falta de rastreabilidade, tempos de inatividade prolongados por ajustes incorretos e riscos de segurança durante os procedimentos manuais. Ao digitalizar as instruções e integrar telemetria em tempo real, o SetupMaster garante que cada ajuste seja validado tecnicamente antes da retoma da produção.

---

## 2. Arquitetura Técnica

O sistema foi edificado sobre pilares de alta disponibilidade e resiliência industrial:

*   **Frontend & UI:** Desenvolvido com **React (Vite)** para garantir uma interface ultra-rápida e reativa. A estilização utiliza **Tailwind CSS**, focada no modo de alto contraste para visibilidade em ambientes fabris.
*   **Gestão de Estado:** Utilização de **Zustand** com middleware de persistência, permitindo que o progresso do operador seja mantido mesmo em caso de reinicialização do dispositivo ou falha de browser.
*   **IIoT & Telemetria:** Motor de simulação que emula protocolos **OPC-UA**, fornecendo dados em tempo real de OEE (Eficácia Global), Tensão do Papel, Velocidade e Temperatura.
*   **Segurança (Interlocks):** Implementação de lógica de bloqueio operacional. Ao entrar no estado de `SETUP`, o sistema comunica com o simulador para forçar a velocidade a 0 m/min, impedindo acidentes.
*   **PWA (Progressive Web App):** Configurado para funcionamento **Offline-First**, garantindo que a aplicação permanece funcional mesmo em zonas da fábrica com sombra de rede Wi-Fi.
*   **Internacionalização (i18n):** Sistema dinâmico com **i18next**, suportando Português (PT), Espanhol (ES) e Inglês (EN) com mudança de contexto em tempo real.

---

## 3. Melhorias Potenciais e "Best-in-Class" (Roadmap)

Para atingir o estatuto de solução líder de mercado, o roteiro de desenvolvimento foca-se na integração profunda com IA e conectividade total.

| Área de Melhoria | Descrição Técnica | Impacto "Best-in-Class" |
| :--- | :--- | :--- |
| **Visão Computacional** | Integração de câmaras para validar ajustes físicos via IA. | Erro humano reduzido a 0%. |
| **Conetividade PLC Real** | Migração do simulador para drivers nativos OPC-UA/MQTT. | Monitorização e controlo direto da máquina. |
| **Análise de Dados (BI)** | Dashboard de supervisão com KPIs históricos e tendências. | Otimização contínua baseada em dados reais. |
| **Realidade Aumentada** | Guia de passos sobreposta na imagem real da máquina. | Redução de 40% no tempo de treino de novos operadores. |
| **Escalabilidade Cloud** | Sincronização de logs com bases de dados distribuídas (PostgreSQL/Redis). | Gestão centralizada de múltiplas unidades fabris. |

---

## 4. Finalidade e Valor de Negócio

O SetupMaster não é apenas uma ferramenta de consulta; é um **ativo estratégico** que gera valor direto no P&L (Profit and Loss) da empresa:

1.  **Redução de Waste:** Menos material desperdiçado em ajustes de "tentativa e erro".
2.  **Segurança Ocupacional:** Redução drástica de riscos de entalamento e acidentes através de interlocks digitais.
3.  **Standardização:** Garante que todos os turnos operam com o mesmo padrão de excelência (Golden Standard).
4.  **Rastreabilidade Total:** Auditoria completa de quem, quando e como cada mudança de formato foi efetuada.

---
---

# Documentación Técnica: SetupMaster (Versión Master) - [ES]

## 1. Visión General y Objetivo
**SetupMaster** es una Solución Industrial Digital diseñada para transformar el proceso crítico de "Setup" (cambio de formato) en líneas de producción. El objetivo principal es la **eliminación del error humano** y la **maximización de la seguridad operacional** mediante una interfaz interactiva que conecta al operador con la máquina en tiempo real.

## 2. Arquitectura Técnica
*   **Stack:** React (Vite) + Tailwind CSS para una interfaz industrial de alto rendimiento.
*   **Estado:** Zustand con persistencia local para resiliencia ante cortes de energía.
*   **IIoT:** Simulación de telemetría vía OPC-UA (OEE, Velocidad, Tensión).
*   **Seguridad:** Interlocks digitales que bloquean la velocidad de la máquina a 0 m/min durante el ajuste.
*   **PWA:** Funcionamiento Offline-First garantizado en planta.

## 3. Roadmap de Mejoras
*   AI Vision para validación de ajustes.
*   Conectividad real con PLCs (MQTT/OPC-UA).
*   Mantenimiento Predictivo basado en tendencias de telemetría.

## 4. Valor de Negocio
Reducción de desperdicios, estandarización de procesos y cumplimiento de normativas de seguridad industrial 4.0.

---
---

# Technical Documentation: SetupMaster (Master Version) - [EN]

## 1. Overview and Objective
**SetupMaster** is a Digital Industrial Solution built to transform the critical "Setup" (format changeover) process in production lines. The primary goal is the **elimination of human error** and the **maximization of operational safety** through an interactive interface that bridges the gap between the operator and the machine.

## 2. Technical Architecture
*   **Stack:** React (Vite) + Tailwind CSS for a high-performance industrial UI.
*   **State Management:** Zustand with persistence for resilience against power or network failures.
*   **IIoT Integration:** Real-time telemetry simulation (OEE, Speed, Tension) via OPC-UA protocols.
*   **Security Interlocks:** Digital logic that forces machine speed to 0 m/min during setup procedures.
*   **Connectivity:** Offline-First PWA design for reliable operation in industrial environments.

## 3. Roadmap to Best-in-Class
*   Computer Vision for automated adjustment verification.
*   Live PLC integration via native OPC-UA/MQTT drivers.
*   Augmented Reality (AR) guided procedures for faster training.

## 4. Business Value
Waste reduction, process standardization, and total traceability for Industry 4.0 compliance.
