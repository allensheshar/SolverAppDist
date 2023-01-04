require(["jqwidgets", "helper"], function () {

    var table01 = "#tableRegConsultas";

    $(table01).CreateTable({
        query: 'GET_FULL_QUERYS',
        items: {
            BUSCAR: function () {
                return $('input#_buscar').val() || '';
            }
        },
        hiddens: ['ORDEN', 'C_SCRIPT', 'USU_CREAC', 'USU_MODIF'],
        columns: {
            NOMBRE_SCRIPT: {
                width: 'auto',
                text: 'Nombre del script'
            },
            USU_ULTIMO_MODI: {
                text: 'Usuario Modifico',
                cellsAlign: 'center',
                width: 140
            },
            FEC_CREAC: {
                text: 'Fecha creación',
                width: 140
            },
            FEC_MODIF: {
                text: 'Fecha modificación',
                width: 140
            },
            ACCION: {
                text: 'Acción', width: '150', align: 'center', cellsalign: 'center', cellsRenderer: function (row, column, value, rowData) {
                    var _editar = '<a href="/Seguridad/Programador/Editorconsultasregistro/' + rowData["C_SCRIPT"] + '" data-id="' + rowData["C_EMPRESA"] + '" class="btn-editar"><i class="fa fa-pencil-square" aria-hidden="true"></i> Editar</a>';
                    var _eliminar = '<a href="#" data-id="' + rowData["C_SCRIPT"] + '" class="btn-eliminar"><i class="fa fa-times" aria-hidden="true"></i> Eliminar</a>';
                    return _editar + ' | ' + _eliminar;
                },
                pinned: true
            }
        },
        sortcolumn: 'FEC_MODIF',
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
                                table: 'W_SCRIPTS',
                                type: 3,
                                condition: "C_SCRIPT='" + _script + "'"
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

    $('form[name=filtrosRegConsultas]').submit(function () {
        $(table01).jqxDataTable('render');
    });

});