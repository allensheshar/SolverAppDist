require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", 'bootbox', "moment"], function (alertify, bootbox, moment) {
        alertify.set('notifier', 'position', 'top-center');

        const frm = 'form[name=frm]'
        const table = '#table'
        const table1 = '#table1'

        const fnCrearTabla = function () {
            $(table).CreateGrid({
                type: 5,
                query: 'SP_RESTAURANT_REPORTES_COMPARATIVO',
                items: {
                    empresa: $.solver.session.SESSION_EMPRESA,
                    base: $.solver.basePath,
                    desde: function () {
                        return $(_controls.desde).val();
                    },
                    hasta: function () {
                        return $(_controls.desde).val();
                    }
                },
                columns: {
                    'DIA': {
                        text: 'Día',
                        width: 120
                    },
                    'TOTAL': {
                        text: 'Total',
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        width: 100
                    },
                    'PERSONAS': {
                        text: 'Personas',
                        cellsAlign: 'right',
                        width: 100
                    },
                    'TICKET_PROMEDIO': {
                        text: 'Ticket promedio',
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        width: 100
                    }
                },
                config: {
                    sortable: false,
                    editable: false,
                    pageSize: 100,
                    rendered: function () { },
                }
            })

            $(table1).CreateGrid({
                type: 5,
                query: 'SP_RESTAURANT_REPORTES_COMPARATIVO_MES_ANTERIOR',
                items: {
                    empresa: $.solver.session.SESSION_EMPRESA,
                    base: $.solver.basePath,
                    desde: function () {
                        return $(_controls.desde).val();
                    },
                    hasta: function () {
                        return $(_controls.desde).val();
                    }
                },
                columns: {
                    'DIA': {
                        text: 'Día',
                        width: 120
                    },
                    'TOTAL': {
                        text: 'Total',
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        width: 100
                    },
                    'PERSONAS': {
                        text: 'Personas',
                        cellsAlign: 'right',
                        width: 100
                    },
                    'TICKET_PROMEDIO': {
                        text: 'Ticket promedio',
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        width: 100
                    }
                },
                config: {
                    sortable: false,
                    editable: false,
                    pageSize: 100,
                    rendered: function () { },
                }
            })
        }


        $(frm).ValidForm({
            type: -1,
            onReady: function () {
                $(table).jqxGrid('updatebounddata');
                $(table1).jqxGrid('updatebounddata');
            },
            onDone: function (form, controls) {
                _controls = controls;
                fnCrearTabla();

                $('.fecha').datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });

            }
        })
    });
});