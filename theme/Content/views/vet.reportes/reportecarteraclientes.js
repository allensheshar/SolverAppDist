require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", "bootbox", "moment"], function (alertify, bootbox, moment) {
        const c_empresa = $.solver.session.SESSION_EMPRESA;

        const fnCrearTablaCartera = function () {
            $('#tblCarteraClientes').CreateGrid({
                query: 'q_ventas_reportes_reportecarteradecliente',
                items: {
                    C_EMPRESA: c_empresa,
                    BUSCAR: function () {
                        return $('#_buscar').val();
                    }
                },
                sortcolumn: 'Nombre / Razón Social',
                sortdirection: 'ASC',
                columns: {
                    '_rowNum': {
                        text: 'N°',
                        width: '30',
                        cellsAlign: 'center',
                        hidden: false,
                        pinned: true,
                        editable: false,
                        sortable: false
                    },
                    'Nombre / Razón Social': {
                        width: 250
                    },
                    'DNI / RUC': {
                        width: 90
                    },
                    'Dirección': {
                        width: 300
                    },
                    'Teléfono': {
                        width: 90
                    },
                    'Correo electrónico': {
                        width: 300
                    },
                    'Estado': {
                        width: 100
                    }
                },
                config: {
                    pageSize: 999999,
                    sortable: true,
                    editable: false,
                }
            });
        }

        const fnObtenerEmpresa = function () {
            $.GetQuery({
                query: ['q_ventas_procesos_nuevaventa_consultarempresa'],
                items: [{
                    C_EMPRESA: c_empresa
                }],
                onError: function (error) {
                    $.ShowError({ error: error });
                },
                onReady: function (result) {
                    if (result.length > 0) {
                        const data = result[0];
                        fnCrearTablaCartera();
                        $('#lblEmpresa').text('Empresa: ' + data.RAZON_SOCIAL)
                        $('#lblRuc').text('RUC: ' + data.NRO_DOCUMENTO)
                    }
                }
            });

            $.solver.fn.getImageLogoCompany('#IMAGEN_EMPRESA');
        }

        $('form[name=frmCartera]').ValidForm({
            type: -1,
            onDone: function () {
                
                fnObtenerEmpresa();
                $('#btnDescargarCartera').click(function () {
                    $.DownloadFile({
                        query: 'q_ventas_reportes_reportecarteradecliente',
                        params: {
                            C_EMPRESA: c_empresa,
                            BUSCAR: function () {
                                return $('#_buscar').val();
                            }
                        }
                    });
                });

            },
            onReady: function () {
                $('#tblCarteraClientes').jqxGrid('updatebounddata');
            }
        })
    });
});