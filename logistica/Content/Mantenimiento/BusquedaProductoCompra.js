require(['helper', 'extras'], function () {
    require(['numeral'], function (numeral) {
        const fnCalcularTotal = function (controls) {
            var cantidad = $(controls.CANTIDAD).val();
            var precio = $(controls.PRECIO).val();
            var porc_dscto = 0;
            cantidad = cantidad == '' ? 0 : cantidad;
            precio = precio == '' ? 0 : precio;
            porc_dscto = porc_dscto == '' ? 0 : porc_dscto;
            var subtotal = cantidad * precio;
            var descuento = subtotal * (porc_dscto / 100);
            var total = subtotal - descuento;
            $(controls.TOTAL).val(numeral(total).format('0.00'));
        }
        $('form[name=frmBusquedaProducto]').ValidForm({
            type: -1,
            onDone: function (form, controls) {
                $('#CANTIDAD, #PRECIO, #PORC_DSCTO').change(function () { fnCalcularTotal(controls); });
                $('#CANTIDAD, #PRECIO, #PORC_DSCTO').keyup(function () { fnCalcularTotal(controls); });
                fnCalcularTotal(controls);
            },
            onError: function (error) {
                $.ShowError({ error: error });
            },
        });
    });
});