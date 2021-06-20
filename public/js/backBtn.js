// function preventBack() {
//     window.history.forward();
// }
// setTimeout("preventBack()", 0);
// window.onunload = function () {
//     null
// };

// function disableBack() {
//     window.history.forward()
// }

// window.onload = disableBack();
// window.onpageshow = function (evt) {
//     if (evt.persisted) disableBack()
// }

//var Backlen=history.length;   history.go(-Backlen); 
// window.location.href="/";

(function (global) {

    if (typeof (global) === "undefined") {
        throw new Error("window is undefined");
    }

    var _hash = "!";
    var noBackPlease = function () {
        global.location.href += "#";
        global.setTimeout(function () {
            global.location.href += "!";
        }, 50);
    };

    global.onhashchange = function () {
        if (global.location.hash !== _hash) {
            global.location.hash = _hash;
        }
    };

    global.onload = function () {
        noBackPlease();

        // disables backspace on page except on input fields and textarea..
        document.body.onkeydown = function (e) {
            var elm = e.target.nodeName.toLowerCase();
            if (e.which === 8 && (elm !== 'input' && elm !== 'textarea')) {
                e.preventDefault();
            }
            // stopping event bubbling up the DOM tree..
            e.stopPropagation();
        };
    }

})(window);

history.pushState(null, document.title, location.href);
window.addEventListener('popstate', function (event) {
    history.pushState(null, document.title, location.href);
});

window.location.hash = "no-back-button";
window.location.hash =
    "Again-No-back-button"; //again because google chrome don't insert first hash into history
window.onhashchange = function () {
    window.location.hash = "no-back-button";
}

console.log("no back btn");