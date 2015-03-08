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
            'data': 'idDoctor',
            /*añadimos las clases editarbtn y borrarbtn para procesar los eventos click de los botones. No lo hacemos mediante id ya que habrá más de un
            botón de edición o borrado*/
            'render': function(data) {
                return '<a class="btn btn-primary editarbtn" href=http://localhost/php/editar.php?id_doctor=' + data + '>Editar</a><a class="btn btn-warning borrarbtn" href=http://localhost/php/borrar.php?id_doctor=' + data + '>Borrar</a>';
            }
        }]
    });

    /*Creamos la función que muestre el formulario cuando hagamos click*/
    /*ojo, es necesario hacerlo con el método ON. Tanto por rendimiento como porque puede haber elementos (botones) que todavía no existan en el document.ready*/
    $('#miTabla').on('click', '.editarbtn', function(e) {
        e.preventDefault();
        $('#tabla').fadeOut(100);
        $('#formulario').fadeIn(100);

        var nRow = $(this).parents('tr')[0];
        var aData = miTabla.row(nRow).data();
        $('#idClinica').val(aData.idClinica);
        $('#nombre').val(aData.nombre);
        $('#numClinica').val(aData.numClinica);
        $('#razonSocial').val(aData.razonSocial);
        $('#cif').val(aData.cif);
        $('#localidad').val(aData.localidad);
        /*lo más cómodo para la provincia sería esto: (hemos convertido los values a mayúsculas mediante multicursor y CTRL + K + U (Sublime)*/
        $('#provincia').val(aData.provincia);
        /*Como hemos cambiado las option del select, más cómodo también para el envío de datos, esto que teníamos lo comentamos:*/
        /*$('#provincia option').filter(function() {
            return this.text.toLowerCase() === aData.provincia.toLowerCase();
        }).attr('selected', true);*/
        $('#id_tarifa').val(aData.idTarifa);
        $('#direccion').val(aData.direccion);
        $('#cp').val(aData.cp);
    });

});

/*Cargamos los clinicas para que aparezcan en el select:*/
function cargarClinicas() {
    $.ajax({
        type: 'POST',
        dataType: 'json',
        url: 'php/cargar_clinicas.php',
        success: function(data) {
            $('#clinicasNuevoDoctor').empty();
            $.each(data, function() {
                $('#clinicasNuevoDoctor').append(
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

$('#bNuevoDoctor').click(function(e) {
    e.preventDefault();
    $('#nombreNuevoDoctor').val("");
    $('#nColegiadoNuevoDoctor').val("");
    $('#tabla').fadeOut(100);
    $('#bNuevoDoctor').fadeOut(100);
    $('#nuevoDoctor').fadeIn(100);
    cargarClinicas();
});

/* En http://www.datatables.net/reference/option/ hemos encontrado la ayuda necesaria
para utilizar el API de datatables para el render de los botones */
/* Para renderizar los botones según bootstrap, la url es esta: 
http://getbootstrap.com/css/#buttons
*/
