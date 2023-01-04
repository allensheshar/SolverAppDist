require(["jqwidgets", "helper"], function () {

    var table01 = "#tableUsuarios";
    var totalLoad = 0;

    var updatingSelection = false;
    var updatingSelectionFromDataTable = false;
    var allRowsSelected = function (_table) {
        var selection = $(_table).jqxDataTable('getSelection');
        var rows = $(_table).jqxDataTable('getRows');
        if (selection.length == 0) {
            return false;
        }
        if (rows.length != selection.length) {
            return null;
        }
        return true;
    };
    var adaptador01 = new $.jqx.dataAdapter({
        dataType: "json",
        dataFields: [
            { name: 'C_USUARIO', type: 'string' },
            { name: 'NOMBRE', type: 'string' },
            { name: 'EMAIL', type: 'string' }
        ],
        data: {
            BUSCAR: function () {
                return $('input#_buscar').val() || '';
            }
        },
        id: 'id',
        type: 'POST',
        url: $.solver.services.api + "/Service/DataTables/GET_ROL_FIND_USERS/"
    });
    var agregarRows = function (_rows, _action) {

        var totalExist = 0;

        for (var item in _rows) {

            var row = _rows[item];
            var refRows = $("#tableRegUsuarios").jqxDataTable('getRows');
            var _continuar = true;

            for (var xitem in refRows) {
                var xrow = refRows[xitem];
                if (xrow.C_USUARIO == row.C_USUARIO && xrow.MODO != 'Eliminado') {
                    _continuar = false;
                    totalExist++;
                    break;
                }
            };

            if (_continuar) {
                $("#tableRegUsuarios").jqxDataTable('addRow', refRows.length, {
                    C_USUARIO: row.C_USUARIO,
                    NOMBRE: row.NOMBRE,
                    EMAIL: row.EMAIL,
                    FLAG_ESTADO: '*',
                    MODO: 'Nuevo'
                }, 'first');
            };

        };

        require(['bootbox', 'alertify'], function (bootbox, alertify) {
            bootbox.hideAll();
            if (totalExist == 0) {
                alertify.success('Los usuarios han sido agregados.');
            } else {
                alertify.error('Algunos usuarios no se agregaron por que ya existían.');
            }
        });

    };

    $(table01).jqxDataTable({
        //localization: getLocalization(),
        serverProcessing: true,
        sortable: true,
        pageSize: 10,
        pageable: true,
        pagerButtonsCount: 10,
        source: adaptador01,
        columnsResize: true,
        width: '100%',
        height: 350,
        columns: [
            {
                text: 'CHECKBOX', width: '40', sortable: false, cellsalign: 'center',
                renderer: function (text, align, height) {
                    var checkBox = "<div id='checkbox' style='z-index: 999; margin: 5px; margin-left: 8px; margin-top: 8px; margin-bottom: 3px;'>";
                    checkBox += "</div>";
                    return checkBox;
                },
                rendered: function (element, align, height) {
                    element.jqxCheckBox();
                    element.on('change', function (event) {
                        if (!updatingSelectionFromDataTable) {
                            var args = event.args;
                            var rows = $(table01).jqxDataTable('getRows');
                            updatingSelection = true;
                            if (args.checked) {
                                for (var i = 0; i < rows.length; i++) {
                                    $(table01).jqxDataTable('selectRow', i);
                                }
                            }
                            else {
                                $(table01).jqxDataTable('clearSelection');
                            }
                            updatingSelection = false;
                        }
                    });
                    return true;
                },
                cellsRenderer: function (row, column, value, rowData) {
                    var checkbox = "<div id='checkbox" + row + "' class='form-check-row' data-row='" + row + "' style='z-index: 999; margin-left: 5px;'></div>";
                    return checkbox;
                }
            },
            { text: 'Código', dataField: 'C_USUARIO', width: '120', align: 'center', cellsalign: 'center' },
            { text: 'Nombre usuario', dataField: 'NOMBRE', width: '250', align: 'center', cellsalign: 'center' },
            { text: 'Email', dataField: 'EMAIL', width: '250', align: 'center', cellsalign: 'center' },
        ],
        rendering: function () {
            // destroys all checkbox.
            if ($(table01 + " .form-check-row").length > 0) {
                $(table01 + " .form-check-row").jqxCheckBox('destroy');
            }
        },
        rendered: function () {
            if ($(table01 + " .form-check-row").length > 0) {
                //Create Checkbox
                $(table01 + " .form-check-row").jqxCheckBox({ checked: false });
                //Activate Checkbox by Row
                var selection = $(table01).jqxDataTable('getSelection');
                for (var i = 0; i < selection.length; i++) {
                    // get a selected row.
                    var rowData = selection[i];
                    $(table01 + " #checkbox" + rowData.uid).jqxCheckBox({ checked: true });
                };
                //Event Change Checkbox
                $(table01 + " .form-check-row").on('change', function (event) {
                    var parent = $(this).closest('div.form-check-row');
                    var args = event.args;
                    var _index = parseInt(parent.attr('data-row'));
                    if (args.checked) $(table01).jqxDataTable('selectRow', _index);
                    if (!args.checked) $(table01).jqxDataTable('unselectRow', _index);
                });
            };
            totalLoad++;
        }
    });

    $('form[name=filtrosRegUsers]').submit(function () {
        $(table01).jqxDataTable('render');
    });

    //Actions Button and Form Filter
    $('button.btn-add').click(function () {
        var _rows = $(table01).jqxDataTable('getSelection');
        if (_rows != 0) {
            agregarRows(_rows);
        } else {
            require(["alertify"], function (alertify) {
                alertify.confirm('Confirmar Acción', 'No ha seleccionado ningun registro, ¿Quiere cargar todos los usuarios a su ROL?', function () {
                    _rows = $(table01).jqxDataTable('getRows');
                    agregarRows(_rows);
                }, function () {
                    console.log('Operacion cancelada...');
                }).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'cancel');
            });
        }
    });

});