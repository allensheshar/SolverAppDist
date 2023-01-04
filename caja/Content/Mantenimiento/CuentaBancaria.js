require(["jqwidgets", "helper", "extras", "jstree", "fileinput.es"], function () {
    require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {
        alertify.set('notifier', 'position', 'top-center');

        const empresa = $.solver.session.SESSION_EMPRESA;
        let tblCuentaBancaria = '#tblCuentaBancaria';
        let arrEliminadosTipoMovimiento = [];

        const fnObtenerCtaContable = function (_controls) {
            $.GetData({
                title: '<strong>Busqueda de plan contable</strong>',
                uriData: $.solver.baseUrl + '/Mantenimiento/BusquedaPlanContable/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (objectBuscarCuenta, modalBuscarCuenta) {
                    $(modalBuscarCuenta).find('.modal-dialog').css({ 'max-width': '40%' });
                    $(objectBuscarCuenta).find('#tblPlanContable').CreateGrid({
                        query: 'tbl_mantenimiento_obtenerplanes',
                        items: { C_EMPRESA: empresa },
                        hiddens: ['C_EMPRESA', 'CODIGO'],
                        columns: {
                            CODIGO_PLAN: {
                                text: 'Código',
                                width: 80
                            },
                            DESCRIPCION: {
                                text: 'Descripción de la cuenta',
                                width: 400
                            }
                        },
                        config: {
                            virtualmode: false,
                            height: 200,
                            pageSize: 999999,
                            pageable: false,
                            sortable: false,
                            editable: false,
                            rendered: function () {
                            }
                        }
                    });
                    $(objectBuscarCuenta).find('#tblPlanContable').on("rowdoubleclick", function () {
                        const getselectedrowindexes = $(objectBuscarCuenta).find('#tblPlanContable').jqxGrid('getselectedrowindexes');
                        if (getselectedrowindexes.length > 0) {

                            const codigo = $(objectBuscarCuenta).find('#tblPlanContable').jqxGrid('getrowdata', getselectedrowindexes[0])['CODIGO_PLAN'];
                            $(_controls.CTA_CONTABLE).val(codigo);
                            $(objectBuscarCuenta).parent().parent().parent().find('.close').trigger('click');

                        }
                    });
                },
                onCloseModal: function () {
                    estado = false;
                }
            });
        }

        const fnEliminarProveedor = function () {

            if ($(tblCuentaBancaria).jqxGrid('getrows').length == 0) {
                alertify.warning('Debes seleccionar un registro para editar.');
            }
            else {
                const index = $(tblCuentaBancaria).jqxGrid('getselectedrowindex');
                const object = $(tblCuentaBancaria).jqxGrid('getrows')[index];
                const c_empresa = object['C_EMPRESA'];
                const c_cuenta_bancaria = object['C_CUENTA_BANCARIA'];


                $.GetQuery({
                    query: ['q_planilla_mantenimiento_ctabancaria_movimientos'],
                    items: [{
                        C_EMPRESA: function () { return c_empresa; },
                        C_CUENTA_BANCARIA: function () { return c_cuenta_bancaria; }
                    }],
                    onReady: function (result) {
                        if (result.length == 0) {
                            $.AddPetition({
                                table: 'CAJA.CUENTA_BANCARIA',
                                type: 3,
                                condition: `C_CUENTA_BANCARIA = '${c_cuenta_bancaria}' AND C_EMPRESA = '${c_empresa}'`
                            });
                            $.SendPetition({
                                connectToLogin: 'S',
                                onReady: function (result) {
                                    $.CloseStatusBar();
                                    alertify.success('Se desactivo la cuenta bancaria.');
                                    $(tblCuentaBancaria).jqxGrid('updatebounddata');
                                },
                                onBefore: function () {
                                    $.DisplayStatusBar({ message: 'Inactivando cta. bancaria.' });
                                },
                                onError: function (_error) {
                                    $.CloseStatusBar();
                                    $.ShowError({ error: _error });
                                }
                            });
                        }
                        else {
                            alertify.warning('No es posible eliminar esta Cta. Bancaria, porque tiene movimientos.');
                        }

                    }
                });



            }
        }

        const GetFormEditer = function (url, condition) {
            var _type = 1;
            var _condition = condition || '';
            var _title = "Nueva cuenta bancaria";
            if (_condition.length != 0) {
                _title = "Editar cuenta bancaria";
                _type = 2;
            };

            $.GetData({
                title: _title,
                uriData: url,
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modal) {
                    $(modal).find('.modal-dialog').css({ 'max-width': '60%' });
                    $(object).find('.number-input').on('input', function () {
                        this.value = this.value.replace(/[^0-9]/g, '');
                    });
                    $('form[name=frmRegistroCuentaBancaria]').ValidForm({
                        table: 'CAJA.CUENTA_BANCARIA',
                        type: _type,
                        condition: condition,
                        extras: {
                            C_CUENTA_BANCARIA: {
                                action: {
                                    name: 'GetNextId',
                                    args: $.ConvertObjectToArr({
                                        columns: 'C_EMPRESA',
                                        max_length: '3'
                                    })
                                }
                            },
                        },
                        querySave: true,
                        queryDefault: {
                            query: ['editableCuentaBancaria'],
                            type: [8],
                            items: [{
                                table: 'CAJA.CUENTA_BANCARIA',
                                condition: _condition
                            }]
                        },
                        onError: function (error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: error });
                        },
                        onDone: function (form, controls) {
                            _controls = controls;

                            $(_controls.C_EMPRESA).val(empresa);
                            if ($(object).find('#C_PARAMETRO_GENERAL_TIPO_CUENTA').val() == '09861') {
                                $(controls.C_BANCO).val('');
                                $(controls.NUMERO_CUENTA).val('');
                                $(controls.CCI_CUENTA).val('');
                                $(controls.C_BANCO).attr('disabled', 'disabled');
                                $(controls.NUMERO_CUENTA).attr('disabled', 'disabled');
                                $(controls.CCI_CUENTA).attr('disabled', 'disabled');
                            } else {
                                $(controls.C_BANCO).removeAttr('disabled');
                                $(controls.NUMERO_CUENTA).removeAttr('disabled');
                                $(controls.CCI_CUENTA).removeAttr('disabled');
                            }

                            if ($(_controls.C_CUENTA_BANCARIA).val() == '' || $(_controls.C_CUENTA_BANCARIA).val() == null || $(_controls.C_CUENTA_BANCARIA).val() == undefined) { }
                            else {
                                $(_controls.C_BANCO).attr('readonly', true);
                                $(_controls.C_BANCO).css('pointer-events', 'none');
                            }
                            $(object).find('#ctaContableCompras').click(function () {
                                fnObtenerCtaContable(_controls)
                            });
                            $(object).find('#btnGuardarCuentaBancaria').click(function () {
                                $('form[name=frmRegistroCuentaBancaria]').submit();
                            });
                            $(object).find('#C_PARAMETRO_GENERAL_TIPO_CUENTA').change(function () {
                                if ($(this).val() == '09861') {
                                    $(controls.C_BANCO).val('');
                                    $(controls.NUMERO_CUENTA).val('');
                                    $(controls.CCI_CUENTA).val('');
                                    $(controls.C_BANCO).attr('disabled', 'disabled');
                                    $(controls.NUMERO_CUENTA).attr('disabled', 'disabled');
                                    $(controls.CCI_CUENTA).attr('disabled', 'disabled');
                                } else {
                                    $(controls.C_BANCO).removeAttr('disabled');
                                    $(controls.NUMERO_CUENTA).removeAttr('disabled');
                                    $(controls.CCI_CUENTA).removeAttr('disabled');
                                }
                            });
                        },
                        onSubmit: function (form, controls, objectForm) {
                            if ($(controls.MONTO_INICIAL).val() == '') {
                                objectForm.MONTO_INICIAL = null
                            }
                            return true;
                        },
                        onReady: function (result, controls, form) {
                            $(tblCuentaBancaria).jqxGrid('updatebounddata');
                            bootbox.hideAll();
                        }
                    });
                }
            });
        };
        const cargarTablas = function () {
            const fnClassEditer = function (row, datafield, value, rowdata) {
                if (rowdata.MODO == 1 || rowdata.MODO == 2) return 'editedRow';
            };
            $(tblCuentaBancaria).CreateGrid({
                query: 'tbl_caja_mant_cuentabancaria_cuentas',
                items: {
                    BUSCAR: function () {
                        return $('#_buscar').val() || '';
                    },
                    MONEDA: function () {
                        return $('#_moneda').val() || '';
                    },
                    CUENTA: function () {
                        return $('#_cuenta').val() || '';
                    },
                    C_EMPRESA: function () {
                        return empresa;
                    }
                },
                hiddens: ['C_EMPRESA', 'C_BANCO', 'C_CUENTA_BANCARIA', 'C_PARAMETRO_GENERAL_MONEDA', 'C_PARAMETRO_GENERAL_TIPO_CUENTA'],
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
                    'RAZON_SOCIAL': {
                        text: 'Banco',
                        cellclassname: fnClassEditer,
                        width: 300,
                    },
                    'NUMERO_CUENTA': {
                        text: 'Nro. Cuenta',
                        cellclassname: fnClassEditer,
                        width: 100
                    },
                    'CCI_CUENTA': {
                        text: 'Nro. C.C.I.',
                        cellclassname: fnClassEditer,
                        width: 100
                    },
                    'NOM_MONEDA': {
                        text: 'Moneda',
                        cellclassname: fnClassEditer,
                        width: 100
                    },
                    'NOM_CUENTA': {
                        text: 'Nom. Cuenta',
                        cellclassname: fnClassEditer,
                        width: 150
                    },
                    'CTA_CONTABLE': {
                        text: 'Cta. Contable',
                        cellsAlign: 'center',
                        cellclassname: fnClassEditer,
                        width: 100
                    },
                    'OBSERVACIONES': {
                        text: 'Observaciones',
                        cellclassname: fnClassEditer,
                        width: 150
                    },
                    'IND_ESTADO': {
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
                    },
                    '': {
                        width: 60,
                        createwidget: function (row, column, value, cellElement) {
                            $(cellElement).append('<a id="btn-' + row.boundindex + '" data-index="' + row.boundindex + '" href="#"><i class="fa fa-pencil-square-o" aria-hidden="true"></i> Editar</a>');
                            $(cellElement).find('a').css({
                                'margin-top': '1.6rem',
                                'margin-bottom': '1.6rem',
                                'margin-left': '0.5rem',
                                'margin-right': '0.5rem',
                                'display': 'block'
                            });
                            $(cellElement).find('#btn-' + row.boundindex + '').bind('click', function () {
                                GetFormEditer($.solver.baseUrl + `/Mantenimiento/CuentaBancariaRegistro/${row.bounddata.C_CUENTA_BANCARIA}`, `C_EMPRESA = '${row.bounddata.C_EMPRESA}' AND C_CUENTA_BANCARIA = '${row.bounddata.C_CUENTA_BANCARIA}'`);
                            });
                        },
                        initwidget: function (row, column, value, htmlElement) { }
                    },
                },
                config: {
                    virtualmode: false,
                    height: 600,
                    pageSize: 999999,
                    rowsheight: 60,
                    columnsresize: true,
                    editable: false,
                    sortable: false,
                    pageable: false
                }
            });
            $(tblCuentaBancaria).on('bindingcomplete', function () {
                $(tblCuentaBancaria).jqxGrid('selectrow', 0);
                $(tblCuentaBancaria).unbind("cellvaluechanged");
                $(tblCuentaBancaria).on("cellvaluechanged", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblCuentaBancaria).jqxGrid('getrows')[row].MODO != 1) $(tblCuentaBancaria).jqxGrid('getrows')[row].MODO = 2;
                    }
                });
            });

            $('a#btnNuevaCuenta').bind('click', function (e) {
                GetFormEditer($.solver.baseUrl + "/Mantenimiento/CuentaBancariaRegistro/", '');
                e.preventDefault();
            });
            $('#btnEliminarMovimiento').click(function () {
                var rows = $(tblCuentaBancaria).jqxGrid('getrows');
                if (rows.length > 0) {
                    var selected = $(tblCuentaBancaria).jqxGrid('getselectedrowindex')
                    if (selected != -1) {
                        if (rows[selected]['C_TIPO_MOVIMIENTO_CTA_BANCARIA'] != '') {
                            arrEliminadosTipoMovimiento.push(rows[selected]);
                        }
                        var rowId = $(tblCuentaBancaria).jqxGrid('getrowid', selected);
                        $(tblCuentaBancaria).jqxGrid('deleterow', rowId);
                        if (selected - 1 != -1) {
                            $(tblCuentaBancaria).jqxGrid('selectrow', selected - 1);
                            $(tblCuentaBancaria).jqxGrid('ensurerowvisible', selected - 1);
                        }
                        else {
                            if (rows.length > 0) {
                                $(tblCuentaBancaria).jqxGrid('selectrow', selected);
                                $(tblCuentaBancaria).jqxGrid('ensurerowvisible', selected);
                            }
                        }
                    }
                }
            });
        };

        $('a#btnEliminarCuenta').bind('click', function (e) {
            fnEliminarProveedor();
            e.preventDefault();
        });
        $('form[name=filtrosRegCuentaBancaria]').ValidForm({
            type: -1,
            onReady: function (result, controls, form) {
                $(tblCuentaBancaria).jqxGrid('updatebounddata');
            }
        });

        cargarTablas();

    });
});