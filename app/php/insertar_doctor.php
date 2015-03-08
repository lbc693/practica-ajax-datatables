<?php
header('content-type: application/json; charset=utf-8');
header("access-control-allow-origin: *");
include("mysql.php" );
$dbinfo = "mysql:dbname=".$db.";host=".$server."";
//Nos intentamos conectar:
try {
	/* conectamos con bbdd e inicializamos conexión como UTF8 */
	$db = new PDO($dbinfo, $user, $password);
	$db->exec('SET CHARACTER SET utf8');
} catch (Exception $e) {
	echo "La conexi&oacute;n ha fallado: " . $e->getMessage();
}
$nombre = $_POST["nombreNuevoDoctor"];
$numcolegiado = $_POST["nColegiadoNuevoDoctor"];
$clinicas = $_POST["clinicasNuevoDoctor"];

$sql = $db->prepare("INSERT INTO doctores (nombre,numcolegiado) VALUES(?,?)" );
$sql->bindParam(1, $nombre, PDO::PARAM_STR);
$sql->bindParam(2, $numcolegiado, PDO::PARAM_STR);
$doctorInsertado = $sql->execute();
if ($doctorInsertado){
	$sql = $db->prepare("SELECT id_doctor
		FROM doctores
		WHERE numcolegiado=?");
	$sql->bindParam(1, $numcolegiado);
	$sql->execute();
	$row = $sql->fetch();
	$id_nuevo_doctor = $row['id_doctor'];
	for ($i=0;$i<count($clinicas);$i++)
	{
		$sql = $db->prepare("INSERT INTO doctores clinica_doctor (id_doctor,id_clinica) 
			VALUES(?,?)" );
		$sql->bindParam(1, $id_nuevo_doctor, PDO::PARAM_STR);
		$sql->bindParam(2, $clinicas[$i], PDO::PARAM_STR);
		$sql->execute();
	}
}
?>