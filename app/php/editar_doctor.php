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

$id_doctor = $_POST["idDoctor"];
$nombre = $_POST["nombreEditarDoctor"];
$numcolegiado = $_POST["nColegiadoEditarDoctor"];
$clinicas = $_POST["clinicasEditarDoctor"];
if($clinicas){
$query = "DELETE FROM clinica_doctor WHERE id_doctor=" . $id_doctor;
$query_res = mysql_query($query);
}
for ($i=0;$i<count($clinicas);$i++)
{
$queryCD = "INSERT INTO clinica_doctor (id_doctor,id_clinica) VALUES(
". $id_doctor . ",
" . $clinicas[$i] . ")" ;
$query_res = mysql_query($queryCD);
}
/* Consulta UPDATE */
$query = "UPDATE doctores SET
nombre = '" . $nombre . "',
numcolegiado = '" . $numcolegiado . "'
WHERE id_doctor = " . $id_doctor;
/*En función del resultado correcto o no, mostraremos el mensaje que corresponda*/
$query_res = mysql_query($query);
// Comprobar el resultado
if (!$query_res) {
$mensaje = 'Error en la consulta: ' .mysql_error() ."\n";
$estado = mysql_errno();
}
else
{
$mensaje = "Actualización correcta";
$estado = 0;
}
$resultado = array();
$resultado[] = array(
'mensaje' => $mensaje,
'estado' => $estado
);
echo json_encode($resultado);
?>