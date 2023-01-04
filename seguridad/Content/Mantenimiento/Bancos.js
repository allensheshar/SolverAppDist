require(["helper", "extras", 'bootstrap-select', 'fileinput.es'], function () {
    require(["alertify", "bootbox"], function (alertify, bootbox) {
        alertify.set('notifier', 'position', 'top-center');

        // VARIABLES
        const tblBancos = $('#tblBancos');
        var fnCrearCargaLogo = function () {

            var myControls = null;

            $("#input-b6").fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: false,
                mainClass: "input-group-sm",
                allowedFileExtensions: ['jpg', 'jpge'],
                uploadUrl: $.solver.services.api + "/Service/Upload/New",
                uploadAsync: true,
            });
            $("#input-b6").on("filebatchselected", function (event, files) {
                $("#input-b6").fileinput("upload");
            });
            $("#input-b6").on("fileuploaded", function (event, data, previewId, index) {
                $(myControls.C_ARCHIVO).val(data.response.token);
            });
            $('#CargaLogo').ValidForm({
                type: -1,
                onDone: function (form, controls) {
                    myControls = controls;
                },
                onReady: function (result, controls) {
                    $("#input-b6").fileinput('clear');
                    $('#modalUploadSigner').modal('hide');

                    const table = 'BANCOS';

                    var index = $(tblBancos).jqxGrid('selectedrowindex');
                    let filas = $(tblBancos).jqxGrid('getrowdata', index);

                    $.AddPetition({
                        table,
                        type: 2,
                        condition: `C_BANCO = '${filas.C_BANCO}'`,
                        items: $.ConvertObjectToArr({
                            C_BANCO: filas.C_BANCO,
                            C_ARCHIVO: $(myControls.C_ARCHIVO).val()
                        })
                    });
                    setTimeout(function () {
                        $.SendPetition({
                            connectToLogin: 'S',
                            onReady: function (result) {
                                $.CloseStatusBar();
                                $(tblBancos).jqxGrid('updatebounddata');
                                require(['bootbox', 'alertify'], function (bootbox, alertify) {
                                    bootbox.hideAll();
                                    alertify.success('Se registró la información.');
                                });
                            },
                            onBefore: function () {
                                $.DisplayStatusBar({ message: 'Realizando actualización' });
                            },
                            onError: function (_error) {
                                $.CloseStatusBar();
                                $.ShowError({ error: _error });
                            }
                        });
                    }, 500);

                }
            });

        };
        // TABLAS
        const fnCrearTabla = function () {
            const fnClassEditer = function (row, datafield, value, rowdata) {
                if (rowdata.MODO == 1 || rowdata.MODO == 2) return 'editedRow';
            };
            $(tblBancos).CreateGrid({
                query: 'tbl_planilla_mantenimiento_bancos',
                items: {
                    NOMBRE: function () {
                        return $('#_buscar').val() || '';
                    },
                },
                hiddens: ['C_BANCO', 'IND_ESTADO'],
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
                    'RAZON_SOCIAL': {
                        text: 'Razón social',
                        cellclassname: fnClassEditer,
                        width: 300,
                    },
                    'RUC': {
                        text: 'RUC',
                        cellclassname: fnClassEditer,
                        initeditor: function (row, column, editor) {
                            editor.attr('maxlength', 11);
                        },
                        cellsAlign: 'center',
                        width: 100
                    },
                    'NOMBRE_CORTO': {
                        text: 'Nombre corto',
                        cellclassname: fnClassEditer,
                        cellsAlign: 'center',
                        width: 150
                    },
                    'C_ARCHIVO': {
                        text: 'Logo',
                        cellclassname: fnClassEditer,
                        cellsAlign: 'center',
                        width: 150,
                        editable: false,
                        cellsRenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value == '' || value == null) {
                                return `<div class="d-flex h-100" style="text-align: center;">
                                            <div class="row justify-content-center align-self-center">
                                                <img height="100%" width="90%" src="/Content/Images/no.png" />
                                            <div />
                                        <div />`;
                            }
                            return `<div class="d-flex h-100" style="text-align: center;">
                                        <div class="row justify-content-center align-self-center">
                                            <img height="100%" width="90%" src="${$.solver.services.api}service/viewfile/${value}"/>
                                        <div/>
                                    <div/>`;
                        }
                    },
                    'ESTADO': {
                        text: 'Estado',
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            const estados = [
                                { value: "*", label: "Activo" },
                                { value: "&", label: "Inactivo" }
                            ];
                            const estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: estados
                            };
                            const myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });
                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellclassname: fnClassEditer,
                        width: 100,
                        cellsAlign: 'center'
                    }
                },
                config: {
                    height: 650,
                    pageSize: 999999,
                    rowsheight: 75,
                    virtualmode: false,
                    columnsresize: true,
                    pageable: false,
                    sortable: false,
                    editable: true,
                    rendered: function () { }
                }
            });
            $(tblBancos).on('bindingcomplete', function () {
                $(tblBancos).jqxGrid('selectrow', 0);
                $(tblBancos).unbind("cellvaluechanged");
                $(tblBancos).on("cellvaluechanged", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblBancos).jqxGrid('getrows')[row].MODO != 1) $(tblBancos).jqxGrid('getrows')[row].MODO = 2;

                        var datafield = event.args.datafield;
                        var oldvalue = event.args.oldvalue
                        if (datafield == 'RUC') {
                            $.GetQuery({
                                query: ['q_ventas_mantenimiento_clientes_obtenerpadron_ruc'],
                                items: [{ RUC: function () { return $(tblBancos).jqxGrid('getrows')[row].RUC } }],
                                onError: function (error) { },
                                onReady: function (result) {
                                    if (result.length > 0) {
                                        $(tblBancos).jqxGrid('getrows')[row].RAZON_SOCIAL = result[0].RAZON_SOCIAL;
                                        $(tblBancos).jqxGrid('refresh');
                                    }
                                    else {
                                        alertify.error('¡El RUC ingresado no existe!');
                                        $(tblBancos).jqxGrid('getrows')[row].RUC = oldvalue;
                                        $(tblBancos).jqxGrid('refresh');
                                    }

                                }
                            });
                        }
                    }
                });
            });
        }

        // ACCIONES
        const actionNuevoBanco = function (e) {
            const fila = $(tblBancos).jqxGrid('getrows').length;
            var banco = {
                _rowNum: fila + 1,
                MODO: 1,
                C_BANCO: 0,
                RAZON_SOCIAL: '',
                RUC: '',
                NOMBRE_CORTO: '',
                ESTADO: 'Activo'
            };
            $(tblBancos).jqxGrid('addrow', null, banco);
            $(tblBancos).jqxGrid('selectrow', fila);
            $(tblBancos).jqxGrid('ensurerowvisible', fila);
        }
        const actionGuardarBanco = function (e) {
            const fnValidarCambios = function () {
                let indice = -1;
                let filas = $(tblBancos).jqxGrid('getrows');
                $.each(filas, function (i, v) {
                    if (indice == -1) {
                        if (v.RAZON_SOCIAL == '' || v.RUC == '' || v.NOMBRE_CORTO == '') {
                            indice = i;
                            return i;
                        }
                    }
                });
                return indice;
            }
            const fnGuardarCambios = function () {
                const indice = fnValidarCambios();
                if (indice == -1) {

                    var inserts = $(tblBancos).jqxGrid('getrows').filter(x => x['MODO'] == 1);
                    var update = $(tblBancos).jqxGrid('getrows').filter(x => x['MODO'] == 2);

                    $.each(inserts, function (i, banco) {
                        var type = 1;
                        var condition = '';
                        var objInset = {
                            C_BANCO: banco.C_BANCO,
                            RAZON_SOCIAL: banco.RAZON_SOCIAL,
                            RUC: banco.RUC,
                            NOMBRE_CORTO: banco.NOMBRE_CORTO,
                            IND_ESTADO: (banco.ESTADO == 'Activo' ? '*' : '&')
                        };
                        var extras = {
                            C_BANCO: {
                                action: {
                                    name: 'GetNextId',
                                    args: $.ConvertObjectToArr({
                                        max_length: '6'
                                    })
                                }
                            },
                        };
                        $.AddPetition({
                            table: 'BANCOS',
                            type: type,
                            condition: condition,
                            items: $.ConvertObjectToArr(objInset, extras)
                        });
                    });
                    $.each(update, function (i, banco) {
                        var type = 2;
                        var condition = `C_BANCO = '${banco['C_BANCO']}'`;
                        var objUpdate = {
                            C_BANCO: banco.C_BANCO,
                            RAZON_SOCIAL: banco.RAZON_SOCIAL,
                            RUC: banco.RUC,
                            NOMBRE_CORTO: banco.NOMBRE_CORTO,
                            IND_ESTADO: (banco.ESTADO == 'Activo' ? '*' : '&')
                        };
                        $.AddPetition({
                            table: 'BANCOS',
                            type: type,
                            condition: condition,
                            items: $.ConvertObjectToArr(objUpdate)
                        });
                    });

                    $.SendPetition({
                        connectToLogin: 'S',
                        onReady: function (result) {
                            $.CloseStatusBar();
                            $(tblBancos).jqxGrid('updatebounddata');
                            alertify.success('Se registró la información.');
                        },
                        onBefore: function () {
                            $.DisplayStatusBar({ message: 'Realizando actualización' });
                        },
                        onError: function (_error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: _error });
                        }
                    });
                }
                else {
                    alertify.alert('Mensaje del Sistema', 'Por favor rellena todos los campos de la fila ' + (indice + 1) + '.', function () { });
                    $(tblBancos).jqxGrid('selectrow', indice);
                    $(tblBancos).jqxGrid('ensurerowvisible', indice);
                }
            }
            alertify.confirm('Confirme Operación!!', '¿Seguro de actualizar la información?', fnGuardarCambios, null)
                .set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
        }

        // GENERALES
        $('a#btnAgregarBanc').bind('click', function (e) {
            actionNuevoBanco();
            e.preventDefault();
        });
        $('a#btnCargarBanc').bind('click', function (e) {
            $('#modalUploadSigner').modal('show');
            e.preventDefault();
        });
        $('#btnGuardarBancos').bind('click', function (e) {
            actionGuardarBanco();
            e.preventDefault();
        });
        $('form[name=filtrosRegBancos]').ValidForm({
            type: -1,
            onReady: function (result, controls, form) {
                const rows = $(tblBancos).jqxGrid('getrows').filter(x => x['MODO'] != undefined);
                if (rows.length > 0) {
                    alertify.confirm('Mensaje del sistema', 'Existen filas sin guardar cambios, ¿Desea continuar?',
                        function () {
                            $(tblBancos).jqxGrid('updatebounddata');
                        },
                        function () {
                            alertify.error('Búsqueda cancelada');
                        })
                        .set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                }
                else {
                    $(tblBancos).jqxGrid('updatebounddata');
                }
            }
        });

        fnCrearTabla();

        //Crear Carga de Archivo
        fnCrearCargaLogo();

    });
});