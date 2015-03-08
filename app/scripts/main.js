console.log('\'Allo \'Allo!');
'use strict';

/*Validacion solo letras alfabeto español*/
$.validator.addMethod("spanishletters", function(value, element) {
    return this.optional(element) || /^[a-zA-ZñÑáéíóúÁÉÍÓÚ]+$/i.test(value);
}, "Por favor, solo letras");
/*Validacion solo letras y espacios alfabeto español*/
$.validator.addMethod("spanishlettersspace", function(value, element) {
    return this.optional(element) || /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/i.test(value);
}, "Por favor, solo letras y espacios");
/*
 * Translated default messages for the jQuery validation plugin.
 * Locale: ES (Spanish; Español)
 */
jQuery.extend(jQuery.validator.messages, {
    required: "Este campo es obligatorio",
    spanishletters: "Introduzca solo letras",
    spanishlettersspace: "Introduzca solo letras y espacios",
    digits: "Introduzca sólo carácteres numéricos",
    minlength: "Es necesario seleccionar al menos una clinica"
});

$(document).ready(function() {
    var miTabla = $('#miTabla').DataTable({
        'processing': true,
        'serverSide': true,
        'ajax': 'php/cargar_vdoctores.php',
        'language': {
            'sProcessing': 'Procesando...',
            'sLengthMenu': 'Mostrar _MENU_ registros',
            'sZeroRecords': 'No se encontraron resultados',
            'sEmptyTable': 'Ningún dato disponible en esta tabla',
            'sInfo': 'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
            'sInfoEmpty': 'Mostrando registros del 0 al 0 de un total de 0 registros',
            'sInfoFiltered': '(filtrado de un total de _MAX_ registros)',
            'sInfoPostFix': '',
            'sSearch': 'Buscar:',
            'sUrl': '',
            'sInfoThousands': ',',
            'sLoadingRecords': 'Cargando...',
            'oPaginate': {
                'sFirst': 'Primero',
                'sLast': 'Último',
                'sNext': 'Siguiente',
                'sPrevious': 'Anterior'
            },
            'oAria': {
                'sSortAscending': ': Activar para ordenar la columna de manera ascendente',
                'sSortDescending': ': Activar para ordenar la columna de manera descendente'
            }
        },
        'columns': [{
            'data': 'doctor'
        }, {
            'data': 'numcolegiado'
        }, {
            'data': 'clinica',
            'render': function(data) {
                clinicas = data.split(', ');
                var lista = "";
                $.each(clinicas, function(ind, clinica) {
                    lista = lista + '<li>' + clinica + '</li><br>';
                });
                return lista;
            }
        }, {
            'data': 'id_clinica',
            "visible": false
        }, {
            'data': 'id_doctor',
            /*añadimos las clases editarbtn y borrarbtn para procesar los eventos click de los botones. No lo hacemos mediante id ya que habrá más de un
            botón de edición o borrado*/
            'render': function(data) {
                return '<a class="btn btn-primary editarbtn">Editar</a><a data-toggle="modal" data-target="#modalBorrarDoctor" class="btn btn-warning borrarbtn">Borrar</a>';
            }
        }]
    });

    /*ojo, es necesario hacerlo con el método ON. Tanto por rendimiento como porque puede haber elementos (botones) que todavía no existan en el document.ready*/

    /*Creamos la función que muestre el formulario cuando hagamos click*/
    $('#miTabla').on('click', '.editarbtn', function(e) {
        e.preventDefault();
        $('#tabla').fadeOut(100);
        $('#bNuevoDoctor').fadeOut(100);
        $('#editarDoctor').fadeIn(100);

        var nRow = $(this).parents('tr')[0];
        var aData = miTabla.row(nRow).data();
        $('#idDoctor').val(aData.id_doctor);
        $('#nombreEditarDoctor').val(aData.doctor);
        $('#nColegiadoEditarDoctor').val(aData.numcolegiado);
        cargarClinicas();
        var str = aData.id_clinica;
        /*Separo los id de las clinicas*/
        str = str.split(",");
        /*cargo el select con las que ya estaban*/
        $('#clinicasEditarDoctor').val(str);
    });

    /*Creamos la función que muestre el formulario cuando hagamos click*/
    $('#miTabla').on('click', '.borrarbtn', function(e) {
        e.preventDefault();
        var nRow = $(this).parents('tr')[0];
        var aData = miTabla.row(nRow).data();
        id_doctor = aData.id_doctor;
        nombre = aData.doctor;
        $('#nombreBorrarDoctor').val(nombre);
    });

    /*Cargamos los clinicas para que aparezcan en el select:*/
    function cargarClinicas() {
        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: 'php/cargar_clinicas.php',
            async: false,
            success: function(data) {
                $('#clinicasNuevoDoctor,#clinicasEditarDoctor').empty();
                $.each(data, function() {
                    $('#clinicasNuevoDoctor,#clinicasEditarDoctor').append(
                        $('<option ></option>').val(this.id_clinica).html(this.nombre)
                    );
                });
            }
        });
    }

    /*Formulario para CREAR NUEVO Doctor*/
    $('#formNuevoDoctor').validate({
        rules: {
            nombreNuevoDoctor: {
                required: true,
                spanishlettersspace: true
            },
            nColegiadoNuevoDoctor: {
                digits: true
            },
            clinicasNuevoDoctor: {
                required: true,
                minlength: 1
            }
        },
        submitHandler: function() {
            nombreNuevoDoctor = $('#nombreNuevoDoctor').val();
            nColegiadoNuevoDoctor = $('#nColegiadoNuevoDoctor').val();
            clinicasNuevoDoctor = $('#clinicasNuevoDoctor').val();
            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: 'php/insertar_doctor.php',
                data: {
                    nombreNuevoDoctor: nombreNuevoDoctor,
                    nColegiadoNuevoDoctor: nColegiadoNuevoDoctor,
                    clinicasNuevoDoctor: clinicasNuevoDoctor
                },
                error: function(xhr, status, error) {
                    $.growl.error({
                        title: "ERROR",
                        message: "No se ha podido añadir el Doctor"
                    });
                },
                success: function(data) {
                    var $mitabla = $("#miTabla").dataTable({
                        bRetrieve: true
                    });
                    $mitabla.fnDraw();
                    if (data[0].estado == 0) {
                        $.growl.notice({
                            title: "OK",
                            message: "Doctor añadido correctamente"
                        });
                    }
                },
                complete: {}
            });
            $('#tabla').fadeIn(100);
            $('#bNuevoDoctor').fadeIn(100);
            $('#nuevoDoctor').fadeOut(100);
        }
    });
    /*Formulario para EDITAR un Doctor ya creado*/
    $('#formEditarDoctor').validate({
        rules: {
            nombreEditarDoctor: {
                required: true,
                spanishlettersspace: true
            },
            nColegiadoEditarDoctor: {
                digits: true
            },
            clinicasEditarDoctor: {
                required: true,
                minlength: 1
            }
        },
        submitHandler: function() {
            idDoctor = $('#idDoctor').val();
            nombreEditarDoctor = $('#nombreEditarDoctor').val();
            nColegiadoEditarDoctor = $('#nColegiadoEditarDoctor').val();
            clinicasEditarDoctor = $('#clinicasEditarDoctor').val();
            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: 'php/editar_doctor.php',
                data: {
                    idDoctor: idDoctor,
                    nombreEditarDoctor: nombreEditarDoctor,
                    nColegiadoEditarDoctor: nColegiadoEditarDoctor,
                    clinicasEditarDoctor: clinicasEditarDoctor
                },
                error: function(xhr, status, error) {
                    $.growl.error({
                        title: "ERROR",
                        message: "No se ha podido editar el Doctor"
                    });
                },
                success: function(data) {
                    var $mitabla = $("#miTabla").dataTable({
                        bRetrieve: true
                    });
                    $mitabla.fnDraw();
                    if (data[0].estado == 0) {
                        $.growl.notice({
                            title: "OK",
                            message: "Doctor editado correctamente"
                        });
                    }
                },
                complete: {
                    //si queremos hacer algo al terminar la petición ajax
                }
            });
            $('#tabla').fadeIn(100);
            $('#bNuevoDoctor').fadeIn(100);
            $('#editarDoctor').fadeOut(100);
        }
    });
    $('#bNuevoDoctor').click(function(e) {
        e.preventDefault();
        $('#nombreNuevoDoctor').val("");
        $('#nColegiadoNuevoDoctor').val("");
        $('#tabla').fadeOut(100);
        $('#bNuevoDoctor').fadeOut(100);
        $('#nuevoDoctor').fadeIn(100);
        cargarClinicas();
    });

    /*Control de Ventana Modal BORRAR Doctor*/
    $('#modalBorrarDoctor').on('click', '#bBorrarDoctor', function(e) {
        $.ajax({
            /*Visto en clase*/
            /*En principio el type para api restful sería DELETE
            pero no lo recogeríamos en $_REQUEST, así que queda como POST*/
            type: 'POST',
            dataType: 'json',
            url: 'php/borrar_doctor.php',
            /*Estos son los datos que queremos actualizar, en json:*/
            data: {
                id_doctor: id_doctor
            },
            error: function(xhr, status, error) {
                /*Mostraríamos alguna ventana de alerta con el error*/
                /*Manejo del plugion de growl*/
                /*https://github.com/ksylvest/jquery-growl*/
                $.growl.error({
                    title: "ERROR",
                    message: "No se ha podido borrar el Doctor"
                });
            },
            success: function(data) {
                //alert("Borrado Completado");
                /*Visto en clase*/
                /*obtenemos el mensaje del servidor, es un array!!!
                var mensaje = (data["mensaje"]) //o data[0], en función del tipo de array!!
                actualizamos datatables:
                para volver a pedir vía ajax los datos de la tabla*/
                var $mitabla = $("#miTabla").dataTable({
                    bRetrieve: true
                });
                $mitabla.fnDraw();
                $.growl.notice({
                    title: "OK",
                    message: "Borrado de Doctor Completado"
                });
            },
            complete: {
                /*si queremos hacer algo al terminar la petición ajax*/
            }
        });
        $('#tabla').fadeIn(100);
        $('#bNuevoDoctor').fadeIn(100);
    });
});

/* En http://www.datatables.net/reference/option/ hemos encontrado la ayuda necesaria
para utilizar el API de datatables para el render de los botones */
/* Para renderizar los botones según bootstrap, la url es esta: 
http://getbootstrap.com/css/#buttons
*/
