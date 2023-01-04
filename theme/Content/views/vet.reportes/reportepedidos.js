require(["helper", "chartjs", "sortablejs", "extras", "controls", "datetimepicker"], function () {
    require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {
        alertify.set('notifier', 'position', 'top-center');

        const table = '#table';

        const fnCrearTabla = function () {
            $(table).CreateGrid({
                query: '',
                columns: {

                },
                sortcolumn: 'TOTAL',
                sortdirection: 'DESC',
                hiddens: [],
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    DESDE: function () {
                        return $(_controls.desde).val();
                    },
                    HASTA: function () {
                        return $(_controls.hasta).val();
                    }
                },
                config: {
                    virtualmode: false,
                    sortable: false,
                    rendered: function () {
                    }
                }
            })
        }

        $(form).ValidForm({
            type: -1,
            onDone: function (_, controls) {
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

            },
            onReady: function () {
                $(table).jqxGrid('updatebounddata');
            }
        });
    });
});