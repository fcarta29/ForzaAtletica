<?php
// Set your return content type
header('Content-type: text/html; charset=utf-8');

// Website url to open
$url = 'https://green2.kingcounty.gov/lake-buoy/';

// Get that website's content
$handle = fopen($url, "r");

// If there is something, read and return
if ($handle) {
    while (!feof($handle)) {
        $buffer = fgets($handle, 4096);
        echo $buffer;
    }
    fclose($handle);
}
?>
