require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", "bootbox", "moment", "inputmask", "numeral"], function (alertify, bootbox, moment, inputmask, numeral) {

        alertify.set('notifier', 'position', 'top-center');

        const c_empresa = $.solver.session.SESSION_EMPRESA;
        const c_usuario = $.solver.session.SESSION_ID;
        const table = '#table';
        const frm = 'form[name=frm]';

        let _controls = null;
        let isRendered = false;
        let actualizar = true;

        $.VerCaja = function (index) {
            var row = $(table).jqxGrid('getrows')[index];
            document.location.href = $.solver.baseUrl + `/Procesos/ArqueoCajaVendedor?a=${row['C_CAJA']}&b=${row['Vendedor']}&c=${row['C_FECHA']}&d=${row['C_OPERACION']}`;
        }
        $.Imprimir = function (index) {

            var row = $(table).jqxGrid('getrows')[index];
            $.DisplayStatusBar({ message: 'Generando pdf.' });

            var optionsToServer = {
                empresa: $.solver.session.SESSION_EMPRESA,
                formato: 'formato_estandar_cuadre_caja',
                papel: 'A4',
                querys: [
                    {
                        name: 'cabecera',
                        args: $.ConvertObjectToArr({
                            modeWork: 'd', //diccionario
                            script: 'q_gbl_cuadre_caja_info_general',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['C_FECHA'],
                            C_OPERACION: row['C_OPERACION']
                        })
                    },
                    {
                        name: 'detalle',
                        args: $.ConvertObjectToArr({
                            script: 'q_gbl_cuadre_caja_tabla_general',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['C_FECHA'],
                            C_OPERACION: row['C_OPERACION']
                        })
                    },
                    {
                        name: 'tblSoles',
                        args: $.ConvertObjectToArr({
                            script: 'q_gbl_cuadre_caja_tabla_soles',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['C_FECHA'],
                            C_OPERACION: row['C_OPERACION']
                        })
                    },
                    {
                        name: 'tblDolares',
                        args: $.ConvertObjectToArr({
                            script: 'q_gbl_cuadre_caja_tabla_dolares',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['C_FECHA'],
                            C_OPERACION: row['C_OPERACION']
                        })
                    },
                    {
                        name: 'tblTarjetas',
                        args: $.ConvertObjectToArr({
                            script: 'q_gbl_cuadre_caja_tabla_tarjeta',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['C_FECHA'],
                            C_OPERACION: row['C_OPERACION']
                        })
                    },
                    {
                        name: 'tblDetalleComprobanteSoles',
                        args: $.ConvertObjectToArr({
                            script: 'q_gbl_cuadre_caja_tabla_comprobantes_soles',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['C_FECHA'],
                            C_OPERACION: row['C_OPERACION']
                        })
                    },
                    {
                        name: 'tblDetalleComprobanteDolares',
                        args: $.ConvertObjectToArr({
                            script: 'q_gbl_cuadre_caja_tabla_comprobantes_dolares',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['C_FECHA'],
                            C_OPERACION: row['C_OPERACION']
                        })
                    },
                ],
            };

            var settings = {
                "url": `${$.solver.services.files}/Service/CreatePDFDocumentWithFile`,
                "method": "POST",
                "timeout": 0,
                xhr: function () {
                    xhr = jQuery.ajaxSettings.xhr.apply(this, arguments);
                    return xhr;
                },
                xhrFields: {
                    responseType: 'blob'
                },
                beforeSend: function (xhr) {
                    $.DisplayStatusBar({ message: 'Generando documento ...' });
                },
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(optionsToServer),
            };

            $.ajax(settings).done(function (json) {

                $.CloseStatusBar();

                var blobUrl = URL.createObjectURL(xhr.response);

                var dialog = bootbox.dialog({
                    message: `<div class="embed-responsive embed-responsive-16by9"><iframe class= "embed-responsive-item" src="" allowfullscreen></iframe></div>`,
                    closeButton: true,
                    className: 'modal-75'
                });

                dialog.init(function () {
                    $(dialog).find('.embed-responsive-item').attr("src", blobUrl);
                });

            });
        }
        $.Paloteo = function (index) {
            var row = $(table).jqxGrid('getrows')[index];

            let formato = 'formato_estandar_resumen_caja'

            if (row['Estado caja'] == 'Arqueado') formato = 'formato_estandar_resumen_caja_arqueado'

            $.DisplayStatusBar({ message: 'Generando pdf.' });

            var optionsToServer = {
                empresa: $.solver.session.SESSION_EMPRESA,
                formato: formato,
                papel: 'Ticket80',
                querys: [
                    {
                        name: 'cabecera',
                        args: $.ConvertObjectToArr({
                            modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja_cabecera',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['Fecha caja apertura'],
                            C_OPERACION: row['C_OPERACION'],
                            TIPO_RESULTADO: 'LISTA-PRODUCTOS',
                        })
                    },
                    {
                        name: 'productos_vendidos',
                        args: $.ConvertObjectToArr({
                            //modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['Fecha caja apertura'],
                            C_OPERACION: row['C_OPERACION'],
                            TIPO_RESULTADO: 'LISTA-PRODUCTOS',
                        })
                    },
                    {
                        name: 'productos_cortesia',
                        args: $.ConvertObjectToArr({
                            //modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['Fecha caja apertura'],
                            C_OPERACION: row['C_OPERACION'],
                            TIPO_RESULTADO: 'LISTA-PRODUCTOS-CORTESIA',
                        })
                    },
                    {
                        name: 'metodos_pago',
                        args: $.ConvertObjectToArr({
                            //modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['Fecha caja apertura'],
                            C_OPERACION: row['C_OPERACION'],
                            TIPO_RESULTADO: 'LISTA-METODOS-PAGO',
                        })
                    },
                    {
                        name: 'comprobantes_ok',
                        args: $.ConvertObjectToArr({
                            //modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['Fecha caja apertura'],
                            C_OPERACION: row['C_OPERACION'],
                            TIPO_RESULTADO: 'LISTA-COMPROBANTES-OK',
                        })
                    },
                    //{
                    //    name: 'comprobantes_anulados',
                    //    args: $.ConvertObjectToArr({
                    //        //modeWork: 'd', //diccionario
                    //        script: 'q_puntoventa_procesos_baloteo_de_caja',
                    //        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    //        C_CAJA: row['C_CAJA'],
                    //        C_USUARIO: row['Vendedor'],
                    //        C_FECHA: row['Fecha caja apertura'],
                    //        C_OPERACION: row['C_OPERACION'],
                    //        TIPO_RESULTADO: 'LISTA-COMPROBANTES-ANULADOS',
                    //    })
                    //},
                    {
                        name: 'productos_anulados',
                        args: $.ConvertObjectToArr({
                            //modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['Fecha caja apertura'],
                            C_OPERACION: row['C_OPERACION'],
                            TIPO_RESULTADO: 'LISTA-COMPROBANTES-ANULADOS-PRODUCTO',
                        })
                    },
                    {
                        name: 'cuentas_anuladas',
                        args: $.ConvertObjectToArr({
                            //modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['Fecha caja apertura'],
                            C_OPERACION: row['C_OPERACION'],
                            TIPO_RESULTADO: 'LISTA-COMPROBANTES-ANULADOS-CUENTA',
                        })
                    },
                    {
                        name: 'documentos_anulados',
                        args: $.ConvertObjectToArr({
                            //modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['Fecha caja apertura'],
                            C_OPERACION: row['C_OPERACION'],
                            TIPO_RESULTADO: 'LISTA-COMPROBANTES-ANULADOS-DOCUMENTO',
                        })
                    },
                    {
                        name: 'comprobantes_por_hora',
                        args: $.ConvertObjectToArr({
                            //modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['Fecha caja apertura'],
                            C_OPERACION: row['C_OPERACION'],
                            TIPO_RESULTADO: 'LISTA-COMPROBANTE-HORA',
                        })
                    },
                    {
                        name: 'comprobante_por_metodopago',
                        args: $.ConvertObjectToArr({
                            //modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['Fecha caja apertura'],
                            C_OPERACION: row['C_OPERACION'],
                            TIPO_RESULTADO: 'LISTA-COMPROBANTE-METODOS-PAGO',
                        })
                    },
                    {
                        name: 'tblResumenArqueo',
                        args: $.ConvertObjectToArr({
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['Fecha caja apertura'],
                            C_OPERACION: row['C_OPERACION'],
                            TIPO_RESULTADO: 'LISTA-ARQUEO-RESUMEN',
                        })
                    },
                    {
                        name: 'tblSolesArqueo',
                        args: $.ConvertObjectToArr({
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['Fecha caja apertura'],
                            C_OPERACION: row['C_OPERACION'],
                            TIPO_RESULTADO: 'LISTA-ARQUEO-SOLES',
                        })
                    },
                    {
                        name: 'tblDolaresArqueo',
                        args: $.ConvertObjectToArr({
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['Fecha caja apertura'],
                            C_OPERACION: row['C_OPERACION'],
                            TIPO_RESULTADO: 'LISTA-ARQUEO-DOLARES',
                        })
                    },
                    {
                        name: 'tblCocinas',
                        args: $.ConvertObjectToArr({
                            //modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_FECHA: row['Fecha caja apertura'],
                            C_OPERACION: row['C_OPERACION'],
                            TIPO_RESULTADO: 'LISTA-COCINA',
                        })
                    },
                ],
            };

            var settings = {
                "url": `${$.solver.services.files}/Service/CreatePDFDocumentWithFile`,
                "method": "POST",
                "timeout": 0,
                xhr: function () {
                    xhr = jQuery.ajaxSettings.xhr.apply(this, arguments);
                    return xhr;
                },
                xhrFields: {
                    responseType: 'blob'
                },
                beforeSend: function (xhr) {
                    $.DisplayStatusBar({ message: 'Generando documento ...' });
                },
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(optionsToServer),
            };

            $.ajax(settings).done(function (json) {

                $.CloseStatusBar();

                var blobUrl = URL.createObjectURL(xhr.response);

                var dialog = bootbox.dialog({
                    message: `<div class="embed-responsive embed-responsive-16by9"><iframe class= "embed-responsive-item" src="" allowfullscreen></iframe></div>`,
                    closeButton: true,
                    className: 'modal-75'
                });

                dialog.init(function () {
                    $(dialog).find('.embed-responsive-item').attr("src", blobUrl);
                });

            });

            $.GetQuery({
                query: ['q_pdv_gestioncaja_obtener_impresora'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_CAJA: row['C_CAJA']
                }],
                onReady: function (result) {
                    var impresora = result[0].C_IMPRESORA;
                    $.SendPrinter({
                        empresa: $.solver.session.SESSION_EMPRESA,
                        formato: formato,
                        impresora: impresora,
                        copias: 1,
                        papel: 'Ticket80',
                        querys: [
                            {
                                name: 'cabecera',
                                args: $.ConvertObjectToArr({
                                    modeWork: 'd', //diccionario
                                    script: 'q_puntoventa_procesos_baloteo_de_caja_cabecera',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_CAJA: row['C_CAJA'],
                                    C_USUARIO: row['Vendedor'],
                                    C_FECHA: row['Fecha caja apertura'],
                                    C_OPERACION: row['C_OPERACION'],
                                    TIPO_RESULTADO: 'LISTA-PRODUCTOS',
                                })
                            },
                            {
                                name: 'productos_vendidos',
                                args: $.ConvertObjectToArr({
                                    //modeWork: 'd', //diccionario
                                    script: 'q_puntoventa_procesos_baloteo_de_caja',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_CAJA: row['C_CAJA'],
                                    C_USUARIO: row['Vendedor'],
                                    C_FECHA: row['Fecha caja apertura'],
                                    C_OPERACION: row['C_OPERACION'],
                                    TIPO_RESULTADO: 'LISTA-PRODUCTOS',
                                })
                            },
                            {
                                name: 'productos_cortesia',
                                args: $.ConvertObjectToArr({
                                    //modeWork: 'd', //diccionario
                                    script: 'q_puntoventa_procesos_baloteo_de_caja',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_CAJA: row['C_CAJA'],
                                    C_USUARIO: row['Vendedor'],
                                    C_FECHA: row['Fecha caja apertura'],
                                    C_OPERACION: row['C_OPERACION'],
                                    TIPO_RESULTADO: 'LISTA-PRODUCTOS-CORTESIA',
                                })
                            },
                            {
                                name: 'metodos_pago',
                                args: $.ConvertObjectToArr({
                                    //modeWork: 'd', //diccionario
                                    script: 'q_puntoventa_procesos_baloteo_de_caja',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_CAJA: row['C_CAJA'],
                                    C_USUARIO: row['Vendedor'],
                                    C_FECHA: row['Fecha caja apertura'],
                                    C_OPERACION: row['C_OPERACION'],
                                    TIPO_RESULTADO: 'LISTA-METODOS-PAGO',
                                })
                            },
                            {
                                name: 'comprobantes_ok',
                                args: $.ConvertObjectToArr({
                                    //modeWork: 'd', //diccionario
                                    script: 'q_puntoventa_procesos_baloteo_de_caja',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_CAJA: row['C_CAJA'],
                                    C_USUARIO: row['Vendedor'],
                                    C_FECHA: row['Fecha caja apertura'],
                                    C_OPERACION: row['C_OPERACION'],
                                    TIPO_RESULTADO: 'LISTA-COMPROBANTES-OK',
                                })
                            },
                            {
                                name: 'productos_anulados',
                                args: $.ConvertObjectToArr({
                                    //modeWork: 'd', //diccionario
                                    script: 'q_puntoventa_procesos_baloteo_de_caja',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_CAJA: row['C_CAJA'],
                                    C_USUARIO: row['Vendedor'],
                                    C_FECHA: row['Fecha caja apertura'],
                                    C_OPERACION: row['C_OPERACION'],
                                    TIPO_RESULTADO: 'LISTA-COMPROBANTES-ANULADOS-PRODUCTO',
                                })
                            },
                            {
                                name: 'cuentas_anuladas',
                                args: $.ConvertObjectToArr({
                                    //modeWork: 'd', //diccionario
                                    script: 'q_puntoventa_procesos_baloteo_de_caja',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_CAJA: row['C_CAJA'],
                                    C_USUARIO: row['Vendedor'],
                                    C_FECHA: row['Fecha caja apertura'],
                                    C_OPERACION: row['C_OPERACION'],
                                    TIPO_RESULTADO: 'LISTA-COMPROBANTES-ANULADOS-CUENTA',
                                })
                            },
                            {
                                name: 'documentos_anulados',
                                args: $.ConvertObjectToArr({
                                    //modeWork: 'd', //diccionario
                                    script: 'q_puntoventa_procesos_baloteo_de_caja',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_CAJA: row['C_CAJA'],
                                    C_USUARIO: row['Vendedor'],
                                    C_FECHA: row['Fecha caja apertura'],
                                    C_OPERACION: row['C_OPERACION'],
                                    TIPO_RESULTADO: 'LISTA-COMPROBANTES-ANULADOS-DOCUMENTO',
                                })
                            },
                            {
                                name: 'comprobantes_por_hora',
                                args: $.ConvertObjectToArr({
                                    //modeWork: 'd', //diccionario
                                    script: 'q_puntoventa_procesos_baloteo_de_caja',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_CAJA: row['C_CAJA'],
                                    C_USUARIO: row['Vendedor'],
                                    C_FECHA: row['Fecha caja apertura'],
                                    C_OPERACION: row['C_OPERACION'],
                                    TIPO_RESULTADO: 'LISTA-COMPROBANTE-HORA',
                                })
                            },
                            {
                                name: 'comprobante_por_metodopago',
                                args: $.ConvertObjectToArr({
                                    //modeWork: 'd', //diccionario
                                    script: 'q_puntoventa_procesos_baloteo_de_caja',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_CAJA: row['C_CAJA'],
                                    C_USUARIO: row['Vendedor'],
                                    C_FECHA: row['Fecha caja apertura'],
                                    C_OPERACION: row['C_OPERACION'],
                                    TIPO_RESULTADO: 'LISTA-COMPROBANTE-METODOS-PAGO',
                                })
                            },
                            {
                                name: 'tblResumenArqueo',
                                args: $.ConvertObjectToArr({
                                    script: 'q_puntoventa_procesos_baloteo_de_caja',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_CAJA: row['C_CAJA'],
                                    C_USUARIO: row['Vendedor'],
                                    C_FECHA: row['Fecha caja apertura'],
                                    C_OPERACION: row['C_OPERACION'],
                                    TIPO_RESULTADO: 'LISTA-ARQUEO-RESUMEN',
                                })
                            },
                            {
                                name: 'tblSolesArqueo',
                                args: $.ConvertObjectToArr({
                                    script: 'q_puntoventa_procesos_baloteo_de_caja',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_CAJA: row['C_CAJA'],
                                    C_USUARIO: row['Vendedor'],
                                    C_FECHA: row['Fecha caja apertura'],
                                    C_OPERACION: row['C_OPERACION'],
                                    TIPO_RESULTADO: 'LISTA-ARQUEO-SOLES',
                                })
                            },
                            {
                                name: 'tblDolaresArqueo',
                                args: $.ConvertObjectToArr({
                                    script: 'q_puntoventa_procesos_baloteo_de_caja',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_CAJA: row['C_CAJA'],
                                    C_USUARIO: row['Vendedor'],
                                    C_FECHA: row['Fecha caja apertura'],
                                    C_OPERACION: row['C_OPERACION'],
                                    TIPO_RESULTADO: 'LISTA-ARQUEO-DOLARES',
                                })
                            },
                            {
                                name: 'tblCocinas',
                                args: $.ConvertObjectToArr({
                                    //modeWork: 'd', //diccionario
                                    script: 'q_puntoventa_procesos_baloteo_de_caja',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_CAJA: row['C_CAJA'],
                                    C_USUARIO: row['Vendedor'],
                                    C_FECHA: row['Fecha caja apertura'],
                                    C_OPERACION: row['C_OPERACION'],
                                    TIPO_RESULTADO: 'LISTA-COCINA',
                                })
                            },
                        ]
                    });
                }
            })

        };

        const actionAperturarCaja = function () {
            $.GetQuery({
                query: ['q_puntoventa_procesos_gestioncaja_validarcajasparaaperturar'],
                items: [{
                    C_EMPRESA: c_empresa
                }],
                onReady: function (result) {
                    if (result.length == 0) {
                        alertify.warning('No hay cajas para aperturar');
                    }
                    else {
                        var token = $.CreateToken();
                        var dialog = bootbox.dialog({
                            title: 'Apertura de caja',
                            message: `<div id="${token}"></div>`,
                            className: 'modal-search-60'
                        });

                        dialog.init(function () {
                            setTimeout(function () {

                                $(dialog).find('#' + token).html(`
                                    <form name="formEstablecimiento" onsubmit="return false;">
                                        <div class="row">
                                            <div class="col-12 zoneCaja">
                                                <div class="row mb-3">
                                                    <div class="col-4" style="display: flex; align-items: center;">
                                                        <label class="col-form-label col-form-label-lg labels">Cajero:</label>
                                                    </div>
                                                    <div class="col-8 text-center" style="margin-bottom: 5px; margin-top: 5px;">
                                                        <select name="C_CAJERO" class="form-control form-control-lg"
                                                            data-query="cb_puntoventa_procesos_listarvendedores" data-value="CODIGO" data-field="CODIGO" data-C_EMPRESA="${c_empresa}"required>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="row mb-3">
                                                    <div class="col-4" style="display: flex; align-items: center;">
                                                        <label class="col-form-label col-form-label-lg labels">Establecimiento:</label>
                                                    </div>
                                                    <div class="col-8 text-center" style="margin-bottom: 5px; margin-top: 5px;">
                                                        <select name="C_ESTABLECIMIENTO" class="form-control form-control-lg"
                                                            data-query="q_pdv_mantenimiento_configuraciones_obtenerestablecimientos_disponibles" data-value="value" data-field="label" data-c_empresa="${c_empresa}"required>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="row mb-3">
                                                    <div class="col-4" style="display: flex; align-items: center;">
                                                        <label class="col-form-label col-form-label-lg labels">Caja:</label>
                                                    </div>
                                                    <div class="col-8 text-center" style="margin-bottom: 5px; margin-top: 5px;">
                                                        <select name="C_CAJA" class="form-control form-control-lg"
                                                            data-query="q_puntoventa_mantenimiento_configuraciones_obtenercajas_disponibles" data-value="CODIGO" data-field="DESCRIPCION" data-C_EMPRESA="${c_empresa}" data-C_ESTABLECIMIENTO=""required>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="row mb-3">
                                                    <div class="col-4" style="display: flex; align-items: center;">
                                                        <label class="col-form-label col-form-label-lg labels">Monto incial:</label>
                                                    </div>
                                                    <div class="col-8 text-center" style="margin-bottom: 5px; margin-top: 5px;">
                                                        <input type="number" name="MONTO" class="form-control form-control-lg" />
                                                    </div>
                                                </div>
                                                <div class="row mb-3">
                                                    <div class="col">
                                                        <button class="btn btn-danger btn-lg float-right"><i class="fa fa-floppy-o" aria-hidden="true"></i> Iniciar</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <input type="hidden" name="COD_MODULO" value="${$.solver.basePath}" />
                                    </form>
                                `);

                                $(dialog).find('form[name=formEstablecimiento]').ValidForm({
                                    type: -1,
                                    onReady: function (_, controls) {
                                        var c_cajero = $(controls.C_CAJERO).val();
                                        var c_establecimiento = $(controls.C_ESTABLECIMIENTO).val();
                                        var c_caja = $(controls.C_CAJA).val();
                                        var nomCaja = $(controls.C_CAJA)[0].args.data.filter(x => x['CODIGO'] == $(controls.C_CAJA).val())[0].DESCRIPCION;
                                        var monto = $(controls.MONTO).val();

                                        const objectCobranza = {
                                            script: 'spw_puntoventa_procesos_arqueo_guardarcobranza',
                                            C_EMPRESA: c_empresa,
                                            C_CAJA: c_caja,
                                            C_USUARIO: c_cajero,
                                            MONTO: (monto == '' ? 0 : monto),
                                            COD_MODULO: $.solver.basePath
                                        };

                                        $.AddPetition({
                                            type: 4,
                                            items: $.ConvertObjectToArr(objectCobranza)
                                        });

                                        $.SendPetition({
                                            onReady: function (result) {
                                                $.CloseStatusBar();
                                                alertify.success('Caja aperturada');
                                                $(dialog).modal('hide');
                                                $(table).jqxGrid('updatebounddata');
                                            },
                                            onBefore: function () {
                                                $.DisplayStatusBar({ message: 'Registrando información.' });
                                            },
                                            onError: function (_error) {
                                                $.CloseStatusBar();
                                                $.ShowError({ error: _error });
                                            }
                                        });
                                    },
                                    onSubmit: function (form, controls) {
                                        var c_cajero = $(controls.C_CAJERO).val();
                                        var c_establecimiento = $(controls.C_ESTABLECIMIENTO).val();
                                        var c_caja = $(controls.C_CAJA).val();

                                        if (c_cajero == '' || c_caja == '' || c_establecimiento == '') {
                                            alertify.warning('Por favor completar los campos obligarorios.');
                                            return false;
                                        }

                                        return true;
                                    },
                                    onDone: function (_, controls) {
                                        $(controls.C_CAJERO).change(function () {
                                            var c_establecimiento = $(controls.C_CAJERO)[0].args.data.filter(x => x['CODIGO'] == $(controls.C_CAJERO).val())[0].C_ESTABLECIMIENTO;

                                            if ((c_establecimiento == null ? '' : c_establecimiento)) {
                                                if ($(controls.C_ESTABLECIMIENTO)[0].args.data.filter(x => x['CODIGO'] == c_establecimiento).length > 0) {
                                                    $(controls.C_ESTABLECIMIENTO).val(c_establecimiento).trigger('change');
                                                }
                                                else {
                                                    $(controls.C_ESTABLECIMIENTO).val('').trigger('change');
                                                }
                                            }
                                            else {
                                                $(controls.C_ESTABLECIMIENTO).val('').trigger('change');
                                            }
                                        });

                                        $(controls.C_ESTABLECIMIENTO).change(function () {
                                            $(controls.C_CAJA).attr('data-c_establecimiento', $(controls.C_ESTABLECIMIENTO).val());
                                            $(controls.C_CAJA).FieldLoadRemote();
                                        })
                                    }
                                })

                            }, 150);
                        });
                    }
                }
            })
        }
        const actionCerrarCaja = function () {
            var index = $(table).jqxGrid('getselectedrowindex');
            if (index >= 0) {
                var row = $(table).jqxGrid('getrows')[index];
                if (row['Estado caja'] == 'Aperturada') {

                    $.GetQuery({
                        query: ['q_puntoventa_procesos_arqueo_obtenerinfocaja'],
                        items: [{
                            C_FECHA: row['Fecha caja apertura'],
                            C_EMPRESA: c_empresa,
                            C_CAJA: row['C_CAJA'],
                            C_USUARIO: row['Vendedor'],
                            C_OPERACION: row['C_OPERACION'],
                            MODULO: $.solver.basePath
                        }],
                        onReady: function (result) {
                            //if (result.length == 0 || result[0].PENDIENTE == '0.00') {
                            alertify
                                .confirm('Mensaje del sistema', '<h3 class="text-center">¿Seguro de cerrar la caja?</h3>', function () {

                                    $.AddPetition({
                                        type: 4,
                                        items: $.ConvertObjectToArr({
                                            script: 'spw_arqueocaja_cerrar_caja',
                                            C_FECHA: row['Fecha caja apertura'],
                                            C_EMPRESA: c_empresa,
                                            C_CAJA: row['C_CAJA'],
                                            C_USUARIO: row['Vendedor'],
                                        })
                                    });

                                    $.SendPetition({
                                        onReady: function () {
                                            $.CloseStatusBar();
                                            alertify.success('La caja ha sido cerrada.');
                                            $(table).jqxGrid('updatebounddata');
                                        },
                                        onBefore: function () {
                                            $.DisplayStatusBar({ message: 'Cerrando caja' });
                                        },
                                        onError: function (_error) {
                                            $.CloseStatusBar();
                                            $.ShowError({ error: _error });
                                        }
                                    });
                                }, null)
                                .set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                            //}
                            //else {
                            //    alertify.error('No se puede cerrar la caja porque tiene pedidos pendientes.')
                            //}

                        }
                    });

                }
                else {
                    alertify.warning('Solo se pueden cerrar cajas en estado aperturada');
                }
            }
        }

        const fnMostrarPdf = function (token) {
            bootbox.dialog({
                message: `<div class="embed-responsive embed-responsive-16by9"><iframe class= "embed-responsive-item" src="https://api.solver.com.pe/v1//service/ViewFile/${token}/" allowfullscreen></iframe></div>`,
                closeButton: true,
                className: 'modal-75'
            });
        }

        const fnCrearTabla = function () {

            $(table).CreateGrid({
                query: 'tbl_puntoventa_procesos_arqueocaja',
                items: {
                    C_EMPRESA: c_empresa,
                    DESDE: function () {
                        return $(_controls.desde).val();
                    },
                    HASTA: function () {
                        return $(_controls.hasta).val();
                    },
                    C_VENDEDOR: function () {
                        return $(_controls.vendedor).val();
                    },
                    C_ESTABLECIMIENTO: function () {
                        return $(_controls.establecimiento).val();
                    },
                    C_CAJA: function () {
                        return $(_controls.caja).val();
                    },
                    MODULO: $.solver.basePath
                },
                sortcolumn: 'Fecha caja apertura',
                sortdirection: 'DESC',
                hiddens: ['C_ESTABLECIMIENTO', 'C_CAJA', 'C_FECHA', 'C_OPERACION', 'Monto pendiente'],
                columns: {
                    'Fecha caja apertura': {
                        text: 'Fecha apertura',
                        width: 120,
                        cellsAlign: 'center',
                    },
                    'Fecha cierre': {
                        width: 120,
                        cellsAlign: 'center',
                    },
                    'Caja': {
                        width: 120
                    },
                    'Vendedor': {
                        width: 100
                    },
                    'Cant. pedido': {
                        width: 80,
                        cellsAlign: 'right',
                        columnType: 'numberinput',
                        cellsFormat: 'd2',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'Monto inicial': {
                        width: 90,
                        cellsAlign: 'right',
                        columnType: 'numberinput',
                        cellsFormat: 'd2',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'Monto pendiente': {
                        width: 90,
                        cellsAlign: 'right',
                        columnType: 'numberinput',
                        cellsFormat: 'd2',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'Monto facturado': {
                        width: 100,
                        cellsAlign: 'right',
                        columnType: 'numberinput',
                        cellsFormat: 'd2',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'Estado caja': {
                        width: 80,
                        cellsAlign: 'center',
                    },
                    'Fecha arqueo': {
                        width: 120,
                        cellsAlign: 'center',
                    },
                    'Usuario arqueo': {
                        width: 100
                    },
                    '': {
                        width: 220,
                        cellsrenderer: function (index, columnfield, value, defaulthtml, columnproperties) {
                            var botones = ''
                            var row = $(table).jqxGrid('getrows')[index];

                            if (row['Estado caja'] == 'Cerrado' || row['Estado caja'] == 'Arqueado') {

                                botones += `<a onclick="$.VerCaja('${index}');" style="cursor: pointer;" class="jqx-grid-widget ml-2"><i class="fa fa-dollar"></i>&nbsp;Arquear</a>`

                                if (row['Estado caja'] == 'Arqueado') {
                                    botones += `<a onclick="$.Imprimir('${index}');" style="cursor: pointer;" class="jqx-grid-widget ml-2"><i class="fa fa-print"></i>&nbsp;Imprimir</a>`
                                }
                            }
                            botones += `<a onclick="$.Paloteo('${index}');" style="cursor: pointer;" class="jqx-grid-widget ml-2"><i class="fa fa-print"></i>&nbsp;Paloteo</a>`

                            return `<div class="jqx-grid-cell-middle-align" style="margin-top: 4.5px;">${botones}</div>`;
                        }
                        //createwidget: function (row, column, value, htmlElement) {
                        //    console.log(1);
                        //    var rowIndex = row.boundindex
                        //    if (actualizar) {
                        //        actualizar = false;
                        //        setTimeout(function () {
                        //            $(table).jqxGrid('refresh');
                        //            actualizar = true;
                        //        }, 250)
                        //    }
                        //},
                        //initwidget: function (rowIndex, column, value, htmlElement) {
                        //    $(htmlElement).html('');
                        //    $(htmlElement).addClass('jqx-grid-cell-middle-align');
                        //    $(htmlElement).addClass('mt-1');


                        //},
                    }
                },
                config: {
                    //virtualmode: false,
                    //height: 500,  
                    //sortable: false,
                    //pageable: true,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 20,
                }
            });

        }

        $(frm).ValidForm({
            type: -1,
            onReady: function () {
                $(table).jqxGrid('updatebounddata');
            },
            onDone: function (form, controls) {
                _controls = controls;

                $(controls.desde).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });
                $(controls.hasta).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });

                fnCrearTabla();
                $(controls.establecimiento).change(function () {
                    $(controls.caja).attr('data-C_ESTABLECIMIENTO', $(controls.establecimiento).val());
                    $(controls.caja).FieldLoadRemote();
                });

                $('#actions').CreateActions({
                    text: 'Acciones',
                    class: 'btn btn-sm btn-orange',
                    actions: {
                        'Aperturar Caja': {
                            icon: 'fa fa-plus',
                            callback: actionAperturarCaja
                        },
                        'Cerrar Caja': {
                            icon: 'fa fa-close',
                            callback: actionCerrarCaja
                        },
                    },
                })
            },
        })
    });
});