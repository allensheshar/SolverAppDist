require(["jqwidgets", "helper"], function () {
    require(["moment"], function (moment) {

        var table01 = "#tableRoles";

        var totalLoad = 0;
        var updatingSelection = false;
        var updatingSelectionFromDataTable = false;
        var adaptador01 = new $.jqx.dataAdapter({
            dataType: "json",
            dataFields: [
                { name: 'C_ROL', type: 'string' },
                { name: 'NOMBRE', type: 'string' },
                { name: 'DESCRIPCION', type: 'string' },
                { name: 'DESCRIPCION_PARAMETRO', type: 'string' },
                { name: 'IND_ESTADO', type: 'string' }
            ],
            data: {
                BUSCAR: function () {
                    return $('input#_buscar').val() || '';
                }
            },
            id: 'id',
            type: 'POST',
            url: $.solver.services.api + "/Service/DataTables/GET_ROL_FIND_USUARIO/"
        });
        var agregarRows = function (_rows, _action) {
            var totalExist = 0;
            for (var item in _rows) {
                var row = _rows[item];
                var refRows = $("#tblServicios").jqxDataTable('getRows');
                var refRowsPri = $("#tblServicios").jqxDataTable('getRows');
                var _continuar = true;

                for (var xitem in refRows) {
                    var xrow = refRows[xitem];
                    if (xrow.C_ROL == row.C_ROL && xrow.MODO != 'Eliminado') {
                        _continuar = false;
                        totalExist++;
                        break;
                    }
                };

                if (_continuar) {
                    $("#tblServicios").jqxDataTable('addRow', refRows.length, {
                        C_USUARIO: $("#C_USUARIO").val(),
                        C_ROL: row.C_ROL,
                        NOMBRE: row.NOMBRE,
                        DESCRIPCION: row.DESCRIPCION,
                        DESCRIPCION_PARAMETRO: row.DESCRIPCION_PARAMETRO,
                        C_USUARIO_REGISTRA: $("#C_USUARIO_REGISTRA").val(),
                        FEC_MODIF: moment(new Date()).format("DD/MM/YYYY"),
                        MODO: 'Nuevo'
                    }, 'first');
                };
            };

            require(['bootbox', 'alertify'], function (bootbox, alertify) {
                bootbox.hideAll();
                if (totalExist == 0) {
                    alertify.success('Los roles han sido agregados.');
                } else {
                    alertify.error('Algunos roles no se agregaron por que ya existían.');
                }
            });
        };

        const fnCrearTabla = function () {
            $(table01).jqxDataTable({
                //localization: getLocalization(),
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
                    { text: 'Nombre', dataField: 'NOMBRE', width: '350', align: 'center', cellsalign: 'center' },
                    { text: 'Descripción', dataField: 'DESCRIPCION', width: '150', align: 'center', cellsalign: 'center' },
                    { text: 'Tipo Rol', dataField: 'DESCRIPCION_PARAMETRO', width: '100', align: 'center', cellsalign: 'center' },
                    {
                        text: 'Estado', dataField: 'IND_ESTADO', width: '100', align: 'center', cellsalign: 'center', cellsRenderer: function (row, column, value, rowData) {
                            if (value == '*') return '<span style="color:blue;" class="text-extra"><i class="fa fa-check-circle" aria-hidden="true"></i> ACTIVO</span>';
                            if (value == '&') return '<span style="color:red;" class="text-extra"><i class="fa fa-exclamation-circle" aria-hidden="true"></i> INACTIVO</span>';
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
                    alertify.confirm('Confirmar Acción', 'No ha seleccionado ningun registro, ¿Quiere cargar todos los roles a su empresa?', function () {
                        _rows = $(table01).jqxDataTable('getRows');
                        agregarRows(_rows);
                    }, function () {
                        console.log('Operacion cancelada...');
                    }).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'cancel');
                });
            }
        });

        $('form[name=filtrosRegRol]').submit(function () {
            $(table01).jqxDataTable('render');
        });
        $('form[name=filtrosRegRol]').ValidForm({
            type: -1,
            onDone: function (form, controls) {
                _controls = controls

                fnCrearTabla();
            },
            onReady: function (result, controls, form) { }
        });

    });
});