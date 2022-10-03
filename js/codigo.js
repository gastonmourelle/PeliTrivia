var db = window.openDatabase("TAREAS", "1.0", "Base de tareas", 1024 * 1024 * 5, crearTablas);

function crearTablas() {
    db.transaction(crearTablasSql);
}

function crearTablasSql(tx) {
    tx.executeSql("CREATE TABLE IF NOT EXISTS top (id INTEGER PRIMARY KEY, nombre VARCHAR(255), puntos NUMBER)");
}

//function errorTns(e) {
//    alert("ERROR: " + e.code);
//}

//function exitoCrearTablas() {
//    alert("TABLAS CREADAS");
//}

var nombre;
var id;

function guardar() {
    nombre = $("#txtNombre").val();
    db.transaction(agregarNombreSql);
}

function agregarNombreSql(tx) {
    tx.executeSql("INSERT INTO top (nombre, puntos) VALUES (?, ?)", [nombre, puntos]);
}

function listarNombres() {
    document.getElementById('content').load("rankings.html");
    db.transaction(listarNombresSql);
}

function listarNombresSql(tx) {
    tx.executeSql("SELECT * FROM top ORDER BY puntos DESC LIMIT 10", [], armarListaNombres);
}

function armarListaNombres(tx, resultados) {
//    console.log(resultados.rows.length);
    $("#tbRecords").empty();
    for (var i = 0; i < resultados.rows.length; i++) {
        $("#tbRecords").append("<tr><td>" + (i+1) + "</td><td>" + resultados.rows.item(i).nombre + "</td><td>" + resultados.rows.item(i).puntos + "</td></tr>");
    }
}

//function nombresListadas() {
//    alert("Se listaron las tareas");
//}




window.fn = {};

var peliculas;
var pelicula;
var puntos = 0;
var tiempo = 60;
var sonidoCor = new Audio("./otros/correcto.mp3");
var sonidoInc = new Audio("./otros/incorrecto.mp3");
function temporizador() {
    tiempo = tiempo - 1;
    if (tiempo < 60) {
        $("#pTiempo").text(tiempo);
    }
    if (tiempo < 1) {
        window.clearInterval(update);
    }
    if (tiempo <= 0) {
        window.clearInterval(update);
        document.getElementById('content').load("resultados.html");
    }
}

var update;


window.fn.open = function () {
    var menu = document.getElementById('menu');
    menu.open();
};

window.fn.load = function (page) {
    var content = document.getElementById('content');
    var menu = document.getElementById('menu');
    content.load(page)
            .then(menu.close.bind(menu));
};

document.addEventListener("init", inicializarPagina);

function inicializarPagina(evt) {
    var destino = evt.target.id;
    $(".barra").hide();
    window.clearInterval(update);
    switch (destino) {
        case "comenzar":
            $("#btnSiguiente").click(tutorial);
            $("#btnListar").click(listarNombres);
            break;
        case "tutorial":
            $("#btnVolver").click(function () {
                window.location = 'index.html';
            });
            $("#btnJugar").click(peliculaRandom);
            break;
        case "juego":
            update = setInterval(temporizador, 1000);

            $("#btnVolver").click(function () {
                window.location = 'index.html';
            });

            if (pelicula.images.posters.length === 0) {
                peliculaRandom();
            }

            $("#pPuntos").html("Puntaje: <b style='color: #eb1f5a;'>" + puntos + "</b>");
            $("#pTiempo").text(tiempo);
            $("#hNombre").html(pelicula.title);
            $("#dImgs").empty();
            $("#dImgs").append('<img src="https://image.tmdb.org/t/p/w500' + pelicula.images.posters[0].file_path + '">');

            var fechaCompleta = pelicula.release_date;
            var añoStr = fechaCompleta.substring(0, 4);
            var año = parseInt(añoStr);

            var min = año - 5;
            var max = año + 5;
            var random1 = Math.floor(Math.random() * (+max - +min) + +min);
            var random2 = Math.floor(Math.random() * (+max + 5 - +min - 5) + +min - 5);
            var random3 = Math.floor(Math.random() * (+max + 10 - +min - 10) + +min - 10);

            if (random1 === año || random2 === año || random3 === año || random2 === random1 || random3 === random1 || random3 === random2) {
                peliculaRandom();
            }


            $("#botones").append("<input value='" + año + "' type='button' class='btnOpcion' id='respuestaCorrecta'>");
            $("#botones").append("<input value='" + random1 + "' type='button' class='btnOpcion'>");
            $("#botones").append("<input value='" + random2 + "' type='button' class='btnOpcion'>");
            $("#botones").append("<input value='" + random3 + "' type='button' class='btnOpcion'>");
            $("#botones").html($(".btnOpcion").sort(function () {
                return Math.random() - 0.5;
            }));
            $(".btnOpcion").click(function () {
                $("#respuestaCorrecta").css("background-color", "#087412");
                $("#respuestaCorrecta").css("color", "whitesmoke");
                var elegida = $(this).attr("value");
                if (elegida === añoStr) {
                    sonidoCor.play();
                    puntos++;
                    $("#pPuntos").html("Puntaje: <b style='color: #eb1f5a;'>" + puntos + "</b>");
                } else {
                    sonidoInc.play();
                    $("#pPuntos").html("Puntaje: <b style='color: #eb1f5a;'>" + puntos + "</b>");
                    $(this).css("background-color", "#da1d33");
                    $(this).css("color", "whitesmoke");
                }
                ;
                setTimeout(function () {
                    if (elegida === añoStr) {
                        peliculaRandom();
                    } else {
                        peliculaRandom();
                    }
                }, 1000);
            });

            break;
        case "resultados":
            $("#dTxtNombre").hide();
            $(function () {
                $('#btnReiniciar').click(function () {
                    puntos = 0;
                    peliculaRandom();
                    tiempo = 60;
                });
            });
            $("#pResultado").text(puntos);
            $("#btnAgregar").click(function(){
                $("#dTxtNombre").show();
                $("#btnAgregar").hide();
            });
            $("#btnConfirmar").click(function(){
                guardar();
                $("#dAgregar").hide();
                $("#hTiempoTerminado").text("¡Perfecto!");
                $("#pTuPuntaje").text("Tu puntaje se ha agregado al ranking.");
            });
            $("#btnSalir").click(function () {
                window.location = 'index.html';
            });
            break;
        case "rankings":
            $("#btnVolver").click(function () {
                window.location = 'index.html';
            });
            break;
    }
}

function peliculaRandom() {
    //var idPelicula = $(this).attr("data-idpeli");
    var idPelicula = Math.ceil(Math.random() * 2000);
    $.ajax({
        url: "https://api.themoviedb.org/3/movie/" + idPelicula,
        dataType: "JSON",
        type: "GET",
        data: {
            api_key: "0d13cbb13af31d53ca30550020660e13",
            language: "en",
            append_to_response: "videos,images"
        },
        success: mostrarJuego,
        error: peliculaRandom,
        beforeSend: mostrarLoader
    });
}

function mostrarJuego(datosPelicula) {
    pelicula = datosPelicula;
    document.getElementById('content').load("juego.html");
}

function tutorial(){
    document.getElementById('content').load("tutorial.html");
}

function mostrarError(e) {
    alert(e);
}

function mostrarLoader() {
    $(".barra").show();
}

var tiempoP = 100;
var tiempoI = 90;
var diferencia = Math.abs(tiempoI - tiempoP);

if (diferencia > 10) {
    //lejos
} else if (diferencia > 0) {
    //cerca
} else {
    //adivinaste
}