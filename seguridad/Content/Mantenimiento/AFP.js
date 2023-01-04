require(["helper", "extras"], function () {
    require(["alertify"], function (alertify) {
        alertify.set('notifier', 'position', 'top-center');

        // VARIABLES
        let c_afp = '';
        const tblAfp = $('#tblAfp');
        const tblAfpDetalle = $('#tblAfpDetalle');
        let regimen = [];
        let meses = [];

        // TABLAS
        const fnCrearTabla = function () {
            const fnClassEditer = function (row, datafield, value, rowdata) {
                if (rowdata.MODO == 1 || rowdata.MODO == 2) return 'editedRow';
            };

            $.GetQuery({
                query: ['q_cuenta_mantenimiento_afp_obtenerregimen'],
                onReady: function (result) {
                    regimen = result;
                }
            });
            $.GetQuery({
                query: ['q_cuenta_mantenimiento_afp_obtenermeses'],
                onReady: function (result) {
                    meses = result;
                }
            });

            $(tblAfp).CreateGrid({
                query: 'tbl_planilla_mantenimiento_afp',
                items: {
                    NOMBRE: function () {
                        return $('#_buscar').val() || '';
                    },
                    RUC: function () {
                        return $('#_buscar').val() || '';
                    },
                },
                hiddens: ['IND_ESTADO', 'C_REGIMEN_PENSIONARIO', 'JSON_Comision'],
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
                    'C_AFP': {
                        text: 'Cod. AFP',
                        cellclassname: fnClassEditer,
                        editable: false,
                        width: 100,
                    },
                    'DESCRIPCION_PARAMETRO': {
                        text: 'Regimen pensionario',
                        width: 250,
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: regimen
                            };

                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });

                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                            $.each(regimen, function (i, v) {
                                if (v.label == newvalue) {
                                    $(tblAfp).jqxGrid('getrows')[row].C_REGIMEN_PENSIONARIO = v.value;
                                }
                            });
                        }
                    },
                    'RAZON_SOCIAL': {
                        text: 'Razón social',
                        cellclassname: fnClassEditer,
                        width: 250
                    },
                    'NOMBRE_AFP': {
                        text: 'Nombre',
                        cellclassname: fnClassEditer,
                        width: 250
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
                    virtualmode: false,
                    height: 200,
                    pageSize: 999999,
                    columnsresize: true,
                    editable: true,
                    sortable: false,
                    pageable: false,
                    rendered: function () { }
                }
            });
            $(tblAfpDetalle).CreateGrid({
                query: 'tbl_planilla_mantenimiento_afp_detalle_vacio',
                items: {
                    C_AFP: function () {
                        return c_afp;
                    },
                },
                hiddens: ['C_AFP', 'MES'],
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
                    'ANIO': {
                        text: 'Año',
                        width: 100,
                        cellsAlign: 'center'
                    },
                    'NOM_MES': {
                        text: 'Mes',
                        width: 100,
                        cellsAlign: 'center',
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: meses
                            };

                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });

                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                            $.each(meses, function (i, v) {
                                if (v.label == newvalue) {
                                    $(tblAfpDetalle).jqxGrid('getrows')[row].MES = v.value;
                                }
                            });
                        }
                    },
                    'COMI_FIJA': {
                        text: 'Comisión fija',
                        width: 100,
                        cellsAlign: 'center',
                        cellsFormat: 'd2',
                        columnType: 'numberinput',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex flex-row-reverse font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'COMI_FLUJO': {
                        text: 'Comisión sobre flujo',
                        width: 130,
                        cellsAlign: 'center',
                        cellsFormat: 'd2',
                        columnType: 'numberinput',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex flex-row-reverse font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'COMI_FLUJO_MIXTA': {
                        text: 'Comisión sobre flujo',
                        width: 130,
                        cellsAlign: 'center',
                        cellsFormat: 'd2',
                        columnType: 'numberinput',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex flex-row-reverse font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'COMI_ANUAL_MIXTA': {
                        text: 'Comisión anual sobre flujo',
                        width: 170,
                        cellsAlign: 'center',
                        cellsFormat: 'd2',
                        columnType: 'numberinput',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex flex-row-reverse font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'PRIMA_SEGUROS': {
                        text: 'Prima de seguros',
                        width: 120,
                        cellsAlign: 'center',
                        cellsFormat: 'd2',
                        columnType: 'numberinput',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex flex-row-reverse font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'AOBF_PENSIONES': {
                        text: 'Aporte obligatorio al fondo de pensiones',
                        width: 250,
                        cellsAlign: 'center',
                        cellsFormat: 'd2',
                        columnType: 'numberinput',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex flex-row-reverse font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'REMUNERACION_MA': {
                        text: 'Remuneración máxima asegurable',
                        width: 200,
                        cellsAlign: 'center',
                        cellsFormat: 'd2',
                        columnType: 'numberinput',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex flex-row-reverse font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                },
                config: {
                    virtualmode: false,
                    height: 200,
                    pageSize: 999999,
                    columnsresize: true,
                    editable: true,
                    sortable: false,
                    pageable: false
                }
            });

            $(tblAfp).on('bindingcomplete', function () {
                $(tblAfp).unbind("cellvaluechanged");
                $(tblAfp).on("cellvaluechanged", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblAfp).jqxGrid('getrows')[row].MODO != 1) $(tblAfp).jqxGrid('getrows')[row].MODO = 2;

                        var datafield = event.args.datafield;
                        var oldvalue = event.args.oldvalue
                        if (datafield == 'RUC') {
                            $.GetQuery({
                                query: ['q_ventas_mantenimiento_clientes_obtenerpadron_ruc'],
                                items: [{ RUC: function () { return $(tblAfp).jqxGrid('getrows')[row].RUC } }],
                                onError: function (error) { },
                                onReady: function (result) {
                                    if (result.length > 0) {
                                        $(tblAfp).jqxGrid('getrows')[row].RAZON_SOCIAL = result[0].RAZON_SOCIAL;
                                        $(tblAfp).jqxGrid('refresh');
                                    }
                                    else {
                                        alertify.error('¡El RUC ingresado no existe!');
                                        $(tblAfp).jqxGrid('getrows')[row].RUC = oldvalue;
                                        $(tblAfp).jqxGrid('refresh');
                                    }
                                }
                            });
                        }
                    }
                });
                $(tblAfp).jqxGrid({ selectedrowindex: 0 });
            });
            $(tblAfp).bind('rowselect', function (event) {
                let index = event.args.rowindex;
                var row = $(tblAfp).jqxGrid('getrows')[index];
                let c_afp = row.C_AFP;

                $(tblAfpDetalle).jqxGrid('clear');
                if (row['JSON_Comision'] == '') {
                    $.GetQuery({
                        query: ['tbl_planilla_mantenimiento_afp_detalle'],
                        items: [{
                            C_AFP: function () {
                                return c_afp;
                            },
                        }],
                        onReady: function (result) {
                            if (result.length > 0) {
                                var arrData = [];
                                $.each(result, function (i, v) {
                                    var fila = {
                                        _rowNum: i + 1,
                                        C_AFP: v['C_AFP'],
                                        ANIO: v['ANIO'],
                                        MES: v['MES'],
                                        NOM_MES: v['NOM_MES'],
                                        COMI_FIJA: v['COMI_FIJA'],
                                        COMI_FLUJO: v['COMI_FLUJO'],
                                        COMI_FLUJO_MIXTA: v['COMI_FLUJO_MIXTA'],
                                        COMI_ANUAL_MIXTA: v['COMI_ANUAL_MIXTA'],
                                        PRIMA_SEGUROS: v['PRIMA_SEGUROS'],
                                        AOBF_PENSIONES: v['AOBF_PENSIONES'],
                                        REMUNERACION_MA: v['REMUNERACION_MA']
                                    }
                                    arrData.push(fila)
                                });
                                $(tblAfpDetalle).jqxGrid('addrow', null, arrData)
                            }
                        }
                    });
                }
                else {
                    var lstComision = JSON.parse(row['JSON_Comision']);
                    var arrData = [];
                    $.each(lstComision, function (i, v) {
                        var fila = {
                            _rowNum: i + 1,
                            C_AFP: v['C_AFP'],
                            ANIO: v['ANIO'],
                            MES: v['MES'],
                            NOM_MES: v['NOM_MES'],
                            COMI_FIJA: v['COMI_FIJA'],
                            COMI_FLUJO: v['COMI_FLUJO'],
                            COMI_FLUJO_MIXTA: v['COMI_FLUJO_MIXTA'],
                            COMI_ANUAL_MIXTA: v['COMI_ANUAL_MIXTA'],
                            PRIMA_SEGUROS: v['PRIMA_SEGUROS'],
                            AOBF_PENSIONES: v['AOBF_PENSIONES'],
                            REMUNERACION_MA: v['REMUNERACION_MA']
                        }
                        arrData.push(fila)
                    });
                    $(tblAfpDetalle).jqxGrid('addrow', null, arrData)
                }
            });
            $(tblAfpDetalle).on('bindingcomplete', function () {
                $(tblAfpDetalle).jqxGrid('selectrow', 0);
                $(tblAfpDetalle).unbind("cellvaluechanged");
                $(tblAfpDetalle).on("cellvaluechanged", function (event) {

                    let indexAfp = $(tblAfp).jqxGrid('selectedrowindex');

                    if (event.args.newvalue != event.args.oldvalue) {

                        var row = event.args.rowindex;
                        if ($(tblAfpDetalle).jqxGrid('getrows')[row].MODO != 1) $(tblAfpDetalle).jqxGrid('getrows')[row].MODO = 2;

                        var rows = $(tblAfpDetalle).jqxGrid('getrows');
                        var JSON_Comision = JSON.stringify(rows);
                        $(tblAfp).jqxGrid('getrows')[indexAfp]['JSON_Comision'] = JSON_Comision;
                        if ($(tblAfp).jqxGrid('getrows')[indexAfp].MODO != 1) $(tblAfp).jqxGrid('getrows')[indexAfp].MODO = 2;

                    }
                });
            });
        }

        // ACCIONES
        const actionNuevaAFP = function (e) {
            const fila = $(tblAfp).jqxGrid('getrows').length;
            var afp = {
                _rowNum: fila + 1,
                MODO: 1,
                C_AFP: '',
                RAZON_SOCIAL: '',
                NOMBRE_AFP: '',
                JSON_Comision: '',
                ESTADO: 'Activo'
            };
            $(tblAfp).jqxGrid('addrow', null, afp);
            $(tblAfp).jqxGrid('selectrow', fila);
            $(tblAfp).jqxGrid('ensurerowvisible', fila);
        }
        const actionEliminarAFP = function (e) {
            let rowsComision = $(tblAfpDetalle).jqxGrid('getRows');

            if (rowsComision.length == 0) {
                alertify.confirm('Confirmar Acción', '¿Seguro que desea eliminar?', function () {

                    const indexAfp = $(tblAfp).jqxGrid('getselectedrowindex');
                    const objectAfp = $(tblAfp).jqxGrid('getrows')[indexAfp];
                    const id = objectAfp['C_AFP'];

                    $.AddPetition({
                        table: 'PLA.AFP',
                        type: 3,
                        condition: `C_AFP = '${id}'`,
                        items: $.ConvertObjectToArr({
                            C_AFP: objectAfp['C_AFP'],
                        })
                    });

                    $.SendPetition({
                        connectToLogin: 'S',
                        onReady: function (result) {
                            $.CloseStatusBar();
                            alertify.success('Se desactivó la AFP/SNP.');
                            $('form[name=filtrosRegAfp]').submit();
                        },
                        onBefore: function () {
                            $.DisplayStatusBar({ message: 'Realizando actualización' });
                        },
                        onError: function (_error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: _error });
                        }
                    });

                }, function () {
                    console.log('Operacion cancelada...');
                }).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'cancel');
            }
            else {
                alertify.confirm('Confirmar Acción', 'Existen comisiones, ¿Seguro que desea eliminar?', function () {

                    const indexAfp = $(tblAfp).jqxGrid('getselectedrowindex');
                    const objectAfp = $(tblAfp).jqxGrid('getrows')[indexAfp];
                    const id = objectAfp['C_AFP'];

                    $.AddPetition({
                        table: 'PLA.AFP_DETALLE',
                        type: 3,
                        condition: `C_AFP = '${id}'`,
                        items: $.ConvertObjectToArr({
                            C_AFP: objectAfp['C_AFP'],
                        })
                    });

                    $.AddPetition({
                        table: 'PLA.AFP',
                        type: 3,
                        condition: `C_AFP = '${id}'`,
                        items: $.ConvertObjectToArr({
                            C_AFP: objectAfp['C_AFP'],
                        })
                    });

                    $.SendPetition({
                        connectToLogin: 'S',
                        onReady: function (result) {
                            $.CloseStatusBar();
                            alertify.success('Se desactivó la AFP/SNP.');
                            $('form[name=filtrosRegAfp]').submit();
                        },
                        onBefore: function () {
                            $.DisplayStatusBar({ message: 'Realizando actualización' });
                        },
                        onError: function (_error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: _error });
                        }
                    });

                }, function () {
                    console.log('Operacion cancelada...');
                }).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'cancel');
            }

        }

        const actionNuevoDetalleAFP = function (e) {
            const fila = $(tblAfpDetalle).jqxGrid('getrows').length;
            let rowAfp = $(tblAfp).jqxGrid('getrows');
            let indexAfp = $(tblAfp).jqxGrid('selectedrowindex');

            var detalle = {
                _rowNum: fila + 1,
                MODO: 1,
                C_AFP: rowAfp[indexAfp].C_AFP,
                ANIO: '',
                MES: '',
                COMI_FIJA: '',
                COMI_FLUJO: '',
                COMI_FLUJO_MIXTA: '',
                COMI_ANUAL_MIXTA: '',
                PRIMA_SEGUROS: '',
                AOBF_PENSIONES: '',
                REMUNERACION_MA: ''
            };
            $(tblAfpDetalle).jqxGrid('addrow', null, detalle);
            $(tblAfpDetalle).jqxGrid('selectrow', fila);
            $(tblAfpDetalle).jqxGrid('ensurerowvisible', fila);
        }
        const actionEliminarDetalleAFP = function (e) {
            let rowsComision = $(tblAfpDetalle).jqxGrid('getRows');
            if (rowsComision.length == 0) {

                alertify.warning('No hay comisiones para eliminar');
                
            }
            else {

                alertify.confirm('Confirmar Acción', '¿Seguro que desea eliminar la comisión?', function () {

                    const index = $(tblAfpDetalle).jqxGrid('getselectedrowindex');
                    const object = $(tblAfpDetalle).jqxGrid('getrows')[index];
                    const id = object['C_AFP'];
                    const anio = object['ANIO'];
                    const mes = object['MES'];
                    $.AddPetition({
                        table: 'PLA.AFP_DETALLE',
                        type: 3,
                        condition: `C_AFP = '${id}' AND ANIO = '${anio}' AND MES = '${mes}'`,
                        items: $.ConvertObjectToArr({
                            C_AFP: object['C_AFP'],
                            ANIO: object['ANIO'],
                            MES: object['MES']
                        })
                    });
                    $.SendPetition({
                        connectToLogin: 'S',
                        onReady: function (result) {
                            $.CloseStatusBar();
                            alertify.success('Se desactivó el registro de Comisión.');
                            $('form[name=filtrosRegAfp]').submit();
                        },
                        onBefore: function () {
                            $.DisplayStatusBar({ message: 'Realizando actualización' });
                        },
                        onError: function (_error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: _error });
                        }
                    });

                }, function () {
                    console.log('Operacion cancelada...');
                }).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'cancel');

            }
        }

        const actionGuardarAFP = function (e) {
            const fnValidarCambios = function () {
                let indice = -1;
                let filas = $(tblAfp).jqxGrid('getrows');
                $.each(filas, function (i, v) {
                    if (indice == -1) {
                        if (v.RUC == '' || v.RAZON_SOCIAL == '' || v.NOMBRE_AFP == '') {
                            indice = i;
                            return i;
                        }
                    }
                });
                return indice;
            }
            const fnValidarCambios2 = function () {
                let indice2 = -1;
                let filasDetalle = $(tblAfpDetalle).jqxGrid('getrows');
                $.each(filasDetalle, function (i, v) {
                    if (indice2 == -1) {
                        if (v.ANIO == '' || v.MES == '') {
                            indice2 = i;
                            return i;
                        }
                    }
                });
                return indice2;
            }
            const fnGuardarCambios = function () {
                const indice = fnValidarCambios();
                const indice2 = fnValidarCambios2();
                if (indice == -1) {
                    if (indice2 == -1) {

                        const table = 'PLA.AFP';

                        let filas = $(tblAfp).jqxGrid('getrows').filter(x => x['MODO'] == 1 || x['MODO'] == 2);
                        let extras = {
                            C_AFP: {
                                action: {
                                    name: 'GetNextId',
                                    args: $.ConvertObjectToArr({
                                        max_length: '6'
                                    })
                                }
                            },
                        };

                        $.each(filas, function (i, v) {

                            let tokenParent = $.AddPetition({
                                table,
                                type: (v.C_AFP == '' ? 1 : 2),
                                condition: (v.C_AFP == '' ? '' : `C_AFP = '${v.C_AFP}'`),
                                items: $.ConvertObjectToArr({
                                    C_AFP: v.C_AFP,
                                    C_REGIMEN_PENSIONARIO: v.C_REGIMEN_PENSIONARIO,
                                    RUC: v.RUC,
                                    RAZON_SOCIAL: v.RAZON_SOCIAL,
                                    NOMBRE_AFP: v.NOMBRE_AFP,
                                    IND_ESTADO: (v.ESTADO == 'Activo' ? '*' : '&')
                                }, extras)
                            });
                            if (v['JSON_Comision'] != '') {
                                var arrComision = JSON.parse(v['JSON_Comision']);
                                $.each(arrComision, function (i, comision) {
                                    var tipoComision = 1;
                                    var condicionComision = '';
                                    if (comision['MODO'] == 1 || comision['MODO'] == '1') tipoComision = 1;
                                    else tipoComision = 2;
                                    if (tipoComision == 2) condicionComision = `C_AFP = '${comision['C_AFP']}' AND ANIO = '${comision['ANIO']}' AND MES = '${comision['MES']}'`

                                    $.AddPetition({
                                        type: tipoComision,
                                        table: 'PLA.AFP_DETALLE',
                                        condition: condicionComision,
                                        items: $.ConvertObjectToArr({
                                            C_AFP: comision.C_AFP,
                                            ANIO: comision.ANIO,
                                            MES: comision.MES,
                                            COMI_FIJA: comision.COMI_FIJA == '' ? '0.00' : comision.COMI_FIJA,
                                            COMI_FLUJO: comision.COMI_FLUJO == '' ? '0.00' : comision.COMI_FLUJO,
                                            COMI_FLUJO_MIXTA: comision.COMI_FLUJO_MIXTA == '' ? '0.00' : comision.COMI_FLUJO_MIXTA,
                                            COMI_ANUAL_MIXTA: comision.COMI_ANUAL_MIXTA == '' ? '0.00' : comision.COMI_ANUAL_MIXTA,
                                            PRIMA_SEGUROS: comision.PRIMA_SEGUROS == '' ? '0.00' : comision.PRIMA_SEGUROS,
                                            AOBF_PENSIONES: comision.AOBF_PENSIONES == '' ? '0.00' : comision.AOBF_PENSIONES,
                                            REMUNERACION_MA: comision.REMUNERACION_MA == '' ? '0.00' : comision.REMUNERACION_MA
                                        },
                                            {
                                                C_AFP: {
                                                    action: {
                                                        name: 'GetParentId',
                                                        args: $.ConvertObjectToArr({
                                                            token: tokenParent,
                                                            column: 'C_AFP'
                                                        })
                                                    }
                                                }
                                            }
                                        )
                                    });
                                });
                            }
                        });
                        $.SendPetition({
                            connectToLogin: 'S',
                            onReady: function (result) {
                                $.CloseStatusBar();
                                $(tblAfp).jqxGrid('updatebounddata');
                                $(tblAfpDetalle).jqxGrid('updatebounddata');
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
                        alertify.alert('Mensaje del Sistema', 'Por favor rellena todos los campos de la fila ' + (indice2 + 1) + '.', function () { });
                        $(tblAfpDetalle).jqxGrid('selectrow', indice2);
                        $(tblAfpDetalle).jqxGrid('ensurerowvisible', indice2);
                    }
                }
                else {
                    alertify.alert('Mensaje del Sistema', 'Por favor rellena todos los campos de la fila ' + (indice + 1) + '.', function () { });
                    $(tblAfp).jqxGrid('selectrow', indice);
                    $(tblAfp).jqxGrid('ensurerowvisible', indice);
                }
            }
            alertify.confirm('¡Confirmar Operación!', '¿Seguro de actualizar la información?', fnGuardarCambios, null).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'cancel');
        }

        // GENERALES
        $('a#btnAgregarAfp').bind('click', function (e) {
            actionNuevaAFP();
            e.preventDefault();
        });
        $('a#btnEliminarAfp').bind('click', function (e) {
            actionEliminarAFP();
            e.preventDefault();
        });

        $('a#btnAgregarDetalleAfp').bind('click', function (e) {
            actionNuevoDetalleAFP();
            e.preventDefault();
        });
        $('a#btnEliminarDetalleAfp').bind('click', function (e) {
            actionEliminarDetalleAFP();
            e.preventDefault();
        });

        $('#btnGuardarAfp').bind('click', function (e) {
            actionGuardarAFP();
            e.preventDefault();
        });

        $('form[name=filtrosRegAfp]').ValidForm({
            type: -1,
            onReady: function (result, controls, form)
            {
                $(tblAfp).jqxGrid('updatebounddata');
                $(tblAfpDetalle).jqxGrid('updatebounddata');
            }
        });

        fnCrearTabla();
    });
});