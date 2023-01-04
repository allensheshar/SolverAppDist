require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", 'bootbox', "moment"], function (alertify, bootbox, moment) {
        alertify.set('notifier', 'position', 'top-center');

        var editable = true;
        if ($.solver.basePath == '/auditoriat') editable = false;

        // VARIABLES
        const table = '#table'
        var _controls;

        // TABLAS
        const fnCrearTabla = function () {
            $(table).CreateGrid({
                query: 'tbl_auditoriat_mantenimiento_decla_impuesto',
                items: {
                    ANIO: function () {
                        return $(_controls.ANIO).val();
                    },
                    C_TIPO_DECLARACION: function () {
                        return $(_controls.C_TIPO_DECLARACION).val();
                    }
                },
                hiddens: ['ANIO'],
                
                columns: {
                    '#': {
                        text: '#',
                        width: '30',
                        cellsAlign: 'center',
                        hidden: false,
                        pinned: true,
                        editable: false,
                    },
                    'DESCRIPCION_PARAMETRO': {
                        text: 'Periodo',
                        width: 80,
                        cellsAlign: 'center',
                    },
                    'DIGITO_CERO': {
                        text: '0',
                        width: 80,
                        cellsAlign: 'center',
                        columngroup: 'ultimonumeros'
                    },
                    'DIGITO_UNO': {
                        text: '1',
                        width: 80,
                        cellsAlign: 'center',
                        columngroup: 'ultimonumeros'
                    },
                    'DIGITO_DOS': {
                        text: '2',
                        width: 80,
                        cellsAlign: 'center',
                        columngroup: 'ultimonumeros'
                    },
                    'DIGITO_TRES': {
                        text: '3',
                        width: 80,
                        cellsAlign: 'center',
                        columngroup: 'ultimonumeros'
                    },
                    'DIGITO_CUATRO': {
                        text: '4',
                        width: 80,
                        cellsAlign: 'center',
                        columngroup: 'ultimonumeros'
                    },
                    'DIGITO_CINCO': {
                        text: '5',
                        width: 80,
                        cellsAlign: 'center',
                        columngroup: 'ultimonumeros'
                    },
                    'DIGITO_SEIS': {
                        text: '6',
                        width: 80,
                        cellsAlign: 'center',
                        columngroup: 'ultimonumeros'
                    },
                    'DIGITO_SIETE': {
                        text: '7',
                        width: 80,
                        cellsAlign: 'center',
                        columngroup: 'ultimonumeros'
                    },
                    'DIGITO_OCHO': {
                        text: '8',
                        width: 80,
                        cellsAlign: 'center',
                        columngroup: 'ultimonumeros'
                    },
                    'DIGITO_NUEVE': {
                        text: '9',
                        width: 80,
                        cellsAlign: 'center',
                        columngroup: 'ultimonumeros'
                    },
                    'BUEN_CONTRIBUYENTE_UESP': {
                        text: 'BUENOS CONTRIBUYENTES Y USP',
                        width: 230,
                        cellsAlign: 'center',
                        columngroup: 'buenoscontri'
                    },
                },
                config: {
                    pageSize: 100,
                    columnsresize: true,
                    rendered: function () { },
                    
                    pageable: true,
                    autorowheight: true,
                    altrows: true,
                    columnsresize: true,
                    columngroups:
                        [
                            { text: 'Según el último dígito del número del RUC:', align: 'center', name: 'ultimonumeros' },
                        ],
                }
            });
        }
      
        // GENERALES
        $('form[name=formImpuestos]').ValidForm({
            type: -1,
            onDone: function (form, controls) {
                _controls = controls
                fnCrearTabla();
            },
            onReady: function (result, controls, form) {
                $(table).jqxGrid('updatebounddata');
            }
        });


    });
});