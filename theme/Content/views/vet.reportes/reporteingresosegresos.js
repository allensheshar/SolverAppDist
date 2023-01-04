require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", "bootbox", "moment", "inputmask", "numeral"], function (alertify, bootbox, moment, inputmask, numeral) {

        const table1 = '#table1';
        const table2 = '#table2';
        const frm = 'form[name=frm]';
        let _controls;
        let isRendered = false

        const fnCalcularTotales = function () {
            var soles = 0;
            var dolares = 0;

            $.each($(table1).jqxGrid('getrows'), function (i, v) {
                soles += v['Soles']
            })

            $.each($(table2).jqxGrid('getrows'), function (i, v) {
                soles -= v['Soles']
                dolares -= v['Dolares']
            })

            $('#soles').text(numeral(soles).format('0.00'))
            $('#dolares').text(numeral(dolares).format('0.00'))
        };
        const fnCrearTabla = function () {
            $(table1).CreateGrid({
                query: 'tbl_puntoventa_procesos_ingresosegresos_listaingresos',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_ESTABLECIMIENTO: function () {
                        return $(_controls.C_ESTABLECIMIENTO).val();
                    },
                    C_CAJA: function () {
                        return $(_controls.C_CAJA).val();
                    },
                    C_USUARIO: function () {
                        return $(_controls.C_USUARIO).val();
                    },
                    DESDE: function () {
                        return $(_controls.DESDE).val();
                    },
                    HASTA: function () {
                        return $(_controls.HASTA).val();
                    },
                    C_CLIENTE: function () {
                        return $(_controls.C_CLIENTE).val();
                    },
                    C_METODO_PAGO: function () {
                        return $(_controls.C_METODO_PAGO).val();
                    },
                    BASE: $.solver.basePath,
                },
                hiddens: ['Cliente'],
                columns: {
                    'Fec. emisión': {
                        width: 150,
                    },
                    'Tipo comprobante': {
                        width: 150,
                    },
                    'Número comprobante': {
                        width: 140,
                    },
                    'Cliente': {
                    },
                    'Metodo Pago': {
                        width: 200
                    },
                    'Nro Operación': {
                        width: 120
                    },
                    'Soles': {
                        width: 120,
                        cellsAlign: 'right',
                        columnType: 'numberinput',
                        cellsFormat: 'd2',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold text-danger">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                },
                config: {
                    height: 300,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 20,
                    pageable: false,
                    virtualmode: false,
                    showgroupsheader: false,
                    sortable: false,
                    groupable: true,
                    closeablegroups: false,
                    rendered: function () {
                        fnCalcularTotales();

                        $(table1).jqxGrid('refresh');
                        $(table1).on('groupexpand', function (event) {
                            $(table1).jqxGrid('refresh');
                        })
                        $(table1).on('groupcollapse', function (event) {
                            $(table1).jqxGrid('refresh');
                        });
                        if (!isRendered) {
                            isRendered = true;
                            setTimeout(function () {
                                //$(table1).jqxGrid('removegroup', 'TIPO_COMPROBANTE');
                                //$(table1).jqxGrid('addgroup', 'TIPO_COMPROBANTE');
                                //$(table1).jqxGrid('removegroup', 'NRO_COMPROBANTE');
                                //$(table1).jqxGrid('addgroup', 'NRO_COMPROBANTE');
                                $(table1).jqxGrid('removegroup', 'Cliente');
                                $(table1).jqxGrid('addgroup', 'Cliente');
                                //$(table1).jqxGrid('removegroup', 'Metodo Pago');
                                //$(table1).jqxGrid('addgroup', 'Metodo Pago');
                                $(table1).jqxGrid('refresh');
                                $(table1).jqxGrid({ rowsheight: 30 });
                                $(table1).jqxGrid('expandallgroups');
                            }, 100)
                        }
                    },
                }
            });
            $(table2).CreateGrid({
                query: 'tbl_puntoventa_procesos_ingresosegresos_listaegresos',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_ESTABLECIMIENTO: function () {
                        return $(_controls.C_ESTABLECIMIENTO).val();
                    },
                    C_CAJA: function () {
                        return $(_controls.C_CAJA).val();
                    },
                    C_USUARIO: function () {
                        return $(_controls.C_USUARIO).val();
                    },
                    DESDE: function () {
                        return $(_controls.DESDE).val();
                    },
                    HASTA: function () {
                        return $(_controls.HASTA).val();
                    },
                    C_CLIENTE: function () {
                        return $(_controls.C_CLIENTE).val();
                    },
                },
                hiddens: [''],
                columns: {
                    'Fec. egreso': {
                        width: 120,
                    },
                    'Usuario': {
                        width: 130,
                    },
                    'Establecimiento': {
                        width: 140
                    },
                    'Caja': {
                        width: 150,
                    },
                    'Motivo': {
                        width: 360,
                    },
                    'Soles': {
                        width: 120,
                        cellsAlign: 'right',
                        columnType: 'numberinput',
                        cellsFormat: 'd2',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold text-danger">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'Dolares': {
                        width: 120,
                        cellsAlign: 'right',
                        columnType: 'numberinput',
                        cellsFormat: 'd2',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold text-danger">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                },
                config: {
                    height: 300,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 20,
                    rendered: function () {
                        fnCalcularTotales();
                    }
                }
            });
        };
        const actionGenerarPdf = function () {

            $.DisplayStatusBar({ message: 'Generando pdf.' });

            $.CreatePDFDocument({
                empresa: $.solver.session.SESSION_EMPRESA,
                formato: 'formato_estandar_ingresos_vs_egresos',
                papel: 'A4',
                querys: [
                    {
                        name: 'cabecera',
                        args: $.ConvertObjectToArr({
                            modeWork: 'd',
                            script: 'q_gbl_formato_ingresos_egresos_cabecera',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_ESTABLECIMIENTO: function () {
                                return $(_controls.C_ESTABLECIMIENTO).val();
                            },
                            C_CAJA: function () {
                                return $(_controls.C_CAJA).val();
                            },
                            C_USUARIO: function () {
                                return $(_controls.C_USUARIO).val();
                            },
                            DESDE: function () {
                                return $(_controls.DESDE).val();
                            },
                            HASTA: function () {
                                return $(_controls.HASTA).val();
                            },
                            C_CLIENTE: function () {
                                return $(_controls.C_CLIENTE).val();
                            },
                            C_METODO_PAGO: function () {
                                return $(_controls.C_METODO_PAGO).val();
                            },
                            BASE: $.solver.basePath
                        })
                    },
                    {
                        name: 'tblIngresos',
                        args: $.ConvertObjectToArr({
                            script: 'q_gbl_formato_ingresos_egresos_ingreso',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_ESTABLECIMIENTO: function () {
                                return $(_controls.C_ESTABLECIMIENTO).val();
                            },
                            C_CAJA: function () {
                                return $(_controls.C_CAJA).val();
                            },
                            C_USUARIO: function () {
                                return $(_controls.C_USUARIO).val();
                            },
                            DESDE: function () {
                                return $(_controls.DESDE).val();
                            },
                            HASTA: function () {
                                return $(_controls.HASTA).val();
                            },
                            C_CLIENTE: function () {
                                return $(_controls.C_CLIENTE).val();
                            },
                            C_METODO_PAGO: function () {
                                return $(_controls.C_METODO_PAGO).val();
                            },
                            BASE: $.solver.basePath
                        })
                    },
                    {
                        name: 'tblEgresos',
                        args: $.ConvertObjectToArr({
                            script: 'q_gbl_formato_ingresos_egresos_egreso',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_ESTABLECIMIENTO: function () {
                                return $(_controls.C_ESTABLECIMIENTO).val();
                            },
                            C_CAJA: function () {
                                return $(_controls.C_CAJA).val();
                            },
                            C_USUARIO: function () {
                                return $(_controls.C_USUARIO).val();
                            },
                            DESDE: function () {
                                return $(_controls.DESDE).val();
                            },
                            HASTA: function () {
                                return $(_controls.HASTA).val();
                            },
                            C_CLIENTE: function () {
                                return $(_controls.C_CLIENTE).val();
                            },
                        })
                    },
                ],
                onReady: function (result) {
                    fnMostrarPdf(result.token);
                    $.CloseStatusBar();
                }
            })
        };
        const fnMostrarPdf = function (token) {
            bootbox.dialog({
                message: `<div class="embed-responsive embed-responsive-16by9"><iframe class= "embed-responsive-item" src="https://api.solver.com.pe/v1//service/ViewFile/${token}/" allowfullscreen></iframe></div>`,
                closeButton: true,
                className: 'modal-75'
            });
        };
        const actionDescargarExcel = function () {
            $.DownloadFile({
                nameFile: 'Ingresos',
                query: 'tbl_puntoventa_procesos_ingresosegresos_listaingresos',
                params: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_ESTABLECIMIENTO: function () {
                        return $(_controls.C_ESTABLECIMIENTO).val();
                    },
                    C_CAJA: function () {
                        return $(_controls.C_CAJA).val();
                    },
                    C_USUARIO: function () {
                        return $(_controls.C_USUARIO).val();
                    },
                    DESDE: function () {
                        return $(_controls.DESDE).val();
                    },
                    HASTA: function () {
                        return $(_controls.HASTA).val();
                    },
                    C_CLIENTE: function () {
                        return $(_controls.C_CLIENTE).val();
                    },
                    C_METODO_PAGO: function () {
                        return $(_controls.C_METODO_PAGO).val();
                    },
                    BASE: $.solver.basePath,
                }
            });

            $.DownloadFile({
                nameFile: 'Egresos',
                query: 'tbl_puntoventa_procesos_ingresosegresos_listaegresos',
                params: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_ESTABLECIMIENTO: function () {
                        return $(_controls.C_ESTABLECIMIENTO).val();
                    },
                    C_CAJA: function () {
                        return $(_controls.C_CAJA).val();
                    },
                    C_USUARIO: function () {
                        return $(_controls.C_USUARIO).val();
                    },
                    DESDE: function () {
                        return $(_controls.DESDE).val();
                    },
                    HASTA: function () {
                        return $(_controls.HASTA).val();
                    },
                    C_CLIENTE: function () {
                        return $(_controls.C_CLIENTE).val();
                    },
                }
            });
        }

        $(frm).ValidForm({
            type: -1,
            onReady: function () {
                $(table1).jqxGrid('updatebounddata');
                $(table2).jqxGrid('updatebounddata');

                setTimeout(function () {
                    $(table1).jqxGrid('removegroup', 'Cliente');
                    $(table1).jqxGrid('addgroup', 'Cliente');
                    //$(table1).jqxGrid('removegroup', 'Metodo Pago');
                    //$(table1).jqxGrid('addgroup', 'Metodo Pago');
                    $(table1).jqxGrid('refresh');
                    $(table1).jqxGrid({ rowsheight: 30 });
                    $(table1).jqxGrid('expandallgroups');
                }, 250)
            },
            onDone: function (form, controls) {
                _controls = controls;

                $(controls.DESDE).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });

                $(controls.HASTA).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });

                fnCrearTabla();

                $('#actions').CreateActions({
                    text: 'Acciones',
                    class: 'btn btn-sm btn-orange',
                    actions: {
                        'Generar pdf': {
                            icon: 'fa fa-plus',
                            callback: actionGenerarPdf
                        },
                        'Descargar excel': {
                            icon: 'fa fa-download',
                            callback: actionDescargarExcel
                        }
                    },
                })

                $(controls.C_ESTABLECIMIENTO).change(function () {
                    $(controls.C_CAJA).attr('data-C_ESTABLECIMIENTO', $(controls.C_ESTABLECIMIENTO).val())
                        .FieldLoadRemote();
                });
            },
        });

    });
});