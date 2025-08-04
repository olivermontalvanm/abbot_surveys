export const userRoles = {
    projectAdmin: "Administrador de Proyecto",
    costChief: "Control de Costos",
    shoppingChief: "Jefe de Compras",
    shoppingAnalyst: "Analista de Compras",
    its: "ITS",

    adminManagement: "Gerencia Administrativa y Financiera",
    projectResident: "Residente de Proyecto",
    projectOpsManagement: "Gerente de Proyecto",
    manager: "Gerencia General",
};


export const requestStatuses = {
    costStatuses: {
        pending: { id: "COSTO:PENDIENTE", label: "Pendiente de revisión" },
        reviewed: { id: "REVISADO", label: "Revisado" },
        cancelled: { id: "ANULADO", label: "Anulado" },
        inquiry: { id: "CONSULTA", label: "Consulta" }
    },
    shoppingStatuses: {
        quoting: { id: "COTIZANDO", label: "Cotizando" },
        exonerationAwait: { id: "ESPERA EXONERACION", label: "En espera de exoneración" },
        purchaseOrder: { id: "ORDEN COMPRA", label: "Orden de compra" },
        checkAwait: { id: "CHEQUE ESPERA", label: "En espera de cheque" },
        checkReceived: { id: "CHEQUE COMPRAS", label: "Cheque en compras" },
        transportAwait: { id: "TRANSPORTE ESPERA", label: "En espera de transporte" },
        deliveredCentralWH: { id: "ENTREGADO BODEGA CENTRAL", label: "Entregado en bodega central" },
        finished: { id: "FINALIZADO", label: "Finalizado" },
        changesRequested: { id: "COMPRAS:CAMBIOS_SOLICITADOS", label: "Cambios solicitados" },
        changesPerformed: { id: "COMPRAS:CAMBIOS_REALIZADOS", label: "Cambios realizados" },
        cancelled: { id: "COMPRAS:ANULADO", label: "Anulado (Compras)" },
        internalTransfer: { id: "COMPRAS:TRASLADO_INTERNO", label: "Traslado interno" },
        cashPayment: { id: "COMPRAS:PAGO_EFECTIVO", label: "Pago en efectivo" }
    },
    admonStatuses: {
        checkSignature: { id: "CHEQUE FIRMA", label: "En espera de firma de cheque" },
        checkDelivered: { id: "CHEQUE ENTREGADO", label: "Cheque entregado a compras" },
        accounting: { id: "CONTABILIDAD", label: "Contabilidad" },
        received: { id: "ADMON:RECIBIDO", label: "Recibido" }
    }
};
