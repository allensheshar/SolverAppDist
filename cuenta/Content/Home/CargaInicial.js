require(['helper', 'datetimepicker', 'inputmask', 'jqwidgets', 'extras', 'bootstrap-select', 'fileinput.es', 'jstree', 'controls'], function () {
    require(["moment", "alertify"], function (moment, alertify) {

        alertify.set('notifier', 'position', 'top-center');

        let codigo_masivo = '';
        let table_update = '';
        const fn_CrearGrillas_Laboral = function () {
            $('#table-colaboradores').CreateGrid({
                query: 'tbl_carga_data_inicial_planilla_colaboradores',
                items: {
                    empresa: $.solver.session.SESSION_EMPRESA
                },
                //sortcolumn: 'Fecha Carga',
                //sortdirection: 'DESC',
                columns: {},
                config: {
                    pageSize: 1000,
                    height: 500
                }
            });
        };
        const fnCrearCargaArchivo = function () {

            $(".input-b6").fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: true,
                mainClass: "input-group-sm",
                allowedFileExtensions: ['xlsx'],
                uploadUrl: $.solver.services.api + "/Service/Upload/New",
                uploadAsync: true,
            });

            $(".input-b6").on("filebatchselected", function (event, files) {
                $(".input-b6").fileinput("upload");
                $.DisplayStatusBar({
                    message: 'Espere un momento se esta cargando su archivo ...'
                });
            });

            $('.input-b6').on('fileuploaderror', function (event, data, msg) {
                $.CloseStatusBar();
            });

            $(".input-b6").on("fileuploaded", function (event, data, previewId, index) {
                fnProcesarCargaMasiva(codigo_masivo, data.response.token);
                $(".input-b6").fileinput('clear');

            });

            $(".input-b7").fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: true,
                mainClass: "input-group-sm",
                allowedFileExtensions: ['xlsx'],
                uploadUrl: $.solver.services.api + "/Service/Upload/New",
                uploadAsync: true,
            });

            $(".input-b7").on("filebatchselected", function (event, files) {
                $(".input-b7").fileinput("upload");
                $.DisplayStatusBar({
                    message: 'Espere un momento se esta cargando su archivo ...'
                });
            });

            $('.input-b7').on('fileuploaderror', function (event, data, msg) {
                $.CloseStatusBar();
            });

            $(".input-b7").on("fileuploaded", function (event, data, previewId, index) {

                var codigo_masivo = $(this).attr('data-table');
                fnProcesarCargaMasiva(codigo_masivo, data.response.token);
                $(".input-b7").fileinput('clear');

            });

        };
        const fnCrearGrillas = function () {
            $(tblCliente).CreateGrid({
                query: 'tbl_lista_tabla_pendiente_cliente',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    BUSCAR: function () {
                        return $('form[name=frmCliente] input[name=buscar]').val();
                    }
                },
                hiddens: ['CODIGO'],
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
                },
                config: {
                    selectionmode: 'checkbox'
                }
            });

            $(tblCategoria).CreateGrid({
                query: 'tbl_lista_tabla_pendiente_categoria',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    BUSCAR: function () {
                        return $('form[name=frmCategoria] input[name=buscar]').val();
                    }
                },
                hiddens: ['CODIGO'],
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
                },
                config: {
                    selectionmode: 'checkbox'
                }
            });

            $(tblCentroCosto).CreateGrid({
                query: 'tbl_lista_tabla_pendiente_centrocosto',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    BUSCAR: function () {
                        return $('form[name=frmCentroCosto] input[name=buscar]').val();
                    }
                },
                hiddens: ['CODIGO'],
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
                },
                config: {
                    selectionmode: 'checkbox'
                }
            });

            $(tblProducto).CreateGrid({
                query: 'tbl_lista_tabla_pendiente_producto',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    BUSCAR: function () {
                        return $('form[name=frmProducto] input[name=buscar]').val();
                    }
                },
                hiddens: ['CODIGO'],
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
                },
                config: {
                    selectionmode: 'checkbox'
                }
            });

            $(tblServicio).CreateGrid({
                query: 'tbl_lista_tabla_pendiente_servicio',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    BUSCAR: function () {
                        return $('form[name=frmServicio] input[name=buscar]').val();
                    }
                },
                hiddens: ['CODIGO'],
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
                },
                config: {
                    selectionmode: 'checkbox'
                }
            });

            $(tblProveedores).CreateGrid({
                query: 'tbl_lista_tabla_pendiente_proveedores',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    BUSCAR: function () {
                        return $('form[name=frmProveedores] input[name=buscar]').val();
                    }
                },
                hiddens: ['CODIGO'],
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
                },
                config: {
                    selectionmode: 'checkbox'
                }
            });
        };

        const fnProcesarCargaMasiva = function (tabla, token) {
            var extras = {
                C_MASIVO_PROCESO: {
                    action: {
                        name: 'GetNextId',
                        args: $.ConvertObjectToArr({
                            columns: 'C_EMPRESA',
                            max_length: '6'
                        })
                    }
                },
            };
            $.AddPetition({
                type: '1',
                table: 'MASIVO_PROCESO',
                items: $.ConvertObjectToArr({
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_MASIVO_PROCESO: '',
                    C_MASIVO: tabla,
                    C_ARCHIVO_MASIVO: token,
                    FEC_REGISTRO: moment().format('DD/MM/YYYY HH:mm:ss'),
                    IND_ESTADO: '&',
                }, extras)
            });

            $.SendPetition({
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Procesando Archivo Planilla ...' });
                },
                onReady: function (result) {
                    $('#modalUploadFiles').modal('hide');
                    $.CloseStatusBar();
                },
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: error });
                }
            });
        }

        const fnAbrirCargaArchivo = function (c_masivo, ref_table) {
            codigo_masivo = c_masivo;
            table_update = ref_table;
            $('.descarga_novedad').attr('href', $.solver.services.api + 'Service/DownloadTemplate/' + c_masivo + '/plantilla/' + $.solver.session.SESSION_EMPRESA);
            $('#modalUploadFiles').modal('show');
        };
        const fnProcesarInformacion = function (tabla, ref_table) {
            var indicesSeleccionados = $(ref_table).jqxGrid('getselectedrowindexes');
            var rows = $(ref_table).jqxGrid('getrows');
            var codigos = [];
            $.each(indicesSeleccionados, function (i, v) {
                codigos.push(rows[v].CODIGO);
            })
            $.AddPetition({
                type: 4,
                items: $.ConvertObjectToArr({
                    script: 'spw_cuenta_cambiar_estado',
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_CODIGOS: codigos.join(','),
                    TABLE: tabla
                })
            });

            $.SendPetition({
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Guardando cambios ...' });
                },
                onReady: function (result) {
                    alertify.success('Cambios guardados correctamente');
                    $(ref_table).jqxGrid('updatebounddata');
                    $.CloseStatusBar();
                },
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: error });
                }
            })

        }
        const fnRevisarCargaMasiva = function () {

        };

        //*****************************************************************************************************************************************
        //carga de informacion laboral
        $('#action-colaboradores').CreateActions({
            class: 'btn btn-sm btn-orange',
            actions: {
                'Carga Plantilla': {
                    icon: 'fa fa-upload',
                    callback: function () {
                        codigo_masivo = '0005';
                        fnAbrirCargaArchivo('0005', 'table-colaboradores');
                    }
                },
                'Recuperar desde Consisat': {
                    icon: 'fa fa-trash-o',
                    callback: function () {

                    }
                },
                'Actualizar Datos': {
                    icon: 'fa fa-download',
                    callback: function () {
                        $('#table-colaboradores').jqxGrid('updatebounddata');
                    }
                },
            }
        });
        fn_CrearGrillas_Laboral();
        fnCrearGrillas();

        //*****************************************************************************************************************************************
        //funciones global
        fnCrearCargaArchivo();


        $.each($('a.descarga_novedad'), function (i, v) {
            var href = $(this).attr('href');
            href += '/' + $.solver.session.SESSION_EMPRESA;
            $(this).attr('href', href);
        });

        $('form[name=frmCliente]').ValidForm({
            type: -1,
            onReady: function (_, controls) {
                $('#tblCliente').jqxGrid('updatebounddata')
            },
            onDone: function (_, controls) {
                var codigo = '0002';
                var table = '#tblCliente';
                $('#actions-cliente').CreateActions({
                    class: 'btn btn-sm btn-orange',
                    actions: {
                        'Carga Plantilla': {
                            icon: 'fa fa-upload',
                            callback: function () {
                                fnAbrirCargaArchivo(codigo, table);
                            }
                        },
                        'Aprobar informacion': {
                            icon: 'fa fa-check',
                            callback: function () {
                                fnProcesarInformacion('CLIENTE', table);
                            }
                        }
                    }
                })
            }
        })
        $('form[name=frmProveedores]').ValidForm({
            type: -1,
            onReady: function (_, controls) {
                $('#tblProveedores').jqxGrid('updatebounddata')
            },
            onDone: function (_, controls) {
                var codigo = '0030';
                var table = '#tblProveedores';
                $('#actions-proveedores').CreateActions({
                    class: 'btn btn-sm btn-orange',
                    actions: {
                        'Carga Plantilla': {
                            icon: 'fa fa-upload',
                            callback: function () {
                                fnAbrirCargaArchivo(codigo, table);
                            }
                        },
                        'Aprobar informacion': {
                            icon: 'fa fa-check',
                            callback: function () {
                                fnProcesarInformacion('PROVEEDOR', table);
                            }
                        }
                    }
                })
            }
        })
        $('form[name=frmCategoria]').ValidForm({
            type: -1,
            onReady: function (_, controls) {
                $('#tblCategoria').jqxGrid('updatebounddata')
            },
            onDone: function (_, controls) {
                var codigo = '0021';
                var table = '#tblCategoria';
                $('#actions-categoria').CreateActions({
                    class: 'btn btn-sm btn-orange',
                    actions: {
                        'Carga Plantilla': {
                            icon: 'fa fa-upload',
                            callback: function () {
                                fnAbrirCargaArchivo(codigo, table);
                            }
                        },
                        'Aprobar informacion': {
                            icon: 'fa fa-check',
                            callback: function () {
                                fnProcesarInformacion('CATEGORIA', table);
                            }
                        }
                    }
                })
            }
        })
        $('form[name=frmCentroCosto]').ValidForm({
            type: -1,
            onReady: function (_, controls) {
                $('#tblCentroCosto').jqxGrid('updatebounddata')
            },
            onDone: function (_, controls) {
                var codigo = '0022';
                var table = '#tblCentroCosto';
                $('#actions-centrocosto').CreateActions({
                    class: 'btn btn-sm btn-orange',
                    actions: {
                        'Carga Plantilla': {
                            icon: 'fa fa-upload',
                            callback: function () {
                                fnAbrirCargaArchivo(codigo, table);
                            }
                        },
                        'Aprobar informacion': {
                            icon: 'fa fa-check',
                            callback: function () {
                                fnProcesarInformacion('CENTROCOSTO', table);
                            }
                        }
                    }
                })
            }
        })
        $('form[name=frmProducto]').ValidForm({
            type: -1,
            onReady: function (_, controls) {
                $('#tblProducto').jqxGrid('updatebounddata')
            },
            onDone: function (_, controls) {
                var codigo = '0003';
                var table = '#tblProducto';
                $('#actions-producto').CreateActions({
                    class: 'btn btn-sm btn-orange',
                    actions: {
                        'Carga Plantilla': {
                            icon: 'fa fa-upload',
                            callback: function () {
                                fnAbrirCargaArchivo(codigo, table);
                            }
                        },
                        'Aprobar informacion': {
                            icon: 'fa fa-check',
                            callback: function () {
                                fnProcesarInformacion('PRODUCTO', table);
                            }
                        }
                    }
                })
            }
        })
        $('form[name=frmServicio]').ValidForm({
            type: -1,
            onReady: function (_, controls) {
                $('#tblServicio').jqxGrid('updatebounddata')
            },
            onDone: function (_, controls) {
                var codigo = '0025';
                var table = '#tblServicio';
                $('#actions-servicio').CreateActions({
                    class: 'btn btn-sm btn-orange',
                    actions: {
                        'Carga Plantilla': {
                            icon: 'fa fa-upload',
                            callback: function () {
                                fnAbrirCargaArchivo(codigo, table);
                            }
                        },
                        'Aprobar informacion': {
                            icon: 'fa fa-check',
                            callback: function () {
                                fnProcesarInformacion('SERVICIO', table);
                            }
                        }
                    }
                })
            }
        })
    });
});