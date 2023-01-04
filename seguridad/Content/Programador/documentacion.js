require(["helper", "extras", 'bootstrap-select', 'fileinput.es'], function () {
    require(["alertify", "bootbox"], function (alertify, bootbox) {
        alertify.set('notifier', 'position', 'top-center');

        var table01 = "#tableDocumentacion";

        $(table01).CreateTable({
            query: 'tbl_documentacion_programador_listadodocumentacion',
            items: {
                BUSCAR: function () {
                    return $('input#_buscar').val() || '';
                },
                C_USUARIO: function () {
                    return $('form[name=filtrosDocumentacion] #_usuario').val() || '';
                }
            },
            hiddens: ['COMENTARIO','CADENA_SCRIPT', 'C_DOCUMENTACION', 'FEC_MODIF'],
            columns: {
                NOMBRE_DOC: {
                    width: 'auto',
                    text: 'Nombre del documentación'
                },
                USU_DOC: {
                    text: 'Usuario',
                    width: 180,
                    cellsAlign: 'center'
                },
                FEC_CREAC: {
                    text: 'Fecha creación',
                    cellsAlign: 'center',
                    width: 140
                },
                FEC_DOC: {
                    text: 'Fecha documentación',
                    cellsAlign: 'center',
                    width: 140
                },
                ACCION: {
                    text: 'Acción', width: '150', align: 'center', cellsalign: 'center', cellsRenderer: function (row, column, value, rowData) {
                        var _editar = '<a href="/seguridad/Programador/Documentacionregistro/' + rowData["C_DOCUMENTACION"] + '" data-id="' + rowData["C_DOCUMENTACION"] + '" class="btn-editar"><i class="fa fa-pencil-square" aria-hidden="true"></i> Editar</a>';
                        var _eliminar = '<a href="#" data-id="' + rowData["C_DOCUMENTACION"] + '" class="btn-eliminar"><i class="fa fa-times" aria-hidden="true"></i> Eliminar</a>';
                        return _editar + ' | ' + _eliminar;
                    },
                    pinned: true
                }
            },
            sortcolumn: 'FEC_CREAC',
            sortdirection: 'DESC',
            config: {
                pageSize: 100,
                rendered: function () {
                    $('a.btn-eliminar').unbind('click');
                    $('a.btn-eliminar').bind('click', function (e) {

                        var _script = $(this).attr('data-id');

                        require(['alertify'], function (alertify) {

                            var _deleting = function () {

                                var _tokeDelEmpresa = $.AddPetition({
                                    table: 'W_DOCUMENTACION_DB',
                                    type: 3,
                                    condition: "C_DOCUMENTACION='" + _script + "'"
                                });

                                $.SendPetition({
                                    onBefore: function () {
                                        $.DisplayStatusBar({ message: 'Espere por favor, estamos eliminando tu registro...' });
                                    },
                                    onReady: function () {
                                        $.CloseStatusBar();
                                        $(table01).jqxDataTable('render');
                                    },
                                    onError: function (error) {
                                        $.CloseStatusBar();
                                        $.ShowError({ error: error });
                                    }
                                });
                            };

                            alertify.confirm('Confirmar Acción', '¿Seguro de eliminar el registro?', function () {
                                _deleting();
                            }, function () {
                                console.log('Operacion cancelada...');
                            }).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'cancel');
                        });

                        e.preventDefault();
                    });
                }
            }
        });

        $('form[name=filtrosDocumentacion]').ValidForm({
            type: -1,
            onReady: function (result) {
                $(table01).jqxDataTable('render');
            },
            onDone: function () {
                
            }
        });

        $('a#btnNuevaDocumentacion').bind('click', function (e) {
            document.location.href = $.solver.baseUrl + "/Programador/Documentacionregistro/";
            e.preventDefault();
        });
    });
});