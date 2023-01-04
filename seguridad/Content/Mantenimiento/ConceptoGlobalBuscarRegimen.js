require(["jqwidgets", "helper"], function () {
    require(["moment"], function (moment) {

        var table01 = "#tableRegimenLaboral";

        var totalLoad = 0;
        var updatingSelection = false;
        var updatingSelectionFromDataTable = false;
        var adaptador01 = new $.jqx.dataAdapter({
            dataType: "json",
            dataFields: [
                { name: 'C_PARAMETRO_MANT', type: 'string' },
                { name: 'CODIGO_PARAMETRO', type: 'string' },
                { name: 'DESCRIPCION_PARAMETRO', type: 'string' },
                { name: 'FLAG_ESTADO', type: 'string' }
            ],
            data: {
                BUSCAR: function () {
                    return $('input#_buscar').val() || '';
                }
            },
            id: 'id',
            type: 'POST',
            url: $.solver.services.api + "/Service/DataTables/GET_REGIMEN_FIND_CONCEPTO/"
        });
        var agregarRows = function (_rows, _action) {
            var totalExist = 0;
            for (var item in _rows) {
                var row = _rows[item];
                var refRows = $("#tblConceptosRegimenLab").jqxDataTable('getRows');
                var refRowsPri = $("#tblConceptosRegimenLab").jqxDataTable('getRows');
                var _continuar = true;

                for (var xitem in refRows) {
                    var xrow = refRows[xitem];
                    if (xrow.C_PARAMETRO_GENERAL_REGIMEN_LABORAL_TRABAJADOR == row.C_PARAMETRO_MANT && xrow.MODO != 'Eliminado') {
                        _continuar = false;
                        totalExist++;
                        break;
                    }
                };

                if (_continuar) {
                    $("#tblConceptosRegimenLab").jqxDataTable('addRow', refRows.length, {
                        C_CONCEPTO_GLOBAL: $("#C_CONCEPTO_GLOBAL").val(),
                        C_PARAMETRO_GENERAL_REGIMEN_LABORAL_TRABAJADOR: row.C_PARAMETRO_MANT,
                        DESCRIPCION_PARAMETRO: row.DESCRIPCION_PARAMETRO,
                        CODIGO_PARAMETRO: row.CODIGO_PARAMETRO,
                        MODO: 'Nuevo'
                    }, 'first');
                };
            };

            require(['bootbox', 'alertify'], function (bootbox, alertify) {
                bootbox.hideAll();
                if (totalExist == 0) {
                    alertify.success('Los reg. laborales han sido agregados.');
                } else {
                    alertify.error('Algunos reg. laborales no se agregaron por que ya existían.');
                }
            });
        };

        const fnCrearTabla = function () {
            $(table01).jqxDataTable({
                serverProcessing: true,
                sortable: true,
                pageSize: 999,
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
                    { text: 'Código', dataField: 'CODIGO_PARAMETRO', width: '80', align: 'center', cellsAlign: 'center' },
                    { text: 'Descripción', dataField: 'DESCRIPCION_PARAMETRO', width: '350', align: 'center', cellsAlign: 'left' },
                    {
                        text: 'Estado', dataField: 'FLAG_ESTADO', width: '100', align: 'center', cellsalign: 'center', cellsRenderer: function (row, column, value, rowData) {
                            if (value == '*') return '<span style="color:blue;" class="text-extra"><i class="fa fa-check-circle" aria-hidden="true"></i> Activo</span>';
                            if (value == '&') return '<span style="color:red;" class="text-extra"><i class="fa fa-exclamation-circle" aria-hidden="true"></i> Inactivo</span>';
                        }
                    },
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
        }

        $('button.btn-add').click(function () {
            var _rows = $(table01).jqxDataTable('getSelection');
            if (_rows != 0) {
                agregarRows(_rows);
            } else {
                require(["alertify"], function (alertify) {
                    alertify.confirm('Confirmar Acción', 'No ha seleccionado ningun registro, ¿Quiere cargar todos los reg. laborales?', function () {
                        _rows = $(table01).jqxDataTable('getRows');
                        agregarRows(_rows);
                    }, function () {
                        console.log('Operacion cancelada...');
                    }).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'cancel');
                });
            }
        });

        $('form[name=filtrosRegRegimen]').submit(function () {
            $(table01).jqxDataTable('render');
        });
        $('form[name=filtrosRegRegimen]').ValidForm({
            type: -1,
            onDone: function (form, controls) {
                _controls = controls
                fnCrearTabla();
            },
            onReady: function (result, controls, form) { }
        });

    });
});