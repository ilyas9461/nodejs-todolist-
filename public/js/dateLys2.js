// kullanım 2: isimsiz ( anonymous )fonksiyon şeklinde kullanım..
// Fonk1:
exports.CurrentDate = function () {

    var today = new Date();
    var options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    };
    // options yerine ;
    // sadece object olarakta giriş yapılabilir.
    return today.toLocaleString('tr-TR', options); //today.getDay();
}

//Fonk2:
exports.CurrentDay = function () {

    var today = new Date();
    var options = {
        weekday: 'long',
    };
    return today.toLocaleString('tr-TR', options); //today.getDay();
}