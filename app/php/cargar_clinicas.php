<?php
header('content-type: application/json; charset=utf-8');
header("access-control-allow-origin: *");
$dbinfo = "mysql:dbname=datatables;host=localhost";
$user = "root";
$pass = "root";
//Nos intentamos conectar:
try {
	/* conectamos con bbdd e inicializamos conexión como UTF8 */
	$db = new PDO($dbinfo, $user, $pass);
	$db->exec('SET CHARACTER SET utf8');
} catch (Exception $e) {
	echo "La conexi&oacute;n ha fallado: " . $e->getMessage();
}
$sql = $db->prepare("SELECT id_clinica, nombre FROM clinicas ORDER BY nombre");
$sql->execute();
$results = $sql->fetchAll(PDO::FETCH_ASSOC);
$json = json_encode($results,JSON_UNESCAPED_UNICODE );
echo($json);
?>