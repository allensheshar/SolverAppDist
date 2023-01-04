require(["helper"], function () {

    setTimeout(function () {
        $('img.dinamic').each(function () {
            var source = $(this).attr('data-source') || '';
            if (source != '') {
                $(this).SetScaleImage(`${$.solver.services.files}Service/ViewFile2/${source}/App`);
            };
        });
    }, 100);

});