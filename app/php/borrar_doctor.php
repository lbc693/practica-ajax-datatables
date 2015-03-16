<?php
header('content-type: application/json; charset=utf-8');
header("access-control-allow-origin: *");
include("mysql.php" );
/*
* Local functions
*/
function fatal_error($sErrorMessage = '') {
	header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error');
	die($sErrorMessage);
}
/*
* MySQL connection
*/
if (!$gaSql['link'] = mysql_pconnect($server, $user , $password)) {
	fatal_error('Could not open connection to server');
}
if (!mysql_select_db($db, $gaSql['link'])) {
	fatal_error('Could not select database ');
}
mysql_query('SET names utf8');
//$_REQUEST['id_doctor'] = 1;
if (isset($_REQUEST['id_doctor'])) {
// param was set in the query string
	if (empty($_REQUEST['id_doctor'])) {
		return "El parámetro id_doctor viene vacio!";
	}
	$id_doctor = $_REQUEST['id_doctor'];
}
/*
* SQL queries
* Get data to display
*/
$query1 = "DELETE FROM clinica_doctor WHERE id_doctor=" . $id_doctor;
$query_res1 = mysql_query($query1);
$query = "DELETE FROM doctores WHERE id_doctor=" . $id_doctor;
$query_res = mysql_query($query);
// Comprobar el resultado
if (!$query_res) {
	if (mysql_errno() == 1451) {
		$mensaje = "Imposible Borrar Doctor. Tiene prescripciones o albaranes definidos, borre primero prescripciones o albaranes";
		$estado = mysql_errno();
	} else {
		$mensaje = 'Error en la consulta: ' . mysql_error() . "\n";
		$estado = mysql_errno();
	}
} else {
	$mensaje = "Borrado correcto";
	$estado = 0;
}
$resultado = array();
$resultado[] = array(
	'mensaje' => $mensaje,
	'estado' => $estado
	);
echo json_encode($resultado);
?>