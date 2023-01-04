require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", "moment"], function (alertify, moment) {
        alertify.set('notifier', 'position', 'top-center');

        var table01 = "#tblConceptosRegimenLab";

        var fnVerificarTabs = function () {

            if ($('#TIPO_CONCEPTO').val() == 'I') {
                $('#INGRESO').attr('checked', true);
            }
            if ($('#TIPO_CONCEPTO').val() == 'D') {
                $('#DEDUCCION').attr('checked', true);
            }
            if ($('#TIPO_CONCEPTO').val() == 'A') {
                $('#APORTE').attr('checked', true);
            }

            if ($('#TIPO_CALCULO').val() == 'F') {
                $('#FORMULA').attr('checked', true);
                $('#div-formula').css('display', 'block');
                $('#div-valor').css('display', 'none');
            }
            if ($('#TIPO_CALCULO').val() == 'V') {
                $('#VALOR').attr('checked', true);
                $('#div-formula').css('display', 'none');
                $('#div-valor').css('display', 'block');
            }

            if ($('#FLAG_INCIDENCIA').val() == '*') {
                $('#SI').attr('checked', true);
                $("#TIPO_INCIDENCIA").removeAttr('readonly').css({ 'pointer-events': 'auto' });
            }
            if ($('#FLAG_INCIDENCIA').val() == '&' || $('#FLAG_INCIDENCIA').val() == null || $('#FLAG_INCIDENCIA').val() == '') {
                $('#NO').attr('checked', true);
                $("#TIPO_INCIDENCIA").attr('readonly', 'readonly').css('pointer-events', 'none');
            }

            if ($('#FLAG_PLAME_REF').val() == '*') {
                $('#SI_CONC').attr('checked', true);

                $("#COD_PLAME").removeAttr('required');
                $("#COD_PLAME").attr('readonly', 'readonly').css('pointer-events', 'none');

                $("#COD_PLAME_REF_2").attr('required', 'required');
                $("#COD_PLAME_REF_2").removeAttr('readonly').css({ 'pointer-events': 'auto' });

                $("#COD_PLAME_REF_2").attr('data-query', 'q_cta_mantenimiento_concepglobal_plameref')
                $("#COD_PLAME_REF_2").attr('data-value', 'CODIGO')
                $("#COD_PLAME_REF_2").attr('data-field', 'DESCRIPCION')
                $("#COD_PLAME_REF_2").attr('data-FLAG_GRUPO_CONCEPTO', $("#FLAG_GRUPO_CONCEPTO").val());
                $("#COD_PLAME_REF_2").FieldLoadRemote({
                    onReady: function () {
                        $("#COD_PLAME_REF_2").val($("#COD_PLAME_REF").val());
                        $("#COD_PLAME_REF_2").trigger('change');
                    }
                });
            }
            if ($('#FLAG_PLAME_REF').val() == '&' || $('#FLAG_PLAME_REF').val() == null || $('#FLAG_PLAME_REF').val() == '') {
                $('#NO_CONC').attr('checked', true);

                $("#COD_PLAME").attr('required', 'required');
                $("#COD_PLAME").removeAttr('readonly').css({ 'pointer-events': 'auto' });

                $("#COD_PLAME_REF_2").removeAttr('required');
                $("#COD_PLAME_REF_2").attr('readonly', 'readonly').css('pointer-events', 'none');
            }

        }

        const fnObtenerComodines = function () {
            $.GetQuery({
                query: ['gbl_obtener_comodin_planilla'],
                items: [{
                    BUSCAR: function () {
                        return $('#lblComodin').val() || '';
                    }
                }],
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error });
                },
                onReady: function (res) {
                    if (res.length > 0) {
                        $('.list-group').html('');
                        $.each(res, function (i, v) {
                            $('.list-group').append(`<a href="#" data-variable="${v.VARIABLE}" class="list-group-item list-group-item-action">${v.NOMBRE}</a>`);
                        });

                        $('.list-group-item-action').unbind('click')
                        $('.list-group-item-action').bind('click', function (e) {
                            var variable = $(this).attr('data-variable');
                            $('#formula').val($('#formula').val() + variable);
                            $('#formula').focus();
                            e.preventDefault();
                        })
                    }
                }
            })
        }
        const cargarChecksBaseComputable = function (servicios) {
            $('#BASE_COMPUTABLE').val(servicios);
            var arrServicios = [];
            if (servicios != null) {
                arrServicios = servicios.split('|');
            }
            $.GetQuery({
                query: ['gbl_planilla_obtener_basecomputable'],
                onReady: function (result) {
                    $('#divchk').html('')
                    $.each(result, function (i, item) {
                        $('#divchk').append(`
                                                <label class="col-auto">
                                                    <input type="checkbox" class="radio basecomputable" id="MOD_${i}" ${((arrServicios.filter(x => x == item['CODIGO']).length == 0) ? '' : 'checked')} data-val="${item['CODIGO']}" data-desc="${item['DESCRIPCION']}" /> ${item['DESCRIPCION']}
                                                </label>
                                            `);
                    });

                }
            })
        }
        const CrearTablas = function (controls) {
            $(table01).CreateTable({
                serverProcessing: true,
                sortable: true,
                pageSize: 999,
                pageable: true,
                pagerButtonsCount: 10,
                columnsResize: true,
                width: '100%',
                query: 'tbl_cuenta_mantenimiento_conceptosglobales_listarregimenlab',
                items: {
                    C_CONCEPTO_GLOBAL: function () {
                        return $(controls.C_CONCEPTO_GLOBAL).val() || '';
                    },
                },
                hiddens: ['C_CONCEPTO_GLOBAL', 'C_PARAMETRO_GENERAL_REGIMEN_LABORAL_TRABAJADOR', 'MODO'],
                columns: {
                    CODIGO_PARAMETRO: { text: 'Código', dataField: 'CODIGO_PARAMETRO', width: '80', align: 'center', cellsAlign: 'center' },
                    DESCRIPCION_PARAMETRO: { text: 'Nombre Regimen Laboral', dataField: 'DESCRIPCION_PARAMETRO', width: '350', align: 'center', cellsAlign: 'left' },
                    ACCION: {
                        text: 'Acción', width: '150', align: 'center', cellsalign: 'center', cellsRenderer: function (row, column, value, rowData) {
                            if (rowData.MODO != 'Eliminado') {
                                return '<a href="#" data-index="' + row + '" class="delete2"><i class="fa fa-pencil-square" aria-hidden="true"></i> Quitar</a>';
                            } else {
                                return "<span style='color:red;' style='No se eliminará hasta que guarde.' class='text-extra'><i class='fa fa-exclamation-triangle' aria-hidden='true'></i> Por Eliminar</span>"
                            }
                        }
                    }
                },
                config: {
                    height: 350,
                    rendered: function () {
                        $('a.delete2').unbind('click');
                        $('a.delete2').click(function (e) {

                            var _index = $(this).attr('data-index');
                            var _rows = $(table01).jqxDataTable('getRows');

                            _rows[_index]["MODO"] = 'Eliminado';
                            $(table01).jqxDataTable('endUpdate');

                            require(["alertify"], function (alertify) {
                                alertify.warning('No olvide guardar sus cambios....', 5, function () { });
                            });

                            e.preventDefault();

                        });
                    }
                }
            });
        }

        var actionsButtons = function (controls) {
            //Agregar nuevo usuario
            $('button.btn-add-pla-concepto').click(function () {
                $.GetData({
                    title: '<i class="fa fa-user" aria-hidden="true"></i> Agregar regimen a concepto',
                    uriData: '/Seguridad/Mantenimiento/ConceptoGlobalBuscarRegimen',
                    location: 'float',
                    size: 'large',
                    type: 'GET',
                    isPage: true,
                    onReady: function (object) { }
                });
            });
        };
        var addOptions = function (token) {
            //Agregando Data de Servicios
            var rowsUser = $(table01).jqxDataTable('getRows');
            for (var item in rowsUser) {

                var _regimen = rowsUser[item];
                var _method = 1;
                var _condition = '';

                if (_regimen.MODO == 'Nuevo') {
                    $.AddPetition({
                        table: 'PLA.CONCEPTO_GLOBAL_REGIMEN_LAB',
                        type: _method,
                        condition: _condition,
                        items: $.ConvertObjectToArr({
                            C_CONCEPTO_GLOBAL: '',
                            C_PARAMETRO_GENERAL_REGIMEN_LABORAL_TRABAJADOR: _regimen.C_PARAMETRO_GENERAL_REGIMEN_LABORAL_TRABAJADOR
                        },
                        {
                            C_CONCEPTO_GLOBAL: {
                                action: {
                                    name: 'GetParentId',
                                    args: $.ConvertObjectToArr({
                                        token: token,
                                        column: 'C_CONCEPTO_GLOBAL'
                                    })
                                }
                            }
                        })
                    });
                }
                if (_regimen.MODO == 'Eliminado') {
                    _method = 3;
                    _condition = "C_CONCEPTO_GLOBAL='" + _regimen.C_CONCEPTO_GLOBAL + "' AND C_PARAMETRO_GENERAL_REGIMEN_LABORAL_TRABAJADOR='" + _regimen.C_PARAMETRO_GENERAL_REGIMEN_LABORAL_TRABAJADOR + "'";

                    $.AddPetition({
                        table: 'PLA.CONCEPTO_GLOBAL_REGIMEN_LAB',
                        type: _method,
                        condition: _condition,
                        items: $.ConvertObjectToArr({
                            C_CONCEPTO_GLOBAL: _regimen.C_CONCEPTO_GLOBAL,
                            C_PARAMETRO_GENERAL_REGIMEN_LABORAL_TRABAJADOR: _regimen.C_PARAMETRO_GENERAL_REGIMEN_LABORAL_TRABAJADOR
                        })
                    });
                };
            };
        };

        $('form[name=frmRegistroConceptosGlobales]').ValidForm({
            table: 'PLA.CONCEPTO_GLOBAL',
            type: 1,
            querySave: true,
            extras: {
                C_CONCEPTO_GLOBAL: {
                    action: {
                        name: 'GetNextId',
                        args: $.ConvertObjectToArr({
                            max_length: '6'
                        })
                    }
                }
            },
            rules: {
                COD_PLAME: {
                    runQuery: {
                        onStart: function () {
                            $.AddPetition({
                                items: $.ConvertObjectToArr({
                                    script: 'q_cta_mantenimiento_conceptosglobales_duplicadoplame',
                                    COD_PLAME: function () {
                                        return $('#COD_PLAME').val();
                                    }
                                })
                            });
                        },
                        onReady: function (result) {
                            if (result[0].result.rows[0].CONT != 0) {
                                if ($('#C_CONCEPTO_GLOBAL').val() != '') {
                                    if ($('#COD_PLAME').val() != $('#COD_PLAME_2').val()) {
                                        alertify.warning('El código plame ingresado ya existe, por favor digite otro');
                                        $('#COD_PLAME').val($('#COD_PLAME_2').val());
                                        return false;
                                    }
                                    else {
                                        return true;
                                    }
                                }
                                else {
                                    alertify.warning('El código plame ingresado ya existe, por favor digite otro');
                                    $('#COD_PLAME').val('');
                                    $('#COD_PLAME').focus();
                                    return false;
                                }
                            }
                            else {
                                return true;
                            }
                        }
                    }
                }
            },
            //messages: {
            //    COD_PLAME: {
            //        runQuery: 'El código plame ingresado ya existe, por favor digite otro.',
            //    },
            //},
            onSubmit: function (form, controls, objParent) {
                var checks = $("#divchk").find('.radio');
                var arr = [];
                $.each(checks, function (i, v) {
                    var a = $(v).is(":checked");
                    if (a) {
                        arr.push($(v).attr("data-val"));
                    }
                });
                objParent.BASE_COMPUTABLE = arr.join('|');
            },
            onDetail: function (form, controls, token) {
                addOptions(token);
            },
            onDone: function (form, controls) {
                _controls = controls;
                $('.number-input').on('input', function () {
                    this.value = this.value.replace(/[^0-9]/g, '');
                });
                
                $("#COD_PLAME_2").val($(_controls.COD_PLAME).val())

                $('input[type="radio"]').on('change', function (e) {
                    let id = this.id;
                    if (id == 'INGRESO') {
                        $('#TIPO_CONCEPTO').val('I');
                        $('#DEDUCCION').prop('checked', false);
                        $('#APORTE').prop('checked', false);
                    }
                    if (id == 'DEDUCCION') {
                        $('#TIPO_CONCEPTO').val('D');
                        $('#INGRESO').prop('checked', false);
                        $('#APORTE').prop('checked', false);
                    }
                    if (id == 'APORTE') {
                        $('#TIPO_CONCEPTO').val('A');
                        $('#INGRESO').prop('checked', false);
                        $('#DEDUCCION').prop('checked', false);
                    }

                    if (id == 'SI') {
                        $('#FLAG_INCIDENCIA').val('*');
                        $('#NO').prop('checked', false);
                        $("#TIPO_INCIDENCIA").removeAttr('readonly').css({ 'pointer-events': 'auto' });
                    }
                    if (id == 'NO') {
                        $('#FLAG_INCIDENCIA').val('&');
                        $('#SI').prop('checked', false);
                        $("#TIPO_INCIDENCIA").val('');
                        $("#TIPO_INCIDENCIA").attr('readonly', 'readonly').css('pointer-events', 'none');
                    }

                    if (id == 'FORMULA') {
                        $('#TIPO_CALCULO').val('F');
                        $('#ORIGEN').prop('checked', false);
                        $('#VALOR').prop('checked', false);
                        $('#div-formula').css('display', 'block');
                        $('#div-valor').css('display', 'none');
                    }
                    if (id == 'VALOR') {
                        $('#TIPO_CALCULO').val('V');
                        $('#FORMULA').prop('checked', false);
                        $('#ORIGEN').prop('checked', false);
                        $('#div-formula').css('display', 'none');
                        $('#div-valor').css('display', 'block');
                    }

                    if (id == 'SI_CONC') {
                        $('#FLAG_PLAME_REF').val('*');
                        $('#NO_CONC').prop('checked', false);

                        $(_controls.COD_PLAME).val('');
                        $(_controls.COD_PLAME).removeAttr('required');
                        $(_controls.COD_PLAME).attr('readonly', 'readonly').css('pointer-events', 'none');

                        $("#COD_PLAME_REF_2").attr('required', 'required');
                        $("#COD_PLAME_REF_2").removeAttr('readonly').css({ 'pointer-events': 'auto' });

                        $("#COD_PLAME_REF_2").attr('data-query', 'q_cta_mantenimiento_concepglobal_plameref')
                        $("#COD_PLAME_REF_2").attr('data-value', 'CODIGO')
                        $("#COD_PLAME_REF_2").attr('data-field', 'DESCRIPCION')
                        $("#COD_PLAME_REF_2").attr('data-FLAG_GRUPO_CONCEPTO', $(_controls.FLAG_GRUPO_CONCEPTO).val());
                        $("#COD_PLAME_REF_2").FieldLoadRemote();
                    }
                    if (id == 'NO_CONC') {
                        $('#FLAG_PLAME_REF').val('&');
                        $('#SI_CONC').prop('checked', false);

                        $(_controls.COD_PLAME).val($("#COD_PLAME_2").val());
                        $(_controls.COD_PLAME).attr('required', 'required');
                        $(_controls.COD_PLAME).removeAttr('readonly').css({ 'pointer-events': 'auto' });

                        $("#COD_PLAME_REF_2").val('');
                        $("#COD_PLAME_REF_2").removeAttr('required');
                        $("#COD_PLAME_REF_2").attr('readonly', 'readonly').css('pointer-events', 'none');
                    }
                });

                $(_controls.FLAG_GRUPO_CONCEPTO).unbind("change");
                $(_controls.FLAG_GRUPO_CONCEPTO).change(function () {
                    $("#COD_PLAME_REF_2").attr('data-query', 'q_cta_mantenimiento_concepglobal_plameref')
                    $("#COD_PLAME_REF_2").attr('data-value', 'CODIGO')
                    $("#COD_PLAME_REF_2").attr('data-field', 'DESCRIPCION')
                    $("#COD_PLAME_REF_2").attr('data-FLAG_GRUPO_CONCEPTO', $(_controls.FLAG_GRUPO_CONCEPTO).val());
                    $("#COD_PLAME_REF_2").FieldLoadRemote();
                });

                $("#COD_PLAME_REF_2").unbind("change");
                $("#COD_PLAME_REF_2").change(function () {
                    let val = $(this).val();
                    $("#COD_PLAME_REF").val(val);
                });

                fnVerificarTabs();
                
                actionsButtons(controls);
                CrearTablas(_controls);
                cargarChecksBaseComputable($(_controls.BASE_COMPUTABLE).val());

                $('#btnModalFormula').click(function () {
                    $('#modalFormula').modal('show');
                    fnObtenerComodines();
                    $('#formula').val($('#DESCRIP_FORMULA').val());
                });

                $('#btnGuardarFormula').click(function () {
                    $('#DESCRIP_FORMULA').val($('#formula').val());
                    $('#lblComodin').val('')
                    $('#modalFormula').modal('hide')
                })

                $('#lblComodin').keyup(function () {
                    fnObtenerComodines();
                })
            },
            onReady: function (result, controls, form) {
                document.location = $.solver.baseUrl + '/Mantenimiento/ConceptosGlobales/';
            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error: error });
            }
        });

        if ($('#CREAR').val() != "") {
            $('#btnSalir').css('display', 'none');
        }

    });
});