require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", "bootbox", "moment", "inputmask", "numeral"], function (alertify, bootbox, moment, inputmask, numeral) {
        alertify.set('notifier', 'position', 'top-center');

        const table = '#table';
        const frm = 'form[name=frm]';

        let _controls = null;
        let estado = false;

        const fnEditar = function (codigo, title) {
            let _codigo = codigo || '';
            $.GetData({
                title: `<i class="fa fa-file-code-o" aria-hidden="true"></i> ${title}`,
                uriData: `${$.solver.baseUrl}/Procesos/NuevoEgreso/`,
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modal) {

                    let _type = 1;
                    let _condition = "";
                    if (_codigo != '') {
                        _type = 2;
                        _condition = `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' and C_EGRESO = '${_codigo}'`;
                    };

                    $(object).find('form[name=frmRegistroEgreso]').ValidForm({
                        type: _type,
                        condition: _condition,
                        table: 'PDV.EGRESO',
                        queryDefault: {
                            query: ['editable_egreso'],
                            type: [8],
                            items: [{
                                table: 'PDV.EGRESO',
                                condition: _condition
                            }]
                        },
                        extras: {
                            C_EGRESO: {
                                action: {
                                    name: 'GetNextId',
                                    args: $.ConvertObjectToArr({
                                        columns: 'C_EMPRESA',
                                        max_length: 6
                                    })
                                }
                            }
                        },
                        onDone: function (form, controls) {
                            if (_type == 2) {
                                $(controls.FEC_EGRESO).val(moment($(controls.FEC_EGRESO).val()).format('DD/MM/YYYY'));
                            }
                            $(controls.C_EMPRESA).val($.solver.session.SESSION_EMPRESA);
                            $(controls.FEC_EGRESO).datetimepicker({
                                format: 'DD/MM/YYYY',
                                locale: 'es'
                            });
                            $(controls.C_ESTABLECIMIENTO).change(function () {
                                $(controls.C_CAJA).attr('data-c_establecimiento', $(controls.C_ESTABLECIMIENTO).val());
                                $(controls.C_CAJA).FieldLoadRemote();
                            }).trigger('change');
                        },
                        onReady: function (result, controls) {
                            $(modal).modal('hide');
                        },
                        onError: function (error) {
                            console.log(error);
                            $.CloseStatusBar();
                            $.ShowError({ error: error });
                        },
                    });
                },
                onCloseModal: function () {
                    estado = false;
                    $(table).jqxGrid('updatebounddata')
                }
            });

            $('.bootbox .modal-dialog').draggable({
                handle: '.modal-header'
            });
            $('.bootbox .modal-header').css('cursor', 'move');
        }

        const actionNuevo = function () {
            if (!estado) {
                estado = true;

                fnEditar('', 'Nuevo egreso');
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
                query: 'tbl_puntoventa_procesos_registroegreso_listaegresos',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    TIPO_FECHA: function () {
                        return $(_controls.tipo_fecha).val();
                    },
                    DESDE: function () {
                        return $(_controls.desde).val();
                    },
                    HASTA: function () {
                        return $(_controls.hasta).val();
                    },
                    C_USUARIO: function () {
                        return $(_controls.c_usuario).val();
                    },
                    MONTO: function () {
                        return $(_controls.monto).val();
                    },
                    ESTADO: function () {
                        return $(_controls.estado).val();
                    },
                },
                hiddens: ['C_EMPRESA', 'C_EGRESO', 'C_CAJA', 'C_MONEDA', 'C_ESTABLECIMIENTO'],
                sortcolumn: 'FEC_REGISTRO',
                sortdirection: 'DESC',
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
                    'FEC_REGISTRO': {
                        text: 'Fec. registro',
                        width: 120,
                    },
                    'NOMBRE_ESTABLECIMIENTO': {
                        text: 'Establecimiento',
                        width: 100,
                    },
                    'NOMBRE_CAJA': {
                        text: 'Nombre Caja',
                        width: 100,
                    },
                    'FEC_EGRESO': {
                        text: 'Fec. egreso',
                        width: 100,
                        cellsAlign: 'center'
                    },
                    'MONEDA': {
                        text: 'Moneda',
                        width: 100
                    },
                    'ETIQUETA': {
                        text: 'Etiqueta',
                        width: 100,
                    },
                    'MONTO_EGRESO': {
                        text: 'Monto',
                        cellsAlign: 'right',
                        width: 60,
                        editable: true,
                        cellsFormat: 'd2',
                    },
                    'MOTIVO_EGRESO': {
                        text: 'Motivo',
                        width: 300
                    },
                    'C_USUARIO_SOLICITANTE': {
                        text: 'Usu. sol.',
                        width: 100
                    },
                    'C_USUARIO_REGISTRO': {
                        text: 'Usu. reg.',
                        width: 100
                    },
                    'ESTADO': {
                        text: 'Estado',
                        width: 100
                    },
                    'PDF': {
                        width: 45,
                        cellsRenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value != '') {
                                return `<a href="#" onclick="$.VerPdf('${value}');" style="margin-top: 0.5rem;display: block;margin-left: 0.3rem;"><i class="fa fa-eye" aria-hidden="true"></i></span> Ver`;
                            }
                        },
                        sortable: false,
                    },
                    'Acciones': {
                        width: 100,
                        createwidget: function (row, column, value, htmlElement) {
                            $(table).jqxGrid('refresh');
                        },
                        initwidget: function (rowIndex, column, value, htmlElement) {

                            $(htmlElement).html('');
                            $(htmlElement).addClass('jqx-grid-cell-middle-align');
                            $(htmlElement).addClass('mt-1');

                            let _btnEditar;
                            _btnEditar = $(`<a id="editar" style="cursor: pointer;" class="jqx-grid-widget">&nbsp;Editar</a>`);
                            $(htmlElement).append(_btnEditar);
                            $(htmlElement).find('a#editar').unbind('click');
                            $(htmlElement).find('a#editar').click(function () {
                                var codigo = $(table).jqxGrid('getrows')[rowIndex]['C_EGRESO'];
                                fnEditar(codigo, 'Editar egreso');
                            });
                        },
                    }
                },
                config: {
                    sortable: true,
                    pageable: true,

                }
            });
        }

        const fnArmarPdf = function () {
            var index = $(table).jqxGrid('getselectedrowindex');
            var row = $(table).jqxGrid('getrows')[index];
            $.DisplayStatusBar({ message: 'Generando pdf.' });

            $.CreatePDFDocument({
                empresa: $.solver.session.SESSION_EMPRESA,
                formato: 'formato_estandar_egreso',
                papel: 'A4',
                querys: [
                    {
                        name: 'cabecera',
                        args: $.ConvertObjectToArr({
                            modeWork: 'd', //diccionario
                            script: 'q_gbl_formato_egreso',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_EGRESO: row['C_EGRESO'],
                        })
                    }
                ],
                onReady: function (result) {
                    $.AddPetition({
                        table: 'PDV.EGRESO',
                        type: 2,
                        condition: `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_EGRESO = '${row['C_EGRESO']}'`,
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_EGRESO: row['C_EGRESO'],
                            RUTA_ARCHIVO_PDF: result.token
                        })
                    });

                    $.SendPetition({
                        onReady: function () {
                            $.CloseStatusBar();

                            fnMostrarPdf(result.token)

                            $(frm).submit();
                        },
                        onError: function (_error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: _error });
                        },
                    });
                }
            });
        };

        $.VerPdf = function (token) {
            fnMostrarPdf(token);
        };

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

                $('#actions').CreateActions({
                    text: 'Acciones',
                    class: 'btn btn-sm btn-orange',
                    actions: {
                        'Nuevo egreso': {
                            icon: 'fa fa-plus',
                            callback: actionNuevo
                        },
                        'Generar Pdf': {
                            callback: function () {
                                fnArmarPdf();
                            },
                            token: 'btnGenerarPdf',
                            icon: 'fa fa-file-pdf-o'
                        },
                    },
                })
            },
        })
    });
});