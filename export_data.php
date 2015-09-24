<?php 
	
$json = $_POST['postname'];
$data = json_decode($json, true);	

function convert_to_csv($input_array, $output_file_name, $delimiter){
	// open raw memory as file
	$f = fopen('php://output', 'w');
	foreach ($input_array as $line) {
		fputcsv($f, $line, $delimiter);
		}
	// rewrind the "file" with the csv lines
	fseek($f, 0);

	// modify header to be downloadable csv file 
	header('Content-Type: application/csv');
	header('Content-Disposition: attachement; filename="' . $output_file_name . '";');

	fpassthru($f);

}

convert_to_csv($data, 'report.csv', ', ');
