<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once('../app/Mage.php'); //Path to Magento
umask(0);

Mage::app();


$model = Mage::getModel('sales/order');

$fromDate = date('Y-m-d H:i:s', strtotime('2015-12-29 08:24:09'));
$orders = $model->getCollection()->addAttributeToFilter('created_at', array('from'=>$fromDate));

foreach ($orders as $order) {
    echo $order->getId() . "\t"
        . $order->getCustomerName() . "\t"
        . $order->getCustomerEmail() . "\t"
        . $order->getState() . "\t"
        . $order->getSubtotal() . "\t"
        . $order->getTotalPaid() . "\t"
        . $order->getOrderCurrencyCode() . "\t"
        . "\r\n<br />";
}

echo "end";

exit();


echo $order->getCreatedAt();
//var_dump($order);

exit();

    $orders = $model->getCollection();
    //$orders->addAttributeToFilter('status', array('in' => array("complete")));
    $orders->setPageSize(100);
    $orders->setCurPage(1);

    foreach ($orders as $order) {
        echo
            $order->getId() . "\t"
            . $order->getCustomerName() . "\t"
            . $order->getCustomerEmail() . "\t"
            . $order->getState() . "\t"
            . $order->getSubtotal() . "\t"
            . $order->getTotalPaid() . "\t"
            . $order->getOrderCurrencyCode() . "\t"
            . "\r\n<br />";
    }

/*$data = array();

foreach ($orders as $order) {
    $payment = $order->getPayment()->getMethodInstance();

    $row = array();
    $row[] = $order->getId();
    $row[] = $order->getCustomerName();
    $row[] = $order->getCustomerEmail();
    $row[] = $order->getState();
    $row[] = $order->getSubtotal();
    $row[] = $order->getTotalPaid();
    $row[] = $order->getOrderCurrency();
    $row[] = $order->getBillingAddress();
    $row[] = $payment->getCode();
    $row[] = $payment->getTitle();
    $row[] = explode("_", $order->getShippingMethod())[0];
    $row[] = $order->getCreatedAtStoreDate()->toString(Varien_Date::DATETIME_INTERNAL_FORMAT);

    $data[] = $row;
}


ob_start();
$df = fopen("myorders.csv", 'w');
fputcsv($df, array_keys(reset($array)));
foreach ($data as $row) {
    fputcsv($df, $row);
}
fclose($df);*/