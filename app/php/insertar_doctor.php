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
/*Recojo datos*/
$nombre = $_POST["nombreNuevoDoctor"];
$numcolegiado = $_POST["nColegiadoNuevoDoctor"];
$clinicas = $_POST["clinicasNuevoDoctor"];	

/*Inserto en BBDD*/
$queryD = "INSERT INTO doctores (nombre,numcolegiado) VALUES(
'".$nombre ."',
'". $numcolegiado ."')" ;
$query_resD = mysql_query($queryD);
/*Si la insercion ha tenido exito hago un select de los doctores
para averiguar cual es el id del ultimo insertado*/
if ($query_resD) {
$sql = "SELECT id_doctor
FROM doctores
WHERE numcolegiado='".$numcolegiado."'";
$res = mysql_query($sql);
while($row = mysql_fetch_array($res, MYSQL_ASSOC))
{
$id_nuevo=$row['id_doctor'];
}
}
/*Recojo las clinicas seleccionadas y
las inserto en BBDD relacionadas con el id del Doctor*/
for ($i=0;$i<count($clinicas);$i++)
{
$queryCD = "INSERT INTO clinica_doctor (id_doctor,id_clinica) VALUES(
". $id_nuevo . ",
" . $clinicas[$i] . ")" ;
$query_resCD = mysql_query($queryCD);
}
/*Si alguna de las consultas anteriores falla
devuelve correspondiente mensaje de error*/
if (!$query_resD||!$res||$query_resCD) {
if (mysql_errno() == 1062) {
$mensaje = "Imposible añadir el doctor, numero de colegiado ya existe";
$estado = mysql_errno();
} else {
$mensaje = 'Error en la consulta: ' . mysql_error() . "\n";
$estado = mysql_errno();
}
}
else
{
$mensaje = "Insercion correcta";
$estado = 0;
}
$resultado = array();
$resultado[] = array(
'mensaje' => $mensaje,
'estado' => $estado
);
echo json_encode($resultado);
?>