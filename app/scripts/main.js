console.log('\'Allo \'Allo!');
'use strict';
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

/* En http://www.datatables.net/reference/option/ hemos encontrado la ayuda necesaria
para utilizar el API de datatables para el render de los botones */
/* Para renderizar los botones según bootstrap, la url es esta: 
http://getbootstrap.com/css/#buttons
*/
