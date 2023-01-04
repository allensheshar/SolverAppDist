require(['helper', 'extras'], function () {
    require(["numeral"], function (numeral) {

        var formName = "filtrosRegModulos";
        var SavedOptions = function (C_EMPRESA) {

            $('.zone-opciones').find('li.option').each(function () {

                let _uid = $(this).attr('data-uid');
                let _texto = $(this).find('span.text-name').first().text();
                let _accion = $(this).find('span.text-accion').first().text();
                let _icono_img = $(this).find('span.text-icono-img').first().text();
                let _flagmovil = $(this).find('input.text-flagmovil').is(':checked');
                let _title = $(this).find('span.text-title').first().text();
                let _orden = $(this).attr('data-index-show');
                let _padre = $(this).attr('data-parent-uid');
                let _fk = $(this).attr('data-fk');
                let _fk_1 = $(this).attr('data-fk-1');
                let _method = $(this).attr('data-method');
                let _logo = $(this).attr('data-logo') || null;
                let _condition = '';
                let _data = {};
                let _table = '';
                let _state = $(this).attr('data-state') || '*';
                let _orden_repair = parseFloat('0.0000000000');
                let _orden_arr = _orden.split('.');
                let _orden_repair_dec = parseFloat('0.0000000000');
                let _htmlIcon = $(this).find('span.text-html-icon').first().text();

                //Recalculamos orden de items
                for (var x in _orden_arr) {
                    if (x == 0) _orden_repair += parseFloat(_orden_arr[x] + '.0000000000');
                    if (x != 0) _orden_repair_dec += parseFloat(_orden_arr[x]);
                };
                _orden_repair += (_orden_repair_dec / 100);

                //Nivel 1
                if ($(this).hasClass('level-01')) {
                    _table = 'W_MODULO';
                    _data = {
                        C_EMPRESA: C_EMPRESA,
                        C_MODULO: _uid,
                        NOMBRES: _texto,
                        DESCRIPCION: '',
                        TITULO_MOSTRAR: _texto,
                        PATH: _accion,
                        FLAG_ESTADO: _state,
                        //ICON_IMG: _icono_img,
                        FLAG_MOVIL: (_flagmovil ? '*' : '&'),
                        ORDEN: _orden_repair,
                        C_ARCHIVO_ICON: _logo
                    };
                    if (_method == '2') {
                        _condition = "C_EMPRESA='" + C_EMPRESA + "' and C_MODULO='" + _uid + "'";
                    };
                };

                //Nivel 2
                if ($(this).hasClass('level-02')) {
                    _table = 'W_MENU';
                    _data = {
                        C_MODULO: _fk,
                        C_MENU: _uid,
                        NOMBRE: _texto,
                        DESCRIPCION: '',
                        UBICACION: '',
                        FLAG_ESTADO: _state,
                        ORDEN: _orden_repair,
                        C_ARCHIVO_ICON: _logo
                    }
                    if (_method == '2') {
                        _condition = "C_MODULO='" + _fk + "' and C_MENU='" + _uid + "'";
                    };
                };

                //Nivel 3
                if ($(this).hasClass('level-03')) {
                    _table = 'W_OPCION_MENU';
                    _data = {
                        C_MODULO: _fk_1,
                        C_MENU: _fk,
                        C_OPCION: _uid,
                        ETIQUETA: _texto,
                        DESCRIPCION: '',
                        ACCION: _accion,
                        DESTINO: '',
                        PARAMETROS: '',
                        FLAG_ESTADO: _state,
                        ORDEN: _orden_repair,
                        C_OPCION_PADRE: _padre,
                        TITULO_PAGINA: _title,
                        C_ARCHIVO_ICON: _logo,
                        C_HTML_ICON: _htmlIcon
                    }
                    if (_method == '2') {
                        _condition = "C_MODULO='" + _fk_1 + "' and C_MENU='" + _fk + "' and C_OPCION='" + _uid + "'";
                    };
                };

                if (_table != '') {
                    $.AddPetition({
                        table: _table,
                        type: _method,
                        condition: _condition,
                        items: $.ConvertObjectToArr(_data)
                    });
                };

            });

            $.SendPetition({
                connectToLogin: 'S',
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Espere porfavor, estamos registrando tu información...' });
                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                },
                onReady: function (_result) {

                    $.CloseStatusBar();

                    require(["alertify"], function (alertify) {
                        alertify.alert('Operación completa', 'Los modulos han sido actualizados correctamente.', function () {
                            $('form[name=' + formName + ']').trigger('submit');
                        });
                    });

                }
            });

        };

        //Valid Form
        $('form[name=' + formName + ']').ValidForm({
            onDone: function (form, controls) {

                $(controls._modulo).change(function () {
                    $(form).submit();
                }).trigger('change');
            
                //Evento Click Add Element
                $('a.add-element').on("click", function (e) {
                    $.AddOption();
                    e.preventDefault();
                });

                //Button Guardar
                $('button.btnGuardar').click(function () {
                    require(["alertify"], function (alertify) {
                        alertify.confirm('Confirmar Acción', '¿Seguro de Guardar los cambios realizados?', function () {
                            SavedOptions($(controls._buscar).val());
                        }, function () {
                            console.log('Operacion guardar cancelada...');
                        }).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'cancel');
                    });
                });

            },
            onReady: function (result, controls, serialize) {

                //Generamos modulos
                $.GenerateOptions(result.result.rows);

            }
        });

    });
});