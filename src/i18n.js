import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    pt: {
        translation: {
            app_title: "SetupMaster",
            app_subtitle: "Sistema de Configuração Industrial",
            history_btn: "Histórico",
            select_format_title: "Selecionar Formato a Configurar",
            setup_steps_count: "{{count}} Passos de Configuração",
            start_setup_btn: "INICIAR SETUP",
            step_x_of_y: "Passo {{current}} de {{total}}",
            product_label: "Produto",
            cancel_btn: "Cancelar",
            mandatory_instruction: "Instrução Obrigatória",
            visual_reference: "Referência Visual",
            confirm_continue_btn: "CONFIRMAR E CONTINUAR",
            setup_completed_title: "Configuração Concluída!",
            setup_completed_msg: "O formato para \"{{product}}\" está pronto para produção.",
            restart_btn: "Reiniciar",
            view_dashboard_btn: "Ver Dashboard",
            abort_modal_title: "Abortar Configuração?",
            abort_modal_msg: "Tem a certeza que deseja cancelar a configuração atual? Todo o progresso será perdido e retornará à tela inicial.",
            abort_modal_no: "NÃO, CONTINUAR SETUP",
            abort_modal_yes: "SIM, ABORTAR",
            language_pt: "Português",
            language_es: "Español",
            language_en: "English",
            login_title: "Identificação do Operador",
            login_subtitle: "Por favor, insira o seu PIN de acesso para continuar",
            pin_placeholder: "Digite o PIN",
            login_error: "PIN incorreto. Tente novamente.",
            login_btn: "ACESSAR SISTEMA",
            history_modal_title: "Registo de Atividades",
            history_empty: "Nenhum registo encontrado.",
            history_col_date: "Data/Hora",
            history_col_op: "Operador",
            history_col_format: "Formato",
            history_col_status: "Estado",
            status_completed: "CONCLUÍDO",
            status_cancelled: "CANCELADO",
            close_btn: "Fechar",
            kiosk_mode_btn: "Modo Quiosque"
        }
    },
    es: {
        translation: {
            app_title: "SetupMaster",
            app_subtitle: "Sistema de Configuración Industrial",
            history_btn: "Historial",
            select_format_title: "Seleccionar Formato a Configurar",
            setup_steps_count: "{{count}} Pasos de Configuración",
            start_setup_btn: "INICIAR SETUP",
            step_x_of_y: "Paso {{current}} de {{total}}",
            product_label: "Producto",
            cancel_btn: "Cancelar",
            mandatory_instruction: "Instrucción Obligatoria",
            visual_reference: "Referencia Visual",
            confirm_continue_btn: "CONFIRMAR Y CONTINUAR",
            setup_completed_title: "¡Configuración Completada!",
            setup_completed_msg: "El formato para \"{{product}}\" está listo para producción.",
            restart_btn: "Reiniciar",
            view_dashboard_btn: "Ver Dashboard",
            abort_modal_title: "¿Abortar Configuración?",
            abort_modal_msg: "¿Está seguro que desea cancelar la configuración actual? Todo el progreso se perderá y regresará a la pantalla inicial.",
            abort_modal_no: "NO, CONTINUAR SETUP",
            abort_modal_yes: "SÍ, ABORTAR",
            language_pt: "Português",
            language_es: "Español",
            language_en: "English",
            login_title: "Identificación del Operador",
            login_subtitle: "Por favor, ingrese su PIN de acceso para continuar",
            pin_placeholder: "Ingrese el PIN",
            login_error: "PIN incorrecto. Intente nuevamente.",
            login_btn: "ACCEDER AL SISTEMA",
            history_modal_title: "Registro de Actividades",
            history_empty: "No hay registros disponibles.",
            history_col_date: "Fecha/Hora",
            history_col_op: "Operador",
            history_col_format: "Formato",
            history_col_status: "Estado",
            status_completed: "COMPLETADO",
            status_cancelled: "ANULADO",
            close_btn: "Cerrar",
            kiosk_mode_btn: "Modo Quiosco"
        }
    },
    en: {
        translation: {
            app_title: "SetupMaster",
            app_subtitle: "Industrial Configuration System",
            history_btn: "History",
            select_format_title: "Select Format to Configure",
            setup_steps_count: "{{count}} Configuration Steps",
            start_setup_btn: "START SETUP",
            step_x_of_y: "Step {{current}} of {{total}}",
            product_label: "Product",
            cancel_btn: "Cancel",
            mandatory_instruction: "Mandatory Instruction",
            visual_reference: "Visual Reference",
            confirm_continue_btn: "CONFIRM AND CONTINUE",
            setup_completed_title: "Setup Completed!",
            setup_completed_msg: "The configuration for \"{{product}}\" is ready for production.",
            restart_btn: "Restart",
            view_dashboard_btn: "View Dashboard",
            abort_modal_title: "Abort Setup?",
            abort_modal_msg: "Are you sure you want to cancel the current setup? All progress will be lost and you will return to the home screen.",
            abort_modal_no: "NO, CONTINUE SETUP",
            abort_modal_yes: "YES, ABORT",
            language_pt: "Português",
            language_es: "Español",
            language_en: "English",
            login_title: "Operator Identification",
            login_subtitle: "Please enter your access PIN to continue",
            pin_placeholder: "Enter PIN",
            login_error: "Incorrect PIN. Please try again.",
            login_btn: "ACCESS SYSTEM",
            history_modal_title: "Activity Log",
            history_empty: "No records found.",
            history_col_date: "Date/Time",
            history_col_op: "Operator",
            history_col_format: "Format",
            history_col_status: "Status",
            status_completed: "COMPLETED",
            status_cancelled: "CANCELLED",
            close_btn: "Close",
            kiosk_mode_btn: "Kiosk Mode"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "pt", // default language
        fallbackLng: "pt",
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
