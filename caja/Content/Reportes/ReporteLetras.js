require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", "bootbox"], function (alertify, bootbox) {

        const table = '#table'
        const frm = 'form[name=frm]'
        let _controls;

        const fnObtenerEmpresa = function () {
            $.GetQuery({
                query: ['q_ventas_procesos_nuevaventa_consultarempresa'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                }],
                onError: function (error) {
                    $.ShowError({ error: error });
                },
                onReady: function (result) {
                    if (result.length > 0) {
                        const data = result[0];
                        $('#lblEmpresa').text('Empresa: ' + data.RAZON_SOCIAL)
                        $('#lblRuc').text('RUC: ' + data.NRO_DOCUMENTO)
                    }
                }
            });

            $.solver.fn.getImageLogoCompany('#IMAGEN_EMPRESA');
        }
        const fnCrearTabla = function () {
            $(table).CreateGrid({
                query: 'tbl_caja_reportes_reporte_letras',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_CLIENTE: function () {
                        return $(_controls.persona).val()
                    }
                },
                hiddens: ['RAZON_SOCIAL', 'NRO_COMPROBANTE_VENTA'],
                columns: {
                    '_rowNum': {
                        text: '#',
                        width: '30',
                        cellsAlign: 'center',
                        hidden: false,
                        pinned: true,
                        editable: false,
                        sortable: false
                    },
                    'TIPO_DOCUMENTO': {
                        text: 'Tipo Documento',
                        width: 100
                    },
                    'NRO_COMPROBANTE': {
                        text: 'Nro Documento',
                        width: 100,
                    },
                    'FECHA_EMISION': {
                        text: 'Fecha emisión',
                        width: 80
                    },
                    'FECHA_VENCIMIENTO': {
                        text: 'Fecha vencimiento',
                        width: 80
                    },
                    'CARGO': {
                        text: 'Cargo',
                        width: 80,
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                    },
                    'ABONO': {
                        text: 'Abono',
                        width: 80,
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                    }
                },
                config: {
                }
            })
        }

        $(frm).ValidForm({
            type: -1,
            onReady: function (_, controls) {
                $(table).jqxGrid('updatebounddata');
            },
            onDone: function (_, controls) {
                _controls = controls;
                fnObtenerEmpresa();

                fnCrearTabla();

                $(controls.persona).change(function () {
                    $(frm).submit();
                })
            }
        });

    });
});