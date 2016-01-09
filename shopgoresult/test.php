<?php

function getCurlValue($filename, $contentType, $postname)
{
    // PHP 5.5 introduced a CurlFile object that deprecates the old @filename syntax
    // See: https://wiki.php.net/rfc/curl-file-upload
    if (function_exists('curl_file_create')) {
        return curl_file_create($filename, $contentType, $postname);
    }

    // Use the old style if using an older version of PHP
    $path = realpath($filename);
    $value = "@".$path;
    return $value;
}

$filename = "./08sfSktQx6wA46VEK5GVFdu5.csv";
$cfile = getCurlValue($filename,'text/csv', "08sfSktQx6wA46VEK5GVFdu5.csv");

$data = array('file_contents' => $cfile);

$ch = curl_init();
$options = array(CURLOPT_URL => 'http://statistic.devstage.shopgo.io/stores/connect',
    CURLOPT_RETURNTRANSFER => true,
    CURLINFO_HEADER_OUT => true, //Request header
    CURLOPT_HEADER => true, //Return header
    CURLOPT_SSL_VERIFYPEER => false, //Don't veryify server certificate
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $data
);

curl_setopt_array($ch, $options);
curl_exec($ch);
curl_close($ch);