<?php

/**
 * Created by PhpStorm.
 * User: belalmazlom
 * Date: 12/7/15
 * Time: 8:52 PM
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once('../app/Mage.php'); //Path to Magento
umask(0);

Mage::app();

class ShopGoProvider
{
    private static $pageSize = 100;
    public static $token = null;

    private static function prepareFilters($collection, $startDate, $endDate, $orderStatus)
    {
        if ($startDate != null && $endDate != null) {
            $fromDate = date('Y-m-d H:i:s', strtotime($startDate));
            $toDate = date('Y-m-d H:i:s', strtotime($endDate));
            $collection->addAttributeToFilter('created_at', array('from' => $fromDate, 'to' => $toDate));
        } elseif ($startDate != null) {
            $fromDate = date('Y-m-d H:i:s', strtotime($startDate));
            $collection->addAttributeToFilter('created_at', array('from' => $fromDate));
        } elseif ($endDate != null) {
            $toDate = date('Y-m-d H:i:s', strtotime($endDate));
            $collection->addAttributeToFilter('created_at', array('to' => $toDate));
        }

        if ($orderStatus != null) {
            $collection->addAttributeToFilter('status', $orderStatus);
        }

        return $collection;
    }

    public static function getOrders($startDate = null, $endDate = null, $orderStatus = null)
    {
        if (ShopGoProvider::$token == null)
            return;

        $orderModel = Mage::getModel('sales/order');

        //Check size
        $ordersCollection = $orderModel->getCollection();
        $ordersCollection = ShopGoProvider::prepareFilters($ordersCollection, $startDate, $endDate, $orderStatus);
        $ordersCount = $ordersCollection->getSize();

        try {
            unlink("./" . ShopGoProvider::$token . ".csv");
        } catch (Exception $e) {
        }


        if ($ordersCount > ShopGoProvider::$pageSize) {
            //Split date to smooth collecting

            $totalPages = ceil($ordersCount / ShopGoProvider::$pageSize) + 1;

            for ($page = 1; $page < $totalPages; $page++) {
                $ordersCollection = $orderModel->getCollection();
                $ordersCollection = ShopGoProvider::prepareFilters($ordersCollection, $startDate, $endDate, $orderStatus);
                $ordersCollection->setPageSize(ShopGoProvider::$pageSize);
                $ordersCollection->setCurPage($page);

                ShopGoProvider::writeData($ordersCollection, $page);
            }
        } else {
            //one page
            $ordersCollection = $orderModel->getCollection();
            $ordersCollection = ShopGoProvider::prepareFilters($ordersCollection, $startDate, $endDate, $orderStatus);
            ShopGoProvider::writeData($ordersCollection);
        }

        ShopGoProvider::sendData();
    }

    public static function writeData($collection, $page = null)
    {
        if ($page != null) {
            $handle = fopen("./" . ShopGoProvider::$token . ".csv", "a");
        } else {
            $handle = fopen("./" . ShopGoProvider::$token . ".csv", "w");
        }

        foreach ($collection as $order) {
            try {
                $payment = $order->getPayment()->getMethodInstance();
                $row = array();

                $row[] = $order->getId();
                $row[] = $order->getCustomerName();
                $row[] = $order->getCustomerEmail();
                $row[] = $order->getSubtotal();
                $row[] = $order->getTotalPaid();
                $row[] = $order->getState();
                $row[] = $order->getOrderCurrencyCode();
                $row[] = $order->getBillingAddress()->getCountryId();

                $row[] = $payment->getCode();
                $row[] = $payment->getTitle();


                $shippingMethods = explode("_", $order->getShippingMethod());
                $row[] = $shippingMethods[0];
                $row[] = $order->getCreatedAt();

                fputcsv($handle, $row);
            } catch (Exception $e) {
            }
        }
        fclose($handle);
    }

    public static function getCurlValue($filename, $contentType, $postname)
    {
        // PHP 5.5 introduced a CurlFile object that deprecates the old @filename syntax
        // See: https://wiki.php.net/rfc/curl-file-upload
        if (function_exists('curl_file_create')) {
            return curl_file_create($filename, $contentType, $postname);
        }

        // Use the old style if using an older version of PHP
        $path = realpath($filename);
        $value = "@" . $path;
        return $value;
    }

    public static function sendData()
    {
        //Send csv
        //Send Timezone to update store timezone

        $filename = "./" . ShopGoProvider::$token . ".csv";
        $cfile = ShopGoProvider::getCurlValue($filename, 'text/csv', ShopGoProvider::$token . ".csv");

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

        echo "Done";
    }

    public static function getShippingList()
    {
        $methods = Mage::getSingleton('shipping/config')->getAllCarriers();
        $options = array();
        foreach ($methods as $_code => $_method) {
            if (!$_title = Mage::getStoreConfig("carriers/$_code/title"))
                $_title = $_code;

            $options[] = array('value' => $_code, 'label' => $_title . " ($_code)");
        }

        echo json_encode($options);
    }
}

if (count($_POST)) {
    $token = isset($_POST["token"]) ? $_POST["token"] : null;
    $hash = isset($_POST["hash"]) ? $_POST["hash"] : null;
    $methodRequest = isset($_POST["method"]) ? $_POST["method"] : null;
    $startDate = isset($_POST["startdate"]) ? $_POST["startdate"] : null;
    $endDate = isset($_POST["enddate"]) ? $_POST["enddate"] : null;
    $orderstatus = isset($_POST["orderstatus"]) ? $_POST["orderstatus"] : null;

    if ($hash == "wsavQvt14cmPNf9wGD59Xir9mzU" && $token != null && !empty($methodRequest)) {
        ShopGoProvider::$token = $token;

        switch ($methodRequest) {
            case "orders":
                ShopGoProvider::getOrders($startDate, $endDate, $orderstatus);
                break;
            case "shippinglist":
                ShopGoProvider::getShippingList();
                break;
            case "timezone":
                echo Mage::getStoreConfig('general/locale/timezone');
                break;
            case "check":
                echo "connected";
                break;
        }
    } else {
        echo "missing data";
    }
}