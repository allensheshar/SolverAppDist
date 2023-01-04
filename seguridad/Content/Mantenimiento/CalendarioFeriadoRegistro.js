require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", "bootbox", "moment"], function (alertify, bootbox, moment) {
        alertify.set('notifier', 'position', 'top-center');

        $("#FEC_FERIADO").datetimepicker({
            format: 'DD/MM/YYYY',
            locale: 'es'
        });

    });
});