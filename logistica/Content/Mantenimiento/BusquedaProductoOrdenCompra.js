require(['helper', 'extras'], function () {
    require(['numeral'], function (numeral) {
        const fnCalcularTotal = function (controls) {
            var cantidad = $(controls.CANTIDAD).val();
            var precio = $(controls.PRECIO).val();
            cantidad = cantidad == '' ? 0 : cantidad;
            precio = precio == '' ? 0 : precio;
            var total = cantidad * precio;
            $(controls.TOTAL).val(numeral(total).format('0.00'));
        }
        $('form[name=frmBusquedaProducto]').ValidForm({
            type: -1,
            onDone: function (form, controls) {
                $('#CANTIDAD, #PRECIO').change(function () { fnCalcularTotal(controls); });
                $('#CANTIDAD, #PRECIO').keyup(function () { fnCalcularTotal(controls); });
                fnCalcularTotal(controls);
            },
            onError: function (error) { $.ShowError({ error: error }); },
        });
    });
});