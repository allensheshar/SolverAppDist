require(["jqwidgets", "helper"], function () {

    var tablaFormatos = "#tableFormatos";

    $(tablaFormatos).CreateGrid({
        query: 'tbl_aus_programador_formatos_listadeformatos',
        sortcolumn: 'FEC_MODIF',
        sortdirection: 'DESC',
        columns: {
            'CÓDIGO': {
                text: 'Código',
                width: 100
            },
            'NOMBRE CLAVE': {
                text: 'Nombre clave',
                width: 200
            },
            'DESCRIPCION': {
                text: 'Descripción',
                width: 500,
            },
            'FEC_MODIF': {
                text: 'Fecha modif.'
            },
            'USU. MODIF': {
                text: 'Usu. modif.'
            },
            'HOST. MODIF': {
                text: 'Host modif.'
            },
            'OPCIONES': {
                text: 'Opciones',
                width: 50,
                sortable: false,
                createwidget: function (row, column, value, cellElement) {
                    $(cellElement).append('<a href="' + $.solver.baseUrl + '/Programador/FormatosRegistro/' + row.bounddata['CÓDIGO'] + '" id="btn-' + row.boundindex + '" data-index="' + row.boundindex + '" class="btn btn-sm  btn-danger btn-block"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></a>');
                    $(cellElement).find('a').css({
                        'padding': '0px',
                        'margin-left': '1px',
                        'margin-right': '1px'
                    });
                },
                initwidget: function (row, column, value, htmlElement) {

                }
            }
        },
        items: {
            BUSCAR: function () {
                return $('input#_buscar').val() || '';
            },
        },
        config: {
            pageSize: 100,
        }
    });

    $('form[name=filtrosRegFormatos]').submit(function () {
        $(tablaFormatos).jqxGrid('updatebounddata');
    });

});